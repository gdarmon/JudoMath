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
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders 6 multiple-choice answer buttons', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)
    const choiceButtons = screen.getAllByRole('button', { name: /^Answer / })
    expect(choiceButtons).toHaveLength(6)
  })

  it('displays belt and stripe indicator', () => {
    render(
      <GameSession
        onComplete={vi.fn()}
        onBack={vi.fn()}
        currentBelt={Belt.Green}
        currentStripes={2}
      />,
    )

    expect(screen.getByText('Green')).toBeInTheDocument()
    expect(screen.getByText('⫼⫼')).toBeInTheDocument()
  })

  it('defaults to White belt with 0 stripes when not provided', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('White')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<GameSession onComplete={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByLabelText('Back to menu'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows feedback after picking a wrong answer and advances to next problem', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    // Read the correct answer from the rendered problem so we can pick a wrong one deterministically.
    const operands = document.querySelectorAll('.problem-display__operand')
    const operatorEl = document.querySelector('.problem-display__operator')
    const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
    const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
    const operator = operatorEl?.textContent?.trim() ?? '+'
    const correct = operator === '+' ? op1 + op2 : op1 - op2

    // Pick the first option that is NOT the correct answer.
    const buttons = screen.getAllByRole('button', { name: /^Answer / })
    const wrongBtn = buttons.find((b) => b.textContent && parseInt(b.textContent, 10) !== correct)
    expect(wrongBtn).toBeTruthy()

    fireEvent.click(wrongBtn!)

    // Buttons should be disabled during feedback.
    for (const b of buttons) expect(b).toBeDisabled()

    // Advance past feedback duration (~1500ms is enough).
    act(() => {
      vi.advanceTimersByTime(1700)
    })

    // Should advance to problem 2/10.
    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('shows the reward clip after a correct answer', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    const operands = document.querySelectorAll('.problem-display__operand')
    const operatorEl = document.querySelector('.problem-display__operator')
    const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
    const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
    const operator = operatorEl?.textContent?.trim() ?? '+'
    const correct = operator === '+' ? op1 + op2 : op1 - op2

    const correctBtn = screen.getByLabelText(`Answer ${correct}`)
    fireEvent.click(correctBtn)

    // Advance past feedback flash.
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // The reward overlay should now be visible.
    expect(screen.getByRole('dialog', { name: 'Prize clip' })).toBeInTheDocument()
    expect(screen.getByLabelText('Skip clip and continue')).toBeInTheDocument()
  })

  it('advances to the next problem after the reward clip is skipped', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    const operands = document.querySelectorAll('.problem-display__operand')
    const operatorEl = document.querySelector('.problem-display__operator')
    const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
    const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
    const operator = operatorEl?.textContent?.trim() ?? '+'
    const correct = operator === '+' ? op1 + op2 : op1 - op2

    fireEvent.click(screen.getByLabelText(`Answer ${correct}`))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Skip the reward clip.
    fireEvent.click(screen.getByLabelText('Skip clip and continue'))

    // Now we should be on problem 2.
    expect(screen.getByText('2/10')).toBeInTheDocument()
    // Reward dialog should be gone.
    expect(screen.queryByRole('dialog', { name: 'Prize clip' })).not.toBeInTheDocument()
  })

  it('shows inactivity reminder after 30 seconds', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    expect(screen.queryByText('!עדיין כאן? בוא נמשיך')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText('!עדיין כאן? בוא נמשיך')).toBeInTheDocument()
  })

  it('has a progress bar that reflects current progress', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '1')
    expect(progressBar).toHaveAttribute('aria-valuemax', '10')
  })
})
