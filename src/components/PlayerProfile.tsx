import type { PlayerProgress } from '../types'
import { Belt } from '../types'
import { PROFILE, BELT_NAMES, beltLabel } from '../i18n/he'
import { getBeltColor } from '../logic/beltColors'
import { getSelectedSkinId, getSkinById, JUDO_SKINS } from '../logic/skins'
import { JudoAvatar } from './JudoAvatar'
import './PlayerProfile.css'

export interface PlayerProfileProps {
  player: PlayerProgress
  onBack: () => void
  onSkinSelect?: (skinId: PlayerProgress['selectedSkin']) => void
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

export function PlayerProfile({ player, onBack, onSkinSelect }: PlayerProfileProps) {
  const stripesRemaining = STRIPES_FOR_PROMOTION - player.currentStripes
  const selectedSkinId = getSelectedSkinId(player)
  const selectedSkin = getSkinById(selectedSkinId)
  const overallPercentage =
    player.totalProblems > 0
      ? Math.round((player.totalCorrect / player.totalProblems) * 100)
      : 0

  return (
    <div className="player-profile">
      {/* Avatar + belt */}
      <section className="player-profile__avatar-section">
        <JudoAvatar
          skin={selectedSkin}
          label={PROFILE.avatarAria(player.currentBelt, selectedSkin.name)}
          className="player-profile__avatar-figure"
        />

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

      {/* Skin selector */}
      <section className="player-profile__card">
        <h2 className="player-profile__card-title">{PROFILE.skinsTitle}</h2>
        <p className="player-profile__skins-intro">{PROFILE.skinsIntro}</p>

        <div className="player-profile__skins-grid">
          {JUDO_SKINS.map((skin) => {
            const unlocked = player.currentBelt >= skin.unlockBelt
            const selected = selectedSkinId === skin.id

            return (
              <button
                key={skin.id}
                type="button"
                className={`player-profile__skin-card ${
                  selected ? 'is-selected' : ''
                } ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                onClick={() => unlocked && onSkinSelect?.(skin.id)}
                disabled={!unlocked}
                aria-label={
                  unlocked
                    ? PROFILE.skinSelectAria(skin.name)
                    : PROFILE.skinLockedAria(skin.name, skin.unlockBelt)
                }
                style={{
                  ['--skin-card-color' as never]: skin.giColor,
                  ['--skin-card-accent' as never]: skin.themeAccent,
                }}
              >
                <span className="player-profile__skin-swatch" aria-hidden="true" />
                <span className="player-profile__skin-name">{skin.name}</span>
                <span className="player-profile__skin-state">
                  {unlocked
                    ? selected ? PROFILE.skinSelected : skin.description
                    : PROFILE.skinUnlockedAt(skin.unlockBelt)}
                </span>
              </button>
            )
          })}
        </div>
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
