import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useGameStore } from '../../store/gameStore'
import { OfflineCache } from '../../persistence/offlineCache'
import { Belt } from '../../types'
import type { PlayerProgress } from '../../types'

// Mock lottie-react to avoid canvas dependency in jsdom.
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />,
  __esModule: true,
}))

// Mock the offlineCache singleton to avoid IndexedDB issues with fake timers.
vi.mock('../../persistence/offlineCache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../persistence/offlineCache')>()
  return {
    ...actual,
    offlineCache: {
      init: vi.fn().mockResolvedValue(undefined),
      saveProgress: vi.fn().mockResolvedValue(undefined),
      loadProgress: vi.fn().mockResolvedValue(null),
      close: vi.fn(),
      queueSync: vi.fn().mockResolvedValue(undefined),
      getPendingSyncItems: vi.fn().mockResolvedValue([]),
      syncOfflineChanges: vi.fn().mockResolvedValue(undefined),
      clearSyncItem: vi.fn().mockResolvedValue(undefined),
      registerOnlineSync: vi.fn(),
      unregisterOnlineSync: vi.fn(),
      isOnline: vi.fn().mockReturnValue(true),
    },
  }
})

import App from '../../App'
import { offlineCache } from '../../persistence/offlineCache'

/**
 * Helpers
 */

/** Reads the currently displayed problem and returns the correct answer. */
function readCurrentCorrectAnswer(): number {
  const operands = document.querySelectorAll('.problem-display__operand')
  const operatorEl = document.querySelector('.problem-display__operator')
  const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
  const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
  const operator = operatorEl?.textContent?.trim() ?? '+'
  return operator === '+' ? op1 + op2 : op1 - op2
}

/** Picks an answer choice in the multiple-choice pad (game session flow). */
function pickAnswerChoice(value: number) {
  const btn = screen.getByLabelText(`Answer ${value}`)
  fireEvent.click(btn)
}

/** Skip the reward clip overlay if it's currently shown. */
function skipRewardIfPresent() {
  const skip = screen.queryByLabelText('Skip clip and continue')
  if (skip) fireEvent.click(skip)
}

/** Submit a single answer in the game session: pick choice, advance feedback, skip reward if any. */
async function answerOne(correctAnswer: number, deliberatelyWrong = false) {
  if (deliberatelyWrong) {
    // Pick the first visible choice that isn't the correct answer.
    const choiceButtons = screen.getAllByRole('button', { name: /^Answer / })
    const wrong = choiceButtons.find(
      (b) => b.textContent && parseInt(b.textContent, 10) !== correctAnswer,
    )
    if (wrong) fireEvent.click(wrong)
  } else {
    pickAnswerChoice(correctAnswer)
  }

  // Advance past the brief feedback flash.
  await act(async () => {
    vi.advanceTimersByTime(1500)
  })

  // If a reward overlay appeared (only on correct answers), skip it.
  skipRewardIfPresent()

  // Let the close handler run.
  await act(async () => {
    vi.advanceTimersByTime(50)
  })
}

/** Tournament screen still uses the keyboard-driven number input. */
function submitNumericAnswer(answer: number) {
  const digits = answer.toString().split('')
  for (const digit of digits) fireEvent.keyDown(window, { key: digit })
  const submitBtn = screen.getByLabelText('Submit answer')
  fireEvent.click(submitBtn)
}

async function tickTournament(ms = 1100) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

async function initApp() {
  await act(async () => {
    vi.advanceTimersByTime(0)
  })
}

describe('Integration: Full Game Session Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    useGameStore.setState({
      player: null,
      playerId: null,
      currentSession: null,
      tournament: null,
      isLoading: false,
      activeScreen: 'menu',
      animationPlaying: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes a full game session: menu → play → 10 problems → results', async () => {
    render(<App />)
    await initApp()

    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Play'))

    expect(screen.getByText('1/10')).toBeInTheDocument()

    // Answer all 10 problems wrong (skips reward overlays). We just need to drive the flow.
    for (let i = 0; i < 10; i++) {
      const correct = readCurrentCorrectAnswer()
      // Already on results screen if previous loop completed early.
      if (!screen.queryByText(/^\d+\/10$/)) break
      await answerOne(correct, /* deliberatelyWrong */ true)
    }

    // Should now see the results screen with score percentage.
    expect(screen.getByLabelText(/Score:/)).toBeInTheDocument()
    expect(screen.getByLabelText(/correct/)).toBeInTheDocument()
    expect(screen.getByLabelText('Play Again')).toBeInTheDocument()
    expect(screen.getByLabelText('Main Menu')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Main Menu'))
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
  })

  it('shows the reward clip after a correct answer and resumes the game on skip', async () => {
    render(<App />)
    await initApp()

    fireEvent.click(screen.getByLabelText('Play'))
    expect(screen.getByText('1/10')).toBeInTheDocument()

    const correct = readCurrentCorrectAnswer()
    pickAnswerChoice(correct)

    // Advance past the brief correct-feedback flash.
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    // Reward overlay is up.
    expect(screen.getByRole('dialog', { name: 'Prize clip' })).toBeInTheDocument()

    // Skip the clip.
    fireEvent.click(screen.getByLabelText('Skip clip and continue'))
    await act(async () => {
      vi.advanceTimersByTime(50)
    })

    // We should now be on problem 2.
    expect(screen.getByText('2/10')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Prize clip' })).not.toBeInTheDocument()
  })
})

