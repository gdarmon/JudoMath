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
  const isChampionship = result.placement !== undefined && result.championshipStage !== undefined
  const emoji = isChampionship && result.placement === 1 ? '🏆' : getTournamentEmoji(result.totalScore)
  const message = isChampionship
    ? TOURNAMENT_RESULTS.placementMessage(result.placement!)
    : getTournamentMessage(result.totalScore)
  const isGreatScore = isChampionship ? result.placement! <= 3 : result.totalScore >= 75
  const playAgainLabel = isChampionship
    ? TOURNAMENT_RESULTS.playChampionshipAgain
    : TOURNAMENT_RESULTS.playAgain

  return (
    <div className="tournament-results" role="region" aria-label={TOURNAMENT_RESULTS.regionLabel}>
      <div
        className={`tournament-results__header ${isGreatScore ? 'tournament-results__header--celebrate' : ''}`}
      >
        <span className="tournament-results__emoji" aria-hidden="true">{emoji}</span>
        <h2 className="tournament-results__message">{message}</h2>
        {isChampionship && (
          <p className="tournament-results__stage">
            {result.championshipStage!.title}
          </p>
        )}
      </div>

      <div
        className={`tournament-results__score ${
          isChampionship ? 'tournament-results__score--placement' : ''
        }`}
        aria-label={
          isChampionship
            ? TOURNAMENT_RESULTS.placementAria(result.placement!)
            : TOURNAMENT_RESULTS.scoreAria(result.totalScore)
        }
      >
        {isChampionship ? (
          <>
            <span className="tournament-results__score-label">
              {TOURNAMENT_RESULTS.placementLabel}
            </span>
            <span className="tournament-results__score-value is-ltr">
              {result.placement}
            </span>
          </>
        ) : (
          <span className="tournament-results__score-value is-ltr">{result.totalScore}%</span>
        )}
      </div>

      <div className="tournament-results__stats">
        {isChampionship && (
          <div className="tournament-results__stat">
            <span className="tournament-results__stat-icon" aria-hidden="true">✓</span>
            <span className="tournament-results__stat-label">
              {TOURNAMENT_RESULTS.correctLabel}
            </span>
            <span className="tournament-results__stat-value is-ltr">
              {TOURNAMENT_RESULTS.correctValue(
                result.totalCorrect ?? 0,
                result.totalProblems ?? 0,
              )}
            </span>
          </div>
        )}

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
          <span className="tournament-results__stat-label">
            {isChampionship ? TOURNAMENT_RESULTS.questionsLabel : TOURNAMENT_RESULTS.sessionsLabel}
          </span>
          <span
            className="tournament-results__stat-value is-ltr"
            aria-label={
              isChampionship
                ? `${result.totalProblems ?? 0} ${TOURNAMENT_RESULTS.questionsLabel}`
                : TOURNAMENT_RESULTS.sessionsAria(result.sessionsCompleted, 3)
            }
          >
            {isChampionship
              ? result.totalProblems ?? 0
              : TOURNAMENT_RESULTS.sessionsValue(result.sessionsCompleted, 3)}
          </span>
        </div>
      </div>

      <div className="tournament-results__actions">
        <button
          type="button"
          className="tournament-results__button tournament-results__button--play-again"
          onClick={onPlayAgain}
          aria-label={playAgainLabel}
        >
          <span className="tournament-results__button-icon" aria-hidden="true">🔄</span>
          <span className="tournament-results__button-label">{playAgainLabel}</span>
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
