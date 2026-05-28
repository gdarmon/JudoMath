import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { GameSession } from '../../components/GameSession'
import { Belt } from '../../types'

describe('GameSession', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the first problem with progress counter "1/10"', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    expect(screen.getByText('1/10')).toBeInTheDocument()
    // Should show a problem display with equation elements
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('displays belt and stripe indicator', () => {
    render(
      <GameSession
        onComplete={vi.fn()}
        onBack={vi.fn()}
        currentBelt={Belt.Green}
        currentStripes={2}
      />
    )

    expect(screen.getByText('Green')).toBeInTheDocument()
    // 2 stripes rendered as ⫼⫼
    expect(screen.getByText('⫼⫼')).toBeInTheDocument()
  })

  it('defaults to White belt with 0 stripes when not provided', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    expect(screen.getByText('White')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<GameSession onComplete={onBack} onBack={onBack} />)

    fireEvent.click(screen.getByLabelText('Back to menu'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows feedback after submitting an answer and advances to next problem', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    // Submit an answer via the number input
    const submitBtn = screen.getByLabelText('Submit answer')
    const digitBtn = screen.getByLabelText('5')

    fireEvent.click(digitBtn)
    fireEvent.click(submitBtn)

    // After submitting, input should be disabled during feedback
    expect(submitBtn).toBeDisabled()

    // Advance past feedback duration
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Should advance to problem 2/10 (unless session completed)
    // The counter should show 2/10 since we answered the first problem
    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('shows inactivity reminder after 30 seconds', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    // Initially no reminder
    expect(screen.queryByText('!עדיין כאן? בוא נמשיך')).not.toBeInTheDocument()

    // Advance 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000)
    })

    // Reminder should appear
    expect(screen.getByText('!עדיין כאן? בוא נמשיך')).toBeInTheDocument()
  })

  it('resets inactivity timer when answer is submitted', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    // Advance 25 seconds (not yet 30)
    act(() => {
      vi.advanceTimersByTime(25000)
    })

    // Submit an answer to reset timer
    const digitBtn = screen.getByLabelText('5')
    const submitBtn = screen.getByLabelText('Submit answer')
    fireEvent.click(digitBtn)
    fireEvent.click(submitBtn)

    // Advance feedback
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Advance another 25 seconds (total 26s since last activity, not 30)
    act(() => {
      vi.advanceTimersByTime(25000)
    })

    // Should NOT show reminder yet
    expect(screen.queryByText('!עדיין כאן? בוא נמשיך')).not.toBeInTheDocument()

    // Advance 5 more seconds (now 30s since last activity)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Now reminder should appear
    expect(screen.getByText('!עדיין כאן? בוא נמשיך')).toBeInTheDocument()
  })

  it('calls onComplete with results after all 10 problems are answered', () => {
    const onComplete = vi.fn()
    render(<GameSession onComplete={onComplete} onBack={vi.fn()} />)

    // Answer all 10 problems (just submit 0 each time)
    for (let i = 0; i < 10; i++) {
      const digitBtn = screen.getByLabelText('0')
      const submitBtn = screen.getByLabelText('Submit answer')

      fireEvent.click(digitBtn)
      fireEvent.click(submitBtn)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }

    // onComplete should have been called with (correctCount, 10)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(expect.any(Number), 10)
  })

  it('has a progress bar that reflects current progress', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '1')
    expect(progressBar).toHaveAttribute('aria-valuemax', '10')
  })
})
