import { useEffect, useRef, useState, useCallback } from 'react'
import Lottie from 'lottie-react'
import { Belt } from '../types'
import { getBeltColor } from '../logic/beltColors'
import { CEREMONY, BELT_NAMES } from '../i18n/he'
import './BeltCeremony.css'

export interface BeltCeremonyProps {
  newBelt: Belt
  onDismiss: () => void
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

const BELT_GLOW_COLORS: Record<Belt, string> = {
  [Belt.White]: 'rgba(245, 245, 245, 0.5)',
  [Belt.Yellow]: 'rgba(253, 216, 53, 0.5)',
  [Belt.Orange]: 'rgba(255, 152, 0, 0.5)',
  [Belt.Green]: 'rgba(76, 175, 80, 0.5)',
  [Belt.Blue]: 'rgba(33, 150, 243, 0.5)',
  [Belt.Brown]: 'rgba(121, 85, 72, 0.5)',
  [Belt.Black]: 'rgba(100, 100, 100, 0.5)',
}

/** Tiny inline Lottie animation — three rotating stars. */
const CELEBRATION_ANIMATION_DATA = {
  v: '5.7.1', fr: 30, ip: 0, op: 120, w: 400, h: 400, nm: 'Celebration',
  layers: [
    {
      ty: 4, nm: 'Star 1', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [720] }] },
        p: { a: 1, k: [{ t: 0, s: [200, 50, 0] }, { t: 120, s: [200, 380, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 120, s: [30, 30, 100] }] },
      },
      shapes: [
        { ty: 'sr', p: { a: 0, k: [0, 0] }, or: { a: 0, k: 15 }, ir: { a: 0, k: 7 }, r: { a: 0, k: 0 }, pt: { a: 0, k: 5 }, sy: 1, nm: 'Star' },
        { ty: 'fl', c: { a: 0, k: [1, 0.85, 0.2, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 0, op: 120,
    },
    {
      ty: 4, nm: 'Star 2', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [-540] }] },
        p: { a: 1, k: [{ t: 0, s: [120, 30, 0] }, { t: 120, s: [80, 370, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100] }, { t: 120, s: [20, 20, 100] }] },
      },
      shapes: [
        { ty: 'sr', p: { a: 0, k: [0, 0] }, or: { a: 0, k: 12 }, ir: { a: 0, k: 5 }, r: { a: 0, k: 0 }, pt: { a: 0, k: 5 }, sy: 1, nm: 'Star' },
        { ty: 'fl', c: { a: 0, k: [1, 0.34, 0.13, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 5, op: 120,
    },
    {
      ty: 4, nm: 'Star 3', sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [100] }, { t: 90, s: [100] }, { t: 120, s: [0] }] },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 120, s: [600] }] },
        p: { a: 1, k: [{ t: 0, s: [300, 40, 0] }, { t: 120, s: [320, 360, 0] }] },
        s: { a: 1, k: [{ t: 0, s: [90, 90, 100] }, { t: 120, s: [25, 25, 100] }] },
      },
      shapes: [
        { ty: 'sr', p: { a: 0, k: [0, 0] }, or: { a: 0, k: 14 }, ir: { a: 0, k: 6 }, r: { a: 0, k: 0 }, pt: { a: 0, k: 5 }, sy: 1, nm: 'Star' },
        { ty: 'fl', c: { a: 0, k: [0.3, 0.69, 0.31, 1] }, o: { a: 0, k: 100 } },
      ],
      ip: 10, op: 120,
    },
  ],
}

const AUTO_DISMISS_MS = 8000
const CEREMONY_DURATION_MS = 4000

export function BeltCeremony({ newBelt, onDismiss }: BeltCeremonyProps) {
  const [lottieError, setLottieError] = useState(false)
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const beltColor = getBeltColor(newBelt)
  const beltName = BELT_NAMES[newBelt]
  const textColor = BELT_TEXT_COLORS[newBelt]
  const glowColor = BELT_GLOW_COLORS[newBelt]

  useEffect(() => {
    autoDismissRef.current = setTimeout(() => onDismiss(), AUTO_DISMISS_MS)
    return () => {
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current)
    }
  }, [onDismiss])

  const handleDismiss = useCallback(() => {
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current)
    onDismiss()
  }, [onDismiss])

  const handleLottieError = useCallback(() => setLottieError(true), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') handleDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDismiss])

  return (
    <div
      className="belt-ceremony"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={CEREMONY.dialogAria(newBelt)}
    >
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
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="belt-ceremony__particle" />
          ))}
        </div>
      )}

      <div className="belt-ceremony__content">
        <h2 className="belt-ceremony__title">{CEREMONY.title}</h2>

        <div
          className="belt-ceremony__badge"
          style={{
            backgroundColor: beltColor,
            ['--belt-glow-color' as never]: glowColor,
          }}
          aria-hidden="true"
        >
          🥋
        </div>

        <span
          className="belt-ceremony__belt-name"
          style={{ backgroundColor: beltColor, color: textColor }}
        >
          {CEREMONY.beltLabel(newBelt)}
        </span>

        <p className="belt-ceremony__subtitle">{CEREMONY.subtitle}</p>

        <button
          className="belt-ceremony__dismiss"
          onClick={handleDismiss}
          aria-label={CEREMONY.continue}
          autoFocus
        >
          <span aria-hidden="true">▶</span> {CEREMONY.continue}
        </button>

        <span className="sr-only">{beltName}</span>
      </div>
    </div>
  )
}

export { CEREMONY_DURATION_MS, AUTO_DISMISS_MS }
export default BeltCeremony
