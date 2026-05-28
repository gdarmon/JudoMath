import type { LeaderboardEntry } from '../types'
import { LEADERBOARD } from '../i18n/he'
import './Leaderboard.css'

export interface LeaderboardProps {
  entries: LeaderboardEntry[]
  isLoading?: boolean
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getRankDisplay(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

export function Leaderboard({ entries, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="leaderboard" role="region" aria-label={LEADERBOARD.ariaLabel}>
        <h2 className="leaderboard__title">
          <span aria-hidden="true">🏆</span>
          {LEADERBOARD.title}
        </h2>
        <div className="leaderboard__loading" role="status" aria-label={LEADERBOARD.loadingAria}>
          <span className="leaderboard__spinner" aria-hidden="true" />
          <span className="leaderboard__loading-text">{LEADERBOARD.loading}</span>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="leaderboard" role="region" aria-label={LEADERBOARD.ariaLabel}>
        <h2 className="leaderboard__title">
          <span aria-hidden="true">🏆</span>
          {LEADERBOARD.title}
        </h2>
        <div className="leaderboard__empty" role="status">
          <span className="leaderboard__empty-icon" aria-hidden="true">📭</span>
          <p className="leaderboard__empty-text">{LEADERBOARD.empty}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="leaderboard" role="region" aria-label={LEADERBOARD.ariaLabel}>
      <h2 className="leaderboard__title">
        <span aria-hidden="true">🏆</span>
        {LEADERBOARD.title}
      </h2>

      <ol className="leaderboard__list" aria-label={LEADERBOARD.ariaLabel}>
        {entries.slice(0, 10).map((entry, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3
          return (
            <li
              key={`${entry.playerId}-${entry.date}`}
              className={`leaderboard__entry ${isTopThree ? 'leaderboard__entry--top' : ''}`}
              aria-label={LEADERBOARD.rowAria(
                rank,
                entry.playerName,
                entry.totalScore,
                formatTime(entry.totalTime),
              )}
            >
              <span
                className={`leaderboard__rank ${isTopThree ? 'leaderboard__rank--medal' : ''}`}
                aria-hidden="true"
              >
                {getRankDisplay(rank)}
              </span>
              <span className="leaderboard__name">{entry.playerName}</span>
              <span className="leaderboard__score is-ltr">{entry.totalScore}%</span>
              <span className="leaderboard__time is-ltr">{formatTime(entry.totalTime)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default Leaderboard
