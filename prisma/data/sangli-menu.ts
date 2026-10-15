/**
 * REAL MENU of Cafe Zorko, Vishrambag, Sangli — transcribed from the printed outlet menu supplied
 * by the team (two photos dated 2026-10-12, docs/OPEN_QUESTIONS.md Q-07). Rows are NOT demo data
 * (isDemo = false). Imported with `npm run db:import-menu` (prisma/import-menu.ts).
 *
 * Transcription rules (ADR-044):
 * - Prices are exactly as printed, in rupees.
 * - "Best Seller" → isBestSeller, "Must Try" → isTrending, "New Launch" → isFeatured.
 * - A second printed price becomes an add-on option (Baked pasta, Large fries, "+25 with ice-cream
 *   scoop", "+15/+30/+40 add cheese", Maggi cheese/butter, cheese/mojito injector).
 * - Descriptions are shortened from the menu's own text. The menu's own food photos are NOT used;
 *   items show licence-checked, vegetarian ILLUSTRATIVE photos from Wikimedia Commons
 *   (public/stock, credits on /credits, ADR-045).
 * - Desserts (ice-cream scoops) are left out: their prices are cut off in the photo.
 * - Every item carries the veg mark printed on the menu (the whole menu is vegetarian).
 */

export type AddOnDef = { name: string; min: number; max: number; options: [string, number][] }
export type MenuTag = 'best' | 'must' | 'new'
export type RealItem = {
  name: string
  desc: string
  price: number
  tags?: MenuTag[]
  addOns?: AddOnDef[]
  /** Closer-matching illustrative photo key (public/stock), overriding the category photo. */
  image?: StockKey
}
export type RealCategory = {
  slug: string
  name: string
  icon:
    | 'BURGER'
    | 'PIZZA'
    | 'PASTA'
    | 'SNACKS'
    | 'SANDWICH'
    | 'BEVERAGE'
    | 'COFFEE'
    | 'DESSERT'
    | 'MEAL'
    | 'GENERAL'
  image: StockKey
  note?: string
  items: RealItem[]
}

/** Illustrative photos (scripts/fetch-stock-images.mjs) and what each one shows (used for alt text). */
export const STOCK = {
  burgers: 'a vegetable burger',
  pizza: 'a cheese pizza',
  momos: 'steamed vegetable momos with dip',
  fries: 'french fries',
  wraps: 'a toasted vegetable wrap',
  'wrap-salsa': 'a vegetable burrito wrap with salad',
  'pasta-pink': 'penne pasta in pink sauce',
  'garlic-bread': 'cheese garlic bread',
  toastie: 'cheese and tomato toast',
  buns: 'a garlic cheese bun',
  nachos: 'nachos with cheese, jalapeños and guacamole',
  maggi: 'masala instant noodles with vegetables',
  mojito: 'a mint mojito',
  'mojito-strawberry': 'strawberry mojitos',
  'cold-coffee': 'cold coffee topped with cream',
  'cold-coffee-chocolate': 'an iced chocolate coffee',
  shakes: 'a milkshake topped with cream',
  'shake-oreo': 'an Oreo milkshake',
  'shake-strawberry': 'a strawberry milkshake',
  'ice-tea': 'iced tea with lemon',
  coffee: 'a cup of hot coffee',
  tea: 'a cup of masala tea',
  'hot-chocolate': 'a cup of hot chocolate',
  'burger-tikki': 'an aloo tikki burger with cheese',
  'burger-veggie': 'a veggie burger with fries',
  'pizza-margherita': 'a margherita pizza',
  'pizza-corn': 'a sweet corn and vegetable pizza',
  'pizza-veg-thin': 'a thin-crust vegetable pizza',
  'pizza-paneer-spicy': 'a spicy paneer pizza with peppers',
  'pizza-paneer-tikka': 'a paneer tikka pizza',
  'momos-fried': 'fried momos',
  'momos-cheese': 'momos with a cheese dip',
  'fries-peri': 'peri peri fries with dip',
  'fries-loaded': 'cheese-loaded fries',
  'pasta-white': 'penne pasta in white sauce with vegetables',
  'pasta-white-2': 'creamy pasta with vegetables',
  'pasta-arrabbiata': 'penne arrabbiata in red sauce',
  'nachos-dip': 'nachos with a cheese dip',
  'bun-korean': 'a cream cheese garlic bun',
  'mojito-mango': 'a mango mojito',
  'mojito-pineapple': 'a yellow fruit mojito with mint',
  'shake-pink': 'a pink milkshake with whipped cream',
  'shake-chocolate': 'a chocolate milkshake',
  'tea-peach': 'peach iced tea',
} as const
export type StockKey = keyof typeof STOCK
export const stockPath = (key: StockKey) => `stock/${key}.webp`
export const stockAlt = (key: StockKey) => `Illustrative photo of ${STOCK[key]}`

