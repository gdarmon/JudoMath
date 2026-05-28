import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { GameSession } from '../../components/GameSession'
import { Belt } from '../../types'
import { GAME, BELT_NAMES, PROBLEM, REWARD } from '../../i18n/he'

function currentCorrectAnswer(): number {
  const operands = document.querySelectorAll('.problem-display__operand')
  const operatorEl = document.querySelector('.problem-display__operator')
  const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
  const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
  const operator = operatorEl?.textContent?.trim() ?? '+'
  return operator === '+' ? op1 + op2 : op1 - op2
}

function submitCurrentCorrectAnswer() {
  fireEvent.click(screen.getByLabelText(`תשובה ${currentCorrectAnswer()}`))
}

function skipRewardClip() {
  act(() => {
    vi.advanceTimersByTime(1000)
  })
  fireEvent.click(screen.getByLabelText(REWARD.skipAria))
}

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
    const choiceButtons = screen.getAllByRole('button', { name: /^תשובה / })
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

    expect(screen.getByText(BELT_NAMES[Belt.Green])).toBeInTheDocument()
    expect(screen.getByText('⫼⫼')).toBeInTheDocument()
  })

  it('defaults to White belt with 0 stripes when not provided', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(BELT_NAMES[Belt.White])).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<GameSession onComplete={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByLabelText(GAME.back))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows feedback after picking a wrong answer and advances to next problem', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    const operands = document.querySelectorAll('.problem-display__operand')
    const operatorEl = document.querySelector('.problem-display__operator')
    const op1 = parseInt(operands[0]?.textContent ?? '0', 10)
    const op2 = parseInt(operands[1]?.textContent ?? '0', 10)
    const operator = operatorEl?.textContent?.trim() ?? '+'
    const correct = operator === '+' ? op1 + op2 : op1 - op2

    const buttons = screen.getAllByRole('button', { name: /^תשובה / })
    const wrongBtn = buttons.find(
      (b) => b.textContent && parseInt(b.textContent, 10) !== correct,
    )
    expect(wrongBtn).toBeTruthy()

    fireEvent.click(wrongBtn!)

    for (const b of buttons) expect(b).toBeDisabled()

    act(() => {
      vi.advanceTimersByTime(1700)
    })

    expect(screen.getByText('2/10')).toBeInTheDocument()
  })

  it('shows the reward clip after a correct answer', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    submitCurrentCorrectAnswer()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByRole('dialog', { name: REWARD.dialogAria })).toBeInTheDocument()
    expect(screen.getByLabelText(REWARD.skipAria)).toBeInTheDocument()
  })

  it('advances to the next problem after the reward clip is skipped', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    submitCurrentCorrectAnswer()
    skipRewardClip()

    expect(screen.getByText('2/10')).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: REWARD.dialogAria })).not.toBeInTheDocument()
  })

  it('shows judo praise after a 3-answer correct streak', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    submitCurrentCorrectAnswer()
    skipRewardClip()
    submitCurrentCorrectAnswer()
    skipRewardClip()
    submitCurrentCorrectAnswer()

    expect(screen.getByText(PROBLEM.streakMessages[0])).toBeInTheDocument()
  })

  it('shows inactivity reminder after 30 seconds', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)

    expect(screen.queryByText(GAME.reminder)).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText(GAME.reminder)).toBeInTheDocument()
  })

  it('has a progress bar that reflects current progress', () => {
    render(<GameSession onComplete={vi.fn()} onBack={vi.fn()} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '1')
    expect(progressBar).toHaveAttribute('aria-valuemax', '10')
  })
})
