/**
 * GENERATED FILE — do not edit by hand.
 * Produced by `scripts/generate-seed.py` from `scripts/catalog.json`, itself a
 * JSON dump of the reference `server/catalog.ts`.
 *
 * Server-side only helper data: the 5 storefront categories and the 52 seed
 * catalog rows (3 gift combos first, then 49 products — same order as
 * `supabase/seed.sql`, so ids line up). Image paths are root-relative for
 * Next.js (`/images/<slug>.webp`).
 */

export type SeedProduct = {
  slug: string;
  title: string;
  category: string;
  collection?: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  tags: string[];
  images: string[];
  variants: string[];
  featured: boolean;
  isCombo: boolean;
};

export type SeedCategory = {
  id: string;
  label: string;
  tagline: string;
  blurb: string;
  image: string;
};

export const CATEGORIES: SeedCategory[] = [
  {
    "id": "fragrance",
    "label": "Fragrance & Attar",
    "tagline": "Oud, musk and amber — bottled by hand",
    "blurb": "Alcohol-free attar oils, roll-on perfume, body mists and bakhoor sourced for depth and longevity.",
    "image": "/images/cat-fragrance.webp"
  },
  {
    "id": "skincare",
    "label": "Skincare & Beauty",
    "tagline": "Korean-grade care, everyday glow",
    "blurb": "Sunscreen, serums, moisturiser and lip colour chosen for Bangladeshi weather and skin tones.",
    "image": "/images/cat-skincare.webp"
  },
  {
    "id": "haircare",
    "label": "Hair Care & Accessories",
    "tagline": "Silk, satin and gentle styling",
    "blurb": "Silk scrunchies, satin bonnets, claw clips and heatless styling sets that protect your hair.",
    "image": "/images/cat-haircare.webp"
  },
  {
    "id": "fashion",
    "label": "Fashion & Lifestyle",
    "tagline": "Anti-tarnish, everyday elegance",
    "blurb": "Anti-tarnish jewellery, canvas totes, mini purses and card holders built to last past one season.",
    "image": "/images/cat-fashion.webp"
  },
  {
    "id": "gifts",
    "label": "Accessories & Gift",
    "tagline": "Boxed, wrapped, ready to give",
    "blurb": "Curated gift boxes, jewellery, makeup tools and organisers — including Under ৳499 and Under ৳999 sets.",
    "image": "/images/cat-gifts.webp"
  }
];

