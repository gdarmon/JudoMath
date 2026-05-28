import type { MathProblem } from '../types'
import { PROBLEM } from '../i18n/he'
import './ProblemDisplay.css'

export interface ProblemDisplayProps {
  problem: MathProblem
  feedback?: 'correct' | 'incorrect' | null
  showCorrectAnswer?: boolean
}

/**
 * Big, kid-friendly equation card. Math always renders LTR
 * (forced via .is-ltr) so digits and operators read normally
 * even inside an RTL document.
 */
export function ProblemDisplay({ problem, feedback, showCorrectAnswer }: ProblemDisplayProps) {
  const feedbackClass = feedback ? `problem-display--${feedback}` : ''

  return (
    <div className={`problem-display ${feedbackClass}`} aria-live="polite">
      <div className="problem-display__equation is-ltr">
        <span className="problem-display__operand">{problem.operand1}</span>
        <span className="problem-display__operator">
          {problem.operator === '+' ? '+' : '−'}
        </span>
        <span className="problem-display__operand">{problem.operand2}</span>
        <span className="problem-display__equals">=</span>
        <span className="problem-display__answer">{PROBLEM.questionMark}</span>
      </div>

      {feedback === 'correct' && (
        <div className="problem-display__feedback problem-display__feedback--correct">
          <span className="problem-display__icon" aria-label={PROBLEM.correctIcon}>✓</span>
          <span className="problem-display__message">{PROBLEM.correctMessage}</span>
        </div>
      )}

      {feedback === 'incorrect' && (
        <div className="problem-display__feedback problem-display__feedback--incorrect">
          <span className="problem-display__icon" aria-label={PROBLEM.incorrectIcon}>✗</span>
          <span className="problem-display__message">{PROBLEM.incorrectMessage}</span>
          {showCorrectAnswer && (
            <span className="problem-display__correct-answer">
              {PROBLEM.correctAnswerIs(problem.correctAnswer)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProblemDisplay
