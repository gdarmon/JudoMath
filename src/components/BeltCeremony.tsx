import { useEffect, useRef, useState, useCallback } from 'react';
import Lottie from 'lottie-react';
import { Belt } from '../types';
import { getBeltColor, getBeltName } from '../logic/beltColors';
import './BeltCeremony.css';

export interface BeltCeremonyProps {
  newBelt: Belt;
  onDismiss: () => void;
}

/** Text color for contrast against belt background */
const BELT_TEXT_COLORS: Record<Belt, string> = {
  [Belt.White]: '#333333',
  [Belt.Yellow]: '#333333',
  [Belt.Orange]: '#ffffff',
  [Belt.Green]: '#ffffff',
  [Belt.Blue]: '#ffffff',
  [Belt.Brown]: '#ffffff',
  [Belt.Black]: '#ffffff',
};

/** Glow color for the belt badge (semi-transparent version of belt color) */
const BELT_GLOW_COLORS: Record<Belt, string> = {
  [Belt.White]: 'rgba(245, 245, 245, 0.5)',
  [Belt.Yellow]: 'rgba(253, 216, 53, 0.5)',
  [Belt.Orange]: 'rgba(255, 152, 0, 0.5)',
  [Belt.Green]: 'rgba(76, 175, 80, 0.5)',
  [Belt.Blue]: 'rgba(33, 150, 243, 0.5)',
  [Belt.Brown]: 'rgba(121, 85, 72, 0.5)',
  [Belt.Black]: 'rgba(100, 100, 100, 0.5)',
};

/**
 * Simple inline Lottie-compatible confetti animation data.
 * This is a minimal celebration animation that works with lottie-react.
 * In production, this would be replaced with a richer authored animation file.
 */
const CELEBRATION_ANIMATION_DATA = {
  v: '5.7.1',
  fr: 30,
  ip: 0,
  op: 120,
  w: 400,
  h: 400,
  nm: 'Celebration',
  layers: [
    {
      ty: 4,
      nm: 'Star 1',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [720] }] },
        p: { a: 1, k: [{ t: 0, s: [200, 50, 0] }, { t: 120, s: [200, 380, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 120, s: [30, 30, 100] }] },
      },
      shapes: [
        {
          ty: 'sr',
          p: { a: 0, k: [0, 0] },
          or: { a: 0, k: 15 },
          ir: { a: 0, k: 7 },
          r: { a: 0, k: 0 },
          pt: { a: 0, k: 5 },
          sy: 1,
          nm: 'Star',
        },
        { ty: 'fl', c: { a: 0, k: [1, 0.85, 0.2, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 0,
      op: 120,
    },
    {
      ty: 4,
      nm: 'Star 2',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [-540] }] },
        p: { a: 1, k: [{ t: 0, s: [120, 30, 0] }, { t: 120, s: [80, 370, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100] }, { t: 120, s: [20, 20, 100] }] },
      },
      shapes: [
        {
          ty: 'sr',
          p: { a: 0, k: [0, 0] },
          or: { a: 0, k: 12 },
          ir: { a: 0, k: 5 },
          r: { a: 0, k: 0 },
          pt: { a: 0, k: 5 },
          sy: 1,
          nm: 'Star',
        },
        { ty: 'fl', c: { a: 0, k: [1, 0.34, 0.13, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 5,
      op: 120,
    },
    {
      ty: 4,
      nm: 'Star 3',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [600] }] },
        p: { a: 1, k: [{ t: 0, s: [300, 40, 0] }, { t: 120, s: [320, 360, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [90, 90, 100] }, { t: 120, s: [25, 25, 100] }] },
      },
      shapes: [
        {
          ty: 'sr',
          p: { a: 0, k: [0, 0] },
          or: { a: 0, k: 14 },
          ir: { a: 0, k: 6 },
          r: { a: 0, k: 0 },
          pt: { a: 0, k: 5 },
          sy: 1,
          nm: 'Star',
        },
        { ty: 'fl', c: { a: 0, k: [0.3, 0.69, 0.31, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 10,
      op: 120,
    },
  ],
};

/** Auto-dismiss timeout in milliseconds (max ceremony duration) */
const AUTO_DISMISS_MS = 8000;

/** Ceremony animation duration in milliseconds */
const CEREMONY_DURATION_MS = 4000;

/**
 * BeltCeremony - Full-screen celebration overlay for belt promotions.
 *
 * Displays a Lottie-based celebration animation with the new belt color
 * shown prominently. Falls back to CSS animations if Lottie fails to load.
 * Auto-dismisses after 8 seconds or on button click.
 *
 * Requirements: 5.1 (3-8s duration), 5.2 (display new belt), 5.3 (sound), 5.4 (dismiss)
 */
export function BeltCeremony({ newBelt, onDismiss }: BeltCeremonyProps) {
  const [lottieError, setLottieError] = useState(false);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const beltColor = getBeltColor(newBelt);
  const beltName = getBeltName(newBelt);
  const textColor = BELT_TEXT_COLORS[newBelt];
  const glowColor = BELT_GLOW_COLORS[newBelt];

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    autoDismissRef.current = setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissRef.current) {
        clearTimeout(autoDismissRef.current);
      }
    };
  }, [onDismiss]);

  // Play congratulatory sound effect
  // NOTE: Actual audio file asset required for production.
  // Integration would be: new Audio('/sounds/belt-ceremony.mp3').play()
  useEffect(() => {
    // Placeholder: play congratulatory sound effect when ceremony starts
    // const audio = new Audio('/sounds/belt-ceremony.mp3');
    // audio.volume = 0.6;
    // audio.play().catch(() => { /* ignore autoplay restrictions */ });
  }, []);

  const handleDismiss = useCallback(() => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
    }
    onDismiss();
  }, [onDismiss]);

  const handleLottieError = useCallback(() => {
    setLottieError(true);
  }, []);

  // Handle keyboard dismiss (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  return (
    <div
      className="belt-ceremony"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Belt ceremony: promoted to ${beltName} belt`}
    >
      {/* Animation layer: Lottie with CSS fallback */}
      {!lottieError ? (
        <div className="belt-ceremony__lottie" aria-hidden="true">
          <Lottie
            animationData={CELEBRATION_ANIMATION_DATA}
            loop={true}
            autoplay={true}
            onError={handleLottieError}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div className="belt-ceremony__css-celebration" aria-hidden="true">
          {/* CSS particle fallback when Lottie fails */}
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="belt-ceremony__particle" />
          ))}
        </div>
      )}

      {/* Content: belt badge, name, and dismiss */}
      <div className="belt-ceremony__content">
        <h2 className="belt-ceremony__title">🎉 Congratulations! 🎉</h2>

        <div
          className="belt-ceremony__badge"
          style={{
            backgroundColor: beltColor,
            '--belt-glow-color': glowColor,
          } as React.CSSProperties}
          aria-hidden="true"
        >
          🥋
        </div>

        <span
          className="belt-ceremony__belt-name"
          style={{ backgroundColor: beltColor, color: textColor }}
        >
          {beltName} Belt
        </span>

        <p className="belt-ceremony__subtitle">
          You earned a new belt! Keep up the great work!
        </p>

        <button
          className="belt-ceremony__dismiss"
          onClick={handleDismiss}
          aria-label="Continue playing"
          autoFocus
        >
          ▶️ Continue
        </button>
      </div>
    </div>
  );
}

export { CEREMONY_DURATION_MS, AUTO_DISMISS_MS };
export default BeltCeremony;
