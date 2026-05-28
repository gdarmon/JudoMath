import type { LeaderboardEntry } from '../types';
import './Leaderboard.css';

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

/** Format milliseconds as mm:ss */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Returns a medal emoji for top 3 ranks */
function getRankDisplay(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

export function Leaderboard({ entries, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="leaderboard" role="region" aria-label="Leaderboard">
        <h2 className="leaderboard__title">
          <span className="leaderboard__title-icon" role="img" aria-hidden="true">🏆</span>
          Leaderboard
        </h2>
        <div className="leaderboard__loading" role="status" aria-label="Loading leaderboard">
          <span className="leaderboard__spinner" aria-hidden="true"></span>
          <span className="leaderboard__loading-text">Loading...</span>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="leaderboard" role="region" aria-label="Leaderboard">
        <h2 className="leaderboard__title">
          <span className="leaderboard__title-icon" role="img" aria-hidden="true">🏆</span>
          Leaderboard
        </h2>
        <div className="leaderboard__empty" role="status">
          <span className="leaderboard__empty-icon" role="img" aria-hidden="true">📭</span>
          <p className="leaderboard__empty-text">No scores yet. Be the first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard" role="region" aria-label="Leaderboard">
      <h2 className="leaderboard__title">
        <span className="leaderboard__title-icon" role="img" aria-hidden="true">🏆</span>
        Leaderboard
      </h2>

      <ol className="leaderboard__list" aria-label="Top 10 scores">
        {entries.slice(0, 10).map((entry, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <li
              key={`${entry.playerId}-${entry.date}`}
              className={`leaderboard__entry ${isTopThree ? 'leaderboard__entry--top' : ''}`}
              aria-label={`Rank ${rank}: ${entry.playerName}, score ${entry.totalScore} percent, time ${formatTime(entry.totalTime)}`}
            >
              <span className={`leaderboard__rank ${isTopThree ? 'leaderboard__rank--medal' : ''}`}>
                {getRankDisplay(rank)}
              </span>
              <span className="leaderboard__name">{entry.playerName}</span>
              <span className="leaderboard__score">{entry.totalScore}%</span>
              <span className="leaderboard__time">{formatTime(entry.totalTime)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default Leaderboard;
