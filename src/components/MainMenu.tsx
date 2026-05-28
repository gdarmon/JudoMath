import { Belt } from '../types'
import { APP_TITLE, APP_SUBTITLE, MENU, beltLabel, BELT_NAMES, PROFILE } from '../i18n/he'
import { getBeltColor } from '../logic/beltColors'
import './MainMenu.css'

export interface MainMenuProps {
  onNavigate: (screen: 'game' | 'tournament' | 'profile') => void
  currentBelt?: Belt
  currentStripes?: number
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

export function MainMenu({ onNavigate, currentBelt, currentStripes }: MainMenuProps) {
  const beltValue = currentBelt ?? Belt.White
  const stripes = currentStripes ?? 0

  return (
    <div className="main-menu">
      {/* Soft sun behind the hero — pure decoration */}
      <div className="main-menu__sun" aria-hidden="true" />

      {/* Hero */}
      <header className="main-menu__hero">
        <div className="main-menu__avatar" aria-label={PROFILE.avatarAria(beltValue)}>
          <span className="main-menu__avatar-glow" aria-hidden="true" />
          <span className="main-menu__avatar-icon" role="img" aria-hidden="true">🥋</span>
        </div>

        <h1 className="main-menu__title">{APP_TITLE}</h1>
        <p className="main-menu__tagline">{APP_SUBTITLE}</p>

        <div
          className="main-menu__belt-badge"
          style={{
            backgroundColor: getBeltColor(beltValue),
            color: BELT_TEXT_COLORS[beltValue],
          }}
        >
          <span className="main-menu__belt-label">{beltLabel(beltValue)}</span>
          <span
            className="main-menu__belt-stripes"
            aria-label={`${stripes} פסים`}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`main-menu__stripe ${i < stripes ? 'is-earned' : ''}`}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
      </header>

      {/* Action cards */}
      <nav className="main-menu__nav" aria-label={APP_TITLE}>
        <button
          type="button"
          className="action-card action-card--play"
          onClick={() => onNavigate('game')}
          aria-label={MENU.play}
        >
          <span className="action-card__icon" aria-hidden="true">▶️</span>
          <span className="action-card__label">{MENU.play}</span>
          <span className="action-card__sub">{MENU.playSub}</span>
        </button>

        <button
          type="button"
          className="action-card action-card--tournament"
          onClick={() => onNavigate('tournament')}
          aria-label={MENU.tournament}
        >
          <span className="action-card__icon" aria-hidden="true">🏆</span>
          <span className="action-card__label">{MENU.tournament}</span>
          <span className="action-card__sub">{MENU.tournamentSub}</span>
        </button>

        <button
          type="button"
          className="action-card action-card--profile"
          onClick={() => onNavigate('profile')}
          aria-label={MENU.profile}
        >
          <span className="action-card__icon" aria-hidden="true">👤</span>
          <span className="action-card__label">{MENU.profile}</span>
          <span className="action-card__sub">{MENU.profileSub}</span>
        </button>
      </nav>

      {/* Tiny credit so screen-reader users know which belt is current */}
      <span className="sr-only">
        חגורה נוכחית: {BELT_NAMES[beltValue]}, {stripes} פסים
      </span>
    </div>
  )
}

export default MainMenu
