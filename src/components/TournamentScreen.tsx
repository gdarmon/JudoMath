import { useState, useEffect, useRef, useCallback } from 'react'
import type { MathProblem, TournamentState, TournamentSession, TournamentResult } from '../types'
import { generateSession } from '../logic/problemGenerator'
import { validateAnswer } from '../logic/problemGenerator'
import { startTournament, completeSession, calculateTournamentResult } from '../logic/tournament'
import { TOURNAMENT } from '../i18n/he'
import { ProblemDisplay } from './ProblemDisplay'
import { NumberInput } from './NumberInput'
import './TournamentScreen.css'

export interface TournamentScreenProps {
  onComplete: (result: TournamentResult) => void
  onBack: () => void
}

const PROBLEMS_PER_SESSION = 10
const TOTAL_SESSIONS = 3
const FEEDBACK_DURATION_MS = 1000

export function TournamentScreen({ onComplete, onBack }: TournamentScreenProps) {
  const [tournamentState, setTournamentState] = useState<TournamentState>(() => startTournament())
  const [problems, setProblems] = useState<MathProblem[]>(() =>
    generateSession({ count: PROBLEMS_PER_SESSION }),
  )
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timePerProblem, setTimePerProblem] = useState<number[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const [inputDisabled, setInputDisabled] = useState(false)

  const problemStartTimeRef = useRef<number>(Date.now())
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentProblem = problems[currentProblemIndex]
  const currentSessionIndex = tournamentState.currentSessionIndex

  useEffect(() => {
    problemStartTimeRef.current = Date.now()
    setElapsedTime(0)

    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - problemStartTimeRef.current)
    }, 100)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [currentProblemIndex, currentSessionIndex])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const startNextSession = useCallback(() => {
    const newProblems = generateSession({ count: PROBLEMS_PER_SESSION })
    setProblems(newProblems)
    setCurrentProblemIndex(0)
    setAnswers([])
    setTimePerProblem([])
    setFeedback(null)
    setShowCorrectAnswer(false)
    setInputDisabled(false)
  }, [])

  const handleAnswerSubmit = useCallback(
    (answer: number) => {
      const timeTaken = Date.now() - problemStartTimeRef.current
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }

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

        if (nextProblemIndex >= PROBLEMS_PER_SESSION) {
          let correctCount = 0
          for (let i = 0; i < problems.length; i++) {
            if (newAnswers[i] === problems[i].correctAnswer) correctCount++
          }
          const score = Math.round((correctCount / PROBLEMS_PER_SESSION) * 100)

          const completedSession: TournamentSession = {
            problems: [...problems],
            answers: newAnswers,
            score,
            timePerProblem: newTimePerProblem,
          }

          const updatedState = completeSession(tournamentState, completedSession)
          setTournamentState(updatedState)

          if (!updatedState.isActive) {
            const result = calculateTournamentResult(updatedState)
            onComplete(result)
          } else {
            startNextSession()
          }
        } else {
          setCurrentProblemIndex(nextProblemIndex)
          setFeedback(null)
          setShowCorrectAnswer(false)
          setInputDisabled(false)
        }
      }, FEEDBACK_DURATION_MS)
    },
    [
      currentProblem,
      currentProblemIndex,
      answers,
      timePerProblem,
      problems,
      tournamentState,
      onComplete,
      startNextSession,
    ],
  )

  const formatTime = (ms: number): string => TOURNAMENT.timerSeconds(ms / 1000)
  const progressPercent = (currentProblemIndex / PROBLEMS_PER_SESSION) * 100

  return (
    <div className="tournament-screen">
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
          <span
            className="tournament-screen__session-label is-ltr"
            aria-label={TOURNAMENT.sessionLabel(currentSessionIndex + 1, TOTAL_SESSIONS)}
          >
            {currentSessionIndex + 1}/{TOTAL_SESSIONS}
          </span>
        </div>

        <div
          className="tournament-screen__timer"
          aria-live="polite"
          aria-label={TOURNAMENT.timerAria(formatTime(elapsedTime))}
        >
          <span className="tournament-screen__timer-icon" aria-hidden="true">⏱</span>
          <span className="tournament-screen__timer-value is-ltr">{formatTime(elapsedTime)}</span>
        </div>
      </header>

      <div
        className="tournament-screen__progress-bar"
        role="progressbar"
        aria-valuenow={currentProblemIndex + 1}
        aria-valuemin={1}
        aria-valuemax={PROBLEMS_PER_SESSION}
      >
        <div
          className="tournament-screen__progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="tournament-screen__problem-counter">
        <span aria-label={TOURNAMENT.problemLabel(currentProblemIndex + 1, PROBLEMS_PER_SESSION)}>
          {TOURNAMENT.problemLabel(currentProblemIndex + 1, PROBLEMS_PER_SESSION)}
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
        <NumberInput onSubmit={handleAnswerSubmit} disabled={inputDisabled} />
      </div>
    </div>
  )
}

export default TournamentScreen