export const ALL_SEED_PRODUCTS: SeedProduct[] = [
  {
    "slug": "royal-attar-box",
    "title": "Royal Attar Box",
    "category": "fragrance",
    "description": "Our signature presentation box holding premium attar in miniature glass bottles — choose the 3-flavour or 5-flavour set. Includes Cambodian Oud, White Musk and Amber Noir as standard; the 5-flavour set adds Royal Rose and Sandal Wood. Each bottle is alcohol-free, long-lasting perfume oil, sealed with a glass dipper and presented on a maroon velvet tray inside a rigid ivory box.",
    "price": 1690,
    "stock": 24,
    "tags": [
      "attar",
      "gift box",
      "oud",
      "musk",
      "amber",
      "royal",
      "combo",
      "eid"
    ],
    "images": [
      "/images/royal-attar-box.webp"
    ],
    "variants": [
      "3 Flavours",
      "5 Flavours (+৳600)"
    ],
    "featured": true,
    "isCombo": true,
    "collection": "Gift Combo",
    "comparePrice": 2150
  },
  {
    "slug": "couple-box",
    "title": "Couple Box",
    "category": "fragrance",
    "description": "One gents attar and one ladies roll-on perfume oil, paired in a single gift box. The gents side carries a warm oud-and-amber blend; the ladies side is a soft alcohol-free floral musk roll-on that sits close to the skin. Finished with a handwritten card slot — the most requested anniversary and wedding gift we stock.",
    "price": 1290,
    "stock": 30,
    "tags": [
      "couple",
      "gift box",
      "attar",
      "roll on",
      "perfume",
      "anniversary",
      "combo",
      "wedding"
    ],
    "images": [
      "/images/couple-box.webp"
    ],
    "variants": [
      "Classic Pair",
      "Premium Pair"
    ],
    "featured": true,
    "isCombo": true,
    "collection": "Gift Combo",
    "comparePrice": 1600
  },
  {
    "slug": "daily-glow-combo",
    "title": "Daily Glow Combo",
    "category": "skincare",
    "description": "A three-step everyday routine in one box: Korean SPF 50+ sunscreen, a buildable lip tint, and a pure silk scrunchie. Built for the daily commute — sun protection, a wash of colour, and a hair tie that does not crease. Comes in a slim ivory box that fits a tote.",
    "price": 1150,
    "stock": 36,
    "tags": [
      "combo",
      "sunscreen",
      "lip tint",
      "scrunchie",
      "glow",
      "daily",
      "gift box",
      "skincare"
    ],
    "images": [
      "/images/daily-glow-combo.webp"
    ],
    "variants": [
      "Rose Tint",
      "Coral Tint"
    ],
    "featured": true,
    "isCombo": true,
    "collection": "Gift Combo",
    "comparePrice": 1420
  },
  {
    "slug": "cambodian-oud-attar",
    "title": "Cambodian Oud Attar",
    "category": "fragrance",
    "description": "A deep, resinous Cambodian oud with a smoky opening that settles into warm woods and a faint sweetness. Alcohol-free perfume oil, so a single dab on the wrist lasts through the day and into evening prayers. Supplied in a glass roll-top bottle with dipper.",
    "price": 890,
    "stock": 42,
    "tags": [
      "oud",
      "attar",
      "gents",
      "woody",
      "smoky",
      "premium",
      "alcohol free"
    ],
    "images": [
      "/images/cambodian-oud-attar.webp"
    ],
    "variants": [
      "3 ml",
      "6 ml",
      "12 ml"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gents Attar",
    "comparePrice": 1150
  },
  {
    "slug": "white-musk-attar",
    "title": "White Musk Attar",
    "category": "fragrance",
    "description": "Clean, powdery white musk — the safest choice if you are new to attar. Soft enough for the office, warm enough for Jummah. Alcohol-free oil that sits close to the skin and never turns sharp.",
    "price": 650,
    "stock": 58,
    "tags": [
      "musk",
      "attar",
      "gents",
      "clean",
      "soft",
      "everyday",
      "alcohol free"
    ],
    "images": [
      "/images/white-musk-attar.webp"
    ],
    "variants": [
      "3 ml",
      "6 ml",
      "12 ml"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gents Attar",
    "comparePrice": 820
  },
  {
    "slug": "amber-noir-attar",
    "title": "Amber Noir Attar",
    "category": "fragrance",
    "description": "Golden amber over vanilla and a dry tobacco base. Sweet but not cloying, and the projection is generous — best used sparingly in the warmer months. Alcohol-free perfume oil in a faceted glass bottle.",
    "price": 790,
    "stock": 35,
    "tags": [
      "amber",
      "attar",
      "gents",
      "sweet",
      "vanilla",
      "warm",
      "winter"
    ],
    "images": [
      "/images/amber-noir-attar.webp"
    ],
    "variants": [
      "3 ml",
      "6 ml",
      "12 ml"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Gents Attar"
  },
  {
    "slug": "rose-musk-rollon",
    "title": "Rose Musk Roll-On Perfume Oil",
    "category": "fragrance",
    "description": "Alcohol-free roll-on perfume oil built around Taif rose softened with white musk. The steel rollerball glides cold on the skin and the scent stays a quiet arm's-length halo rather than filling a room. Handbag-sized.",
    "price": 520,
    "stock": 64,
    "tags": [
      "roll on",
      "ladies",
      "rose",
      "musk",
      "perfume oil",
      "alcohol free",
      "floral"
    ],
    "images": [
      "/images/rose-musk-rollon.webp"
    ],
    "variants": [
      "6 ml",
      "10 ml"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Ladies Roll-On",
    "comparePrice": 640
  },
  {
    "slug": "jasmine-oud-rollon",
    "title": "Jasmine Oud Roll-On Perfume Oil",
    "category": "fragrance",
    "description": "Night-blooming jasmine laid over a light oud base — floral at first, quietly woody after an hour. Alcohol-free roll-on, so it is gentle on sensitive skin and safe to reapply.",
    "price": 560,
    "stock": 48,
    "tags": [
      "roll on",
      "ladies",
      "jasmine",
      "oud",
      "perfume oil",
      "alcohol free",
      "floral"
    ],
    "images": [
      "/images/jasmine-oud-rollon.webp"
    ],
    "variants": [
      "6 ml",
      "10 ml"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Ladies Roll-On"
  },
  {
    "slug": "velvet-body-mist",
    "title": "Velvet Body Mist",
    "category": "fragrance",
    "description": "A fine-spray body mist in soft peony and vanilla, light enough to layer over attar or wear alone after a shower. 250 ml bottle with a locking collar so it will not leak in a bag.",
    "price": 480,
    "stock": 52,
    "tags": [
      "body mist",
      "spray",
      "peony",
      "vanilla",
      "light",
      "fresh",
      "ladies"
    ],
    "images": [
      "/images/velvet-body-mist.webp"
    ],
    "variants": [
      "250 ml"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Body Mist",
    "comparePrice": 590
  },
  {
    "slug": "oud-room-car-spray",
    "title": "Oud Room & Car Freshener Spray",
    "category": "fragrance",
    "description": "Concentrated oud-and-amber air spray for rooms, wardrobes and car interiors. Two pumps hold for hours, and the formula is water-based so it will not stain upholstery. Comes with a hanging felt tag you can spray for a slow release.",
    "price": 420,
    "stock": 70,
    "tags": [
      "room spray",
      "car freshener",
      "oud",
      "home",
      "air freshener",
      "amber"
    ],
    "images": [
      "/images/oud-room-car-spray.webp"
    ],
    "variants": [
      "100 ml",
      "250 ml"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Home Fragrance"
  },
  {
    "slug": "bakhoor-burner-set",
    "title": "Bakhoor & Burner Set",
    "category": "fragrance",
    "description": "A ceramic electric burner paired with 40 g of hand-rolled bakhoor chips in oud and saffron. No charcoal and no smoke alarm — the plate warms the chips gently so the scent fills the room in minutes. Ideal for Thursday evenings and guest arrivals.",
    "price": 1350,
    "stock": 18,
    "tags": [
      "bakhoor",
      "burner",
      "oud",
      "home",
      "incense",
      "electric",
      "gift",
      "saffron"
    ],
    "images": [
      "/images/bakhoor-burner-set.webp"
    ],
    "variants": [
      "Ivory Ceramic",
      "Charcoal Ceramic"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Home Fragrance",
    "comparePrice": 1690
  },
  {
    "slug": "korean-sunscreen-spf50",
    "title": "Korean Sunscreen SPF 50+ PA++++",
    "category": "skincare",
    "description": "A lightweight chemical sunscreen that finishes matte with no white cast — tested through Dhaka humidity. SPF 50+ PA++++ with niacinamide and panthenol, so it doubles as the last step of a morning routine. 50 ml tube.",
    "price": 890,
    "stock": 46,
    "tags": [
      "sunscreen",
      "spf",
      "korean",
      "skincare",
      "matte",
      "no white cast",
      "spf 50"
    ],
    "images": [
      "/images/korean-sunscreen-spf50.webp"
    ],
    "variants": [
      "50 ml"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Sun Care",
    "comparePrice": 1100
  },
  {
    "slug": "glow-vitamin-c-serum",
    "title": "Glowing Face Serum — 10% Vitamin C",
    "category": "skincare",
    "description": "A stabilised 10% vitamin C serum with ferulic acid for brightness and even tone. Thin, fast-absorbing, and low enough in concentration to use daily without stinging. Amber glass dropper bottle keeps it from oxidising. 30 ml.",
    "price": 950,
    "stock": 40,
    "tags": [
      "serum",
      "vitamin c",
      "glow",
      "brightening",
      "skincare",
      "face",
      "korean"
    ],
    "images": [
      "/images/glow-vitamin-c-serum.webp"
    ],
    "variants": [
      "30 ml"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Serums",
    "comparePrice": 1250
  },
  {
    "slug": "ceramide-moisturizer",
    "title": "Ceramide Barrier Moisturiser",
    "category": "skincare",
    "description": "A gel-cream with ceramides and hyaluronic acid that hydrates without the heavy film. Sits well under sunscreen and makeup, and calms the tightness that follows a strong cleanser. Fragrance-free. 50 ml jar.",
    "price": 780,
    "stock": 44,
    "tags": [
      "moisturizer",
      "ceramide",
      "hydration",
      "skincare",
      "gel cream",
      "fragrance free"
    ],
    "images": [
      "/images/ceramide-moisturizer.webp"
    ],
    "variants": [
      "50 ml"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Moisturisers"
  },
  {
    "slug": "glossy-lip-oil",
    "title": "Glossy Lip Oil",
    "category": "skincare",
    "description": "A non-sticky lip oil in a sheer wash of colour, with jojoba and vitamin E for overnight repair. The doe-foot applicator carries just enough product, and the finish is glass-glossy rather than tacky.",
    "price": 390,
    "stock": 72,
    "tags": [
      "lip oil",
      "glossy",
      "lips",
      "beauty",
      "makeup",
      "hydrating",
      "tint"
    ],
    "images": [
      "/images/glossy-lip-oil.webp"
    ],
    "variants": [
      "Clear",
      "Peach",
      "Berry"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Lips",
    "comparePrice": 480
  },
  {
    "slug": "matte-lipstick",
    "title": "Velvet Matte Lipstick",
    "category": "skincare",
    "description": "Full-coverage matte in one pass, with a soft powder finish that does not crack over dry lips. Transfer-resistant enough for a mask, and the bullet is wide enough to line the lip without a pencil.",
    "price": 450,
    "stock": 66,
    "tags": [
      "lipstick",
      "matte",
      "lips",
      "makeup",
      "beauty",
      "long lasting"
    ],
    "images": [
      "/images/matte-lipstick.webp"
    ],
    "variants": [
      "Maroon Noir",
      "Nude Rose",
      "Brick Red"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Lips"
  },
  {
    "slug": "water-lip-tint",
    "title": "Water Lip Tint",
    "category": "skincare",
    "description": "A watery Korean-style tint that stains rather than coats — the colour stays after tea and the lips still feel bare. Build it up for a full lip or blot it once for a just-bitten wash.",
    "price": 340,
    "stock": 80,
    "tags": [
      "lip tint",
      "korean",
      "lips",
      "stain",
      "makeup",
      "beauty",
      "water tint"
    ],
    "images": [
      "/images/water-lip-tint.webp"
    ],
    "variants": [
      "Cherry",
      "Rose",
      "Coral"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Lips",
    "comparePrice": 420
  },
  {
    "slug": "sheet-mask-set",
    "title": "Face Sheet Mask Set — 10 Pieces",
    "category": "skincare",
    "description": "Ten single-use sheet masks across five varieties: hyaluronic acid, green tea, rice, centella and vitamin C. Cotton-cupra sheets hold serum without sliding off. Keep a few in the fridge for the hot months.",
    "price": 690,
    "stock": 38,
    "tags": [
      "sheet mask",
      "face mask",
      "korean",
      "skincare",
      "set",
      "hydrating",
      "10 pcs"
    ],
    "images": [
      "/images/sheet-mask-set.webp"
    ],
    "variants": [
      "10 Pieces"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Masks",
    "comparePrice": 890
  },
  {
    "slug": "silk-scrunchie-set",
    "title": "Pure Silk Scrunchie Set — 3 Pieces",
    "category": "haircare",
    "description": "Three 100% mulberry silk scrunchies in ivory, maroon and charcoal. Silk slides against the hair instead of gripping it, so you avoid the dent and the breakage a rubber band leaves. Hand-stitched elastic casing.",
    "price": 520,
    "stock": 62,
    "tags": [
      "scrunchie",
      "silk",
      "hair",
      "accessories",
      "set",
      "no crease",
      "mulberry silk"
    ],
    "images": [
      "/images/silk-scrunchie-set.webp"
    ],
    "variants": [
      "Neutral Trio",
      "Jewel Trio"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Scrunchies",
    "comparePrice": 650
  },
  {
    "slug": "satin-bonnet",
    "title": "Satin Sleep Bonnet",
    "category": "haircare",
    "description": "A double-layer satin bonnet with a wide soft-elastic band that stays on through the night without pressing a line into your forehead. Keeps a blow-dry and reduces morning frizz. One size, adjustable.",
    "price": 450,
    "stock": 54,
    "tags": [
      "bonnet",
      "satin",
      "hair",
      "sleep",
      "cap",
      "frizz",
      "night care"
    ],
    "images": [
      "/images/satin-bonnet.webp"
    ],
    "variants": [
      "Ivory",
      "Maroon",
      "Black"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Sleep Care"
  },
  {
    "slug": "trendy-claw-clips",
    "title": "Trendy Claw Clips — Pair",
    "category": "haircare",
    "description": "Two large matte claw clips with a strong steel spring — they actually hold thick hair up through a working day. Marbled acetate finish in tortoise and ivory, no visible seam lines.",
    "price": 380,
    "stock": 76,
    "tags": [
      "claw clip",
      "hair clip",
      "accessories",
      "trendy",
      "matte",
      "pair"
    ],
    "images": [
      "/images/trendy-claw-clips.webp"
    ],
    "variants": [
      "Tortoise & Ivory",
      "Maroon & Black"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Clips",
    "comparePrice": 460
  },
  {
    "slug": "heatless-curler-straightener-set",
    "title": "Mini Straightener & Heatless Curler Set",
    "category": "haircare",
    "description": "A travel-size ceramic mini straightener paired with a satin heatless curling rod. Use the rod overnight for soft curls with no heat damage, and the straightener for edges and fringe touch-ups. Dual voltage, with a heat-safe pouch.",
    "price": 1450,
    "stock": 22,
    "tags": [
      "straightener",
      "heatless curler",
      "styling",
      "hair",
      "set",
      "travel",
      "mini"
    ],
    "images": [
      "/images/heatless-curler-straightener-set.webp"
    ],
    "variants": [
      "Ivory",
      "Rose Gold"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Styling",
    "comparePrice": 1850
  },
  {
    "slug": "anti-tarnish-ring-set",
    "title": "Anti-Tarnish Ring Set — 4 Pieces",
    "category": "fashion",
    "description": "Four stacking rings in 18k-gold-plated stainless steel — a plain band, a twisted band, a pearl solitaire and a fine cubic zirconia eternity. Anti-tarnish and water-safe, so they survive wudu and washing up without going green.",
    "price": 690,
    "stock": 48,
    "tags": [
      "ring",
      "anti tarnish",
      "jewellery",
      "gold plated",
      "set",
      "stainless steel",
      "fashion"
    ],
    "images": [
      "/images/anti-tarnish-ring-set.webp"
    ],
    "variants": [
      "Size 6",
      "Size 7",
      "Size 8"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Jewellery",
    "comparePrice": 890
  },
  {
    "slug": "anti-tarnish-bracelet",
    "title": "Anti-Tarnish Chain Bracelet",
    "category": "fashion",
    "description": "A fine flat-link chain bracelet in gold-plated stainless steel with a lobster clasp and a 2 cm extender. Anti-tarnish, hypoallergenic, and light enough to layer under a watch.",
    "price": 540,
    "stock": 56,
    "tags": [
      "bracelet",
      "anti tarnish",
      "jewellery",
      "chain",
      "gold plated",
      "fashion"
    ],
    "images": [
      "/images/anti-tarnish-bracelet.webp"
    ],
    "variants": [
      "Gold",
      "Silver"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Jewellery"
  },
  {
    "slug": "pearl-drop-earrings",
    "title": "Pearl Drop Earrings",
    "category": "fashion",
    "description": "Freshwater pearl drops on a gold-plated hook with a silicone stopper so they sit forward rather than slumping. Understated enough for work, bright enough for a wedding.",
    "price": 480,
    "stock": 60,
    "tags": [
      "earrings",
      "pearl",
      "jewellery",
      "drop",
      "gold plated",
      "wedding",
      "fashion"
    ],
    "images": [
      "/images/pearl-drop-earrings.webp"
    ],
    "variants": [
      "Gold",
      "Silver"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Jewellery",
    "comparePrice": 620
  },
  {
    "slug": "jhumka-earrings",
    "title": "Oxidised Jhumka Earrings",
    "category": "fashion",
    "description": "Classic oxidised-silver-finish jhumka with a bead fringe and a light hollow dome — full-looking without dragging on the earlobe. Pairs with both a saree and a kurti.",
    "price": 590,
    "stock": 44,
    "tags": [
      "jhumka",
      "earrings",
      "oxidised",
      "jewellery",
      "traditional",
      "eid",
      "fashion"
    ],
    "images": [
      "/images/jhumka-earrings.webp"
    ],
    "variants": [
      "Silver Oxidised",
      "Antique Gold"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Jewellery"
  },
  {
    "slug": "layered-necklace",
    "title": "Layered Pendant Necklace",
    "category": "fashion",
    "description": "A two-strand necklace — a short cable chain with a tiny cubic zirconia pendant over a longer plain chain — pre-linked so the layers never tangle. Gold-plated anti-tarnish steel.",
    "price": 620,
    "stock": 42,
    "tags": [
      "necklace",
      "layered",
      "pendant",
      "jewellery",
      "anti tarnish",
      "gold plated"
    ],
    "images": [
      "/images/layered-necklace.webp"
    ],
    "variants": [
      "Gold",
      "Silver"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Jewellery",
    "comparePrice": 780
  },
  {
    "slug": "anklet-pair",
    "title": "Anti-Tarnish Anklet — Pair",
    "category": "fashion",
    "description": "A pair of fine anklets with small bell charms in anti-tarnish gold-plated steel. Adjustable clasp fits most ankles, and the charms are soft enough not to jingle loudly.",
    "price": 450,
    "stock": 50,
    "tags": [
      "anklet",
      "pair",
      "jewellery",
      "anti tarnish",
      "charm",
      "fashion"
    ],
    "images": [
      "/images/anklet-pair.webp"
    ],
    "variants": [
      "Gold",
      "Silver"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Jewellery"
  },
  {
    "slug": "canvas-tote-bag",
    "title": "Heavy Canvas Tote Bag",
    "category": "fashion",
    "description": "A 12 oz cotton canvas tote with reinforced shoulder straps, an inner zip pocket and a flat base that lets it stand up on its own. Fits a 14-inch laptop, a water bottle and a tiffin box. Machine washable.",
    "price": 690,
    "stock": 58,
    "tags": [
      "tote bag",
      "canvas",
      "bag",
      "everyday",
      "laptop",
      "lifestyle",
      "washable"
    ],
    "images": [
      "/images/canvas-tote-bag.webp"
    ],
    "variants": [
      "Ivory",
      "Charcoal",
      "Maroon"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Bags",
    "comparePrice": 850
  },
  {
    "slug": "mini-purse-card-holder",
    "title": "Mini Purse & Card Holder",
    "category": "fashion",
    "description": "A slim vegan-leather card holder with six card slots, a note sleeve and a snap coin pouch — sized to slip into the front pocket of a tote. Stitched edges, no raw lining.",
    "price": 520,
    "stock": 64,
    "tags": [
      "purse",
      "card holder",
      "wallet",
      "mini",
      "vegan leather",
      "fashion"
    ],
    "images": [
      "/images/mini-purse-card-holder.webp"
    ],
    "variants": [
      "Maroon",
      "Tan",
      "Black"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Bags"
  },
  {
    "slug": "polarised-sunglasses",
    "title": "Polarised Sunglasses",
    "category": "gifts",
    "description": "UV400 polarised lenses in a lightweight acetate frame with spring hinges. Cuts road and water glare properly rather than just darkening. Supplied with a hard case and a microfibre cloth.",
    "price": 890,
    "stock": 34,
    "tags": [
      "sunglasses",
      "polarised",
      "uv400",
      "accessories",
      "gift",
      "unisex"
    ],
    "images": [
      "/images/polarised-sunglasses.webp"
    ],
    "variants": [
      "Black",
      "Tortoise"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Accessories",
    "comparePrice": 1150
  },
  {
    "slug": "fashion-watch",
    "title": "Minimal Fashion Watch",
    "category": "gifts",
    "description": "A 34 mm slim quartz watch with an ivory sunray dial, thin baton markers and a mesh steel strap that adjusts without tools. 3 ATM water resistant — safe in rain, not for swimming.",
    "price": 1450,
    "stock": 26,
    "tags": [
      "watch",
      "fashion",
      "minimal",
      "accessories",
      "gift",
      "quartz",
      "steel"
    ],
    "images": [
      "/images/fashion-watch.webp"
    ],
    "variants": [
      "Gold Mesh",
      "Silver Mesh"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Accessories",
    "comparePrice": 1850
  },
  {
    "slug": "mini-crossbody-bag",
    "title": "Mini Crossbody Bag",
    "category": "gifts",
    "description": "A structured mini crossbody in quilted vegan leather with a detachable chain-and-strap combination, so it works as a shoulder bag or a clutch. Fits a phone, a lipstick and a card holder.",
    "price": 980,
    "stock": 30,
    "tags": [
      "crossbody",
      "bag",
      "mini",
      "quilted",
      "gift",
      "fashion",
      "clutch"
    ],
    "images": [
      "/images/mini-crossbody-bag.webp"
    ],
    "variants": [
      "Maroon",
      "Black",
      "Cream"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Bags"
  },
  {
    "slug": "slim-wallet",
    "title": "Slim Bifold Wallet",
    "category": "gifts",
    "description": "A genuine-grain bifold with eight card slots, two note compartments and an RFID-blocking lining. Slim enough for a back pocket without the bulge.",
    "price": 750,
    "stock": 40,
    "tags": [
      "wallet",
      "bifold",
      "rfid",
      "gents",
      "gift",
      "accessories",
      "leather"
    ],
    "images": [
      "/images/slim-wallet.webp"
    ],
    "variants": [
      "Brown",
      "Black"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Accessories"
  },
  {
    "slug": "makeup-pouch",
    "title": "Quilted Makeup Pouch",
    "category": "gifts",
    "description": "A quilted satin pouch with a wipe-clean waterproof lining and a wide chunky zip that opens flat so you can actually see what is inside. Holds a full daily kit.",
    "price": 420,
    "stock": 68,
    "tags": [
      "makeup pouch",
      "quilted",
      "waterproof",
      "organizer",
      "gift",
      "travel"
    ],
    "images": [
      "/images/makeup-pouch.webp"
    ],
    "variants": [
      "Ivory",
      "Maroon",
      "Sage"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Makeup Tools",
    "comparePrice": 520
  },
  {
    "slug": "makeup-brush-set",
    "title": "Makeup Brush Set — 12 Pieces",
    "category": "gifts",
    "description": "Twelve synthetic-bristle brushes covering face and eye, with tapered ferrules and matte handles. Synthetic fibres pick up less product and wash clean in one go. Includes a standing holder.",
    "price": 890,
    "stock": 36,
    "tags": [
      "brush set",
      "makeup brush",
      "12 pcs",
      "beauty",
      "tools",
      "gift",
      "synthetic"
    ],
    "images": [
      "/images/makeup-brush-set.webp"
    ],
    "variants": [
      "Rose Gold",
      "Black"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Makeup Tools",
    "comparePrice": 1150
  },
  {
    "slug": "beauty-blender-set",
    "title": "Beauty Blender Set — 4 Pieces",
    "category": "gifts",
    "description": "Four latex-free sponges — teardrop, flat-edge, mini and powder-puff — plus a vented drying case. The flat edge is the one that finally gets foundation under the eyes without streaking.",
    "price": 350,
    "stock": 74,
    "tags": [
      "beauty blender",
      "sponge",
      "makeup",
      "set",
      "latex free",
      "tools",
      "gift"
    ],
    "images": [
      "/images/beauty-blender-set.webp"
    ],
    "variants": [
      "4 Pieces"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Makeup Tools"
  },
  {
    "slug": "makeup-organizer",
    "title": "Acrylic Makeup Organizer",
    "category": "gifts",
    "description": "A clear acrylic organiser with a brush well, four lipstick tiers and a deep drawer on smooth runners. Heavy enough not to skid across a dressing table when you pull the drawer.",
    "price": 1150,
    "stock": 24,
    "tags": [
      "makeup organizer",
      "acrylic",
      "storage",
      "dressing table",
      "gift",
      "organiser"
    ],
    "images": [
      "/images/makeup-organizer.webp"
    ],
    "variants": [
      "Clear",
      "Smoke"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Organisers",
    "comparePrice": 1450
  },
  {
    "slug": "cosmetic-travel-bag",
    "title": "Cosmetic Travel Bag",
    "category": "gifts",
    "description": "A hanging travel case with four zip compartments, a removable brush roll and a swivel hook for the back of a bathroom door. Folds down to the size of a paperback.",
    "price": 680,
    "stock": 42,
    "tags": [
      "travel bag",
      "cosmetic",
      "hanging",
      "organizer",
      "gift",
      "travel"
    ],
    "images": [
      "/images/cosmetic-travel-bag.webp"
    ],
    "variants": [
      "Ivory",
      "Maroon"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Organisers"
  },
  {
    "slug": "nail-care-set",
    "title": "Nail Care Set — 10 Tools",
    "category": "gifts",
    "description": "Ten stainless-steel grooming tools — clippers, scissors, cuticle pusher, tweezers, file and more — in a snap-shut leatherette case. Mirror-polished so they do not rust in a humid bathroom.",
    "price": 520,
    "stock": 46,
    "tags": [
      "nail care",
      "manicure",
      "grooming",
      "set",
      "stainless steel",
      "gift",
      "tools"
    ],
    "images": [
      "/images/nail-care-set.webp"
    ],
    "variants": [
      "10 Tools"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Grooming"
  },
  {
    "slug": "facial-ice-roller",
    "title": "Facial Ice Roller",
    "category": "gifts",
    "description": "A gel-filled stainless roller you keep in the freezer — rolls out morning puffiness and calms heat rash in about a minute. Sealed head, no leaking, with a stand.",
    "price": 450,
    "stock": 52,
    "tags": [
      "ice roller",
      "facial",
      "puffiness",
      "beauty tool",
      "gift",
      "cooling"
    ],
    "images": [
      "/images/facial-ice-roller.webp"
    ],
    "variants": [
      "Ivory",
      "Rose"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Beauty Tools",
    "comparePrice": 580
  },
  {
    "slug": "face-massage-tool",
    "title": "Rose Quartz Gua Sha & Roller",
    "category": "gifts",
    "description": "Genuine rose quartz gua sha stone and a double-ended face roller, both hand-finished so the edges glide instead of dragging. Use with a few drops of serum along the jaw and brow.",
    "price": 590,
    "stock": 40,
    "tags": [
      "gua sha",
      "face roller",
      "rose quartz",
      "massage",
      "beauty tool",
      "gift"
    ],
    "images": [
      "/images/face-massage-tool.webp"
    ],
    "variants": [
      "Rose Quartz",
      "Jade"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Beauty Tools"
  },
  {
    "slug": "compact-mirror",
    "title": "Engraved Compact Mirror",
    "category": "gifts",
    "description": "A double-sided compact — plain and 2x magnifying — in a brushed metal shell with an engraved border. Snaps shut firmly so it will not open inside a bag.",
    "price": 320,
    "stock": 78,
    "tags": [
      "compact mirror",
      "magnifying",
      "accessories",
      "gift",
      "metal",
      "pocket"
    ],
    "images": [
      "/images/compact-mirror.webp"
    ],
    "variants": [
      "Gold",
      "Rose Gold"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Accessories"
  },
  {
    "slug": "jewellery-organizer-box",
    "title": "Jewellery Organizer Gift Box",
    "category": "gifts",
    "description": "A velvet-lined two-tier box with ring rolls, a necklace hook panel and a small mirror in the lid. Presentable enough to give as the gift itself.",
    "price": 1250,
    "stock": 20,
    "tags": [
      "jewellery box",
      "organizer",
      "velvet",
      "gift box",
      "storage",
      "gift"
    ],
    "images": [
      "/images/jewellery-organizer-box.webp"
    ],
    "variants": [
      "Ivory",
      "Maroon"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Organisers",
    "comparePrice": 1550
  },
  {
    "slug": "couple-bracelet-keychain-set",
    "title": "Couple Bracelet & Keychain Set",
    "category": "gifts",
    "description": "A matched pair — two anti-tarnish steel bracelets and two interlocking keychain halves, packed in a slim magnetic box with a blank card. The most-bought anniversary gift under ৳700.",
    "price": 690,
    "stock": 44,
    "tags": [
      "couple",
      "bracelet",
      "keychain",
      "set",
      "gift",
      "anniversary",
      "valentine"
    ],
    "images": [
      "/images/couple-bracelet-keychain-set.webp"
    ],
    "variants": [
      "Gold & Silver",
      "Black & Steel"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Couple Gifts",
    "comparePrice": 850
  },
  {
    "slug": "gift-box-under-499",
    "title": "Gift Box Under ৳499",
    "category": "gifts",
    "description": "A ready-wrapped box on a strict budget that still looks considered: one roll-on perfume oil, one silk scrunchie and one compact mirror, on a maroon tray with a blank card. Nothing in it feels like filler.",
    "price": 499,
    "stock": 60,
    "tags": [
      "gift box",
      "under 499",
      "budget",
      "gift",
      "scrunchie",
      "roll on",
      "combo"
    ],
    "images": [
      "/images/gift-box-under-499.webp"
    ],
    "variants": [
      "Ivory Wrap",
      "Maroon Wrap"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gift Boxes"
  },
  {
    "slug": "gift-box-under-999",
    "title": "Gift Box Under ৳999",
    "category": "gifts",
    "description": "A fuller box at under a thousand: one attar, one water lip tint, a silk scrunchie and a pearl-drop earring pair, on a velvet tray with a ribbon and card. Our standard birthday answer.",
    "price": 999,
    "stock": 48,
    "tags": [
      "gift box",
      "under 999",
      "gift",
      "attar",
      "lip tint",
      "earrings",
      "combo",
      "birthday"
    ],
    "images": [
      "/images/gift-box-under-999.webp"
    ],
    "variants": [
      "Ivory Wrap",
      "Maroon Wrap"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gift Boxes",
    "comparePrice": 1250
  },
  {
    "slug": "eid-gift-box",
    "title": "Eid Gift Box",
    "category": "gifts",
    "description": "Built for Eid: a gents attar, bakhoor chips, a pair of oxidised jhumka and a dates-and-chocolate tin, packed in a deep maroon rigid box with a foiled crescent card.",
    "price": 1890,
    "stock": 30,
    "tags": [
      "eid",
      "gift box",
      "attar",
      "bakhoor",
      "jhumka",
      "festival",
      "combo"
    ],
    "images": [
      "/images/eid-gift-box.webp"
    ],
    "variants": [
      "Standard",
      "Premium"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gift Boxes",
    "comparePrice": 2350
  },
  {
    "slug": "valentine-gift-box",
    "title": "Valentine Gift Box",
    "category": "gifts",
    "description": "A rose-musk roll-on, a glossy lip oil, a couple keychain pair and a dried-rose sachet in a heart-embossed box. Shipped with the price slip removed on request.",
    "price": 1290,
    "stock": 38,
    "tags": [
      "valentine",
      "gift box",
      "roll on",
      "lip oil",
      "couple",
      "romantic",
      "combo"
    ],
    "images": [
      "/images/valentine-gift-box.webp"
    ],
    "variants": [
      "Classic",
      "Deluxe"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Gift Boxes"
  },
  {
    "slug": "anniversary-gift-box",
    "title": "Anniversary Gift Box",
    "category": "gifts",
    "description": "One gents attar, one ladies roll-on, a layered pendant necklace and a pair of anti-tarnish bracelets — a two-person box rather than a single gift. Velvet tray, magnetic lid, blank card.",
    "price": 2190,
    "stock": 22,
    "tags": [
      "anniversary",
      "gift box",
      "couple",
      "attar",
      "necklace",
      "bracelet",
      "combo"
    ],
    "images": [
      "/images/anniversary-gift-box.webp"
    ],
    "variants": [
      "Standard",
      "Premium"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Gift Boxes",
    "comparePrice": 2690
  },
  {
    "slug": "self-care-gift-box",
    "title": "Self-Care Gift Box",
    "category": "gifts",
    "description": "A quiet-evening box: sheet masks, a facial ice roller, the ceramide moisturiser, a satin bonnet and a body mist. For the friend who keeps looking after everyone else.",
    "price": 1690,
    "stock": 32,
    "tags": [
      "self care",
      "gift box",
      "sheet mask",
      "ice roller",
      "bonnet",
      "friendship",
      "combo"
    ],
    "images": [
      "/images/self-care-gift-box.webp"
    ],
    "variants": [
      "Standard",
      "Deluxe"
    ],
    "featured": false,
    "isCombo": false,
    "collection": "Gift Boxes",
    "comparePrice": 2050
  },
  {
    "slug": "customizable-gift-box",
    "title": "Customizable Gift Box",
    "category": "gifts",
    "description": "Pick the box size, then message us on WhatsApp with the items you want inside and the name for the card — we assemble, wrap and photograph it before dispatch so you can approve it. Price shown is the box and wrapping; item costs are added to the invoice.",
    "price": 450,
    "stock": 100,
    "tags": [
      "customizable",
      "gift box",
      "custom",
      "personalised",
      "whatsapp",
      "build your own"
    ],
    "images": [
      "/images/customizable-gift-box.webp"
    ],
    "variants": [
      "Small Box",
      "Medium Box",
      "Large Box"
    ],
    "featured": true,
    "isCombo": false,
    "collection": "Gift Boxes"
  }
];

export const COMBOS: SeedProduct[] = ALL_SEED_PRODUCTS.filter((p) => p.isCombo);
export const PRODUCTS: SeedProduct[] = ALL_SEED_PRODUCTS.filter((p) => !p.isCombo);
