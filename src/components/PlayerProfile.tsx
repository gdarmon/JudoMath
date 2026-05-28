import type { PlayerProgress } from '../types'
import { Belt } from '../types'
import { PROFILE, BELT_NAMES, beltLabel } from '../i18n/he'
import { getBeltColor } from '../logic/beltColors'
import './PlayerProfile.css'

export interface PlayerProfileProps {
  player: PlayerProgress
  onBack: () => void
}

const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#2d2a33',
  [Belt.Yellow]: '#2d2a33',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
}

const STRIPES_FOR_PROMOTION = 3

export function PlayerProfile({ player, onBack }: PlayerProfileProps) {
  const stripesRemaining = STRIPES_FOR_PROMOTION - player.currentStripes
  const overallPercentage =
    player.totalProblems > 0
      ? Math.round((player.totalCorrect / player.totalProblems) * 100)
      : 0

  return (
    <div className="player-profile">
      {/* Avatar + belt */}
      <section className="player-profile__avatar-section">
        <div className="player-profile__avatar" aria-label={PROFILE.avatarAria(player.currentBelt)}>
          <span className="player-profile__avatar-glow" aria-hidden="true" />
          <span className="player-profile__avatar-icon" role="img" aria-hidden="true">🥋</span>
        </div>

        <span
          className="player-profile__belt-badge"
          style={{
            backgroundColor: getBeltColor(player.currentBelt),
            color: BELT_TEXT_COLORS[player.currentBelt],
          }}
        >
          {beltLabel(player.currentBelt)}
        </span>
      </section>

      {/* Stripe progress card */}
      <section className="player-profile__card">
        <h2 className="player-profile__card-title">{PROFILE.stripesTitle}</h2>

        <div
          className="player-profile__stripes-display"
          aria-label={PROFILE.stripesAria(player.currentStripes, STRIPES_FOR_PROMOTION)}
        >
          {Array.from({ length: STRIPES_FOR_PROMOTION }).map((_, i) => (
            <span
              key={i}
              className={`player-profile__stripe ${i < player.currentStripes ? 'is-earned' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <p className="player-profile__stripes-text">
          <span className="is-ltr">
            {PROFILE.stripesText(player.currentStripes, STRIPES_FOR_PROMOTION)}
          </span>
          {stripesRemaining > 0 && (
            <span className="player-profile__stripes-remaining">
              {' — '}
              {PROFILE.stripesRemaining(stripesRemaining)}
            </span>
          )}
        </p>
      </section>

      {/* Stats card */}
      <section className="player-profile__card">
        <h2 className="player-profile__card-title">{PROFILE.statsTitle}</h2>

        <div className="player-profile__stats-grid">
          <div className="player-profile__stat-card">
            <span className="player-profile__stat-icon" aria-hidden="true">📚</span>
            <span className="player-profile__stat-value is-ltr">{player.totalSessions}</span>
            <span className="player-profile__stat-label">{PROFILE.sessionsPlayed}</span>
          </div>
          <div className="player-profile__stat-card">
            <span className="player-profile__stat-icon" aria-hidden="true">✅</span>
            <span className="player-profile__stat-value is-ltr">{overallPercentage}%</span>
            <span className="player-profile__stat-label">{PROFILE.correctRate}</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="player-profile__back-button"
        onClick={onBack}
        aria-label={PROFILE.back}
      >
        <span aria-hidden="true">→</span>
        <span>{PROFILE.back}</span>
      </button>

      <span className="sr-only">חגורה: {BELT_NAMES[player.currentBelt]}</span>
    </div>
  )
}

export default PlayerProfile
