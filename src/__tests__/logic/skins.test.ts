import { describe, expect, it } from 'vitest'
import { Belt } from '../../types'
import {
  DEFAULT_SKIN_ID,
  getSelectedSkinId,
  getSkinUnlockedAtBelt,
  getUnlockedSkins,
  isSkinUnlocked,
  normalizePlayerSkin,
} from '../../logic/skins'
import type { PlayerProgress } from '../../types'

function makePlayer(currentBelt: Belt, selectedSkin?: PlayerProgress['selectedSkin']): PlayerProgress {
  return {
    currentBelt,
    currentStripes: 0,
    totalSessions: 0,
    totalCorrect: 0,
    totalProblems: 0,
    selectedSkin,
  }
}

describe('skin unlock rules', () => {
  it('unlocks only the white suit at the start', () => {
    expect(getUnlockedSkins(Belt.White).map((skin) => skin.id)).toEqual(['white'])
    expect(isSkinUnlocked('black', Belt.White)).toBe(false)
    expect(isSkinUnlocked('blue', Belt.White)).toBe(false)
  })

  it('unlocks the black suit after 3 belt promotions', () => {
    expect(getUnlockedSkins(Belt.Green).map((skin) => skin.id)).toEqual(['white', 'black'])
    expect(isSkinUnlocked('black', Belt.Green)).toBe(true)
    expect(isSkinUnlocked('blue', Belt.Green)).toBe(false)
  })

  it('unlocks the blue suit after another 3 belt promotions', () => {
    expect(getUnlockedSkins(Belt.Black).map((skin) => skin.id)).toEqual([
      'white',
      'black',
      'blue',
    ])
    expect(isSkinUnlocked('blue', Belt.Black)).toBe(true)
  })

  it('reports the skin unlocked exactly on promotion belts', () => {
    expect(getSkinUnlockedAtBelt(Belt.Green)?.id).toBe('black')
    expect(getSkinUnlockedAtBelt(Belt.Black)?.id).toBe('blue')
    expect(getSkinUnlockedAtBelt(Belt.Yellow)).toBeUndefined()
  })
})

describe('selected skin normalization', () => {
  it('keeps an unlocked selected skin', () => {
    expect(getSelectedSkinId(makePlayer(Belt.Green, 'black'))).toBe('black')
  })

  it('falls back to white when the selected skin is still locked', () => {
    expect(getSelectedSkinId(makePlayer(Belt.Yellow, 'black'))).toBe(DEFAULT_SKIN_ID)
  })

  it('adds the default skin to old saved progress without selectedSkin', () => {
    expect(normalizePlayerSkin(makePlayer(Belt.White)).selectedSkin).toBe(DEFAULT_SKIN_ID)
  })
})
