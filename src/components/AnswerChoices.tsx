import { useEffect, useMemo, useState } from 'react'
import type { MathProblem } from '../types'
import { generateChoices } from '../logic/distractors'
import './AnswerChoices.css'

export interface AnswerChoicesProps {
  problem: MathProblem
  /** When set, lock the grid and visually mark which choice the child picked. */
  selectedAnswer?: number | null
  /** When the grid is locked, the correct answer is highlighted. */
  showCorrect?: boolean
  disabled?: boolean
  onSelect: (answer: number) => void
}

/**
 * Six big touch-friendly buttons. One is the correct answer; the
 * other five are plausible distractors generated deterministically
 * from the problem id, so they never reshuffle while the child is
 * looking at the same question.
 */
export function AnswerChoices({
  problem,
  selectedAnswer = null,
  showCorrect = false,
  disabled = false,
  onSelect,
}: AnswerChoicesProps) {
  const choices = useMemo(() => generateChoices(problem), [problem])

  // Track keyboard focus index for arrow-key navigation.
  const [focusIdx, setFocusIdx] = useState(0)
  useEffect(() => setFocusIdx(0), [problem.id])

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const cols = 3
    let next = focusIdx
    switch (e.key) {
      case 'ArrowRight': next = (focusIdx + 1) % choices.length; break
      case 'ArrowLeft':  next = (focusIdx - 1 + choices.length) % choices.length; break
      case 'ArrowDown':  next = Math.min(focusIdx + cols, choices.length - 1); break
      case 'ArrowUp':    next = Math.max(focusIdx - cols, 0); break
      default: return
    }
    e.preventDefault()
    setFocusIdx(next)
    const btn = document.querySelector<HTMLButtonElement>(
      `[data-answer-choice-index="${next}"]`,
    )
    btn?.focus()
  }

  return (
    <div
      className="answer-choices"
      role="group"
      aria-label="Answer choices"
      onKeyDown={handleKeyNav}
    >
      {choices.map((value, idx) => {
        const isSelected = selectedAnswer === value
        const isCorrect = problem.correctAnswer === value
        const reveal = showCorrect && isCorrect
        const wrong = showCorrect && isSelected && !isCorrect

        const className = [
          'answer-choices__btn',
          reveal && 'answer-choices__btn--correct',
          wrong && 'answer-choices__btn--wrong',
          isSelected && !showCorrect && 'answer-choices__btn--selected',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={`${problem.id}-${value}`}
            type="button"
            data-answer-choice-index={idx}
            className={className}
            onClick={() => onSelect(value)}
            disabled={disabled}
            aria-label={`Answer ${value}`}
            aria-pressed={isSelected}
          >
            {value}
          </button>
        )
      })}
    </div>
  )
}

export default AnswerChoices
