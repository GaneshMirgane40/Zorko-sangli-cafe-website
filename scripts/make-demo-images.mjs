// Generates neutral, clearly labelled DEMO placeholder images into public/demo/ (CLAUDE.md §6.8, §14).
// Run once: `node scripts/make-demo-images.mjs`. Output is committed so seeds and screenshots are
// deterministic and no external image is hotlinked. Uses `sharp`, which Next.js already installs.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const OUT = 'public/demo'
// Brand-token tints (UI_SPEC §2) behind a plain label. No food photos, no claims.
const images = [
  ['burgers', '#a93200', 'Burgers'],
  ['pizza', '#d1430a', 'Pizza'],
  ['pasta', '#7c5800', 'Pasta'],
  ['wraps', '#5e4200', 'Wraps'],
  ['momos', '#00658d', 'Momos'],
  ['snacks', '#006947', 'Snacks'],
  ['beverages', '#00658d', 'Beverages'],
  ['desserts', '#8c3a5b', 'Desserts'],
  ['offer-combo', '#a93200', 'Combo offer'],
  ['offer-discount', '#006947', 'Discount offer'],
  ['offer-student', '#7c5800', 'Student Zone'],
]

// Neutral "photo coming soon" tiles for the REAL menu (no photos supplied yet, Q-10).
const placeholders = [
  ['burgers', '#a93200', 'Burgers'],
  ['pizza', '#d1430a', 'Pizza'],
  ['momos', '#00658d', 'Momos'],
  ['fries', '#7c5800', 'Fries'],
  ['wraps', '#5e4200', 'Wraps'],
  ['pasta', '#8c3a5b', 'Pasta'],
  ['garlic-bread', '#842500', 'Garlic Bread'],
  ['toastie', '#5e4200', 'Toastie'],
  ['buns', '#a93200', 'Special Buns'],
  ['nachos', '#7c5800', 'Nachos'],
  ['maggi', '#d1430a', 'Maggi'],
  ['mojito', '#006947', 'Mojito'],
  ['cold-coffee', '#5a4139', 'Cold Coffee'],
  ['shakes', '#8c3a5b', 'Milk Shakes'],
  ['ice-tea', '#00658d', 'Ice Tea'],
  ['hot', '#842500', 'Hot Beverages'],
]

await mkdir(OUT, { recursive: true })
await mkdir('public/placeholder', { recursive: true })
for (const [name, color, label] of placeholders) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="${color}"/>
    <text x="400" y="300" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${label}</text>
    <text x="400" y="372" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#ffffff" fill-opacity="0.85">Photo coming soon</text>
  </svg>`
  await sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(`public/placeholder/${name}.webp`)
}
for (const [name, color, label] of images) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="${color}"/>
    <rect x="40" y="40" width="720" height="520" rx="32" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="4"/>
    <text x="400" y="300" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${label}</text>
    <text x="400" y="372" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#ffffff" fill-opacity="0.85">DEMO IMAGE — placeholder</text>
  </svg>`
  await sharp(Buffer.from(svg)).webp({ quality: 70 }).toFile(`${OUT}/${name}.webp`)
}
console.log(`Wrote ${images.length} placeholder images to ${OUT}/`)
