import { Belt } from '../types';
import './SessionResults.css';

export interface SessionResultsProps {
  correctCount: number;
  totalCount: number;
  score: number;
  stripeAwarded: boolean;
  beltPromotion: boolean;
  newBelt?: Belt;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

/** Maps Belt enum values to display names */
const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'White',
  [Belt.Yellow]: 'Yellow',
  [Belt.Orange]: 'Orange',
  [Belt.Green]: 'Green',
  [Belt.Blue]: 'Blue',
  [Belt.Brown]: 'Brown',
  [Belt.Black]: 'Black',
};

/** Maps Belt enum values to CSS colors */
const BELT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#f5f5f5',
  [Belt.Yellow]: '#fdd835',
  [Belt.Orange]: '#ff9800',
  [Belt.Green]: '#4caf50',
  [Belt.Blue]: '#2196f3',
  [Belt.Brown]: '#795548',
  [Belt.Black]: '#212121',
};

/** Maps Belt enum values to text colors for contrast */
const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#333333',
  [Belt.Yellow]: '#333333',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
};

/** Returns a celebration emoji based on score */
function getScoreEmoji(score: number): string {
  if (score === 100) return '🌟';
  if (score >= 75) return '🎉';
  if (score >= 50) return '👍';
  return '💪';
}

/** Returns an encouraging message based on score */
function getScoreMessage(score: number): string {
  if (score === 100) return 'Perfect!';
  if (score >= 75) return 'Great job!';
  if (score >= 50) return 'Good effort!';
  return 'Keep practicing!';
}

export function SessionResults({
  correctCount,
  totalCount,
  score,
  stripeAwarded,
  beltPromotion,
  newBelt,
  onPlayAgain,
  onMainMenu,
}: SessionResultsProps) {
  const emoji = getScoreEmoji(score);
  const message = getScoreMessage(score);
  const isGoodScore = score >= 75;

  return (
    <div className="session-results" role="region" aria-label="Session results">
      {/* Celebration header */}
      <div className={`session-results__header ${isGoodScore ? 'session-results__header--celebrate' : ''}`}>
        <span className="session-results__emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
        <h2 className="session-results__message">{message}</h2>
      </div>

      {/* Score display */}
      <div className="session-results__score" aria-label={`Score: ${score} percent`}>
        <span className="session-results__score-value">{score}%</span>
      </div>

      {/* Correct count */}
      <p className="session-results__count" aria-label={`${correctCount} out of ${totalCount} correct`}>
        {correctCount}/{totalCount} correct
      </p>

      {/* Stripe awarded indicator */}
      {stripeAwarded && (
        <div className="session-results__stripe" role="status" aria-label="Stripe earned">
          <span className="session-results__stripe-icon" role="img" aria-hidden="true">⫼</span>
          <span className="session-results__stripe-text">Stripe Earned!</span>
        </div>
      )}

      {/* Belt promotion indicator */}
      {beltPromotion && newBelt !== undefined && (
        <div
          className="session-results__promotion"
          role="status"
          aria-label={`Promoted to ${BELT_NAMES[newBelt]} belt`}
        >
          <span className="session-results__promotion-icon" role="img" aria-hidden="true">🥋</span>
          <span className="session-results__promotion-text">
            New Belt:{' '}
            <span
              className="session-results__belt-name"
              style={{
                backgroundColor: BELT_COLORS[newBelt],
                color: BELT_TEXT_COLORS[newBelt],
              }}
            >
              {BELT_NAMES[newBelt]}
            </span>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="session-results__actions">
        <button
          className="session-results__button session-results__button--play-again"
          onClick={onPlayAgain}
          aria-label="Play Again"
        >
          <span className="session-results__button-icon" role="img" aria-hidden="true">▶️</span>
          <span className="session-results__button-label">Play Again</span>
        </button>

        <button
          className="session-results__button session-results__button--main-menu"
          onClick={onMainMenu}
          aria-label="Main Menu"
        >
          <span className="session-results__button-icon" role="img" aria-hidden="true">🏠</span>
          <span className="session-results__button-label">Main Menu</span>
        </button>
      </div>
    </div>
  );
}

export default SessionResults;
