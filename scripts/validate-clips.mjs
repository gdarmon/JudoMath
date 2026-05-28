#!/usr/bin/env node
/**
 * Validate every YouTube ID in src/data/judoClips.ts.
 *
 * Uses YouTube's public oEmbed endpoint:
 *   https://www.youtube.com/oembed?url=...&format=json
 * which returns 200 only when the video exists AND is embeddable.
 * No API key needed and no rate limits to worry about for ~100 videos.
 *
 * Usage:
 *   npm run clips:validate
 *   npm run clips:validate -- --json    # machine-readable output
 *
 * Exit code: 0 if every clip is reachable, 1 otherwise.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const clipsPath = resolve(projectRoot, 'src/data/judoClips.ts')

/** Extract { youtubeId, title } pairs from the TypeScript file via regex. */
function loadClipsFromSource() {
  const src = readFileSync(clipsPath, 'utf8')
  const out = []
  const re = /\{\s*youtubeId:\s*"([^"]+)"\s*,\s*title:\s*"((?:[^"\\]|\\.)*)"(?:\s*,\s*start:\s*(\d+))?\s*\}/g
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({ youtubeId: m[1], title: m[2], start: m[3] ? Number(m[3]) : undefined })
  }
  return out
}

/**
 * Check one video. Returns { ok: boolean, status: number, reason?: string }.
 * 200 → exists and embeddable. 401 → exists but embedding disabled. 404 → not found.
 */
async function checkOne(id) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
  try {
    const res = await fetch(oembed, { method: 'GET' })
    if (res.status === 200) return { ok: true, status: 200 }
    if (res.status === 401) return { ok: false, status: 401, reason: 'embedding disabled' }
    if (res.status === 404) return { ok: false, status: 404, reason: 'not found / removed' }
    return { ok: false, status: res.status, reason: `http ${res.status}` }
  } catch (err) {
    return { ok: false, status: 0, reason: err.message ?? 'fetch failed' }
  }
}

/** Run checks with bounded concurrency. */
async function checkAll(clips, concurrency = 6) {
  const results = new Array(clips.length)
  let cursor = 0
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = cursor++
      if (i >= clips.length) return
      results[i] = { ...clips[i], ...(await checkOne(clips[i].youtubeId)) }
      // Print progress as we go.
      const r = results[i]
      const tag = r.ok ? '✓' : '✗'
      const reason = r.ok ? '' : ` — ${r.reason}`
      // eslint-disable-next-line no-console
      console.error(`${tag} ${r.youtubeId}  ${r.title}${reason}`)
    }
  })
  await Promise.all(workers)
  return results
}

const wantJson = process.argv.includes('--json')

const clips = loadClipsFromSource()
if (clips.length === 0) {
  console.error('No clips found in', clipsPath)
  process.exit(1)
}

console.error(`Validating ${clips.length} clip(s)…\n`)
const results = await checkAll(clips)

const broken = results.filter((r) => !r.ok)
const ok = results.filter((r) => r.ok)

if (wantJson) {
  console.log(JSON.stringify({ total: results.length, ok: ok.length, broken }, null, 2))
} else {
  console.error(`\n${ok.length}/${results.length} OK, ${broken.length} broken.`)
  if (broken.length > 0) {
    console.error('\nBroken clips:')
    for (const b of broken) {
      console.error(`  ${b.youtubeId}  "${b.title}"  → ${b.reason} (status ${b.status})`)
    }
  }
}

process.exit(broken.length === 0 ? 0 : 1)
