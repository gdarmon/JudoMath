import type { PlayerProgress } from '../types';
import { Belt } from '../types';
import './PlayerProfile.css';

export interface PlayerProfileProps {
  player: PlayerProgress;
  onBack: () => void;
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

const STRIPES_FOR_PROMOTION = 3;

export function PlayerProfile({ player, onBack }: PlayerProfileProps) {
  const stripesRemaining = STRIPES_FOR_PROMOTION - player.currentStripes;
  const overallPercentage =
    player.totalProblems > 0
      ? Math.round((player.totalCorrect / player.totalProblems) * 100)
      : 0;

  return (
    <div className="screen screen--profile player-profile">
      {/* Avatar section */}
      <div className="player-profile__avatar-section">
        <div
          className="player-profile__avatar"
          aria-label={`Player avatar with ${BELT_NAMES[player.currentBelt]} belt`}
        >
          <span className="player-profile__avatar-icon" role="img" aria-hidden="true">
            🥋
          </span>
          <span
            className="player-profile__belt-indicator"
            style={{ backgroundColor: BELT_COLORS[player.currentBelt] }}
            aria-hidden="true"
          />
        </div>

        {/* Belt badge */}
        <span
          className="player-profile__belt-badge"
          style={{
            backgroundColor: BELT_COLORS[player.currentBelt],
            color: BELT_TEXT_COLORS[player.currentBelt],
          }}
        >
          {BELT_NAMES[player.currentBelt]} Belt
        </span>
      </div>

      {/* Stripe progress */}
      <div className="player-profile__stripes-section">
        <h2 className="player-profile__section-title">Stripe Progress</h2>
        <div className="player-profile__stripes-display" aria-label={`${player.currentStripes} of ${STRIPES_FOR_PROMOTION} stripes earned`}>
          {Array.from({ length: STRIPES_FOR_PROMOTION }).map((_, i) => (
            <span
              key={i}
              className={`player-profile__stripe ${i < player.currentStripes ? 'player-profile__stripe--earned' : 'player-profile__stripe--empty'}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="player-profile__stripes-text">
          {player.currentStripes}/{STRIPES_FOR_PROMOTION} stripes
          {stripesRemaining > 0 && (
            <span className="player-profile__stripes-remaining">
              {' '}— {stripesRemaining} more for next belt!
            </span>
          )}
        </p>
      </div>

      {/* Stats section */}
      <div className="player-profile__stats-section">
        <h2 className="player-profile__section-title">Stats</h2>
        <div className="player-profile__stats-grid">
          <div className="player-profile__stat-card">
            <span className="player-profile__stat-icon" role="img" aria-hidden="true">📚</span>
            <span className="player-profile__stat-value">{player.totalSessions}</span>
            <span className="player-profile__stat-label">Sessions Played</span>
          </div>
          <div className="player-profile__stat-card">
            <span className="player-profile__stat-icon" role="img" aria-hidden="true">✅</span>
            <span className="player-profile__stat-value">{overallPercentage}%</span>
            <span className="player-profile__stat-label">Correct</span>
          </div>
        </div>
      </div>

      {/* Back button */}
      <button
        className="player-profile__back-button"
        onClick={onBack}
        aria-label="Back to Menu"
      >
        <span className="player-profile__back-icon" role="img" aria-hidden="true">⬅️</span>
        <span className="player-profile__back-label">Back to Menu</span>
      </button>
    </div>
  );
}

export default PlayerProfile;
