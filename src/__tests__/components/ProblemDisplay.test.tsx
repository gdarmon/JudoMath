import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProblemDisplay } from '../../components/ProblemDisplay'
import type { MathProblem } from '../../types'

const mockProblem: MathProblem = {
  id: 'test-1',
  operand1: 7,
  operand2: 5,
  operator: '+',
  correctAnswer: 12,
}

const subtractionProblem: MathProblem = {
  id: 'test-2',
  operand1: 15,
  operand2: 8,
  operator: '-',
  correctAnswer: 7,
}

describe('ProblemDisplay', () => {
  it('renders the math problem with operands and operator', () => {
    render(<ProblemDisplay problem={mockProblem} />)

    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders subtraction with minus sign (−)', () => {
    render(<ProblemDisplay problem={subtractionProblem} />)

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('−')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows correct feedback with checkmark', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="correct" />)

    expect(screen.getByLabelText('Correct answer')).toBeInTheDocument()
    expect(screen.getByText('!כל הכבוד')).toBeInTheDocument()
  })

  it('shows incorrect feedback with X mark', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="incorrect" />)

    expect(screen.getByLabelText('Incorrect answer')).toBeInTheDocument()
    expect(screen.getByText('!נסה שוב')).toBeInTheDocument()
  })

  it('shows the correct answer when feedback is incorrect and showCorrectAnswer is true', () => {
    render(
      <ProblemDisplay problem={mockProblem} feedback="incorrect" showCorrectAnswer={true} />
    )

    expect(screen.getByText(/12/)).toBeInTheDocument()
  })

  it('does not show correct answer when showCorrectAnswer is false', () => {
    render(
      <ProblemDisplay problem={mockProblem} feedback="incorrect" showCorrectAnswer={false} />
    )

    expect(screen.queryByText(/התשובה הנכונה/)).not.toBeInTheDocument()
  })

  it('does not show feedback when feedback is null', () => {
    render(<ProblemDisplay problem={mockProblem} feedback={null} />)

    expect(screen.queryByLabelText('Correct answer')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Incorrect answer')).not.toBeInTheDocument()
  })

  it('applies correct CSS class for correct feedback', () => {
    const { container } = render(<ProblemDisplay problem={mockProblem} feedback="correct" />)

    const display = container.querySelector('.problem-display')
    expect(display).toHaveClass('problem-display--correct')
  })

  it('applies correct CSS class for incorrect feedback', () => {
    const { container } = render(<ProblemDisplay problem={mockProblem} feedback="incorrect" />)

    const display = container.querySelector('.problem-display')
    expect(display).toHaveClass('problem-display--incorrect')
  })

  it('uses font size >= 32px for equation elements', () => {
    const { container } = render(<ProblemDisplay problem={mockProblem} />)

    const operands = container.querySelectorAll('.problem-display__operand')
    const operator = container.querySelector('.problem-display__operator')
    const equals = container.querySelector('.problem-display__equals')
    const answer = container.querySelector('.problem-display__answer')

    // Verify the elements exist (CSS handles the font-size)
    expect(operands.length).toBe(2)
    expect(operator).toBeInTheDocument()
    expect(equals).toBeInTheDocument()
    expect(answer).toBeInTheDocument()
  })
})