const burgerExtras: AddOnDef = {
  name: 'Extras',
  min: 0,
  max: 3,
  options: [
    ['Add cheese slice', 15],
    ['Double cheese slice', 30],
    ['Grill the burger', 30],
    ['Cheese injector', 30],
  ],
}
const pizzaCheese: AddOnDef = {
  name: 'Extras',
  min: 0,
  max: 1,
  options: [['Add double cheese', 40]],
}
const pastaStyle: AddOnDef = {
  name: 'Style',
  min: 1,
  max: 1,
  options: [
    ['Regular', 0],
    ['Baked', 30],
  ],
}
const addCheese30: AddOnDef = { name: 'Extras', min: 0, max: 1, options: [['Add cheese', 30]] }
const friesSize = (extra: number): AddOnDef => ({
  name: 'Size',
  min: 1,
  max: 1,
  options: [
    ['Regular', 0],
    ['Large', extra],
  ],
})
const maggiExtras: AddOnDef = {
  name: 'Extras',
  min: 0,
  max: 2,
  options: [
    ['Add cheese (25 g)', 30],
    ['Add butter (10 g)', 10],
  ],
}
const iceCreamScoop: AddOnDef = {
  name: 'Extras',
  min: 0,
  max: 1,
  options: [['With ice-cream scoop', 25]],
}
const mojitoInjector: AddOnDef = { name: 'Extras', min: 0, max: 1, options: [['Add injector', 30]] }

