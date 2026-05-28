#!/usr/bin/env node
/**
 * Generate raster PNG icons that Bubblewrap needs to build the Android TWA.
 *
 * Bubblewrap reads icons referenced from twa-manifest.json. The web app only
 * has SVG icons in public/, so we rasterize them here at build time using
 * sharp (pure Node, no system deps). Outputs go into public/ so the deployed
 * site serves them at the URLs declared in twa-manifest.json.
 *
 * Run:  npm run twa:icons
 */
import { readFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const sourceSvg = resolve(projectRoot, 'public/icon-512.svg')
const outputDir = resolve(projectRoot, 'public')

mkdirSync(outputDir, { recursive: true })
const svgBuffer = readFileSync(sourceSvg)

/**
 * Square output sizes Bubblewrap consumes:
 *  - 512: launcher and TWA splash icon
 *  - 192: PWA manifest fallback
 *  - 192/512 maskable: rendered with safe-area padding for adaptive icons
 */
const targets = [
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'icon-192-maskable.png', size: 192, maskable: true },
]

for (const { name, size, maskable } of targets) {
  const outputPath = resolve(outputDir, name)

  if (maskable) {
    // Maskable icons need a safe area: render the artwork at 80% of the
    // canvas, centered, with a solid background. Android may crop up to
    // 10% on each side for adaptive icon shapes.
    const innerSize = Math.round(size * 0.8)
    const offset = Math.round((size - innerSize) / 2)

    const innerPng = await sharp(svgBuffer)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0x86, g: 0x3b, b: 0xff, alpha: 1 },
      },
    })
      .composite([{ input: innerPng, top: offset, left: offset }])
      .png()
      .toFile(outputPath)
  } else {
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath)
  }

  console.log(`✓ ${name} (${size}x${size}${maskable ? ', maskable' : ''})`)
}

console.log('\nGenerated all TWA icons in', outputDir)
