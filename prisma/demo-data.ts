/**
 * DEMONSTRATION DATA ONLY (CLAUDE.md §6.2, §14). Every row is created with isDemo = true.
 * Names, descriptions and prices are invented placeholders, NOT the café's real menu, prices,
 * hours or offers. Replace them through the admin dashboard (Phase 5) or `npm run db:remove-demo`.
 */
import type { CategoryIcon, DietType, OfferKind } from '../src/generated/prisma/client'

type Item = {
  slug: string
  name: string
  description: string
  price: number // whole rupees, converted to paise by the seed
  diet?: DietType
  available?: boolean
  bestSeller?: boolean
  trending?: boolean
  featured?: boolean
  published?: boolean
}

export const demoCategories: {
  slug: string
  name: string
  icon: CategoryIcon
  image: string
  items: Item[]
}[] = [
  {
    slug: 'burgers',
    name: 'Burgers',
    icon: 'BURGER',
    image: 'demo/burgers.webp',
    items: [
      {
        slug: 'classic-veg-burger',
        name: 'Classic Veg Burger',
        description:
          'Demo item: a vegetable patty with lettuce, tomato and house sauce in a toasted bun.',
        price: 99,
        bestSeller: true,
      },
      {
        slug: 'paneer-tikka-burger',
        name: 'Paneer Tikka Burger',
        description: 'Demo item: grilled paneer tikka patty with mint mayo.',
        price: 149,
        trending: true,
        featured: true,
      },
      {
        slug: 'double-cheese-burger',
        name: 'Double Cheese Burger',
        description: 'Demo item: two slices of cheese on a crispy vegetable patty.',
        price: 179,
        available: false,
      },
    ],
  },
  {
    slug: 'pizza',
    name: 'Pizza',
    icon: 'PIZZA',
    image: 'demo/pizza.webp',
    items: [
      {
        slug: 'margherita-pizza',
        name: 'Margherita Pizza',
        description: 'Demo item: tomato sauce, mozzarella and herbs on a thin base.',
        price: 199,
        bestSeller: true,
      },
      {
        slug: 'farmhouse-pizza',
        name: 'Farmhouse Pizza',
        description: 'Demo item: capsicum, onion, tomato and sweet corn.',
        price: 249,
        trending: true,
      },
      {
        slug: 'tandoori-paneer-pizza',
        name: 'Tandoori Paneer Pizza',
        description: 'Demo item: tandoori-spiced paneer with onion and capsicum.',
        price: 279,
      },
    ],
  },
  {
    slug: 'pasta',
    name: 'Pasta',
    icon: 'PASTA',
    image: 'demo/pasta.webp',
    items: [
      {
        slug: 'white-sauce-pasta',
        name: 'White Sauce Pasta',
        description: 'Demo item: penne in a creamy white sauce with vegetables.',
        price: 169,
      },
      {
        slug: 'red-sauce-pasta',
        name: 'Red Sauce Pasta',
        description: 'Demo item: penne in a tangy tomato sauce.',
        price: 159,
        featured: true,
      },
      {
        slug: 'pink-sauce-pasta',
        name: 'Pink Sauce Pasta',
        description: 'Demo item: a mix of red and white sauces.',
        price: 179,
        published: false,
      },
    ],
  },
  {
    slug: 'snacks',
    name: 'Snacks',
    icon: 'SNACKS',
    image: 'demo/snacks.webp',
    items: [
      {
        slug: 'french-fries',
        name: 'French Fries',
        description: 'Demo item: salted crispy fries.',
        price: 79,
        bestSeller: true,
      },
      {
        slug: 'peri-peri-fries',
        name: 'Peri Peri Fries',
        description: 'Demo item: fries tossed in peri peri seasoning.',
        price: 99,
        trending: true,
      },
      {
        slug: 'cheese-garlic-bread',
        name: 'Cheese Garlic Bread',
        description: 'Demo item: garlic butter bread with melted cheese.',
        price: 119,
      },
    ],
  },
  {
    slug: 'beverages',
    name: 'Beverages',
    icon: 'BEVERAGE',
    image: 'demo/beverages.webp',
    items: [
      {
        slug: 'cold-coffee',
        name: 'Cold Coffee',
        description: 'Demo item: chilled blended coffee.',
        price: 89,
        bestSeller: true,
      },
      {
        slug: 'masala-lemonade',
        name: 'Masala Lemonade',
        description: 'Demo item: lemonade with a spiced masala mix.',
        price: 59,
      },
      {
        slug: 'chocolate-shake',
        name: 'Chocolate Shake',
        description: 'Demo item: thick chocolate milkshake.',
        price: 129,
        available: false,
      },
    ],
  },
  {
    slug: 'desserts',
    name: 'Desserts',
    icon: 'DESSERT',
    image: 'demo/desserts.webp',
    items: [
      {
        slug: 'chocolate-brownie',
        name: 'Chocolate Brownie',
        description: 'Demo item: a warm chocolate brownie.',
        price: 99,
        trending: true,
      },
      {
        slug: 'brownie-with-ice-cream',
        name: 'Brownie with Ice Cream',
        description: 'Demo item: brownie topped with a scoop of vanilla ice cream.',
        price: 139,
      },
    ],
  },
]

