#!/usr/bin/env node
/**
 * Build a curated list of judo YouTube clips by:
 *   1. Fetching the RSS feed of trusted judo channels (no API key needed).
 *   2. Filtering by title keywords ("judo", "ippon", "throw", "tachi-waza", etc.)
 *      and excluding violent / inappropriate words.
 *   3. Validating every candidate via the oEmbed endpoint
 *      (returns 200 only when the video exists AND embedding is allowed).
 *   4. Writing the validated clips into src/data/judoClips.ts.
 *
 * Run:
 *   npm run clips:fetch              # fetch + validate, write to disk
 *   npm run clips:fetch -- --dry-run # print only, don't write
 *
 * Channels list lives in scripts/clip-sources.json (edit there to curate).
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const sourcesPath = resolve(projectRoot, 'scripts/clip-sources.json')
const outPath = resolve(projectRoot, 'src/data/judoClips.ts')

const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'))
const TARGET_COUNT = sources.targetCount ?? 100
const MUST_INCLUDE = (sources.titleMustContain ?? []).map((s) => s.toLowerCase())
const MUST_EXCLUDE = (sources.titleMustNotContain ?? []).map((s) => s.toLowerCase())

const dryRun = process.argv.includes('--dry-run')

/**
 * Fetch ALL videos from a YouTube channel by scraping the public /videos page.
 * RSS feeds only return the 15 most-recent videos; the /videos page returns
 * up to 30 in the initial render and also exposes the channel's full video list.
 * Returns [] silently on any error so one bad channel doesn't break the run.
 */
async function fetchChannelFeed(source) {
  let channelId = ''
  if (source.type === 'channelId') {
    channelId = source.value
  } else if (source.type === 'channelHandle') {
    channelId = await resolveHandleToChannelId(source.value)
    if (!channelId) return []
  } else if (source.type === 'playlistId') {
    return fetchPlaylistFeed(source)
  } else {
    return []
  }

  // Strategy 1: scrape /channel/UCxxx/videos for up to ~30 most-recent uploads.
  const fromPage = await fetchChannelVideosPage(channelId)
  // Strategy 2: also pull RSS as a backup (newest 15 in case the page parse fails).
  const fromRss = await fetchChannelRss(channelId)

  // Merge, dedupe.
  const seen = new Set()
  const combined = []
  for (const v of [...fromPage, ...fromRss]) {
    if (!seen.has(v.youtubeId)) {
      seen.add(v.youtubeId)
      combined.push({ ...v, source: source.label || source.value })
    }
  }
  return combined
}

/** RSS feed → up to 15 most-recent videos. */
async function fetchChannelRss(channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'judomath-clip-fetcher/1.0' } })
    if (!res.ok) return []
    const xml = await res.text()
    return parseFeed(xml)
  } catch {
    return []
  }
}

/** Playlist RSS feed (15 most-recent items in a playlist). */
async function fetchPlaylistFeed(source) {
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(source.value)}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'judomath-clip-fetcher/1.0' } })
    if (!res.ok) return []
    const xml = await res.text()
    return parseFeed(xml).map((v) => ({ ...v, source: source.label || source.value }))
  } catch {
    return []
  }
}

/**
 * Scrape the /channel/UCxxx/videos page. The HTML embeds a JSON blob
 * (ytInitialData) listing the recent uploads — we parse video IDs and titles
 * directly out of it. This typically returns ~30 videos vs. 15 from RSS.
 */
async function fetchChannelVideosPage(channelId) {
  const url = `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; judomath/1.0)', 'Accept-Language': 'en-US,en;q=0.9' },
    })
    if (!res.ok) return []
    const html = await res.text()
    // Extract every {videoId, title} pair from ytInitialData.
    // Pattern: "videoId":"xxxxxxxxxxx",...,"title":{"runs":[{"text":"..."}]}
    const out = []
    const seen = new Set()
    const re = /"videoId":"([\w-]{11})"[^}]*?"title":\{(?:"runs":\[\{)?"text":"((?:[^"\\]|\\.)*)"/g
    let m
    while ((m = re.exec(html)) !== null) {
      const id = m[1]
      if (seen.has(id)) continue
      seen.add(id)
      out.push({ youtubeId: id, title: decodeJsonString(m[2]) })
    }
    return out
  } catch {
    return []
  }
}

/** Decode JSON-encoded escapes inside a captured string fragment. */
function decodeJsonString(s) {
  return s
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, ' ')
    .replace(/\\\//g, '/')
}

/**
 * Resolve a YouTube channel handle (e.g. "@JudoTV") to a channel id.
 * Loads the public channel page and extracts the canonical channelId from the HTML.
 */
async function resolveHandleToChannelId(handle) {
  const clean = handle.startsWith('@') ? handle : `@${handle}`
  const url = `https://www.youtube.com/${encodeURIComponent(clean)}`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; judomath/1.0)' } })
    if (!res.ok) return null
    const html = await res.text()
    // YouTube embeds <link rel="canonical" href="https://www.youtube.com/channel/UCxxx" />
    const m = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/([^"]+)"/)
    if (m) return m[1]
    // Fallback: look for "channelId":"UCxxx" inside ytInitialData.
    const m2 = html.match(/"channelId":"(UC[\w-]{20,})"/)
    return m2 ? m2[1] : null
  } catch {
    return null
  }
}