describe('Integration: Belt Promotion Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    useGameStore.setState({
      player: {
        currentBelt: Belt.White,
        currentStripes: 2,
        totalSessions: 5,
        totalCorrect: 40,
        totalProblems: 50,
      },
      playerId: 'local-player',
      currentSession: null,
      tournament: null,
      isLoading: false,
      activeScreen: 'menu',
      animationPlaying: false,
    })
    vi.mocked(offlineCache.loadProgress).mockResolvedValue({
      currentBelt: Belt.White,
      currentStripes: 2,
      totalSessions: 5,
      totalCorrect: 40,
      totalProblems: 50,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('promotes belt after earning 3rd stripe with 100% score', async () => {
    render(<App />)
    await initApp()

    fireEvent.click(screen.getByLabelText('Play'))
    expect(screen.getByText('1/10')).toBeInTheDocument()

    // Answer all 10 correctly, skipping the reward clip each time.
    for (let i = 0; i < 10; i++) {
      const correct = readCurrentCorrectAnswer()
      await answerOne(correct, /* deliberatelyWrong */ false)
    }

    // After 100% score with 2 stripes -> promotion. Belt ceremony dialog should appear.
    expect(screen.getByRole('dialog', { name: /Belt ceremony/i })).toBeInTheDocument()
    expect(screen.getByText(/Yellow Belt/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Continue playing'))
    expect(screen.queryByRole('dialog', { name: /Belt ceremony/i })).not.toBeInTheDocument()

    const updated = useGameStore.getState().player
    expect(updated?.currentBelt).toBe(Belt.Yellow)
    expect(updated?.currentStripes).toBe(0)
  })
})

describe('Integration: Tournament Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    useGameStore.setState({
      player: {
        currentBelt: Belt.White,
        currentStripes: 0,
        totalSessions: 0,
        totalCorrect: 0,
        totalProblems: 0,
      },
      playerId: 'local-player',
      currentSession: null,
      tournament: null,
      isLoading: false,
      activeScreen: 'menu',
      animationPlaying: false,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes a tournament: 3 sessions × 10 problems → tournament results', async () => {
    render(<App />)
    await initApp()

    fireEvent.click(screen.getByLabelText('Tournament'))
    expect(screen.getByText(/Session 1\/3/)).toBeInTheDocument()

    // Tournament keeps the keyboard number input — submit `0` for each problem.
    for (let session = 0; session < 3; session++) {
      for (let problem = 0; problem < 10; problem++) {
        submitNumericAnswer(0)
        await tickTournament()
      }
    }

    expect(screen.getByLabelText('Tournament results')).toBeInTheDocument()
    expect(screen.getByLabelText(/Total score:/)).toBeInTheDocument()
    expect(screen.getByLabelText(/3 of 3 sessions completed/)).toBeInTheDocument()
    expect(screen.getByLabelText('Main Menu')).toBeInTheDocument()
  })
})

describe('Integration: Offline Persistence', () => {
  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('judomath-offline')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
    })
  })

  it('persists player progress to IndexedDB and loads it back', async () => {
    const testProgress: PlayerProgress = {
      currentBelt: Belt.Green,
      currentStripes: 2,
      totalSessions: 10,
      totalCorrect: 85,
      totalProblems: 100,
    }

    const cache1 = new OfflineCache()
    await cache1.init()
    await cache1.saveProgress('local-player', testProgress)
    cache1.close()

    const cache2 = new OfflineCache()
    await cache2.init()
    const loaded = await cache2.loadProgress('local-player')
    cache2.close()

    expect(loaded).toEqual(testProgress)
  })

  it('queues sync items offline and processes them on reconnect', async () => {
    const cache = new OfflineCache()
    await cache.init()

    const progress: PlayerProgress = {
      currentBelt: Belt.Blue,
      currentStripes: 1,
      totalSessions: 20,
      totalCorrect: 170,
      totalProblems: 200,
    }
    await cache.saveProgress('local-player', progress)
    await cache.queueSync('saveProgress', { playerId: 'local-player', progress })
    await cache.queueSync('saveLeaderboard', { score: 85, time: 120000 })

    expect(await cache.getPendingSyncItems()).toHaveLength(2)

    const syncFn = vi.fn().mockResolvedValue(undefined)
    await cache.syncOfflineChanges(syncFn)

    expect(syncFn).toHaveBeenCalledTimes(2)
    expect(await cache.getPendingSyncItems()).toHaveLength(0)
    expect(await cache.loadProgress('local-player')).toEqual(progress)

    cache.close()
  })

  it('retains failed sync items for retry', async () => {
    const cache = new OfflineCache()
    await cache.init()

    await cache.queueSync('saveProgress', { data: 'item1' })
    await cache.queueSync('saveLeaderboard', { data: 'item2' })

    const syncFn = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Network error'))

    await cache.syncOfflineChanges(syncFn)

    const remaining = await cache.getPendingSyncItems()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].action).toBe('saveLeaderboard')

    cache.close()
  })
})
