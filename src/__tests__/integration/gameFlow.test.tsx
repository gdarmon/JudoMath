import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useGameStore } from '../../store/gameStore'
import { OfflineCache } from '../../persistence/offlineCache'
import { Belt } from '../../types'
import type { PlayerProgress } from '../../types'

// Mock lottie-react to avoid canvas dependency in jsdom
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-mock" />,
  __esModule: true,
}))

// Mock the offlineCache singleton to avoid IndexedDB issues with fake timers
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

// Import App after mocks are set up
import App from '../../App'
import { offlineCache } from '../../persistence/offlineCache'

/**
 * Integration tests for Judo Math Game.
 * Tests full app flows by rendering the App component and simulating user interactions.
 * Uses fake timers to avoid flakiness from real timer delays.
 *
 * Validates: All Requirements
 */

// Helper: submit a specific number answer via keyboard simulation
function submitAnswer(answer: number) {
  const digits = answer.toString().split('')
  for (const digit of digits) {
    fireEvent.keyDown(window, { key: digit })
  }
  const submitBtn = screen.getByLabelText('Submit answer')
  fireEvent.click(submitBtn)
}

// Helper: advance timers and flush microtasks
async function tick(ms = 1100) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

// Helper: initialize the app (flush the async useEffect)
async function initApp() {
  await act(async () => {
    vi.advanceTimersByTime(0)
  })
}

describe('Integration: Full Game Session Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Reset the store to initial state
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

    // Wait for app initialization (async useEffect)
    await initApp()

    // Should see the main menu with Play button
    expect(screen.getByLabelText('Play')).toBeInTheDocument()

    // Click Play to start a game session
    fireEvent.click(screen.getByLabelText('Play'))

    // Should now be in game session
    expect(screen.getByText('1/10')).toBeInTheDocument()

    // Answer all 10 problems (submit 0 each time)
    for (let i = 0; i < 10; i++) {
      submitAnswer(0)
      // Advance past the 1000ms feedback timer
      await tick()
    }

    // Should now see the results screen with score percentage
    expect(screen.getByLabelText(/Score:/)).toBeInTheDocument()

    // Results screen should show correct/total count
    expect(screen.getByLabelText(/correct/)).toBeInTheDocument()

    // Should have Play Again and Main Menu buttons
    expect(screen.getByLabelText('Play Again')).toBeInTheDocument()
    expect(screen.getByLabelText('Main Menu')).toBeInTheDocument()

    // Click Main Menu to go back
    fireEvent.click(screen.getByLabelText('Main Menu'))

    // Should be back at main menu
    expect(screen.getByLabelText('Play')).toBeInTheDocument()
  })

  it('navigates back to game via Play Again after session', async () => {
    render(<App />)

    await initApp()

    expect(screen.getByLabelText('Play')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Play'))
    expect(screen.getByText('1/10')).toBeInTheDocument()

    // Answer all 10 problems
    for (let i = 0; i < 10; i++) {
      submitAnswer(0)
      await tick()
    }

    // Should see results
    expect(screen.getByLabelText('Play Again')).toBeInTheDocument()

    // Click Play Again
    fireEvent.click(screen.getByLabelText('Play Again'))

    // Should start a new game session
    expect(screen.getByText('1/10')).toBeInTheDocument()
  })
})

