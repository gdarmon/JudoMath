import type { TournamentResult } from '../types'
import { TOURNAMENT_RESULTS } from '../i18n/he'
import './TournamentResults.css'

export interface TournamentResultsProps {
  result: TournamentResult
  onMainMenu: () => void
  onPlayAgain: () => void
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getTournamentEmoji(score: number): string {
  if (score === 100) return '🏆'
  if (score >= 75) return '🥇'
  if (score >= 50) return '🥈'
  return '🥉'
}

function getTournamentMessage(score: number): string {
  if (score === 100) return TOURNAMENT_RESULTS.champion
  if (score >= 75) return TOURNAMENT_RESULTS.amazing
  if (score >= 50) return TOURNAMENT_RESULTS.wellDone
  return TOURNAMENT_RESULTS.goodTry
}

export function TournamentResults({ result, onMainMenu, onPlayAgain }: TournamentResultsProps) {
  const emoji = getTournamentEmoji(result.totalScore)
  const message = getTournamentMessage(result.totalScore)
  const isGreatScore = result.totalScore >= 75

  return (
    <div className="tournament-results" role="region" aria-label={TOURNAMENT_RESULTS.regionLabel}>
      <div
        className={`tournament-results__header ${isGreatScore ? 'tournament-results__header--celebrate' : ''}`}
      >
        <span className="tournament-results__emoji" aria-hidden="true">{emoji}</span>
        <h2 className="tournament-results__message">{message}</h2>
      </div>

      <div
        className="tournament-results__score"
        aria-label={TOURNAMENT_RESULTS.scoreAria(result.totalScore)}
      >
        <span className="tournament-results__score-value is-ltr">{result.totalScore}%</span>
      </div>

      <div className="tournament-results__stats">
        <div className="tournament-results__stat">
          <span className="tournament-results__stat-icon" aria-hidden="true">⏱️</span>
          <span className="tournament-results__stat-label">{TOURNAMENT_RESULTS.timeLabel}</span>
          <span
            className="tournament-results__stat-value is-ltr"
            aria-label={TOURNAMENT_RESULTS.timeAria(formatTime(result.totalTime))}
          >
            {formatTime(result.totalTime)}
          </span>
        </div>

        <div className="tournament-results__stat">
          <span className="tournament-results__stat-icon" aria-hidden="true">📋</span>
          <span className="tournament-results__stat-label">{TOURNAMENT_RESULTS.sessionsLabel}</span>
          <span
            className="tournament-results__stat-value is-ltr"
            aria-label={TOURNAMENT_RESULTS.sessionsAria(result.sessionsCompleted, 3)}
          >
            {TOURNAMENT_RESULTS.sessionsValue(result.sessionsCompleted, 3)}
          </span>
        </div>
      </div>

      <div className="tournament-results__actions">
        <button
          type="button"
          className="tournament-results__button tournament-results__button--play-again"
          onClick={onPlayAgain}
          aria-label={TOURNAMENT_RESULTS.playAgain}
        >
          <span className="tournament-results__button-icon" aria-hidden="true">🔄</span>
          <span className="tournament-results__button-label">{TOURNAMENT_RESULTS.playAgain}</span>
        </button>

        <button
          type="button"
          className="tournament-results__button tournament-results__button--main-menu"
          onClick={onMainMenu}
          aria-label={TOURNAMENT_RESULTS.mainMenu}
        >
          <span className="tournament-results__button-icon" aria-hidden="true">🏠</span>
          <span className="tournament-results__button-label">{TOURNAMENT_RESULTS.mainMenu}</span>
        </button>
      </div>
    </div>
  )
}

export default TournamentResults
