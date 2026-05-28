import { Belt } from '../types'
import type { JudoSkin, JudoSkinId, PlayerProgress } from '../types'

export const DEFAULT_SKIN_ID: JudoSkinId = 'white'

export const JUDO_SKINS: JudoSkin[] = [
  {
    id: 'white',
    name: 'חליפה לבנה',
    description: 'הסקין הקלאסי שמתחילים איתו.',
    unlockBelt: Belt.White,
    giColor: '#f8f4e9',
    giAccent: '#d8d0bf',
    themeAccent: '#4ecdc4',
    themeAccentDeep: '#26a69a',
    themeSurface: '#ffffff',
    themeSurfaceSoft: '#fff8ee',
  },
  {
    id: 'black',
    name: 'חליפה שחורה',
    description: 'נפתח אחרי 3 חגורות.',
    unlockBelt: Belt.Green,
    giColor: '#23232b',
    giAccent: '#5f6370',
    themeAccent: '#2d2a33',
    themeAccentDeep: '#11111a',
    themeSurface: '#fffdf8',
    themeSurfaceSoft: '#f3efe7',
  },
  {
    id: 'blue',
    name: 'חליפה כחולה',
    description: 'נפתח אחרי עוד 3 חגורות.',
    unlockBelt: Belt.Black,
    giColor: '#1f5ca8',
    giAccent: '#8fc7ff',
    themeAccent: '#3a7bd5',
    themeAccentDeep: '#1d4f91',
    themeSurface: '#ffffff',
    themeSurfaceSoft: '#edf7ff',
  },
]

export function getSkinById(id: JudoSkinId | undefined): JudoSkin {
  return JUDO_SKINS.find((skin) => skin.id === id) ?? JUDO_SKINS[0]
}

export function isSkinUnlocked(skinId: JudoSkinId, belt: Belt): boolean {
  return belt >= getSkinById(skinId).unlockBelt
}

export function getUnlockedSkins(belt: Belt): JudoSkin[] {
  return JUDO_SKINS.filter((skin) => belt >= skin.unlockBelt)
}

export function getSkinUnlockedAtBelt(belt: Belt): JudoSkin | undefined {
  return JUDO_SKINS.find((skin) => skin.id !== DEFAULT_SKIN_ID && skin.unlockBelt === belt)
}

export function getSelectedSkinId(player: PlayerProgress): JudoSkinId {
  const selected = player.selectedSkin ?? DEFAULT_SKIN_ID
  return isSkinUnlocked(selected, player.currentBelt) ? selected : DEFAULT_SKIN_ID
}

export function normalizePlayerSkin(player: PlayerProgress): PlayerProgress {
  return {
    ...player,
    selectedSkin: getSelectedSkinId(player),
  }
}
