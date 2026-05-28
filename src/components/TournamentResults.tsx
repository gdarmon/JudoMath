import type { TournamentResult } from '../types';
import './TournamentResults.css';

export interface TournamentResultsProps {
  result: TournamentResult;
  onMainMenu: () => void;
  onPlayAgain: () => void;
}

/** Format milliseconds as mm:ss */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Returns a celebration emoji based on tournament score */
function getTournamentEmoji(score: number): string {
  if (score === 100) return '🏆';
  if (score >= 75) return '🥇';
  if (score >= 50) return '🥈';
  return '🥉';
}

/** Returns an encouraging message based on tournament score */
function getTournamentMessage(score: number): string {
  if (score === 100) return 'Champion!';
  if (score >= 75) return 'Amazing!';
  if (score >= 50) return 'Well done!';
  return 'Good try!';
}

export function TournamentResults({
  result,
  onMainMenu,
  onPlayAgain,
}: TournamentResultsProps) {
  const emoji = getTournamentEmoji(result.totalScore);
  const message = getTournamentMessage(result.totalScore);
  const isGreatScore = result.totalScore >= 75;

  return (
    <div className="tournament-results" role="region" aria-label="Tournament results">
      {/* Celebration header */}
      <div className={`tournament-results__header ${isGreatScore ? 'tournament-results__header--celebrate' : ''}`}>
        <span className="tournament-results__emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
        <h2 className="tournament-results__message">{message}</h2>
      </div>

      {/* Score display */}
      <div className="tournament-results__score" aria-label={`Total score: ${result.totalScore} percent`}>
        <span className="tournament-results__score-value">{result.totalScore}%</span>
      </div>

      {/* Stats */}
      <div className="tournament-results__stats">
        <div className="tournament-results__stat">
          <span className="tournament-results__stat-icon" role="img" aria-hidden="true">⏱️</span>
          <span className="tournament-results__stat-label">Time</span>
          <span className="tournament-results__stat-value" aria-label={`Completion time: ${formatTime(result.totalTime)}`}>
            {formatTime(result.totalTime)}
          </span>
        </div>

        <div className="tournament-results__stat">
          <span className="tournament-results__stat-icon" role="img" aria-hidden="true">📋</span>
          <span className="tournament-results__stat-label">Sessions</span>
          <span className="tournament-results__stat-value" aria-label={`${result.sessionsCompleted} of 3 sessions completed`}>
            {result.sessionsCompleted}/3
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="tournament-results__actions">
        <button
          className="tournament-results__button tournament-results__button--play-again"
          onClick={onPlayAgain}
          aria-label="Play Again"
        >
          <span className="tournament-results__button-icon" role="img" aria-hidden="true">🔄</span>
          <span className="tournament-results__button-label">Play Again</span>
        </button>

        <button
          className="tournament-results__button tournament-results__button--main-menu"
          onClick={onMainMenu}
          aria-label="Main Menu"
        >
          <span className="tournament-results__button-icon" role="img" aria-hidden="true">🏠</span>
          <span className="tournament-results__button-label">Main Menu</span>
        </button>
      </div>
    </div>
  );
}

export default TournamentResults;
