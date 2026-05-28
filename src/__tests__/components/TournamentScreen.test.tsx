import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TournamentScreen } from '../../components/TournamentScreen'
import type { TournamentResult } from '../../types'
import { TOURNAMENT } from '../../i18n/he'

describe('TournamentScreen', () => {
  let onComplete: Mock<(result: TournamentResult) => void>
  let onBack: Mock<() => void>

  beforeEach(() => {
    onComplete = vi.fn<(result: TournamentResult) => void>()
    onBack = vi.fn<() => void>()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders session indicator showing 1/3 initially', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText('1/3')).toBeTruthy()
  })

  it('renders problem counter showing the i18n label', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText(TOURNAMENT.problemLabel(1, 10))).toBeTruthy()
  })

  it('displays a timer that starts at 0.0', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText(TOURNAMENT.timerSeconds(0))).toBeTruthy()
  })

  it('timer increments as time passes', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByText(TOURNAMENT.timerSeconds(1.5))).toBeTruthy()
  })

  it('calls onBack when back button is clicked', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    const backBtn = screen.getByLabelText(TOURNAMENT.backAria)
    fireEvent.click(backBtn)
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('displays a math problem with operands and operator', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText('?')).toBeTruthy()
    expect(screen.getByText('=')).toBeTruthy()
  })

  it('advances problem counter after submitting an answer', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    fireEvent.keyDown(window, { key: '5' })
    fireEvent.keyDown(window, { key: 'Enter' })

    act(() => {
      vi.advanceTimersByTime(1100)
    })

    expect(screen.getByText(TOURNAMENT.problemLabel(2, 10))).toBeTruthy()
  })

  it('completes all 3 sessions and calls onComplete with a TournamentResult', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    for (let session = 0; session < 3; session++) {
      for (let problem = 0; problem < 10; problem++) {
        fireEvent.keyDown(window, { key: '5' })
        fireEvent.keyDown(window, { key: 'Enter' })
        act(() => {
          vi.advanceTimersByTime(1100)
        })
      }
    }

    expect(onComplete).toHaveBeenCalledOnce()
    const result = onComplete.mock.calls[0][0]
    expect(result).toHaveProperty('totalScore')
    expect(result).toHaveProperty('totalTime')
    expect(result).toHaveProperty('sessionsCompleted')
    expect(result.sessionsCompleted).toBe(3)
  })

  it('shows session 2/3 after completing the first session', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    for (let problem = 0; problem < 10; problem++) {
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'Enter' })
      act(() => {
        vi.advanceTimersByTime(1100)
      })
    }

    expect(screen.getByText('2/3')).toBeTruthy()
  })

  it('resets problem counter when starting a new session', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    for (let problem = 0; problem < 10; problem++) {
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'Enter' })
      act(() => {
        vi.advanceTimersByTime(1100)
      })
    }

    expect(screen.getByText(TOURNAMENT.problemLabel(1, 10))).toBeTruthy()
  })

  it('has accessible progress bar', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeTruthy()
    expect(progressBar.getAttribute('aria-valuenow')).toBe('1')
    expect(progressBar.getAttribute('aria-valuemax')).toBe('10')
  })
})
