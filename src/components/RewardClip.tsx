import { useEffect, useRef, useState } from 'react'
import type { JudoClip } from '../data/judoClips'
import { REWARD } from '../i18n/he'
import './RewardClip.css'

export interface RewardClipProps {
  clip: JudoClip
  durationSeconds?: number
  onSkip: () => void
  onComplete: () => void
  onError?: (failedYoutubeId: string) => void
}

export function RewardClip({
  clip,
  durationSeconds = 30,
  onSkip,
  onComplete,
  onError,
}: RewardClipProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [showContinueChoice, setShowContinueChoice] = useState(false)
  const [isExtendedWatching, setIsExtendedWatching] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const completedRef = useRef(false)

  useEffect(() => {
    setSecondsLeft(durationSeconds)
    setShowContinueChoice(false)
    setIsExtendedWatching(false)
    setIframeError(false)
    completedRef.current = false
  }, [clip.youtubeId, durationSeconds])

  const embedParams = new URLSearchParams({
    autoplay: '1',
    mute: '0',
    playsinline: '1',
    controls: '1',
    rel: '0',
    modestbranding: '1',
  })
  if (clip.start && clip.start > 0) {
    embedParams.set('start', String(clip.start))
  }
  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(clip.youtubeId)}` +
    `?${embedParams.toString()}`

  useEffect(() => {
    if (showContinueChoice || isExtendedWatching) return

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          setShowContinueChoice(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [clip.youtubeId, isExtendedWatching, showContinueChoice])

  const handleSkip = () => {
    if (completedRef.current) return
    completedRef.current = true
    onSkip()
  }

  const handleComplete = () => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }

  const handleContinueWatching = () => {
    setShowContinueChoice(false)
    setIsExtendedWatching(true)
  }

  const handleIframeError = () => {
    setIframeError(true)
    if (onError) onError(clip.youtubeId)
  }

  return (
    <div className="reward-clip" role="dialog" aria-modal="true" aria-label={REWARD.dialogAria}>
      <div className="reward-clip__card">
        <header className="reward-clip__header">
          <span className="reward-clip__trophy" aria-hidden="true">🏅</span>
          <h2 className="reward-clip__title">{REWARD.title}</h2>
          <p className="reward-clip__subtitle">{clip.title}</p>
        </header>

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
              <span className="reward-clip__fallback-text">{REWARD.fallbackText}</span>
            </div>
          )}
        </div>

        <footer className="reward-clip__footer">
          {showContinueChoice ? (
            <>
              <span className="reward-clip__watch-prompt" role="status">
                {REWARD.keepWatchingPrompt}
              </span>
              <div className="reward-clip__actions">
                <button
                  type="button"
                  className="reward-clip__button reward-clip__button--watch"
                  onClick={handleContinueWatching}
                  aria-label={REWARD.continueWatchingAria}
                  autoFocus
                >
                  <span aria-hidden="true">▶️</span> {REWARD.continueWatching}
                </button>
                <button
                  type="button"
                  className="reward-clip__button reward-clip__button--game"
                  onClick={handleComplete}
                  aria-label={REWARD.continueGameAria}
                >
                  <span aria-hidden="true">🥋</span> {REWARD.continueGame}
                </button>
              </div>
            </>
          ) : (
            <>
              {isExtendedWatching ? (
                <span className="reward-clip__watch-prompt" role="status">
                  {REWARD.extendedWatching}
                </span>
              ) : (
                <span
                  className="reward-clip__countdown is-ltr"
                  aria-live="polite"
                  aria-label={REWARD.countdownAria(secondsLeft)}
                >
                  {secondsLeft}s
                </span>
              )}
              <button
                type="button"
                className="reward-clip__button reward-clip__button--game"
                onClick={isExtendedWatching ? handleComplete : handleSkip}
                aria-label={isExtendedWatching ? REWARD.continueGameAria : REWARD.skipAria}
              >
                <span aria-hidden="true">⏭</span>{' '}
                {isExtendedWatching ? REWARD.continueGame : REWARD.skip}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}

export default RewardClip