/** Crude but reliable XML feed parser — looks for <yt:videoId> + <title> per <entry>. */
function parseFeed(xml) {
  const entries = xml.split(/<entry[\s>]/).slice(1)
  const out = []
  for (const e of entries) {
    const idMatch = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const titleMatch = e.match(/<title>([^<]+)<\/title>/)
    if (idMatch && titleMatch) {
      out.push({ youtubeId: idMatch[1], title: decodeXmlEntities(titleMatch[1].trim()) })
    }
  }
  return out
}

function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** Title-keyword filter — keep judo-relevant, drop the bad stuff. */
function passesTitleFilter(title) {
  const t = title.toLowerCase()
  if (MUST_INCLUDE.length > 0 && !MUST_INCLUDE.some((kw) => t.includes(kw))) return false
  if (MUST_EXCLUDE.some((kw) => t.includes(kw))) return false
  return true
}

/** Verify a single video via oEmbed. 200 = exists + embeddable. */
async function isEmbeddable(youtubeId) {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
  try {
    const res = await fetch(oembed)
    return res.status === 200
  } catch {
    return false
  }
}

/** Bounded-concurrency mapper. */
async function mapWithConcurrency(items, fn, concurrency = 6) {
  const out = new Array(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (true) {
        const i = cursor++
        if (i >= items.length) return
        out[i] = await fn(items[i], i)
      }
    }),
  )
  return out
}

/** Render the final TypeScript module, sorted by source then title. */
function renderClipsFile(clips) {
  const banner = `/**
 * Curated, machine-validated pool of judo YouTube clips.
 *
 * Generated by scripts/fetch-judo-clips.mjs from scripts/clip-sources.json.
 * Each id was verified via YouTube oEmbed at generation time — only videos
 * that exist AND allow embedding are included. To refresh the list, run:
 *
 *   npm run clips:fetch
 *
 * If a clip later disables embedding, RewardClip will fail over to the next
 * one in the rotation; the player experience never gets stuck.
 */

export interface JudoClip {
  /** YouTube video id — the part after \`v=\` or after \`youtu.be/\`. */
  youtubeId: string
  /** Short, kid-friendly description shown above the video. */
  title: string
  /** Optional start time in seconds (default 0). */
  start?: number
}

export const CLIP_DURATION_SECONDS = 30

export const JUDO_CLIPS: JudoClip[] = [
`
  const lines = clips
    .map(
      (c) =>
        `  { youtubeId: ${JSON.stringify(c.youtubeId)}, title: ${JSON.stringify(c.title)} },`,
    )
    .join('\n')
  return banner + lines + '\n]\n'
}

/* ----------------------- main ----------------------- */

console.error(`Fetching feeds for ${sources.sources.length} channel(s)…`)
const allCandidates = []
for (const src of sources.sources) {
  const found = await fetchChannelFeed(src)
  console.error(`  [${src.label || src.value}] feed → ${found.length} entries`)
  allCandidates.push(...found)
}

console.error(`\nTotal candidates from feeds: ${allCandidates.length}`)
const titleFiltered = allCandidates.filter((c) => passesTitleFilter(c.title))
console.error(`After title filter:           ${titleFiltered.length}`)

// De-dupe by id.
const seen = new Set()
const unique = titleFiltered.filter((c) => {
  if (seen.has(c.youtubeId)) return false
  seen.add(c.youtubeId)
  return true
})
console.error(`After de-dup:                 ${unique.length}`)

console.error(`\nValidating ${unique.length} candidates against oEmbed…`)
const validated = await mapWithConcurrency(unique, async (c) => ({
  ...c,
  ok: await isEmbeddable(c.youtubeId),
}))

const good = validated.filter((c) => c.ok)
const bad = validated.filter((c) => !c.ok)
console.error(`\nValid: ${good.length}/${validated.length} (rejected ${bad.length})`)

if (good.length === 0) {
  console.error('\nNo valid clips found. Check scripts/clip-sources.json.')
  process.exit(1)
}

// Cap to target.
const final = good.slice(0, TARGET_COUNT)
console.error(`\nKeeping ${final.length} clip(s) for the final list.`)

if (dryRun) {
  console.error('\n--dry-run: not writing src/data/judoClips.ts')
  for (const c of final) console.log(`${c.youtubeId}\t${c.title}`)
} else {
  writeFileSync(outPath, renderClipsFile(final))
  console.error(`\n✓ Wrote ${outPath}`)
}
