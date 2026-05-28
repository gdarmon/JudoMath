import type { JudoClip } from '../data/judoClips'

const STORAGE_KEY = 'judomath:clip-rotation'

interface RotationState {
  /** Indices into the JUDO_CLIPS array that have been shown this rotation. */
  used: number[]
  /** Hash of the current clip pool — bumped automatically when the pool changes. */
  poolFingerprint: string
}

function fingerprint(clips: JudoClip[]): string {
  return `${clips.length}:${clips.map((c) => c.youtubeId).join(',').slice(0, 64)}`
}

function readState(): RotationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RotationState
    if (!parsed || !Array.isArray(parsed.used) || typeof parsed.poolFingerprint !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeState(state: RotationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota or privacy-mode failures; the in-memory rotation will still work.
  }
}

/**
 * Pick the next clip the child hasn't seen yet in the current rotation.
 * When all clips have been shown, the rotation resets so the cycle
 * starts again. Avoids picking the just-shown clip on the boundary.
 *
 * The state is persisted to localStorage so the rotation survives
 * page reloads.
 */
export function pickNextClip(
  clips: JudoClip[],
  rng: () => number = Math.random,
): JudoClip {
  if (clips.length === 0) {
    throw new Error('JUDO_CLIPS pool is empty')
  }

  const fp = fingerprint(clips)
  const stored = readState()
  let used = stored && stored.poolFingerprint === fp ? stored.used : []

  // Reset if every clip has been used.
  let availableIndices = clips.map((_, i) => i).filter((i) => !used.includes(i))
  if (availableIndices.length === 0) {
    used = []
    availableIndices = clips.map((_, i) => i)
  }

  const choiceIdx = availableIndices[Math.floor(rng() * availableIndices.length)]
  const next = [...used, choiceIdx]
  writeState({ used: next, poolFingerprint: fp })
  return clips[choiceIdx]
}

/**
 * Mark a clip as failed-to-embed so we don't pick it again in this rotation.
 * Returns a different clip from the pool, or null if every remaining clip
 * has already been tried.
 */
export function pickFallbackClip(
  clips: JudoClip[],
  excludeYoutubeIds: Set<string>,
  rng: () => number = Math.random,
): JudoClip | null {
  const candidates = clips.filter((c) => !excludeYoutubeIds.has(c.youtubeId))
  if (candidates.length === 0) return null
  return candidates[Math.floor(rng() * candidates.length)]
}

/** Reset the saved rotation. Useful for tests. */
export function resetRotation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
