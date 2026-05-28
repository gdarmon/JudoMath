#!/usr/bin/env node
/**
 * Browser-level validation for reward YouTube embeds.
 *
 * oEmbed tells us that a video exists and allows embedding, but this check opens
 * the same youtube-nocookie embed URL used by the app in Chrome and looks for
 * player-level error screens such as "Video unavailable".
 */

import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const clipsPath = resolve(projectRoot, 'src/data/judoClips.ts')
const executablePath = process.env.CHROME_PATH || '/usr/bin/google-chrome'
const perClipTimeoutMs = Number(process.env.CLIP_BROWSER_TIMEOUT_MS || 8000)
const startIndex = Math.max(0, Number(process.env.CLIP_START_INDEX || 0))
const clipLimit = Number(process.env.CLIP_LIMIT || 0)

function loadClipsFromSource() {
  const src = readFileSync(clipsPath, 'utf8')
  const out = []
  const re = /\{\s*youtubeId:\s*"([^"]+)"\s*,\s*title:\s*"((?:[^"\\]|\\.)*)"(?:\s*,\s*start:\s*(\d+))?\s*\}/g
  let m
  while ((m = re.exec(src)) !== null) {
    out.push({
      youtubeId: m[1],
      title: JSON.parse(`"${m[2]}"`),
      start: m[3] ? Number(m[3]) : undefined,
    })
  }
  return out
}

function buildEmbedUrl(clip) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '0',
    playsinline: '1',
    controls: '1',
    rel: '0',
    modestbranding: '1',
  })
  if (clip.start && clip.start > 0) {
    params.set('start', String(clip.start))
  }
  return `https://www.youtube-nocookie.com/embed/${clip.youtubeId}?${params.toString()}`
}

function escapeAttribute(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function startTestServer() {
  const server = createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', 'http://127.0.0.1')
    const src = requestUrl.searchParams.get('src')
    if (requestUrl.pathname !== '/clip' || !src) {
      res.writeHead(404)
      res.end('Not found')
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    })
    res.end(`<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reward clip test</title>
    <style>
      html, body, iframe { width: 100%; height: 100%; margin: 0; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="${escapeAttribute(src)}"
      title="Reward clip"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </body>
</html>`)
  })

  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Could not start local clip test server')
  }
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  }
}

async function findEmbedFrame(page, youtubeId) {
  const deadline = Date.now() + perClipTimeoutMs
  while (Date.now() < deadline) {
    const frame = page.frames().find((f) => f.url().includes(`/embed/${youtubeId}`))
    if (frame) return frame
    await page.waitForTimeout(100)
  }
  return null
}

async function checkClip(page, clip, baseUrl) {
  const url = buildEmbedUrl(clip)
  const pageUrl = `${baseUrl}/clip?src=${encodeURIComponent(url)}`
  const errors = []

  page.removeAllListeners('console')
  page.removeAllListeners('pageerror')
  page.on('pageerror', (err) => errors.push(err.message))

  const response = await page.goto(pageUrl, {
    waitUntil: 'domcontentloaded',
    timeout: perClipTimeoutMs,
  })

  const frame = await findEmbedFrame(page, clip.youtubeId)
  if (!frame) {
    return {
      ok: false,
      status: response?.status() ?? 0,
      hasVideo: false,
      hasPlayer: false,
      adShowing: false,
      reason: 'youtube iframe did not load',
    }
  }

  await page.waitForTimeout(3000)

  const status = response?.status() ?? 0
  const result = await frame.evaluate(() => {
    const text = document.body?.innerText || ''
    const errorText = Array.from(
      document.querySelectorAll(
        '.ytp-error-content-wrap-reason, .ytp-error-content-wrap-subreason, .ytp-unavailable-message, .ytp-offline-slate-main-text',
      ),
    )
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .join(' | ')

    return {
      hasVideo: Boolean(document.querySelector('video')),
      hasPlayer: Boolean(document.querySelector('.html5-video-player, #movie_player')),
      hasErrorNode: Boolean(document.querySelector('.ytp-error, .ytp-error-content-wrap')),
      adShowing: Boolean(document.querySelector('.ad-showing')),
      text,
      errorText,
    }
  })

  const lowerText = `${result.text} ${result.errorText}`.toLowerCase()
  const looksUnavailable =
    result.hasErrorNode ||
    lowerText.includes('video unavailable') ||
    lowerText.includes('this video is unavailable') ||
    lowerText.includes('not available') ||
    lowerText.includes('playback on other websites has been disabled')

  const ok = status >= 200 && status < 400 && result.hasPlayer && !looksUnavailable
  return {
    ok,
    status,
    hasVideo: result.hasVideo,
    hasPlayer: result.hasPlayer,
    adShowing: result.adShowing,
    reason: ok ? '' : result.errorText || errors[0] || 'player did not load cleanly',
  }
}

const allClips = loadClipsFromSource()
const clips = clipLimit > 0
  ? allClips.slice(startIndex, startIndex + clipLimit)
  : allClips.slice(startIndex)
if (clips.length === 0) {
  console.error('No clips found in', clipsPath)
  process.exit(1)
}

console.error(`Browser-checking ${clips.length}/${allClips.length} reward clip embed(s)...`)

const { server, baseUrl } = await startTestServer()

const results = []
for (const [index, clip] of clips.entries()) {
  let browser
  let context
  let page
  try {
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: [
        '--autoplay-policy=no-user-gesture-required',
        '--disable-background-networking',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
      ],
    })
    context = await browser.newContext({
      locale: 'en-US',
      viewport: { width: 390, height: 844 },
    })
    page = await context.newPage()

    const result = await checkClip(page, clip, baseUrl)
    results.push({ ...clip, ...result })
    const tag = result.ok ? '✓' : '✗'
    const ad = result.adShowing ? ' ad-detected' : ''
    const reason = result.ok ? '' : ` — ${result.reason}`
    console.error(`${tag} ${startIndex + index + 1}/${allClips.length} ${clip.youtubeId} ${clip.title}${ad}${reason}`)
  } catch (err) {
    results.push({
      ...clip,
      ok: false,
      status: 0,
      hasVideo: false,
      hasPlayer: false,
      adShowing: false,
      reason: err.message || 'browser check failed',
    })
    console.error(`✗ ${startIndex + index + 1}/${allClips.length} ${clip.youtubeId} ${clip.title} — ${err.message}`)
  } finally {
    await page?.close().catch(() => {})
    await context?.close().catch(() => {})
    await browser?.close().catch(() => {})
  }
}

await new Promise((resolveClose) => server.close(resolveClose))

const broken = results.filter((r) => !r.ok)
const ads = results.filter((r) => r.adShowing)

console.error(`\n${clips.length - broken.length}/${clips.length} browser checks OK, ${broken.length} failed.`)
if (ads.length > 0) {
  console.error(`${ads.length}/${clips.length} showed an ad marker during the short check.`)
}
if (broken.length > 0) {
  console.error('\nBroken embeds:')
  for (const clip of broken) {
    console.error(`  ${clip.youtubeId} "${clip.title}" → ${clip.reason}`)
  }
}

process.exit(broken.length === 0 ? 0 : 1)
