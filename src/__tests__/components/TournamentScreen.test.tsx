import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Mock } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TournamentScreen } from '../../components/TournamentScreen'
import type { TournamentResult } from '../../types'

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

  it('renders session indicator showing "Session 1/3" initially', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText('Session 1/3')).toBeTruthy()
  })

  it('renders problem counter showing "Problem 1/10" initially', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText('Problem 1/10')).toBeTruthy()
  })

  it('displays a timer that starts at 0.0s', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    expect(screen.getByText('0.0s')).toBeTruthy()
  })

  it('timer increments as time passes', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    // After 1.5 seconds, timer should show approximately 1.5s
    expect(screen.getByText('1.5s')).toBeTruthy()
  })

  it('calls onBack when back button is clicked', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    const backBtn = screen.getByLabelText('Back to menu')
    fireEvent.click(backBtn)
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('displays a math problem with operands and operator', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    // The ProblemDisplay should render with a "?" placeholder for the answer
    expect(screen.getByText('?')).toBeTruthy()
    // Should also have the equals sign
    expect(screen.getByText('=')).toBeTruthy()
  })

  it('advances problem counter after submitting an answer', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    // Submit an answer via keyboard
    fireEvent.keyDown(window, { key: '5' })
    fireEvent.keyDown(window, { key: 'Enter' })

    // Wait for feedback duration
    act(() => {
      vi.advanceTimersByTime(1100)
    })

    expect(screen.getByText('Problem 2/10')).toBeTruthy()
  })

  it('completes all 3 sessions and calls onComplete with a TournamentResult', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    // Complete 3 sessions × 10 problems = 30 answers
    for (let session = 0; session < 3; session++) {
      for (let problem = 0; problem < 10; problem++) {
        // Submit answer "5" for each problem (may be right or wrong, doesn't matter for structure test)
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

  it('shows "Session 2/3" after completing the first session', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    // Complete first session (10 problems)
    for (let problem = 0; problem < 10; problem++) {
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'Enter' })

      act(() => {
        vi.advanceTimersByTime(1100)
      })
    }

    expect(screen.getByText('Session 2/3')).toBeTruthy()
  })

  it('resets problem counter to "Problem 1/10" when starting a new session', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)

    // Complete first session (10 problems)
    for (let problem = 0; problem < 10; problem++) {
      fireEvent.keyDown(window, { key: '5' })
      fireEvent.keyDown(window, { key: 'Enter' })

      act(() => {
        vi.advanceTimersByTime(1100)
      })
    }

    expect(screen.getByText('Problem 1/10')).toBeTruthy()
  })

  it('has accessible progress bar', () => {
    render(<TournamentScreen onComplete={onComplete} onBack={onBack} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeTruthy()
    expect(progressBar.getAttribute('aria-valuenow')).toBe('1')
    expect(progressBar.getAttribute('aria-valuemax')).toBe('10')
  })
})
