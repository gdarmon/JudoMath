import { Belt } from '../types';
import './MainMenu.css';

export interface MainMenuProps {
  onNavigate: (screen: 'game' | 'tournament' | 'profile') => void;
  currentBelt?: Belt;
  currentStripes?: number;
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

export function MainMenu({ onNavigate, currentBelt, currentStripes }: MainMenuProps) {
  const beltValue = currentBelt ?? Belt.White;
  const stripes = currentStripes ?? 0;

  return (
    <div className="screen screen--menu main-menu">
      <div className="main-menu__header">
        <div className="main-menu__avatar" aria-label={`Player avatar with ${BELT_NAMES[beltValue]} belt`}>
          <span className="main-menu__avatar-icon" role="img" aria-hidden="true">🥋</span>
          <span
            className="main-menu__belt-badge"
            style={{
              backgroundColor: BELT_COLORS[beltValue],
              color: BELT_TEXT_COLORS[beltValue],
            }}
          >
            {BELT_NAMES[beltValue]} Belt
            {stripes > 0 && (
              <span className="main-menu__stripes" aria-label={`${stripes} stripe${stripes > 1 ? 's' : ''}`}>
                {' '}{'⫼'.repeat(stripes)}
              </span>
            )}
          </span>
        </div>
        <h1 className="main-menu__title">Judo Math</h1>
      </div>

      <nav className="main-menu__nav" aria-label="Main navigation">
        <button
          className="main-menu__button main-menu__button--play"
          onClick={() => onNavigate('game')}
          aria-label="Play"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">▶️</span>
          <span className="main-menu__button-label">Play</span>
        </button>

        <button
          className="main-menu__button main-menu__button--tournament"
          onClick={() => onNavigate('tournament')}
          aria-label="Tournament"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">🏆</span>
          <span className="main-menu__button-label">Tournament</span>
        </button>

        <button
          className="main-menu__button main-menu__button--profile"
          onClick={() => onNavigate('profile')}
          aria-label="Profile"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">👤</span>
          <span className="main-menu__button-label">Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default MainMenu;
