import { Belt } from '../types';
import './MainMenu.css';

export interface MainMenuProps {
  onNavigate: (screen: 'game' | 'tournament' | 'profile') => void;
  currentBelt?: Belt;
  currentStripes?: number;
}

const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'White',
  [Belt.Yellow]: 'Yellow',
  [Belt.Orange]: 'Orange',
  [Belt.Green]: 'Green',
  [Belt.Blue]: 'Blue',
  [Belt.Brown]: 'Brown',
  [Belt.Black]: 'Black',
};

const BELT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#f5f5f5',
  [Belt.Yellow]: '#fdd835',
  [Belt.Orange]: '#ff9800',
  [Belt.Green]: '#4caf50',
  [Belt.Blue]: '#2196f3',
  [Belt.Brown]: '#795548',
  [Belt.Black]: '#212121',
};

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
    <div className="main-menu">
      {/* Animated background — drifting math symbols */}
      <div className="main-menu__bg" aria-hidden="true">
        <span className="main-menu__bg-symbol main-menu__bg-symbol--1">+</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--2">−</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--3">7</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--4">+</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--5">3</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--6">−</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--7">12</span>
        <span className="main-menu__bg-symbol main-menu__bg-symbol--8">5</span>
      </div>

      {/* Hero card */}
      <div className="main-menu__hero">
        <div className="main-menu__avatar-wrap" aria-label={`Player avatar with ${BELT_NAMES[beltValue]} belt`}>
          {/* Concentric rings + judogi avatar */}
          <span className="main-menu__avatar-ring main-menu__avatar-ring--1" aria-hidden="true" />
          <span className="main-menu__avatar-ring main-menu__avatar-ring--2" aria-hidden="true" />
          <span className="main-menu__avatar-icon" role="img" aria-hidden="true">🥋</span>
        </div>

        <h1 className="main-menu__title">
          <span className="main-menu__title-judo">JUDO</span>
          <span className="main-menu__title-math">MATH</span>
        </h1>

        <p className="main-menu__tagline">
          <span className="main-menu__tagline-emoji" aria-hidden="true">🥋</span>
          Earn your belt, one problem at a time
          <span className="main-menu__tagline-emoji" aria-hidden="true">⭐</span>
        </p>

        {/* Belt status badge */}
        <div
          className="main-menu__belt-badge"
          style={{
            backgroundColor: BELT_COLORS[beltValue],
            color: BELT_TEXT_COLORS[beltValue],
          }}
        >
          <span className="main-menu__belt-label">{BELT_NAMES[beltValue]} Belt</span>
          <span className="main-menu__belt-stripes" aria-label={`${stripes} stripe${stripes !== 1 ? 's' : ''}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`main-menu__stripe ${i < stripes ? 'main-menu__stripe--earned' : ''}`}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
      </div>

      {/* Big colorful action buttons */}
      <nav className="main-menu__nav" aria-label="Main navigation">
        <button
          className="main-menu__button main-menu__button--play"
          onClick={() => onNavigate('game')}
          aria-label="Play"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">▶️</span>
          <span className="main-menu__button-label">Play</span>
          <span className="main-menu__button-sub">Solve & earn stripes</span>
        </button>

        <button
          className="main-menu__button main-menu__button--tournament"
          onClick={() => onNavigate('tournament')}
          aria-label="Tournament"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">🏆</span>
          <span className="main-menu__button-label">Tournament</span>
          <span className="main-menu__button-sub">3 rounds, beat the clock</span>
        </button>

        <button
          className="main-menu__button main-menu__button--profile"
          onClick={() => onNavigate('profile')}
          aria-label="Profile"
        >
          <span className="main-menu__button-icon" role="img" aria-hidden="true">👤</span>
          <span className="main-menu__button-label">Profile</span>
          <span className="main-menu__button-sub">Your belt & stats</span>
        </button>
      </nav>
    </div>
  );
}

export default MainMenu;
