import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProblemDisplay } from '../../components/ProblemDisplay'
import type { MathProblem } from '../../types'
import { PROBLEM } from '../../i18n/he'

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

  it('shows correct feedback with checkmark and Hebrew message', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="correct" />)
    expect(screen.getByLabelText(PROBLEM.correctIcon)).toBeInTheDocument()
    expect(screen.getByText(PROBLEM.correctMessage)).toBeInTheDocument()
  })

  it('shows incorrect feedback with X mark and Hebrew message', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="incorrect" />)
    expect(screen.getByLabelText(PROBLEM.incorrectIcon)).toBeInTheDocument()
    expect(screen.getByText(PROBLEM.incorrectMessage)).toBeInTheDocument()
  })

  it('shows the correct answer when feedback is incorrect and showCorrectAnswer is true', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="incorrect" showCorrectAnswer={true} />)
    expect(screen.getByText(PROBLEM.correctAnswerIs(12))).toBeInTheDocument()
  })

  it('does not show correct answer when showCorrectAnswer is false', () => {
    render(<ProblemDisplay problem={mockProblem} feedback="incorrect" showCorrectAnswer={false} />)
    expect(screen.queryByText(PROBLEM.correctAnswerIs(12))).not.toBeInTheDocument()
  })

  it('does not show feedback when feedback is null', () => {
    render(<ProblemDisplay problem={mockProblem} feedback={null} />)
    expect(screen.queryByLabelText(PROBLEM.correctIcon)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(PROBLEM.incorrectIcon)).not.toBeInTheDocument()
  })

  it('applies correct CSS class for correct feedback', () => {
    const { container } = render(<ProblemDisplay problem={mockProblem} feedback="correct" />)
    expect(container.querySelector('.problem-display')).toHaveClass('problem-display--correct')
  })

  it('applies correct CSS class for incorrect feedback', () => {
    const { container } = render(<ProblemDisplay problem={mockProblem} feedback="incorrect" />)
    expect(container.querySelector('.problem-display')).toHaveClass('problem-display--incorrect')
  })
})
