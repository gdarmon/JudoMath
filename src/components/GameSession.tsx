import { useState, useEffect, useRef, useCallback } from 'react'
import { Belt } from '../types'
import type { MathProblem } from '../types'
import { generateSession, validateAnswer } from '../logic/problemGenerator'
import { pickNextClip, pickFallbackClip } from '../logic/clipRotation'
import { JUDO_CLIPS, CLIP_DURATION_SECONDS } from '../data/judoClips'
import type { JudoClip } from '../data/judoClips'
import { ProblemDisplay } from './ProblemDisplay'
import { AnswerChoices } from './AnswerChoices'
import { RewardClip } from './RewardClip'
import './GameSession.css'

export interface GameSessionProps {
  onComplete: (correctCount: number, totalCount: number) => void
  onBack: () => void
  currentBelt?: Belt
  currentStripes?: number
}

const PROBLEMS_PER_SESSION = 10
const FEEDBACK_DURATION_MS = 900
const INACTIVITY_TIMEOUT_MS = 30000

const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'White',
  [Belt.Yellow]: 'Yellow',
  [Belt.Orange]: 'Orange',
  [Belt.Green]: 'Green',
  [Belt.Blue]: 'Blue',
  [Belt.Brown]: 'Brown',
  [Belt.Black]: 'Black',
}

const BELT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#f5f5f5',
  [Belt.Yellow]: '#fdd835',
  [Belt.Orange]: '#ff9800',
  [Belt.Green]: '#4caf50',
  [Belt.Blue]: '#2196f3',
  [Belt.Brown]: '#795548',
  [Belt.Black]: '#212121',
}

const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#333333',
  [Belt.Yellow]: '#333333',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
}

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
  const [pickedAnswer, setPickedAnswer] = useState<number | null>(null)
  const [reward, setReward] = useState<JudoClip | null>(null)
  const failedClipsRef = useRef<Set<string>>(new Set())

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingNextRef = useRef<(() => void) | null>(null)

  const currentProblem = problems[currentIndex]

  const resetInactivityTimer = useCallback(() => {
    setIsInactive(false)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => setIsInactive(true), INACTIVITY_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    resetInactivityTimer()
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [currentIndex, resetInactivityTimer])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const advanceOrFinish = useCallback(
    (finalCorrect: number) => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= PROBLEMS_PER_SESSION) {
        onComplete(finalCorrect, PROBLEMS_PER_SESSION)
      } else {
        setCurrentIndex(nextIndex)
        setFeedback(null)
        setShowCorrectAnswer(false)
        setInputDisabled(false)
        setPickedAnswer(null)
      }
    },
    [currentIndex, onComplete],
  )

  const handleAnswerSubmit = useCallback(
    (answer: number) => {
      if (inputDisabled) return
      resetInactivityTimer()

      const isCorrect = validateAnswer(currentProblem, answer)
      setPickedAnswer(answer)
      setInputDisabled(true)

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1)
        setFeedback('correct')
        setShowCorrectAnswer(false)

        // Queue the reward clip after the brief feedback flash.
        feedbackTimerRef.current = setTimeout(() => {
          const clip = pickNextClip(JUDO_CLIPS)
          // Stash the next-step action — runs when the reward clip closes.
          pendingNextRef.current = () => advanceOrFinish(correctCount + 1)
          setReward(clip)
        }, FEEDBACK_DURATION_MS)
      } else {
        setFeedback('incorrect')
        setShowCorrectAnswer(true)

        feedbackTimerRef.current = setTimeout(() => {
          advanceOrFinish(correctCount)
        }, FEEDBACK_DURATION_MS + 600) // Slightly longer so the kid sees the right answer.
      }
    },
    [advanceOrFinish, correctCount, currentProblem, inputDisabled, resetInactivityTimer],
  )

  const handleRewardClose = useCallback(() => {
    setReward(null)
    failedClipsRef.current = new Set()
    const next = pendingNextRef.current
    pendingNextRef.current = null
    if (next) next()
  }, [])

  /** If a clip fails to embed, swap to a different one without disrupting the flow. */
  const handleRewardError = useCallback((failedYoutubeId: string) => {
    failedClipsRef.current.add(failedYoutubeId)
    const fallback = pickFallbackClip(JUDO_CLIPS, failedClipsRef.current)
    if (fallback) {
      setReward(fallback)
    } else {
      // Out of clips — just close and continue.
      handleRewardClose()
    }
  }, [handleRewardClose])

  const progressPercent = (currentIndex / PROBLEMS_PER_SESSION) * 100

  return (
    <div className={`game-session ${isInactive ? 'game-session--inactive' : ''}`}>
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
          <span
            className="game-session__problem-counter"
            aria-label={`Problem ${currentIndex + 1} of ${PROBLEMS_PER_SESSION}`}
          >
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

      <div
        className="game-session__progress-bar"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={PROBLEMS_PER_SESSION}
      >
        <div
          className="game-session__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {isInactive && (
        <div className="game-session__reminder" aria-live="polite">
          <span className="game-session__reminder-icon" role="img" aria-label="Reminder">👋</span>
          <span className="game-session__reminder-text">!עדיין כאן? בוא נמשיך</span>
        </div>
      )}

      <div className="game-session__problem">
        <ProblemDisplay
          problem={currentProblem}
          feedback={feedback}
          showCorrectAnswer={showCorrectAnswer}
        />
      </div>

      <div className="game-session__input">
        <AnswerChoices
          problem={currentProblem}
          onSelect={handleAnswerSubmit}
          disabled={inputDisabled}
          selectedAnswer={pickedAnswer}
          showCorrect={feedback !== null}
        />
      </div>

      {reward && (
        <RewardClip
          clip={reward}
          durationSeconds={CLIP_DURATION_SECONDS}
          onSkip={handleRewardClose}
          onComplete={handleRewardClose}
          onError={handleRewardError}
        />
      )}
    </div>
  )
}

export default GameSession
