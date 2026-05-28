import { useState, useEffect, useRef, useCallback } from 'react'
import { Belt } from '../types'
import type { MathProblem } from '../types'
import { generateSession } from '../logic/problemGenerator'
import { validateAnswer } from '../logic/problemGenerator'
import { ProblemDisplay } from './ProblemDisplay'
import { NumberInput } from './NumberInput'
import './GameSession.css'

export interface GameSessionProps {
  onComplete: (correctCount: number, totalCount: number) => void
  onBack: () => void
  currentBelt?: Belt
  currentStripes?: number
}

const PROBLEMS_PER_SESSION = 10
const FEEDBACK_DURATION_MS = 1000
const INACTIVITY_TIMEOUT_MS = 30000

/** Maps Belt enum values to display names */
const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'White',
  [Belt.Yellow]: 'Yellow',
  [Belt.Orange]: 'Orange',
  [Belt.Green]: 'Green',
  [Belt.Blue]: 'Blue',
  [Belt.Brown]: 'Brown',
  [Belt.Black]: 'Black',
}

/** Maps Belt enum values to CSS colors */
const BELT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#f5f5f5',
  [Belt.Yellow]: '#fdd835',
  [Belt.Orange]: '#ff9800',
  [Belt.Green]: '#4caf50',
  [Belt.Blue]: '#2196f3',
  [Belt.Brown]: '#795548',
  [Belt.Black]: '#212121',
}

/** Maps Belt enum values to text colors for contrast */
const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#333333',
  [Belt.Yellow]: '#333333',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
}

/**
 * Game Session screen component.
 * Manages a session of 10 math problems, tracks answers,
 * shows progress, and handles inactivity reminders.
 */
export function GameSession({ onComplete, onBack, currentBelt, currentStripes }: GameSessionProps) {
  const beltValue = currentBelt ?? Belt.White
  const stripes = currentStripes ?? 0

  const [problems] = useState<MathProblem[]>(() => generateSession({ count: PROBLEMS_PER_SESSION }))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)
  const [isInactive, setIsInactive] = useState(false)

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentProblem = problems[currentIndex]

  // Reset inactivity timer on any activity
  const resetInactivityTimer = useCallback(() => {
    setIsInactive(false)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsInactive(true)
    }, INACTIVITY_TIMEOUT_MS)
  }, [])

  // Start inactivity timer on mount and reset on index change
  useEffect(() => {
    resetInactivityTimer()
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [currentIndex, resetInactivityTimer])

  // Cleanup feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  const handleAnswerSubmit = useCallback((answer: number) => {
    // Reset inactivity on interaction
    resetInactivityTimer()

    const isCorrect = validateAnswer(currentProblem, answer)

    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
      setFeedback('correct')
      setShowCorrectAnswer(false)
    } else {
      setFeedback('incorrect')
      setShowCorrectAnswer(true)
    }

    setInputDisabled(true)

    // After feedback duration, advance to next problem or complete session
    feedbackTimerRef.current = setTimeout(() => {
      const nextIndex = currentIndex + 1

      if (nextIndex >= PROBLEMS_PER_SESSION) {
        // Session complete
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount
        onComplete(finalCorrect, PROBLEMS_PER_SESSION)
      } else {
        setCurrentIndex(nextIndex)
        setFeedback(null)
        setShowCorrectAnswer(false)
        setInputDisabled(false)
      }
    }, FEEDBACK_DURATION_MS)
  }, [currentProblem, currentIndex, correctCount, onComplete, resetInactivityTimer])

  const progressPercent = (currentIndex / PROBLEMS_PER_SESSION) * 100

  return (
    <div className={`game-session ${isInactive ? 'game-session--inactive' : ''}`}>
      {/* Header: back button, progress, belt indicator */}
      <header className="game-session__header">
        <button
          className="game-session__back-btn"
          onClick={onBack}
          aria-label="Back to menu"
          type="button"
        >
          ← Back
        </button>

        <div className="game-session__progress-info">
          <span className="game-session__problem-counter" aria-label={`Problem ${currentIndex + 1} of ${PROBLEMS_PER_SESSION}`}>
            {currentIndex + 1}/{PROBLEMS_PER_SESSION}
          </span>
        </div>

        <div
          className="game-session__belt-indicator"
          style={{
            backgroundColor: BELT_COLORS[beltValue],
            color: BELT_TEXT_COLORS[beltValue],
          }}
          aria-label={`${BELT_NAMES[beltValue]} belt with ${stripes} stripe${stripes !== 1 ? 's' : ''}`}
        >
          <span className="game-session__belt-name">{BELT_NAMES[beltValue]}</span>
          {stripes > 0 && (
            <span className="game-session__belt-stripes">{'⫼'.repeat(stripes)}</span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="game-session__progress-bar" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={PROBLEMS_PER_SESSION}>
        <div
          className="game-session__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Inactivity reminder */}
      {isInactive && (
        <div className="game-session__reminder" aria-live="polite">
          <span className="game-session__reminder-icon" role="img" aria-label="Reminder">👋</span>
          <span className="game-session__reminder-text">!עדיין כאן? בוא נמשיך</span>
        </div>
      )}

      {/* Problem display */}
      <div className="game-session__problem">
        <ProblemDisplay
          problem={currentProblem}
          feedback={feedback}
          showCorrectAnswer={showCorrectAnswer}
        />
      </div>

      {/* Number input */}
      <div className="game-session__input">
        <NumberInput
          onSubmit={handleAnswerSubmit}
          disabled={inputDisabled}
        />
      </div>
    </div>
  )
}

export default GameSession
