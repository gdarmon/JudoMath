import { render, screen, fireEvent, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RewardClip } from '../../components/RewardClip'
import { REWARD } from '../../i18n/he'
import type { JudoClip } from '../../data/judoClips'

const clip: JudoClip = {
  youtubeId: 'abc123',
  title: 'Judo reward clip',
}

describe('RewardClip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('offers to keep watching when the reward timer ends', () => {
    const onComplete = vi.fn()
    render(
      <RewardClip
        clip={clip}
        durationSeconds={2}
        onSkip={vi.fn()}
        onComplete={onComplete}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByText(REWARD.keepWatchingPrompt)).toBeInTheDocument()
    expect(screen.getByLabelText(REWARD.continueWatchingAria)).toBeInTheDocument()
    expect(screen.getByLabelText(REWARD.continueGameAria)).toBeInTheDocument()
  })

  it('continues the game when the child chooses to return after the prompt', () => {
    const onComplete = vi.fn()
    render(
      <RewardClip
        clip={clip}
        durationSeconds={1}
        onSkip={vi.fn()}
        onComplete={onComplete}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(screen.getByLabelText(REWARD.continueGameAria))

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('keeps the video open when the child chooses to keep watching', () => {
    const onComplete = vi.fn()
    render(
      <RewardClip
        clip={clip}
        durationSeconds={1}
        onSkip={vi.fn()}
        onComplete={onComplete}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    fireEvent.click(screen.getByLabelText(REWARD.continueWatchingAria))

    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByText(REWARD.extendedWatching)).toBeInTheDocument()
    expect(screen.getByLabelText(REWARD.continueGameAria)).toBeInTheDocument()
  })
})
