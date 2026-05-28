import { useEffect, useMemo, useState } from 'react'
import type { MathProblem } from '../types'
import { generateChoices } from '../logic/distractors'
import { CHOICES } from '../i18n/he'
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
 * Six big touch-friendly buttons. Deterministic shuffle per problem id
 * so the buttons don't reshuffle as the child looks at them.
 */
export function AnswerChoices({
  problem,
  selectedAnswer = null,
  showCorrect = false,
  disabled = false,
  onSelect,
}: AnswerChoicesProps) {
  const choices = useMemo(() => generateChoices(problem), [problem])

  const [focusIdx, setFocusIdx] = useState(0)
  useEffect(() => setFocusIdx(0), [problem.id])

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const cols = 3
    let next = focusIdx
    // RTL: ArrowRight should move toward smaller index visually,
    //      ArrowLeft toward larger. We swap to keep the keyboard
    //      experience consistent with the visual grid.
    switch (e.key) {
      case 'ArrowRight': next = (focusIdx - 1 + choices.length) % choices.length; break
      case 'ArrowLeft':  next = (focusIdx + 1) % choices.length; break
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
      aria-label={CHOICES.groupLabel}
      onKeyDown={handleKeyNav}
    >
      {choices.map((value, idx) => {
        const isSelected = selectedAnswer === value
        const isCorrect = problem.correctAnswer === value
        const reveal = showCorrect && isCorrect
        const wrong = showCorrect && isSelected && !isCorrect

        const className = [
          'answer-choices__btn',
          'is-ltr',
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
            aria-label={CHOICES.answerAria(value)}
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
