/**
 * DEVELOPMENT DEMO MENU (CLAUDE.md §6.2, §14). Every row is created with isDemo = true.
 *
 * Category and item NAMES follow the public ZORKO brand website (https://zorko.in/, checked
 * 2026-10-14) so the demo looks like a real ZORKO menu. That site shows no prices and is a
 * brand reference only, NOT the Sangli outlet's confirmed menu:
 * - descriptions are our own neutral wording, prefixed "Demo item";
 * - every price is an invented placeholder;
 * - no brand images or text are copied (placeholders come from scripts/make-demo-images.mjs).
 * Replace with the outlet's real menu through the admin dashboard (Phase 5) or
 * `npm run db:remove-demo -- --confirm` (open question Q-03).
 */
import type { Item, SeedDataset } from './fixtures/test-data'

const d = (text: string) => `Demo item: ${text}`
type Cat = SeedDataset['categories'][number]
const cat = (slug: string, name: string, icon: Cat['icon'], image: string, items: Item[]): Cat => ({
  slug,
  name,
  icon,
  image,
  items,
})

const categories: SeedDataset['categories'] = [
  cat('burgers', 'Burgers', 'BURGER', 'demo/burgers.webp', [
    {
      slug: 'veg-classic-burger',
      name: 'Veg Classic Burger',
      description: d('vegetable patty, lettuce and sauce in a toasted bun.'),
      price: 89,
      bestSeller: true,
    },
    {
      slug: 'paneer-burger',
      name: 'Paneer Burger',
      description: d('crumb-fried paneer patty with a creamy sauce.'),
      price: 129,
      trending: true,
    },
    {
      slug: 'cheese-burger',
      name: 'Cheese Burger',
      description: d('vegetable patty with a slice of cheese.'),
      price: 109,
    },
  ]),
  cat('pizza', 'Pizza', 'PIZZA', 'demo/pizza.webp', [
    {
      slug: 'capsicum-onion-pizza',
      name: 'Capsicum Onion Pizza',
      description: d('tomato sauce, cheese, capsicum and onion.'),
      price: 169,
      bestSeller: true,
    },
    {
      slug: 'kulhad-pizza',
      name: 'Kulhad Pizza',
      description: d('pizza toppings and cheese baked in a clay kulhad.'),
      price: 149,
      trending: true,
      featured: true,
    },
    {
      slug: 'paneer-tikka-pizza',
      name: 'Paneer Tikka Pizza',
      description: d('tikka-spiced paneer with onion and capsicum.'),
      price: 219,
    },
  ]),
  cat('wraps-sandwiches', 'Wraps & Sandwiches', 'SANDWICH', 'demo/wraps.webp', [
    {
      slug: 'spicy-paneer-wrap',
      name: 'Spicy Paneer Wrap',
      description: d('spiced paneer and vegetables rolled in a soft wrap.'),
      price: 119,
      trending: true,
    },
    {
      slug: 'veg-mexican-sandwich',
      name: 'Veg Mexican Sandwich',
      description: d('grilled sandwich with a Mexican-style vegetable filling.'),
      price: 99,
    },
    {
      slug: 'zorko-tostie',
      name: 'Zorko Tostie',
      description: d('toasted sandwich with a cheesy vegetable filling.'),
      price: 109,
    },
  ]),
  cat('momos', 'Momos', 'GENERAL', 'demo/momos.webp', [
    {
      slug: 'vegetable-momos',
      name: 'Vegetable Momos',
      description: d('steamed dumplings with a vegetable filling.'),
      price: 89,
      bestSeller: true,
    },
    {
      slug: 'fried-momos',
      name: 'Fried Momos',
      description: d('crisp fried vegetable dumplings.'),
      price: 99,
    },
    {
      slug: 'paneer-momos',
      name: 'Paneer Momos',
      description: d('steamed dumplings with a paneer filling.'),
      price: 109,
      available: false,
    },
  ]),
  cat('pasta-maggie', 'Pasta & Maggie', 'PASTA', 'demo/pasta.webp', [
    {
      slug: 'white-sauce-pasta',
      name: 'White Sauce Pasta',
      description: d('pasta in a creamy white sauce with vegetables.'),
      price: 139,
    },
    {
      slug: 'double-masala-maggie',
      name: 'Double Masala Maggie',
      description: d('instant noodles with extra masala and vegetables.'),
      price: 79,
      trending: true,
    },
  ]),
  cat('snacks', 'Fries & Snacks', 'SNACKS', 'demo/snacks.webp', [
    {
      slug: 'crispy-loaded-fries',
      name: 'Crispy Loaded Fries',
      description: d('fries topped with cheese sauce and seasoning.'),
      price: 119,
      bestSeller: true,
    },
    {
      slug: 'cheesy-delight-nachos',
      name: 'Cheesy Delight Nachos',
      description: d('nachos with cheese sauce and salsa.'),
      price: 129,
    },
    {
      slug: 'garlic-bread',
      name: 'Garlic Bread',
      description: d('toasted bread with garlic butter.'),
      price: 89,
    },
    {
      slug: 'cheesy-lava-bun',
      name: 'Cheesy Lava Bun',
      description: d('soft bun with a molten cheese filling.'),
      price: 99,
      featured: true,
    },
  ]),
  cat('beverages', 'Beverages', 'BEVERAGE', 'demo/beverages.webp', [
    {
      slug: 'premium-cold-coffee',
      name: 'Premium Cold Coffee',
      description: d('chilled blended coffee.'),
      price: 109,
      bestSeller: true,
    },
    {
      slug: 'mint-mojito',
      name: 'Mint Mojito',
      description: d('mint and lime cooler (non-alcoholic).'),
      price: 89,
      trending: true,
    },
    { slug: 'hot-coffee', name: 'Hot Coffee', description: d('hot milk coffee.'), price: 59 },
    {
      slug: 'lemon-iced-tea',
      name: 'Lemon Iced Tea',
      description: d('chilled tea with lemon.'),
      price: 79,
    },
  ]),
  cat('shakes-desserts', 'Shakes & Desserts', 'DESSERT', 'demo/desserts.webp', [
    {
      slug: 'chocolate-browny-shake',
      name: 'Chocolate Browny Shake',
      description: d('chocolate milkshake blended with brownie.'),
      price: 149,
      trending: true,
    },
    {
      slug: 'sizzling-brownie',
      name: 'Sizzling Brownie',
      description: d('warm brownie served on a hot plate with chocolate sauce.'),
      price: 159,
    },
  ]),
]