describe('Integration: Belt Promotion Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Set up player with 2 stripes - one more correct session triggers promotion
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
    // Mock loadProgress to return the player with 2 stripes
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

  it('promotes belt after earning 3rd stripe with ≥75% score', async () => {
    render(<App />)

    await initApp()

    expect(screen.getByLabelText('Play')).toBeInTheDocument()

    // Start a game
    fireEvent.click(screen.getByLabelText('Play'))
    expect(screen.getByText('1/10')).toBeInTheDocument()

    // Answer all problems correctly by reading the equation elements from the DOM
    for (let i = 0; i < 10; i++) {
      // Read operands and operator from the specific DOM elements
      const operands = document.querySelectorAll('.problem-display__operand')
      const operatorEl = document.querySelector('.problem-display__operator')

      const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
      const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
      const operator = operatorEl?.textContent?.trim() ?? '+'

      // '−' is Unicode minus (U+2212), '+' is plus
      const answer = (operator === '+') ? op1 + op2 : op1 - op2

      submitAnswer(answer)
      await tick()
    }

    // After completing with 100% score, belt ceremony should appear
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Ceremony should show the new belt name (Yellow, promoted from White)
    expect(screen.getByText(/Yellow Belt/)).toBeInTheDocument()

    // Dismiss the ceremony
    fireEvent.click(screen.getByLabelText('Continue playing'))

    // Ceremony should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Verify the store has the new belt
    const updatedPlayer = useGameStore.getState().player
    expect(updatedPlayer?.currentBelt).toBe(Belt.Yellow)
    expect(updatedPlayer?.currentStripes).toBe(0)
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

    expect(screen.getByLabelText('Tournament')).toBeInTheDocument()

    // Click Tournament
    fireEvent.click(screen.getByLabelText('Tournament'))

    // Should see tournament screen with session indicator
    expect(screen.getByText(/Session 1\/3/)).toBeInTheDocument()

    // Answer all 30 problems (3 sessions × 10 problems)
    for (let session = 0; session < 3; session++) {
      for (let problem = 0; problem < 10; problem++) {
        submitAnswer(0)
        await tick()
      }
    }

    // After all 3 sessions, should see tournament results
    expect(screen.getByLabelText('Tournament results')).toBeInTheDocument()

    // Should show total score
    expect(screen.getByLabelText(/Total score:/)).toBeInTheDocument()

    // Should show sessions completed (3/3)
    expect(screen.getByLabelText(/3 of 3 sessions completed/)).toBeInTheDocument()

    // Should have Main Menu button
    expect(screen.getByLabelText('Main Menu')).toBeInTheDocument()
  })
})

describe('Integration: Offline Persistence', () => {
  beforeEach(async () => {
    // Delete the database to ensure clean state
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

    // Save progress using one OfflineCache instance
    const cache1 = new OfflineCache()
    await cache1.init()
    await cache1.saveProgress('local-player', testProgress)
    cache1.close()

    // Load progress using a new OfflineCache instance (simulates app restart)
    const cache2 = new OfflineCache()
    await cache2.init()
    const loadedProgress = await cache2.loadProgress('local-player')
    cache2.close()

    // Verify the loaded progress matches what was saved
    expect(loadedProgress).toEqual(testProgress)
  })

  it('queues sync items offline and processes them on reconnect', async () => {
    const cache = new OfflineCache()
    await cache.init()

    // Save progress
    const progress: PlayerProgress = {
      currentBelt: Belt.Blue,
      currentStripes: 1,
      totalSessions: 20,
      totalCorrect: 170,
      totalProblems: 200,
    }
    await cache.saveProgress('local-player', progress)

    // Queue sync items (simulating offline changes)
    await cache.queueSync('saveProgress', { playerId: 'local-player', progress })
    await cache.queueSync('saveLeaderboard', { score: 85, time: 120000 })

    // Verify items are queued
    const pendingItems = await cache.getPendingSyncItems()
    expect(pendingItems).toHaveLength(2)

    // Simulate reconnection - sync all pending items
    const syncFn = vi.fn().mockResolvedValue(undefined)
    await cache.syncOfflineChanges(syncFn)

    // Verify sync function was called for each item
    expect(syncFn).toHaveBeenCalledTimes(2)

    // Verify queue is now empty
    const remainingItems = await cache.getPendingSyncItems()
    expect(remainingItems).toHaveLength(0)

    // Verify progress is still accessible
    const loadedProgress = await cache.loadProgress('local-player')
    expect(loadedProgress).toEqual(progress)

    cache.close()
  })

  it('retains failed sync items for retry', async () => {
    const cache = new OfflineCache()
    await cache.init()

    await cache.queueSync('saveProgress', { data: 'item1' })
    await cache.queueSync('saveLeaderboard', { data: 'item2' })

    // First item syncs, second fails
    const syncFn = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Network error'))

    await cache.syncOfflineChanges(syncFn)

    // Only the failed item should remain
    const remaining = await cache.getPendingSyncItems()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].action).toBe('saveLeaderboard')

    cache.close()
  })
})