export const demoAddOns: Record<
  string,
  { name: string; min: number; max: number; options: [string, number][] }[]
> = {
  'classic-veg-burger': [
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
  'margherita-pizza': [
    {
      name: 'Crust',
      min: 1,
      max: 1,
      options: [
        ['Regular crust', 0],
        ['Cheese burst', 60],
      ],
    },
    {
      name: 'Toppings',
      min: 0,
      max: 3,
      options: [
        ['Olives', 25],
        ['Jalapeños', 25],
        ['Sweet corn', 20],
      ],
    },
  ],
  'cold-coffee': [{ name: 'Add-ons', min: 0, max: 1, options: [['Scoop of ice cream', 30]] }],
}

/** [from, to, type] — admin-managed associations, not analytics. */
export const demoRelations: [string, string, 'RELATED' | 'FREQUENTLY_BOUGHT_TOGETHER'][] = [
  ['classic-veg-burger', 'paneer-tikka-burger', 'RELATED'],
  ['classic-veg-burger', 'double-cheese-burger', 'RELATED'],
  ['classic-veg-burger', 'french-fries', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['classic-veg-burger', 'cold-coffee', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['margherita-pizza', 'farmhouse-pizza', 'RELATED'],
  ['margherita-pizza', 'cheese-garlic-bread', 'FREQUENTLY_BOUGHT_TOGETHER'],
  ['white-sauce-pasta', 'red-sauce-pasta', 'RELATED'],
  ['white-sauce-pasta', 'pink-sauce-pasta', 'RELATED'], // unpublished target: must stay hidden
]

const DAY = 86_400_000

/** Offers with dates relative to when the seed runs: active, scheduled, expired, unpublished. */
export function demoOffers(now: Date): {
  slug: string
  kind: OfferKind
  title: string
  description: string
  image: string | null
  price: number | null
  startsAt: Date
  endsAt: Date
  published: boolean
  student?: boolean
  featured?: boolean
  items: [string, number][]
}[] {
  const at = (days: number) => new Date(now.getTime() + days * DAY)
  return [
    {
      slug: 'burger-fries-combo',
      kind: 'COMBO',
      title: 'Burger + Fries + Coffee Combo',
      description: 'Demo combo: a classic veg burger, fries and a cold coffee.',
      image: 'demo/offer-combo.webp',
      price: 229,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      featured: true,
      items: [
        ['classic-veg-burger', 1],
        ['french-fries', 1],
        ['cold-coffee', 1],
      ],
    },
    {
      slug: 'pizza-duo-deal',
      kind: 'DISCOUNT',
      title: 'Pizza Duo Deal',
      description: 'Demo discount: two Margherita pizzas at a demo price.',
      image: 'demo/offer-discount.webp',
      price: 349,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      items: [['margherita-pizza', 2]],
    },
    {
      slug: 'student-snack-box',
      kind: 'COMBO',
      title: 'Student Snack Box',
      description:
        'Demo Student Zone offer: peri peri fries and masala lemonade. Information only; no student ID check exists.',
      image: 'demo/offer-student.webp',
      price: 129,
      startsAt: at(-1),
      endsAt: at(30),
      published: true,
      student: true,
      items: [
        ['peri-peri-fries', 1],
        ['masala-lemonade', 1],
      ],
    },
    {
      slug: 'weekend-dessert-special',
      kind: 'DISCOUNT',
      title: 'Dessert Special (scheduled)',
      description: 'Demo scheduled offer: starts next week.',
      image: null,
      price: 119,
      startsAt: at(7),
      endsAt: at(37),
      published: true,
      items: [['brownie-with-ice-cream', 1]],
    },
    {
      slug: 'old-pasta-offer',
      kind: 'DISCOUNT',
      title: 'Old Pasta Offer (expired)',
      description: 'Demo expired offer: must never be shown.',
      image: null,
      price: 139,
      startsAt: at(-30),
      endsAt: at(-1),
      published: true,
      items: [['white-sauce-pasta', 1]],
    },
    {
      slug: 'draft-offer',
      kind: 'INFO',
      title: 'Draft Offer (unpublished)',
      description: 'Demo unpublished offer: must never be shown.',
      image: null,
      price: null,
      startsAt: at(-1),
      endsAt: at(30),
      published: false,
      items: [],
    },
  ]
}

/** Placeholder café details. Every `*Verified` flag is false, so the UI labels them unverified. */
export const demoCafe = {
  name: 'ZORKO Sangli',
  addressLine: 'Address to be confirmed by the café (demo placeholder)',
  city: 'Sangli',
  aboutText: 'Demo text: replace with the café’s approved description.',
  studentZoneText:
    'Demo text: Student Zone offers are information only. No student ID check exists.',
  offerTerms: 'Demo text: offers shown here are examples, not real promotions.',
}

/** Placeholder hours (unverified, Q-05): 11:00–23:00 every day. */
export const demoHours = Array.from({ length: 7 }, (_, day) => ({
  dayOfWeek: day,
  opensAtMin: 11 * 60,
  closesAtMin: 23 * 60,
  isClosed: false,
}))
