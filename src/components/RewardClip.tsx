import { useEffect, useRef, useState } from 'react'
import type { JudoClip } from '../data/judoClips'
import './RewardClip.css'

export interface RewardClipProps {
  clip: JudoClip
  /** Total clip window in seconds. Defaults to 30. */
  durationSeconds?: number
  onSkip: () => void
  onComplete: () => void
  /** Called if the embed fails — parent can swap to another clip. */
  onError?: (failedYoutubeId: string) => void
}

/**
 * Reward overlay shown after a correct answer.
 * Embeds a YouTube clip (privacy-enhanced host, no related videos)
 * for ~30 seconds. The child can press the big "Skip" button at any time.
 *
 * If the iframe fails to load (e.g. the channel disabled embedding),
 * the parent is notified via onError and can pick a different clip.
 */
export function RewardClip({
  clip,
  durationSeconds = 30,
  onSkip,
  onComplete,
  onError,
}: RewardClipProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [iframeError, setIframeError] = useState(false)
  const completedRef = useRef(false)

  // Reset countdown / error state when the clip changes (after a fallback).
  useEffect(() => {
    setSecondsLeft(durationSeconds)
    setIframeError(false)
    completedRef.current = false
  }, [clip.youtubeId, durationSeconds])

  const start = clip.start ?? 0
  const end = start + durationSeconds

  // Privacy-friendly embed URL (youtube-nocookie), bounded play window.
  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(clip.youtubeId)}` +
    `?autoplay=1&start=${start}&end=${end}` +
    `&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&controls=1`

  // Countdown timer — auto-completes when it reaches 0.
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          if (!completedRef.current) {
            completedRef.current = true
            onComplete()
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onComplete, clip.youtubeId])

  const handleSkip = () => {
    if (completedRef.current) return
    completedRef.current = true
    onSkip()
  }

  const handleIframeError = () => {
    setIframeError(true)
    if (onError) onError(clip.youtubeId)
  }

  return (
    <div className="reward-clip" role="dialog" aria-modal="true" aria-label="Prize clip">
      <div className="reward-clip__card">
        <div className="reward-clip__header">
          <span className="reward-clip__trophy" role="img" aria-hidden="true">🏅</span>
          <h2 className="reward-clip__title">!כל הכבוד</h2>
          <p className="reward-clip__subtitle">{clip.title}</p>
        </div>

        <div className="reward-clip__video-wrap">
          {!iframeError ? (
            <iframe
              key={clip.youtubeId}
              className="reward-clip__iframe"
              src={embedUrl}
              title={clip.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleIframeError}
            />
          ) : (
            <div className="reward-clip__fallback" aria-hidden="true">
              <span className="reward-clip__fallback-emoji">🥋</span>
              <span className="reward-clip__fallback-text">
                The clip couldn't load — but you still earned a star!
              </span>
            </div>
          )}
        </div>

        <div className="reward-clip__footer">
          <span className="reward-clip__countdown" aria-live="polite">
            {secondsLeft}s
          </span>
          <button
            type="button"
            className="reward-clip__skip"
            onClick={handleSkip}
            aria-label="Skip clip and continue"
            autoFocus
          >
            <span aria-hidden="true">⏭</span> Skip & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default RewardClip