export const sangliMenu: RealCategory[] = [
  {
    slug: 'burgers',
    name: 'Burgers',
    icon: 'BURGER',
    image: 'burgers',
    items: [
      {
        name: 'Classic Burger',
        desc: 'Burger layered with a vegetable patty, veggies and ZORKO special sauces.',
        price: 49,
        addOns: [burgerExtras],
        image: 'burger-tikki',
      },
      {
        name: 'Korean Burger',
        desc: 'Veg patty, fresh veggies, ZORKO special sauces and spicy Korean sauce.',
        price: 69,
        tags: ['new'],
        addOns: [burgerExtras],
        image: 'burgers',
      },
      {
        name: 'Spicy Salsa Barbeque Burger',
        desc: 'Veg patty, fresh veggies, spicy BBQ salsa and ZORKO special sauce.',
        price: 79,
        addOns: [burgerExtras],
        image: 'burger-veggie',
      },
      {
        name: 'Double Tikki Burger',
        desc: 'Two vegetable patties with veggies and creamy sauces.',
        price: 79,
        addOns: [burgerExtras],
        image: 'burger-tikki',
      },
      {
        name: 'Mexican King Burger',
        desc: 'Patty, veggies and ZORKO special sauces with a punch of Mexican flavour.',
        price: 89,
        tags: ['best'],
        addOns: [burgerExtras],
        image: 'burger-veggie',
      },
      {
        name: 'Royal Paneer Grilled Burger',
        desc: 'Creamy burger layered with freshly grilled paneer and ZORKO special sauces.',
        price: 139,
        tags: ['must'],
        addOns: [burgerExtras],
        image: 'burgers',
      },
    ],
  },
  {
    slug: 'pizza',
    name: 'Pizza',
    icon: 'PIZZA',
    image: 'pizza',
    items: [
      {
        name: 'Margherita',
        desc: 'Classic pizza with tomato-based sauce and mozzarella.',
        price: 99,
        addOns: [pizzaCheese],
        image: 'pizza-margherita',
      },
      {
        name: 'Golden Harvest Pizza',
        desc: 'Cheesy pizza with sweet corn in cream cheese, mixed herbs and mozzarella. Kids special.',
        price: 109,
        addOns: [pizzaCheese],
        image: 'pizza-corn',
      },
      {
        name: 'Hot To Hell Pizza',
        desc: 'Loaded with spicy sauce, veggies, red paprika and mozzarella.',
        price: 149,
        addOns: [pizzaCheese],
        image: 'pizza-paneer-spicy',
      },
      {
        name: 'Korean Pizza',
        desc: 'Topped with Korean sauce, jalapeños, mozzarella and fresh veggies.',
        price: 159,
        tags: ['new'],
        addOns: [pizzaCheese],
        image: 'pizza-paneer-spicy',
      },
      {
        name: 'Veg Exotica Pizza',
        desc: 'Loaded with exotic veggies and ZORKO special sauces.',
        price: 159,
        tags: ['best'],
        addOns: [pizzaCheese],
        image: 'pizza-veg-thin',
      },
      {
        name: 'Paneer Barbeque Pizza',
        desc: 'Paneer and onion tossed in ZORKO BBQ sauce, topped with pizza cheese.',
        price: 189,
        tags: ['must'],
        addOns: [pizzaCheese],
        image: 'pizza-paneer-tikka',
      },
      {
        name: 'Pizza Di Sicilia',
        desc: "Thin-crust pizza (the menu calls it the world's thinnest) with exotic veggies and red paprika.",
        price: 129,
        image: 'pizza-veg-thin',
      },
      {
        name: 'Cheese Loaded Kulhad Pizza',
        desc: 'Pan-tossed pizza ingredients loaded into a kulhad, covered with mozzarella and baked.',
        price: 149,
        tags: ['must'],
        image: 'pizza',
      },
    ],
  },
  {
    slug: 'momos',
    name: 'Momos',
    icon: 'GENERAL',
    image: 'momos',
    note: '6 pieces',
    items: [
      {
        name: 'Steam Momos',
        desc: 'Steamed momos spiced with ginger, garlic and other spices, served with dip. 6 pieces.',
        price: 89,
      },
      {
        name: 'Fried Momos',
        desc: 'Fried momos served with a dip. 6 pieces.',
        price: 89,
        image: 'momos-fried',
      },
      {
        name: 'Cheese Volcano Kulhad Momos',
        desc: 'Fried momos tossed in creamy sauces, stuffed in a kulhad, topped with mozzarella and baked.',
        price: 149,
        image: 'momos-cheese',
      },
    ],
  },
  {
    slug: 'fries',
    name: 'Fries',
    icon: 'SNACKS',
    image: 'fries',
    items: [
      {
        name: 'Salted French Fries',
        desc: 'Potato fries fried golden and seasoned with salt, with cheese dip.',
        price: 49,
        addOns: [friesSize(30)],
      },
      {
        name: 'Peri Peri French Fries',
        desc: 'Fries seasoned with salt and tossed with peri peri powder, with cheese dip.',
        price: 59,
        addOns: [friesSize(40)],
        image: 'fries-peri',
      },
      {
        name: 'Korean Cheesy Fries',
        desc: 'Crispy fries loaded with Korean sauce and rich orange cheese sauce.',
        price: 149,
        tags: ['new'],
        image: 'fries-loaded',
      },
      {
        name: 'Sizzling Italian Fries',
        desc: 'Fries topped with cheese sauce, ZORKO special sauces, jalapeños, paprika, olives and cheese.',
        price: 159,
        tags: ['must'],
        image: 'fries-loaded',
      },
    ],
  },
  {
    slug: 'wraps',
    name: 'Wraps',
    icon: 'SANDWICH',
    image: 'wraps',
    items: [
      {
        name: 'Classic Veg Wrap',
        desc: 'Tortilla wrapped with a veg patty, fresh veggies, ZORKO special sauces and red paprika.',
        price: 109,
        addOns: [addCheese30],
      },
      {
        name: 'Mexican Salsa Wrap',
        desc: 'Grilled tortilla with fresh tomato salsa, exotic veggies, potato patty, special sauces and crispy nachos.',
        price: 129,
        addOns: [addCheese30],
        image: 'wrap-salsa',
      },
    ],
  },
  {
    slug: 'pasta',
    name: 'Pasta',
    icon: 'PASTA',
    image: 'pasta-pink',
    items: [
      {
        name: 'Alfredo (White Sauce)',
        desc: 'Penne tossed with creamy, cheesy white sauce with veggies. Regular or baked.',
        price: 139,
        addOns: [pastaStyle],
        image: 'pasta-white',
      },
      {
        name: 'Arrabbiata (Red Sauce)',
        desc: 'Penne in tomato sauce infused with special spices, veggies and chilli flakes. Regular or baked.',
        price: 139,
        addOns: [pastaStyle],
        image: 'pasta-arrabbiata',
      },
      {
        name: 'Ala Rosey (Pink Sauce)',
        desc: 'Pasta in a cocktail of red and white sauces with a creamy texture. Regular or baked.',
        price: 139,
        tags: ['best'],
        addOns: [pastaStyle],
        image: 'pasta-pink',
      },
      {
        name: 'Peri Peri Pasta',
        desc: 'Penne in cheesy, creamy peri peri sauce with golden corn and Italian herbs. Regular or baked.',
        price: 139,
        addOns: [pastaStyle],
        image: 'pasta-white-2',
      },
    ],
  },
  {
    slug: 'garlic-bread',
    name: 'Garlic Bread',
    icon: 'GENERAL',
    image: 'garlic-bread',
    note: '3 slices',
    items: [
      {
        name: 'Cheese Garlic Bread',
        desc: 'Baked garlic bread topped with mozzarella cheese. 3 slices.',
        price: 89,
        addOns: [addCheese30],
      },
      {
        name: 'Supreme Treat Garlic Bread',
        desc: 'Garlic bread loaded with golden corn, jalapeño, onion, special seasoning and mozzarella. 3 slices.',
        price: 99,
        addOns: [addCheese30],
      },
    ],
  },
  {
    slug: 'toastie',
    name: 'Toastie',
    icon: 'SANDWICH',
    image: 'toastie',
    items: [
      {
        name: 'Italian Treat',
        desc: 'ZORKO-style marinated veggies on toast, crowned with cheesy goodness.',
        price: 79,
      },
      {
        name: 'Korean Spicy Paneer',
        desc: 'Paneer and veggies marinated in Korean sauce, topped with cheese on toasted bread.',
        price: 89,
        tags: ['new'],
      },
      {
        name: 'Peri Peri Cheese Blast',
        desc: 'Peri peri-spiced cheese cubes and onions with orange cheese sauce and a cheesy topping.',
        price: 99,
        tags: ['must'],
      },
    ],
  },
  {
    slug: 'special-buns',
    name: 'Special Buns',
    icon: 'GENERAL',
    image: 'buns',
    items: [
      {
        name: 'Cheese Pull & Tear Garlic Bun',
        desc: 'Bun stuffed with orange cheese sauce, herbs, mozzarella and garlic butter.',
        price: 149,
        tags: ['best'],
      },
      {
        name: 'Korean Jalapeno Bun',
        desc: 'Bun stuffed with jalapeño, orange cheese sauce, herbs, mozzarella, garlic butter and Korean sauce.',
        price: 149,
        tags: ['new'],
        image: 'bun-korean',
      },
    ],
  },
  {
    slug: 'nachos',
    name: 'Nachos',
    icon: 'SNACKS',
    image: 'nachos',
    items: [
      {
        name: 'Nachos with Cheese Dip',
        desc: 'Crispy, flavourful nachos chips served with a special creamy dip.',
        price: 79,
        image: 'nachos-dip',
      },
      {
        name: 'Cheesy Delight Nachos',
        desc: 'Crunchy nachos tossed with cheese, ZORKO special sauces and grated cheese.',
        price: 129,
        tags: ['must'],
      },
    ],
  },
  {
    slug: 'maggi',
    name: 'Maggi',
    icon: 'PASTA',
    image: 'maggi',
    items: [
      { name: 'Plain Maggie', desc: 'Classic Maggi noodles.', price: 49, addOns: [maggiExtras] },
      {
        name: 'Double Masala Maggi',
        desc: 'A blend of finely ground spices, herbs and double Maggi masala.',
        price: 59,
        addOns: [maggiExtras],
      },
      {
        name: 'Hot Passion Spicy Maggi',
        desc: 'Chatakedaar Maggi with a punch of sauces and veggies.',
        price: 69,
        addOns: [maggiExtras],
      },
      {
        name: 'Veg. Masala Maggi',
        desc: 'Maggi prepared with veggies and Maggi masala.',
        price: 79,
        addOns: [maggiExtras],
      },
      {
        name: 'Kulhad Maggi',
        desc: 'Maggi served in a kulhad.',
        price: 99,
        tags: ['best'],
        addOns: [maggiExtras],
      },
    ],
  },
  {
    slug: 'mojito',
    name: 'Mojito',
    icon: 'BEVERAGE',
    image: 'mojito',
    items: [
      {
        name: 'Surprise Mojito',
        desc: 'Mojito (non-alcoholic).',
        price: 49,
        tags: ['best'],
        addOns: [mojitoInjector],
      },
      {
        name: 'Korean Mojito',
        desc: 'Mojito (non-alcoholic).',
        price: 49,
        tags: ['new'],
        addOns: [mojitoInjector],
      },
      {
        name: 'Strawberry Mojito',
        desc: 'Strawberry mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
        image: 'mojito-strawberry',
      },
      {
        name: 'Tangy Mango Mojito',
        desc: 'Mango mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
        image: 'mojito-mango',
      },
      {
        name: 'Pineapple Punch Mojito',
        desc: 'Pineapple mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
        image: 'mojito-pineapple',
      },
      {
        name: 'Mary Litchi Mojito',
        desc: 'Litchi mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
      },
      {
        name: 'Mint Mojito',
        desc: 'Mint and lime mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
      },
      {
        name: 'Orange Cindrella Mojito',
        desc: 'Orange mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
      },
      {
        name: 'Blue Heaven Mojito',
        desc: 'Blue mojito (non-alcoholic).',
        price: 49,
        addOns: [mojitoInjector],
      },
    ],
  },
  {
    slug: 'cold-coffee',
    name: 'Cold Coffee',
    icon: 'COFFEE',
    image: 'cold-coffee',
    items: [
      {
        name: 'Premium Cold Coffee',
        desc: 'Chilled cold coffee.',
        price: 49,
        tags: ['best'],
        addOns: [iceCreamScoop],
      },
      {
        name: 'Strong Cold Coffee',
        desc: 'Cold coffee with a stronger coffee taste.',
        price: 59,
        addOns: [iceCreamScoop],
      },
      {
        name: 'Chocolate Cold Coffee',
        desc: 'Cold coffee with chocolate.',
        price: 79,
        tags: ['must'],
        addOns: [iceCreamScoop],
        image: 'cold-coffee-chocolate',
      },
    ],
  },
  {
    slug: 'milk-shakes',
    name: 'Milk Shakes',
    icon: 'DESSERT',
    image: 'shakes',
    items: [
      {
        name: 'Rose Delight Shake',
        desc: 'Rose milkshake.',
        price: 79,
        addOns: [iceCreamScoop],
        image: 'shake-pink',
      },
      {
        name: 'Strawberry Shake',
        desc: 'Strawberry milkshake.',
        price: 79,
        addOns: [iceCreamScoop],
        image: 'shake-strawberry',
      },
      {
        name: 'Oreo Chocolate Shake',
        desc: 'Chocolate milkshake with Oreo.',
        price: 99,
        addOns: [iceCreamScoop],
        image: 'shake-oreo',
      },
      {
        name: 'KitKat Chocolate Shake',
        desc: 'Chocolate milkshake with KitKat.',
        price: 109,
        addOns: [iceCreamScoop],
        image: 'shake-chocolate',
      },
    ],
  },
  {
    slug: 'ice-tea',
    name: 'Ice Tea',
    icon: 'BEVERAGE',
    image: 'ice-tea',
    items: [
      { name: 'Lemon Ice Tea', desc: 'Chilled lemon ice tea.', price: 49 },
      { name: 'Peach Ice Tea', desc: 'Chilled peach ice tea.', price: 49, image: 'tea-peach' },
      {
        name: 'Passion Fruit Ice Tea',
        desc: 'Chilled passion fruit ice tea.',
        price: 49,
      },
      { name: 'Cranberry Ice Tea', desc: 'Chilled cranberry ice tea.', price: 49 },
      { name: 'American Blue Ice Tea', desc: 'Chilled blue ice tea.', price: 49, tags: ['best'] },
    ],
  },
  {
    slug: 'hot-beverages',
    name: 'Hot Beverages',
    icon: 'COFFEE',
    image: 'coffee',
    items: [
      { name: 'Special Tea', desc: 'Hot tea.', price: 19, image: 'tea' },
      { name: 'Hot Coffee', desc: 'Hot coffee.', price: 29 },
      {
        name: 'Hot Chocolate',
        desc: 'Hot chocolate.',
        price: 39,
        tags: ['best'],
        image: 'hot-chocolate',
      },
    ],
  },
]

/**
 * Outlet details printed on the menu, plus the map coordinates the team supplied (2026-10-15,
 * Q-01). Opening hours, email and social links are not on the menu and stay unconfirmed
 * (Q-03, Q-04, Q-05).
 */
export const sangliCafe = {
  name: 'ZORKO Sangli',
  addressLine: 'Cafe Zorko, Chavan Arkade, Near Sambha Bhel, 100 ft. Road, Vishrambag',
  city: 'Sangli',
  postalCode: '416415',
  phone: '+919890011348',
  isPureVegConfirmed: true, // green veg mark printed on the outlet menu (Q-06)
  addressVerified: true,
  contactVerified: true,
  latitude: 16.845262,
  longitude: 74.596347,
  mapVerified: true,
  // Google Maps listing of the outlet, supplied by the team (2026-10-15).
  mapsQuery:
    'Cafe Zorko, 100 Feet Rd, Sangli, Vishrambag, Sangli Miraj Kupwad, Maharashtra 416415, India',
}

/** URL slug from a menu name: "Ala Rosey (Pink Sauce)" → "ala-rosey-pink-sauce". */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
