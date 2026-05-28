import type { MathProblem } from '../types'
import './ProblemDisplay.css'

export interface ProblemDisplayProps {
  problem: MathProblem
  feedback?: 'correct' | 'incorrect' | null
  showCorrectAnswer?: boolean
}

/**
 * Displays a math problem in large, child-friendly format with visual feedback.
 * Shows operand1 operator operand2 = ? and animates correct/incorrect states.
 */
export function ProblemDisplay({ problem, feedback, showCorrectAnswer }: ProblemDisplayProps) {
  const feedbackClass = feedback ? `problem-display--${feedback}` : ''

  return (
    <div className={`problem-display ${feedbackClass}`} aria-live="polite">
      <div className="problem-display__equation">
        <span className="problem-display__operand">{problem.operand1}</span>
        <span className="problem-display__operator">{problem.operator === '+' ? '+' : '−'}</span>
        <span className="problem-display__operand">{problem.operand2}</span>
        <span className="problem-display__equals">=</span>
        <span className="problem-display__answer">?</span>
      </div>

      {feedback === 'correct' && (
        <div className="problem-display__feedback problem-display__feedback--correct">
          <span className="problem-display__icon" aria-label="Correct answer">✓</span>
          <span className="problem-display__message">!כל הכבוד</span>
        </div>
      )}

      {feedback === 'incorrect' && (
        <div className="problem-display__feedback problem-display__feedback--incorrect">
          <span className="problem-display__icon" aria-label="Incorrect answer">✗</span>
          <span className="problem-display__message">!נסה שוב</span>
          {showCorrectAnswer && (
            <span className="problem-display__correct-answer">
              התשובה הנכונה: {problem.correctAnswer}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProblemDisplay
