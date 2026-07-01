/**
 * Generates the Drift app icon + splash assets (for @capacitor/assets) from SVG,
 * in the app's own language: a dusk gradient with a soft violet crescent moon.
 * Output → ./assets (consumed by `npx @capacitor/assets generate`).
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('assets', { recursive: true })

const bg = (s) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="38%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#4A2287"/>
      <stop offset="42%" stop-color="#2A125E"/>
      <stop offset="100%" stop-color="#0A0716"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#bg)"/>
</svg>`

// crescent moon + glow + stars, centered, sized to `d` (diameter) on an s×s canvas
const moon = (s, d) => {
  const c = s / 2
  const r = d / 2
  const off = r * 0.42
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#CDBBFF" stop-opacity="0.55"/>
      <stop offset="70%" stop-color="#CDBBFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F6F3FF"/>
      <stop offset="100%" stop-color="#C9B6FF"/>
    </linearGradient>
    <mask id="cres">
      <rect width="${s}" height="${s}" fill="black"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="white"/>
      <circle cx="${c + off}" cy="${c - off * 0.55}" r="${r * 0.9}" fill="black"/>
    </mask>
  </defs>
  <circle cx="${c}" cy="${c}" r="${r * 1.55}" fill="url(#glow)"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="url(#m)" mask="url(#cres)"/>
  <g fill="#F6F3FF">
    <circle cx="${c + r * 0.7}" cy="${c + r * 0.55}" r="${r * 0.03}"/>
    <circle cx="${c - r * 0.62}" cy="${c - r * 0.62}" r="${r * 0.018}" opacity="0.8"/>
  </g>
</svg>`
}

const png = (svg) => sharp(Buffer.from(svg)).png()

// icons (1024)
await png(bg(1024)).toFile('assets/icon-background.png')
await png(moon(1024, 470)).toFile('assets/icon-foreground.png')
await sharp(Buffer.from(bg(1024)))
  .composite([{ input: await png(moon(1024, 560)).toBuffer() }])
  .png()
  .toFile('assets/icon-only.png')

// splashes (2732) — gradient + centered moon
const splash = await sharp(Buffer.from(bg(2732)))
  .composite([{ input: await png(moon(2732, 900)).toBuffer() }])
  .png()
  .toBuffer()
await sharp(splash).toFile('assets/splash.png')
await sharp(splash).toFile('assets/splash-dark.png')

console.log('[icon] generated Drift moon icon + splash into ./assets')
