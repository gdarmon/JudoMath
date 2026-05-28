import { useState, useEffect, useRef, useCallback } from 'react'
import { Belt } from '../types'
import type { MathProblem, TournamentState, TournamentSession, TournamentResult } from '../types'
import { generateSession } from '../logic/problemGenerator'
import { validateAnswer } from '../logic/problemGenerator'
import { startTournament, completeSession, calculateTournamentResult } from '../logic/tournament'
import {
  calculateChampionshipPlacement,
  getChampionshipStageForBelt,
} from '../logic/championship'
import { TOURNAMENT } from '../i18n/he'
import { ProblemDisplay } from './ProblemDisplay'
import { NumberInput } from './NumberInput'
import './TournamentScreen.css'

export type TournamentVariant = 'classic' | 'championship'

export interface TournamentScreenProps {
  onComplete: (result: TournamentResult) => void
  onBack: () => void
  currentBelt?: Belt
  variant?: TournamentVariant
}

const CLASSIC_PROBLEMS_PER_SESSION = 10
const CLASSIC_TOTAL_SESSIONS = 3
const FEEDBACK_DURATION_MS = 1000
const TIMED_OUT_ANSWER = -1

export function TournamentScreen({
  onComplete,
  onBack,
  currentBelt = Belt.White,
  variant = 'classic',
}: TournamentScreenProps) {
  const isChampionship = variant === 'championship'
  const championshipStage = isChampionship ? getChampionshipStageForBelt(currentBelt) : null
  const problemsPerSession = championshipStage?.questionCount ?? CLASSIC_PROBLEMS_PER_SESSION
  const totalSessions = championshipStage ? 1 : CLASSIC_TOTAL_SESSIONS
  const timeLimitMs = championshipStage ? championshipStage.secondsPerQuestion * 1000 : null

  const [showIntro, setShowIntro] = useState(isChampionship)
  const [tournamentState, setTournamentState] = useState<TournamentState>(() =>
    startTournament(totalSessions),
  )
  const [problems, setProblems] = useState<MathProblem[]>(() =>
    generateSession({ count: problemsPerSession }),
  )
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timePerProblem, setTimePerProblem] = useState<number[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimitMs ?? 0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)

  const problemStartTimeRef = useRef<number>(0)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentProblem = problems[currentProblemIndex]
  const currentSessionIndex = tournamentState.currentSessionIndex

  const clearQuestionTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  const startNextSession = useCallback(() => {
    const newProblems = generateSession({ count: problemsPerSession })
    setProblems(newProblems)
    setCurrentProblemIndex(0)
    setAnswers([])
    setTimePerProblem([])
    setFeedback(null)
    setShowCorrectAnswer(false)
    setInputDisabled(false)
    setElapsedTime(0)
    setTimeLeft(timeLimitMs ?? 0)
  }, [problemsPerSession, timeLimitMs])

  const completeTournamentSession = useCallback(
    (newAnswers: number[], newTimePerProblem: number[]) => {
      let correctCount = 0
      for (let i = 0; i < problems.length; i++) {
        if (newAnswers[i] === problems[i].correctAnswer) correctCount++
      }

      const score = Math.round((correctCount / problemsPerSession) * 100)
      const completedSession: TournamentSession = {
        problems: [...problems],
        answers: newAnswers,
        score,
        timePerProblem: newTimePerProblem,
      }

      const updatedState = completeSession(tournamentState, completedSession)
      setTournamentState(updatedState)

      if (!updatedState.isActive) {
        const baseResult = calculateTournamentResult(updatedState)
        if (championshipStage) {
          onComplete({
            ...baseResult,
            placement: calculateChampionshipPlacement(
              baseResult.totalCorrect ?? 0,
              baseResult.totalProblems ?? problemsPerSession,
            ),
            championshipStage,
          })
        } else {
          onComplete(baseResult)
        }
      } else {
        startNextSession()
      }
    },
    [
      championshipStage,
      onComplete,
      problems,
      problemsPerSession,
      startNextSession,
      tournamentState,
    ],
  )

  const handleAnswerSubmit = useCallback(
    (answer: number) => {
      if (inputDisabled) return

      clearQuestionTimer()
      const startTime = problemStartTimeRef.current || Date.now()
      const rawTimeTaken = Date.now() - startTime
      const timeTaken = timeLimitMs ? Math.min(rawTimeTaken, timeLimitMs) : rawTimeTaken
      const isCorrect = validateAnswer(currentProblem, answer)

      setFeedback(isCorrect ? 'correct' : 'incorrect')
      setShowCorrectAnswer(!isCorrect)
      setInputDisabled(true)

      const newAnswers = [...answers, answer]
      const newTimePerProblem = [...timePerProblem, timeTaken]
      setAnswers(newAnswers)
      setTimePerProblem(newTimePerProblem)

      feedbackTimerRef.current = setTimeout(() => {
        const nextProblemIndex = currentProblemIndex + 1

        if (nextProblemIndex >= problemsPerSession) {
          completeTournamentSession(newAnswers, newTimePerProblem)
        } else {
          setCurrentProblemIndex(nextProblemIndex)
          setFeedback(null)
          setShowCorrectAnswer(false)
          setInputDisabled(false)
          setElapsedTime(0)
          setTimeLeft(timeLimitMs ?? 0)
        }
      }, FEEDBACK_DURATION_MS)
    },
    [
      answers,
      clearQuestionTimer,
      completeTournamentSession,
      currentProblem,
      currentProblemIndex,
      inputDisabled,
      problemsPerSession,
      timeLimitMs,
      timePerProblem,
    ],
  )

  useEffect(() => {
    if (showIntro || inputDisabled) return

    problemStartTimeRef.current = Date.now()

    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - problemStartTimeRef.current
      setElapsedTime(elapsed)

      if (timeLimitMs !== null) {
        const remaining = Math.max(0, timeLimitMs - elapsed)
        setTimeLeft(remaining)

        if (remaining <= 0) {
          clearQuestionTimer()
          handleAnswerSubmit(TIMED_OUT_ANSWER)
        }
      }
    }, 100)

    return clearQuestionTimer
  }, [
    clearQuestionTimer,
    currentProblemIndex,
    currentSessionIndex,
    handleAnswerSubmit,
    inputDisabled,
    showIntro,
    timeLimitMs,
  ])

  useEffect(() => {
    return () => {
      clearQuestionTimer()
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [clearQuestionTimer])

  const formatTime = (ms: number): string => TOURNAMENT.timerSeconds(ms / 1000)
  const progressPercent = (currentProblemIndex / problemsPerSession) * 100
  const secondsLeft = Math.ceil(timeLeft / 1000)
  const timerText = championshipStage
    ? TOURNAMENT.countdownSeconds(secondsLeft)
    : formatTime(elapsedTime)
  const timerAria = championshipStage
    ? TOURNAMENT.countdownAria(timerText)
    : TOURNAMENT.timerAria(timerText)

  if (championshipStage && showIntro) {
    return (
      <div className="tournament-screen tournament-screen--championship">
        <header className="tournament-screen__header">
          <button
            className="tournament-screen__back-btn"
            onClick={onBack}
            aria-label={TOURNAMENT.backAria}
            type="button"
          >
            <span aria-hidden="true">→</span> {TOURNAMENT.back}
          </button>
        </header>

        <section
          className="championship-intro"
          role="region"
          aria-label={TOURNAMENT.championshipIntroAria(championshipStage.title)}
        >
          <span className="championship-intro__badge">{TOURNAMENT.championshipBadge}</span>
          <h2 className="championship-intro__title">
            {TOURNAMENT.championshipIntroTitle(championshipStage.title)}
          </h2>
          <p className="championship-intro__description">
            {championshipStage.description}
          </p>
          <div className="championship-intro__rules">
            <span className="championship-intro__rule">
              {TOURNAMENT.championshipIntroRules(
                championshipStage.questionCount,
                championshipStage.secondsPerQuestion,
              )}
            </span>
            <span className="championship-intro__rule">
              {TOURNAMENT.championshipIntroPlacement}
            </span>
          </div>
          <button
            type="button"
            className="championship-intro__start"
            onClick={() => setShowIntro(false)}
            aria-label={TOURNAMENT.championshipStart}
          >
            <span aria-hidden="true">🥋</span>
            {TOURNAMENT.championshipStart}
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className={`tournament-screen ${championshipStage ? 'tournament-screen--championship' : ''}`}>
      <header className="tournament-screen__header">
        <button
          className="tournament-screen__back-btn"
          onClick={onBack}
          aria-label={TOURNAMENT.backAria}
          type="button"
        >
          <span aria-hidden="true">→</span> {TOURNAMENT.back}
        </button>

        <div className="tournament-screen__session-info">
          {championshipStage ? (
            <span
              className="tournament-screen__session-label"
              aria-label={TOURNAMENT.stageLabel(championshipStage.title)}
            >
              {championshipStage.shortTitle}
            </span>
          ) : (
            <span
              className="tournament-screen__session-label is-ltr"
              aria-label={TOURNAMENT.sessionLabel(currentSessionIndex + 1, totalSessions)}
            >
              {currentSessionIndex + 1}/{totalSessions}
            </span>
          )}
        </div>

        <div
          className={`tournament-screen__timer ${
            championshipStage && timeLeft <= 3000 ? 'tournament-screen__timer--urgent' : ''
          }`}
          aria-live="polite"
          aria-label={timerAria}
        >
          <span className="tournament-screen__timer-icon" aria-hidden="true">⏱</span>
          <span className="tournament-screen__timer-value is-ltr">{timerText}</span>
        </div>
      </header>

      <div
        className="tournament-screen__progress-bar"
        role="progressbar"
        aria-valuenow={currentProblemIndex + 1}
        aria-valuemin={1}
        aria-valuemax={problemsPerSession}
      >
        <div
          className="tournament-screen__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="tournament-screen__problem-counter">
        <span aria-label={TOURNAMENT.problemLabel(currentProblemIndex + 1, problemsPerSession)}>
          {TOURNAMENT.problemLabel(currentProblemIndex + 1, problemsPerSession)}
        </span>
      </div>

      <div className="tournament-screen__problem">
        <ProblemDisplay
          problem={currentProblem}
          feedback={feedback}
          showCorrectAnswer={showCorrectAnswer}
        />
      </div>

      <div className="tournament-screen__input">
        <NumberInput
          key={`${currentSessionIndex}-${currentProblemIndex}`}
          onSubmit={handleAnswerSubmit}
          disabled={inputDisabled}
        />
      </div>
    </div>
  )
}

export default TournamentScreen
