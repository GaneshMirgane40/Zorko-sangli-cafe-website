// Downloads the chosen, licence-checked Wikimedia Commons photos used as ILLUSTRATIVE menu images
// (ADR-045) and writes:
//   public/stock/<key>.webp          1200×900 (4:3) WebP, metadata stripped
//   src/lib/site/image-credits.json  source page, author and licence for the /credits page
// Run once: `node scripts/fetch-stock-images.mjs`. Every photo was checked by eye to be vegetarian.
// Downloads are treated as untrusted data: they are only decoded and re-encoded by sharp.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const UA = {
  'User-Agent': 'zorko-sangli-student-project/0.1 (educational; github.com/uTkarsho6/cafe-website)',
}
const FILES = {
  burgers: 'File:Mushroom vegetarian burger - Grubbs.jpg',
  pizza: 'File:Four Cheese - Pizza 500 2023-11-10.jpg',
  momos: 'File:Vegetable Momos - Yak Yeti Yak 2025-07-23.jpg',
  fries: 'File:French fries 🍟.jpg',
  wraps: 'File:Vegetable Wrap (toasted) - The naan hut 2023-12-22.jpg',
  'wrap-salsa': 'File:Avocado Burrito - Potatoast 2025-12-30.jpg',
  'pasta-pink': "File:Jacob's Restaurant - December 2025 - Sarah Stierch 03.jpg",
  'garlic-bread': 'File:Garlic Bread Mozzarella - Oregano Pizzeria 2025-05-17.jpg',
  toastie: 'File:Toast with cheddar cheese and tomato.jpg',
  buns: 'File:Korean Cheese Bun.jpg',
  nachos: 'File:NACHOS - Montagues Tex Mex 2026-06-03.jpg',
  maggi: 'File:Vegetable Maggi 3.jpg',
  mojito: 'File:Mojito, Mazatlán, 30 de noviembre de 2022.jpg',
  'mojito-strawberry': 'File:Strawberry Mojito (Unsplash).jpg',
  'cold-coffee': 'File:Iced Coffee 20240730-135859.jpg',
  'cold-coffee-chocolate': "File:Iced Mocha - Granny's Café 2024-08-21.jpg",
  shakes: 'File:Salted Caramel Milkshake.jpg',
  'shake-oreo': 'File:Oreo milkshake - Creperie Doux Sourire 2025-05-03.jpg',
  'shake-strawberry': 'File:Strawberry milk shake (cropped).jpg',
  'ice-tea': 'File:Iced tea (Unsplash).jpg',
  coffee: 'File:Cup of coffee in Café Butter - Prenzlauer Berg, Berlin.jpg',
  tea: 'File:Masala Chai.JPG',
  'hot-chocolate': 'File:Hot chocolate (Unsplash).jpg',
  'burger-tikki': 'File:Aloo Tikki Burger.jpg',
  'burger-veggie': "File:Fancy Veggie Burger and Fries - Joe's Burger House 2024-07-07.jpg",
  'pizza-margherita': 'File:Pizza-napoletana.jpg',
  'pizza-corn': 'File:Mysore Style Tawa Pizza with higher resolution.jpg',
  'pizza-veg-thin': 'File:Vegetable pizza Denpasar Bali.JPG',
  'pizza-paneer-spicy': 'File:Paneer Pizza 2.jpg',
  'pizza-paneer-tikka': 'File:Paneer Tikka Pizza.jpg',
  'momos-fried': 'File:Fried momos of Salem.jpg',
  'momos-cheese': 'File:MOMOs with chilly cheese chutney and soya sauce.jpg',
  'fries-peri': 'File:Peri peri fries.jpg',
  'fries-loaded': 'File:LoadedCheeseFries C2Cafe Mumbai.jpg',
  'pasta-white': 'File:White Sauce Pasta at a restaurant in Kolkata, India.jpg',
  'pasta-white-2': 'File:White sauce pasta.jpg',
  'pasta-arrabbiata': 'File:Penne Arrabbiata.jpg',
  'nachos-dip': 'File:Nachos with dip.jpg',
  'bun-korean': 'File:AEON Taman Maluri, Kuala Lumpur 20230618 105829.jpg',
  'mojito-mango': 'File:Mango Mojito – La Casa Restaurant – September 2023 - Sarah Stierch.jpg',
  'mojito-pineapple': 'File:Mango mojito.jpg',
  'shake-pink': 'File:Strawberry Milkshake Whipped Cream.jpg',
  'shake-chocolate': "File:Chocolate Milkshake (Rudford's Restaurant).jpg",
  'tea-peach': 'File:Peach iced tea with orange slices.jpg',
}
// Per-image crop focus where automatic 'attention' cropping picks the background.
const POSITION = { 'shake-oreo': 'centre' }
const ALLOWED = /^(CC0|Public domain|CC BY(-SA)? (2\.0|2\.5|3\.0|4\.0))$/

const api = new URL('https://commons.wikimedia.org/w/api.php')
Object.entries({
  action: 'query',
  titles: Object.values(FILES).join('|'),
  prop: 'imageinfo',
  iiprop: 'url|extmetadata',
  iiurlwidth: '1600',
  format: 'json',
}).forEach(([k, v]) => api.searchParams.set(k, v))
const j = await (await fetch(api, { headers: UA })).json()
const norm = Object.fromEntries((j.query.normalized ?? []).map((n) => [n.from, n.to]))
const pages = Object.fromEntries(Object.values(j.query.pages).map((p) => [p.title, p]))
const strip = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

await mkdir('public/stock', { recursive: true })
const credits = []
for (const [key, title] of Object.entries(FILES)) {
  const p = pages[norm[title] ?? title]
  const ii = p?.imageinfo?.[0]
  if (!ii) throw new Error(`missing on Commons: ${title}`)
  const m = ii.extmetadata
  const license = m.LicenseShortName?.value ?? ''
  if (!ALLOWED.test(license)) throw new Error(`licence not allowed for ${title}: ${license}`)
  await new Promise((r) => setTimeout(r, 1500)) // be polite to Wikimedia
  const res = await fetch(ii.thumburl, { headers: UA })
  if (!res.ok) throw new Error(`download failed ${res.status}: ${title}`)
  await sharp(Buffer.from(await res.arrayBuffer()))
    .rotate() // respect EXIF orientation, then metadata is dropped by default
    .resize(1200, 900, { fit: 'cover', position: POSITION[key] ?? 'attention' })
    .webp({ quality: 74 })
    .toFile(`public/stock/${key}.webp`)
  credits.push({
    key,
    title: p.title.replace(/^File:/, ''),
    author: strip(m.Artist?.value) || 'Unknown',
    license,
    licenseUrl: m.LicenseUrl?.value ?? null,
    source: ii.descriptionurl,
  })
  console.log('ok', key, license)
}
await writeFile('src/lib/site/image-credits.json', JSON.stringify(credits, null, 2) + '\n')
console.log(`Wrote ${credits.length} images and credits`)
