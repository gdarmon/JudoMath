import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlayerProfile } from '../../components/PlayerProfile'
import { Belt } from '../../types'
import { PROFILE } from '../../i18n/he'
import type { PlayerProgress } from '../../types'

function makePlayer(overrides: Partial<PlayerProgress> = {}): PlayerProgress {
  return {
    currentBelt: Belt.White,
    currentStripes: 0,
    totalSessions: 4,
    totalCorrect: 24,
    totalProblems: 30,
    selectedSkin: 'white',
    ...overrides,
  }
}

describe('PlayerProfile skins', () => {
  it('shows the skin selector', () => {
    render(<PlayerProfile player={makePlayer()} onBack={vi.fn()} />)
    expect(screen.getByText(PROFILE.skinsTitle)).toBeInTheDocument()
    expect(screen.getByText('חליפה לבנה')).toBeInTheDocument()
    expect(screen.getByText('חליפה שחורה')).toBeInTheDocument()
    expect(screen.getByText('חליפה כחולה')).toBeInTheDocument()
  })

  it('keeps locked skins disabled before the unlock belt', () => {
    render(<PlayerProfile player={makePlayer({ currentBelt: Belt.Yellow })} onBack={vi.fn()} />)
    expect(screen.getByLabelText(PROFILE.skinLockedAria('חליפה שחורה', Belt.Green))).toBeDisabled()
    expect(screen.getByLabelText(PROFILE.skinLockedAria('חליפה כחולה', Belt.Black))).toBeDisabled()
  })

  it('lets the child select the black suit after Green belt', () => {
    const onSkinSelect = vi.fn()
    render(
      <PlayerProfile
        player={makePlayer({ currentBelt: Belt.Green })}
        onBack={vi.fn()}
        onSkinSelect={onSkinSelect}
      />,
    )

    fireEvent.click(screen.getByLabelText(PROFILE.skinSelectAria('חליפה שחורה')))
    expect(onSkinSelect).toHaveBeenCalledWith('black')
  })

  it('marks the chosen skin as selected', () => {
    render(
      <PlayerProfile
        player={makePlayer({ currentBelt: Belt.Black, selectedSkin: 'blue' })}
        onBack={vi.fn()}
      />,
    )

    const blueButton = screen.getByLabelText(PROFILE.skinSelectAria('חליפה כחולה'))
    expect(blueButton).toHaveClass('is-selected')
    expect(screen.getByText(PROFILE.skinSelected)).toBeInTheDocument()
  })
})
