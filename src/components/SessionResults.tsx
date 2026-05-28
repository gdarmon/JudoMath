import { Belt } from '../types'
import type { JudoSkin } from '../types'
import { RESULTS, BELT_NAMES } from '../i18n/he'
import { getBeltColor } from '../logic/beltColors'
import './SessionResults.css'

export interface SessionResultsProps {
  correctCount: number
  totalCount: number
  score: number
  stripeAwarded: boolean
  beltPromotion: boolean
  newBelt?: Belt
  newSkinUnlocked?: JudoSkin | null
  onPlayAgain: () => void
  onMainMenu: () => void
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

function getScoreEmoji(score: number): string {
  if (score === 100) return '🌟'
  if (score >= 75) return '🎉'
  if (score >= 50) return '👍'
  return '💪'
}

function getScoreMessage(score: number): string {
  if (score === 100) return RESULTS.perfect
  if (score >= 75) return RESULTS.great
  if (score >= 50) return RESULTS.good
  return RESULTS.keepGoing
}

export function SessionResults({
  correctCount,
  totalCount,
  score,
  stripeAwarded,
  beltPromotion,
  newBelt,
  newSkinUnlocked,
  onPlayAgain,
  onMainMenu,
}: SessionResultsProps) {
  const emoji = getScoreEmoji(score)
  const message = getScoreMessage(score)
  const isGoodScore = score >= 75

  return (
    <div className="session-results" role="region" aria-label={RESULTS.regionLabel}>
      <div
        className={`session-results__header ${isGoodScore ? 'session-results__header--celebrate' : ''}`}
      >
        <span className="session-results__emoji" role="img" aria-hidden="true">
          {emoji}
        </span>
        <h2 className="session-results__message">{message}</h2>
      </div>

      <div className="session-results__score" aria-label={RESULTS.scoreAria(score)}>
        <span className="session-results__score-value is-ltr">{score}%</span>
      </div>

      <p
        className="session-results__count"
        aria-label={RESULTS.scoreLabelAria(correctCount, totalCount)}
      >
        {RESULTS.scoreLabel(correctCount, totalCount)}
      </p>

      {stripeAwarded && (
        <div
          className="session-results__stripe"
          role="status"
          aria-label={RESULTS.stripeAriaLabel}
        >
          <span className="session-results__stripe-icon" aria-hidden="true">⫼</span>
          <span className="session-results__stripe-text">{RESULTS.stripeEarned}</span>
        </div>
      )}

      {beltPromotion && newBelt !== undefined && (
        <div
          className="session-results__promotion"
          role="status"
          aria-label={RESULTS.beltPromotionAria(newBelt)}
        >
          <span className="session-results__promotion-icon" aria-hidden="true">🥋</span>
          <span className="session-results__promotion-text">
            {RESULTS.newBeltLabel}
            <span
              className="session-results__belt-name"
              style={{
                backgroundColor: getBeltColor(newBelt),
                color: BELT_TEXT_COLORS[newBelt],
              }}
            >
              {BELT_NAMES[newBelt]}
            </span>
          </span>
        </div>
      )}

      {newSkinUnlocked && (
        <div
          className="session-results__skin-unlock"
          role="status"
          aria-label={RESULTS.skinUnlockedAria(newSkinUnlocked.name)}
          style={{
            ['--unlocked-skin-color' as never]: newSkinUnlocked.giColor,
            ['--unlocked-skin-accent' as never]: newSkinUnlocked.themeAccent,
          }}
        >
          <span className="session-results__skin-swatch" aria-hidden="true" />
          <span className="session-results__skin-text">
            {RESULTS.skinUnlocked}
            <strong>{newSkinUnlocked.name}</strong>
          </span>
        </div>
      )}

      <div className="session-results__actions">
        <button
          type="button"
          className="session-results__button session-results__button--play-again"
          onClick={onPlayAgain}
          aria-label={RESULTS.playAgain}
        >
          <span className="session-results__button-icon" aria-hidden="true">▶️</span>
          <span className="session-results__button-label">{RESULTS.playAgain}</span>
        </button>

        <button
          type="button"
          className="session-results__button session-results__button--main-menu"
          onClick={onMainMenu}
          aria-label={RESULTS.mainMenu}
        >
          <span className="session-results__button-icon" aria-hidden="true">🏠</span>
          <span className="session-results__button-label">{RESULTS.mainMenu}</span>
        </button>
      </div>
    </div>
  )
}

export default SessionResults
