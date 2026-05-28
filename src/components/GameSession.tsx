import { useState, useEffect, useRef, useCallback } from 'react'
import { Belt } from '../types'
import type { MathProblem } from '../types'
import { generateSession, validateAnswer } from '../logic/problemGenerator'
import { pickNextClip, pickFallbackClip } from '../logic/clipRotation'
import { JUDO_CLIPS, CLIP_DURATION_SECONDS } from '../data/judoClips'
import type { JudoClip } from '../data/judoClips'
import { getBeltColor } from '../logic/beltColors'
import { GAME, BELT_NAMES, PROBLEM } from '../i18n/he'
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
const STREAK_PRAISE_START = 3

const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#2d2a33',
  [Belt.Yellow]: '#2d2a33',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
}

function praiseForStreak(streak: number): string | undefined {
  if (streak < STREAK_PRAISE_START) return undefined
  const praiseIndex = (streak - STREAK_PRAISE_START) % PROBLEM.streakMessages.length
  return PROBLEM.streakMessages[praiseIndex]
}

export function GameSession({
  onComplete,
  onBack,
  currentBelt,
  currentStripes,
}: GameSessionProps) {
  const beltValue = currentBelt ?? Belt.White
  const stripes = currentStripes ?? 0

  const [problems] = useState<MathProblem[]>(() =>
    generateSession({ count: PROBLEMS_PER_SESSION }),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)
  const [isInactive, setIsInactive] = useState(false)
  const [pickedAnswer, setPickedAnswer] = useState<number | null>(null)
  const [reward, setReward] = useState<JudoClip | null>(null)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [correctPraise, setCorrectPraise] = useState<string | undefined>(undefined)
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
        const nextStreak = correctStreak + 1
        setCorrectCount((prev) => prev + 1)
        setCorrectStreak(nextStreak)
        setCorrectPraise(praiseForStreak(nextStreak))
        setFeedback('correct')
        setShowCorrectAnswer(false)

        feedbackTimerRef.current = setTimeout(() => {
          const clip = pickNextClip(JUDO_CLIPS)
          pendingNextRef.current = () => advanceOrFinish(correctCount + 1)
          setReward(clip)
        }, FEEDBACK_DURATION_MS)
      } else {
        setCorrectStreak(0)
        setCorrectPraise(undefined)
        setFeedback('incorrect')
        setShowCorrectAnswer(true)

        feedbackTimerRef.current = setTimeout(() => {
          advanceOrFinish(correctCount)
        }, FEEDBACK_DURATION_MS + 600)
      }
    },
    [
      advanceOrFinish,
      correctCount,
      correctStreak,
      currentProblem,
      inputDisabled,
      resetInactivityTimer,
    ],
  )

  const handleRewardClose = useCallback(() => {
    setReward(null)
    failedClipsRef.current = new Set()
    const next = pendingNextRef.current
    pendingNextRef.current = null
    if (next) next()
  }, [])

  const handleRewardError = useCallback(
    (failedYoutubeId: string) => {
      failedClipsRef.current.add(failedYoutubeId)
      const fallback = pickFallbackClip(JUDO_CLIPS, failedClipsRef.current)
      if (fallback) {
        setReward(fallback)
      } else {
        handleRewardClose()
      }
    },
    [handleRewardClose],
  )

  const progressPercent = (currentIndex / PROBLEMS_PER_SESSION) * 100

  return (
    <div className={`game-session ${isInactive ? 'game-session--inactive' : ''}`}>
      <header className="game-session__header">
        <button
          className="game-session__back-btn"
          onClick={onBack}
          aria-label={GAME.back}
          type="button"
        >
          <span aria-hidden="true">→</span> {GAME.backShort}
        </button>

        <div className="game-session__progress-info">
          <span
            className="game-session__problem-counter is-ltr"
            aria-label={GAME.questionOf(currentIndex + 1, PROBLEMS_PER_SESSION)}
          >
            {GAME.questionShort(currentIndex + 1, PROBLEMS_PER_SESSION)}
          </span>
        </div>

        <div
          className="game-session__belt-indicator"
          style={{
            backgroundColor: getBeltColor(beltValue),
            color: BELT_TEXT_COLORS[beltValue],
          }}
          aria-label={`חגורה ${BELT_NAMES[beltValue]}, ${stripes} פסים`}
        >
          <span className="game-session__belt-name">{BELT_NAMES[beltValue]}</span>
          {stripes > 0 && (
            <span className="game-session__belt-stripes" aria-hidden="true">
              {'⫼'.repeat(stripes)}
            </span>
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
        <div
          className="game-session__reminder"
          role="status"
          aria-label={GAME.inactiveAriaLabel}
        >
          {GAME.reminder}
        </div>
      )}

      <div className="game-session__problem">
        <ProblemDisplay
          problem={currentProblem}
          feedback={feedback}
          showCorrectAnswer={showCorrectAnswer}
          correctMessage={correctPraise}
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