const addOns: SeedDataset['addOns'] = {
  'veg-classic-burger': [
    {
      name: 'Extras',
      min: 0,
      max: 2,
      options: [
        ['Extra cheese slice', 20],
        ['Extra patty', 40],
      ],
    },
  ],
  'capsicum-onion-pizza': [
    {
      name: 'Size',
      min: 1,
      max: 1,
      options: [
        ['Regular', 0],
        ['Medium', 80],
      ],
    },
    {
      name: 'Toppings',
      min: 0,
      max: 3,
      options: [
        ['Extra cheese', 30],
        ['Jalapeños', 20],
        ['Sweet corn', 20],
      ],
    },
  ],
  'premium-cold-coffee': [
    { name: 'Add-ons', min: 0, max: 1, options: [['Scoop of ice cream', 30]] },
  ],
  'vegetable-momos': [
    {
      name: 'Style',
      min: 1,
      max: 1,
      options: [
        ['Steamed', 0],
        ['Fried', 10],
      ],
    },
  ],
}

const relations: SeedDataset['relations'] = [
  ['veg-classic-burger', 'paneer-burger', 'RELATED'],
  ['veg-classic-burger', 'cheese-burger', 'RELATED'],
  ['veg-classic-burger', 'crispy-loaded-fries', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['veg-classic-burger', 'premium-cold-coffee', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['capsicum-onion-pizza', 'kulhad-pizza', 'RELATED'],
  ['capsicum-onion-pizza', 'garlic-bread', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['vegetable-momos', 'fried-momos', 'RELATED'],
  ['vegetable-momos', 'mint-mojito', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['white-sauce-pasta', 'double-masala-maggie', 'RELATED'],
]

const DAY = 86_400_000

const offers: SeedDataset['offers'] = (now) => {
  const at = (days: number) => new Date(now.getTime() + days * DAY)
  return [
    {
      slug: 'burger-fries-coffee-combo',
      kind: 'COMBO',
      title: 'Burger + Fries + Cold Coffee',
      description:
        'Demo combo: Veg Classic Burger, Crispy Loaded Fries and Premium Cold Coffee. Example price only.',
      image: 'demo/offer-combo.webp',
      price: 269,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      featured: true,
      items: [
        ['veg-classic-burger', 1],
        ['crispy-loaded-fries', 1],
        ['premium-cold-coffee', 1],
      ],
    },
    {
      slug: 'momos-mojito-student-combo',
      kind: 'COMBO',
      title: 'Momos + Mojito (Student Zone)',
      description:
        'Demo Student Zone combo: Vegetable Momos and Mint Mojito. Information only; no student ID check exists.',
      image: 'demo/offer-student.webp',
      price: 149,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      student: true,
      items: [
        ['vegetable-momos', 1],
        ['mint-mojito', 1],
      ],
    },
    {
      slug: 'pizza-pair-deal',
      kind: 'DISCOUNT',
      title: 'Pizza Pair Deal',
      description: 'Demo discount: two Capsicum Onion Pizzas at an example price.',
      image: 'demo/offer-discount.webp',
      price: 299,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      items: [['capsicum-onion-pizza', 2]],
    },
    {
      slug: 'brownie-shake-weekend',
      kind: 'DISCOUNT',
      title: 'Brownie + Shake (scheduled)',
      description:
        'Demo scheduled offer: Sizzling Brownie with a Chocolate Browny Shake, starting next week.',
      image: null,
      price: 269,
      startsAt: at(7),
      endsAt: at(37),
      published: true,
      items: [
        ['sizzling-brownie', 1],
        ['chocolate-browny-shake', 1],
      ],
    },
  ]
}

export const demoDataset: SeedDataset = {
  categories,
  addOns,
  relations,
  offers,
  cafe: {
    name: 'ZORKO Sangli',
    addressLine: 'Address to be confirmed by the café (demo placeholder)',
    city: 'Sangli',
    aboutText:
      'Demo text: ZORKO Sangli is an outlet of the ZORKO fast-food brand. Replace with the café’s approved description.',
    studentZoneText:
      'Demo text: Student Zone offers are information only. No student ID check exists.',
    offerTerms: 'Demo text: offers shown here are examples, not real promotions.',
  },
  hours: Array.from({ length: 7 }, (_, day) => ({
    dayOfWeek: day,
    opensAtMin: 11 * 60,
    closesAtMin: 23 * 60,
    isClosed: false,
  })),
}
