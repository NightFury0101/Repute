import "dotenv/config";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function pImg(category: string, n: number) {
  return `/generated/products/${category}-${((n - 1) % 6) + 1}.jpg`;
}

// ---------------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    name: "Makeup",
    slug: "makeup",
    description:
      "Buildable color and second-skin finishes — lip, face and eye formulas designed to feel like nothing at all.",
    image: "/generated/categories/makeup.jpg",
  },
  {
    name: "Skincare",
    slug: "skincare",
    description:
      "Clinically-minded formulas layered around a simple idea: healthy skin is the best foundation.",
    image: "/generated/categories/skincare.jpg",
  },
  {
    name: "Haircare",
    slug: "haircare",
    description: "Salon-grade repair and shine, reformulated for the everyday wash-day ritual.",
    image: "/generated/categories/haircare.jpg",
  },
  {
    name: "Fragrance",
    slug: "fragrance",
    description: "Layerable eau de parfums and oils built around quiet, distinctive signatures.",
    image: "/generated/categories/fragrance.jpg",
  },
  {
    name: "Body Care",
    slug: "body-care",
    description: "Rich butters, oils and washes that turn the everyday routine into a ritual.",
    image: "/generated/categories/body-care.jpg",
  },
  {
    name: "Beauty Tools",
    slug: "tools",
    description: "The instruments behind the routine — considered, well-made, built to last.",
    image: "/generated/categories/tools.jpg",
  },
] as const;

const BRANDS = [
  { name: "Lumière Rare", description: "Precision color cosmetics with a second-skin finish." },
  { name: "Terra & Bloom", description: "Botanical-forward skincare rooted in clean formulation." },
  { name: "Velvet Noir", description: "Bold, editorial color with an uncompromising matte finish." },
  { name: "Aurel & Co", description: "Dermatologist-informed skincare for long-term skin health." },
  { name: "Maison Douce", description: "French-inspired fragrance and indulgent body rituals." },
  { name: "Bare Ritual", description: "Minimalist, fragrance-conscious essentials for sensitive skin." },
  { name: "Gilded Petal", description: "Luminous, editorial makeup and finishing tools." },
  { name: "Nordling", description: "Scandinavian-formulated haircare built for shine and strength." },
  { name: "Verre & Vine", description: "Glass-skin haircare and hybrid styling oils." },
  { name: "Soleil Studio", description: "Sun-loved fragrance and warm-weather body care." },
  { name: "Anoki Beauty", description: "Ritual-driven tools and body oils inspired by self-care traditions." },
] as const;

const TAGS = [
  "Vegan",
  "Cruelty-Free",
  "Clean Beauty",
  "Paraben-Free",
  "Fragrance-Free",
  "Dermatologist-Tested",
  "Reef-Safe",
  "Refillable",
];

type ProductSeed = {
  name: string;
  brand: string;
  category: string;
  shortDescription: string;
  description: string;
  ingredients: string;
  howToUse: string;
  benefits: string[];
  skinType?: string[];
  productType: string;
  price: number;
  discountPrice?: number;
  stock: number;
  tags: string[];
  variants?: { type: "shade" | "size"; name: string; swatch?: string; priceOverride?: number; stock: number }[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  imgIndexes: number[];
};

const SHADE_SETS = {
  lip: [
    { name: "Bare Blush", swatch: "#C98A79" },
    { name: "Terracotta", swatch: "#B5573A" },
    { name: "Rosewood", swatch: "#8C4A45" },
    { name: "Sheer Nude", swatch: "#D9A895" },
    { name: "Crimson Muse", swatch: "#9C2B3A" },
  ],
  foundation: [
    { name: "Ivory 10", swatch: "#F3DCC4" },
    { name: "Sand 20", swatch: "#E8C39F" },
    { name: "Honey 30", swatch: "#D6A374" },
    { name: "Almond 40", swatch: "#B77F4F" },
    { name: "Cocoa 50", swatch: "#8B5A34" },
    { name: "Espresso 60", swatch: "#5C3A24" },
  ],
};

const PRODUCTS: ProductSeed[] = [
  // ---------------- Makeup ----------------
  {
    name: "Velvet Matte Lipstick",
    brand: "Lumière Rare",
    category: "makeup",
    shortDescription: "A weightless matte that wears like a second skin, not a coat of paint.",
    description:
      "Our signature bullet delivers full-pigment color in a single stroke, with a soft-focus matte finish that never feathers or dries thin. Formulated with a vitamin E and jojoba base to keep lips comfortable for up to eight hours.",
    ingredients: "Dimethicone, Vitamin E, Jojoba Seed Oil, Candelilla Wax, Iron Oxides, Mica",
    howToUse: "Apply directly from the bullet starting at the center of the lips, then blend outward. Layer for more intensity.",
    benefits: ["8-hour transfer-resistant wear", "Weightless matte finish", "Infused with Vitamin E"],
    productType: "Lipstick",
    price: 28,
    discountPrice: 22,
    stock: 120,
    tags: ["Vegan", "Cruelty-Free"],
    featured: true,
    bestSeller: true,
    imgIndexes: [1, 2],
  },
  {
    name: "Second Skin Foundation",
    brand: "Lumière Rare",
    category: "makeup",
    shortDescription: "Buildable, breathable coverage that disappears into skin.",
    description:
      "A lightweight, oil-free foundation that adapts to your skin's texture rather than sitting on top of it. Medium, buildable coverage with a soft-matte finish that photographs beautifully in any light.",
    ingredients: "Aqua, Cyclopentasiloxane, Titanium Dioxide, Niacinamide, Hyaluronic Acid, Iron Oxides",
    howToUse: "Warm 2-3 drops between fingertips and press into skin, building coverage where needed.",
    benefits: ["Buildable medium coverage", "Oil-free, non-comedogenic", "24-hour wear"],
    skinType: ["Normal", "Combination", "Oily"],
    productType: "Foundation",
    price: 42,
    stock: 90,
    tags: ["Cruelty-Free", "Dermatologist-Tested"],
    bestSeller: true,
    imgIndexes: [2, 3],
  },
  {
    name: "Featherlight Setting Powder",
    brand: "Bare Ritual",
    category: "makeup",
    shortDescription: "A translucent finishing powder that blurs without masking.",
    description:
      "Micro-milled rice powder locks makeup in place while softening the look of pores and fine lines. Leaves a soft-focus finish with zero flashback in photos.",
    ingredients: "Oryza Sativa (Rice) Powder, Silica, Tapioca Starch, Boron Nitride",
    howToUse: "Press lightly with a puff over the T-zone, or dust all over with a fluffy brush to set makeup.",
    benefits: ["Blurs pores instantly", "No white cast or flashback", "All-day shine control"],
    productType: "Setting Powder",
    price: 34,
    stock: 75,
    tags: ["Fragrance-Free", "Vegan"],
    imgIndexes: [3, 4],
  },
  {
    name: "Sculpt & Glow Blush Duo",
    brand: "Gilded Petal",
    category: "makeup",
    shortDescription: "A cream-to-powder blush and highlighter duo for a lit-from-within flush.",
    description:
      "Two complementary shades — a soft flush and a molten highlight — blend seamlessly into skin for a naturally sculpted, luminous finish that lasts through the day.",
    ingredients: "Mica, Dimethicone, Squalane, Iron Oxides, Vitamin E",
    howToUse: "Tap onto the apples of cheeks with fingertips or a damp sponge, blending upward and outward.",
    benefits: ["Buildable cream-to-powder formula", "Long-wearing dewy finish", "Multi-use for eyes and lips"],
    productType: "Blush",
    price: 36,
    discountPrice: 29,
    stock: 60,
    tags: ["Vegan", "Cruelty-Free"],
    newArrival: true,
    imgIndexes: [4, 5],
  },
  {
    name: "Precision Liquid Eyeliner",
    brand: "Velvet Noir",
    category: "makeup",
    shortDescription: "An ultra-fine felt tip for the sharpest wing you've ever drawn freehand.",
    description:
      "A jet-black, waterproof formula in a flexible micro-tip that glides smoothly for razor-sharp lines with zero skipping — even for first-timers.",
    ingredients: "Aqua, Acrylates Copolymer, Iron Oxides, Aluminum Silicate",
    howToUse: "Rest the tip at the lash line and draw in one continuous motion, building thickness as desired.",
    benefits: ["Waterproof, smudge-proof, 24-hour wear", "Ultra-fine 0.01mm tip", "Ophthalmologist-tested"],
    productType: "Eyeliner",
    price: 24,
    stock: 100,
    tags: ["Vegan", "Cruelty-Free"],
    bestSeller: true,
    imgIndexes: [5, 6],
  },
  {
    name: "Volumizing Mascara",
    brand: "Velvet Noir",
    category: "makeup",
    shortDescription: "A fiber-infused formula for feathery, va-va-voom volume.",
    description:
      "An hourglass-shaped brush coats every lash from root to tip, while our bio-fiber formula builds clump-free volume that lasts all day without flaking.",
    ingredients: "Aqua, Beeswax, Panthenol, Iron Oxides, Keratin Amino Acids",
    howToUse: "Wiggle the brush at the base of lashes and sweep upward. Layer for extra drama.",
    benefits: ["Clump-free buildable volume", "Flake-free, smudge-resistant", "Conditions lashes with keratin"],
    productType: "Mascara",
    price: 26,
    stock: 130,
    tags: ["Cruelty-Free"],
    bestSeller: true,
    imgIndexes: [6, 1],
  },
  {
    name: "Silk Finish Concealer",
    brand: "Lumière Rare",
    category: "makeup",
    shortDescription: "Full coverage that never settles into fine lines.",
    description:
      "A creamy, crease-resistant concealer that brightens and corrects with just a few dots — perfect for under-eyes, blemishes and everywhere in between.",
    ingredients: "Aqua, Dimethicone, Caffeine, Titanium Dioxide, Iron Oxides",
    howToUse: "Dot under eyes or over blemishes and blend with a damp sponge or fingertip.",
    benefits: ["Full coverage, crease-resistant", "Brightening caffeine complex", "Lightweight, breathable wear"],
    skinType: ["All Skin Types"],
    productType: "Concealer",
    price: 27,
    stock: 95,
    tags: ["Vegan", "Dermatologist-Tested"],
    imgIndexes: [1, 3],
  },
  {
    name: "Prism Eyeshadow Palette",
    brand: "Gilded Petal",
    category: "makeup",
    shortDescription: "Nine richly-pigmented mattes and shimmers for endless editorial looks.",
    description:
      "A considered edit of warm neutrals and jewel tones, built to blend into each other effortlessly — from soft daytime washes to smoky evening looks.",
    ingredients: "Talc, Mica, Dimethicone, Iron Oxides, Synthetic Fluorphlogopite",
    howToUse: "Apply mattes with a blending brush and shimmers with a flat shadow brush for maximum payoff.",
    benefits: ["9 blendable matte & shimmer shades", "Crease-resistant 10-hour wear", "Silky, low-fallout formula"],
    productType: "Eyeshadow Palette",
    price: 52,
    stock: 55,
    tags: ["Cruelty-Free"],
    newArrival: true,
    featured: true,
    imgIndexes: [3, 5],
  },

  // ---------------- Skincare ----------------
  {
    name: "Vitamin C Brightening Serum",
    brand: "Terra & Bloom",
    category: "skincare",
    shortDescription: "15% stabilized vitamin C for a visibly brighter, more even tone.",
    description:
      "A fast-absorbing serum that fades the look of dark spots and dullness while defending against environmental stress. Ferulic acid and vitamin E boost antioxidant power for morning-after glow.",
    ingredients: "Aqua, Ascorbic Acid (15%), Ferulic Acid, Vitamin E, Hyaluronic Acid, Glycerin",
    howToUse: "Apply 3-4 drops to clean skin each morning before moisturizer and SPF.",
    benefits: ["Visibly brighter, more even tone", "Antioxidant environmental defense", "Lightweight, fast-absorbing"],
    skinType: ["Normal", "Combination", "Dry"],
    productType: "Serum",
    price: 58,
    stock: 70,
    tags: ["Clean Beauty", "Dermatologist-Tested"],
    featured: true,
    bestSeller: true,
    imgIndexes: [1, 2],
  },
  {
    name: "Hyaluronic Hydration Serum",
    brand: "Terra & Bloom",
    category: "skincare",
    shortDescription: "Multi-weight hyaluronic acid for plump, dewy, all-day hydration.",
    description:
      "Five molecular weights of hyaluronic acid work at every layer of skin to deliver deep, long-lasting hydration without any heaviness or shine.",
    ingredients: "Aqua, Sodium Hyaluronate, Panthenol, Glycerin, Beta-Glucan",
    howToUse: "Press 2-3 drops into damp skin morning and night, before moisturizer.",
    benefits: ["Plumps and smooths fine lines", "24-hour hydration", "Non-greasy, fast-absorbing"],
    skinType: ["All Skin Types"],
    productType: "Serum",
    price: 46,
    discountPrice: 38,
    stock: 85,
    tags: ["Clean Beauty", "Fragrance-Free"],
    bestSeller: true,
    imgIndexes: [2, 4],
  },
  {
    name: "Overnight Renewal Cream",
    brand: "Aurel & Co",
    category: "skincare",
    shortDescription: "A rich, peptide-powered night cream that works while you sleep.",
    description:
      "A luxuriously silky cream formulated with peptides and ceramides to visibly firm, replenish and restore skin's barrier overnight, so you wake to a softer, more rested complexion.",
    ingredients: "Aqua, Ceramide NP, Peptide Complex, Shea Butter, Squalane, Niacinamide",
    howToUse: "Massage a generous layer over face and neck as the final step of your evening routine.",
    benefits: ["Firms and replenishes overnight", "Strengthens the skin barrier", "Rich, non-greasy texture"],
    skinType: ["Dry", "Normal"],
    productType: "Moisturizer",
    price: 68,
    stock: 50,
    tags: ["Clean Beauty", "Dermatologist-Tested"],
    imgIndexes: [4, 5],
  },
  {
    name: "Gentle Foaming Cleanser",
    brand: "Bare Ritual",
    category: "skincare",
    shortDescription: "A pH-balanced daily cleanser that never strips or tightens.",
    description:
      "A soft, low-foaming gel cleanser that lifts away makeup and impurities while amino acids and oat extract keep the skin barrier calm and comfortable.",
    ingredients: "Aqua, Coco-Glucoside, Oat Kernel Extract, Panthenol, Allantoin",
    howToUse: "Massage onto damp skin morning and night, then rinse with lukewarm water.",
    benefits: ["pH-balanced, non-stripping", "Calms sensitive, reactive skin", "Removes makeup & SPF"],
    skinType: ["Sensitive", "All Skin Types"],
    productType: "Cleanser",
    price: 24,
    stock: 110,
    tags: ["Fragrance-Free", "Dermatologist-Tested", "Clean Beauty"],
    bestSeller: true,
    imgIndexes: [5, 6],
  },
  {
    name: "Micro-Exfoliating Toner",
    brand: "Terra & Bloom",
    category: "skincare",
    shortDescription: "A gentle daily-acid toner for smoother, more refined texture.",
    description:
      "A blend of PHA and lactic acid gently resurfaces skin without irritation, refining texture and tone with consistent use — a great entry point into exfoliating acids.",
    ingredients: "Aqua, Lactic Acid, Gluconolactone, Niacinamide, Centella Asiatica Extract",
    howToUse: "Sweep over clean skin with a cotton pad in the evening, 3-4 times per week.",
    benefits: ["Gently resurfaces texture", "Beginner-friendly acid strength", "Soothes with centella"],
    skinType: ["Normal", "Combination", "Oily"],
    productType: "Toner",
    price: 32,
    stock: 65,
    tags: ["Clean Beauty"],
    newArrival: true,
    imgIndexes: [6, 2],
  },
  {
    name: "Rose Clay Detox Mask",
    brand: "Maison Douce",
    category: "skincare",
    shortDescription: "A mineral-rich clay mask that draws out impurities without over-drying.",
    description:
      "French pink clay and rosewater team up to gently absorb excess oil and refine pores, while glycerin keeps skin balanced instead of tight.",
    ingredients: "Kaolin, Illite (French Pink Clay), Rosa Damascena Water, Glycerin, Aloe Vera",
    howToUse: "Apply an even layer to clean, dry skin. Leave for 10 minutes, then rinse with warm water.",
    benefits: ["Draws out excess oil & impurities", "Refines the look of pores", "Leaves skin balanced, not tight"],
    skinType: ["Combination", "Oily"],
    productType: "Mask",
    price: 38,
    stock: 55,
    tags: ["Clean Beauty", "Vegan"],
    imgIndexes: [2, 6],
  },
  {
    name: "Barrier Repair Moisturizer",
    brand: "Aurel & Co",
    category: "skincare",
    shortDescription: "A ceramide-rich daily cream that rebuilds a compromised moisture barrier.",
    description:
      "Formulated for reactive, over-exfoliated or dry skin, this cream layers ceramides, cholesterol and fatty acids in the same ratio found naturally in skin to restore comfort fast.",
    ingredients: "Aqua, Ceramide NP, Cholesterol, Fatty Acids, Squalane, Shea Butter",
    howToUse: "Apply morning and night as the final step of your routine, focusing on dry or irritated areas.",
    benefits: ["Rebuilds the skin barrier", "Relieves tightness and flaking", "Fragrance-free, non-irritating"],
    skinType: ["Dry", "Sensitive"],
    productType: "Moisturizer",
    price: 54,
    stock: 60,
    tags: ["Fragrance-Free", "Dermatologist-Tested"],
    bestSeller: true,
    imgIndexes: [3, 1],
  },
  {
    name: "Eye Contour Cream",
    brand: "Aurel & Co",
    category: "skincare",
    shortDescription: "A cooling, caffeine-infused cream for tired, puffy under-eyes.",
    description:
      "A lightweight gel-cream with caffeine and peptides to visibly de-puff and brighten the eye area, with a cooling metal applicator for an instant refresh.",
    ingredients: "Aqua, Caffeine, Peptide Complex, Hyaluronic Acid, Vitamin K",
    howToUse: "Dot a rice-grain amount around the orbital bone morning and night, patting gently until absorbed.",
    benefits: ["De-puffs and brightens", "Cooling stainless-steel applicator", "Softens fine lines over time"],
    skinType: ["All Skin Types"],
    productType: "Eye Cream",
    price: 44,
    discountPrice: 36,
    stock: 45,
    tags: ["Clean Beauty"],
    imgIndexes: [1, 4],
  },

  // ---------------- Haircare ----------------
  {
    name: "Silk Repair Shampoo",
    brand: "Nordling",
    category: "haircare",
    shortDescription: "A sulfate-free shampoo that rebuilds strength from the first wash.",
    description:
      "A silk protein and biotin blend gently cleanses while reinforcing the hair's internal structure, reducing breakage and leaving strands noticeably softer.",
    ingredients: "Aqua, Cocamidopropyl Betaine, Hydrolyzed Silk Protein, Biotin, Panthenol",
    howToUse: "Massage into wet hair and scalp, lather, then rinse thoroughly. Follow with conditioner.",
    benefits: ["Strengthens and reduces breakage", "Sulfate & silicone-free", "Safe for color-treated hair"],
    productType: "Shampoo",
    price: 26,
    stock: 90,
    tags: ["Vegan", "Cruelty-Free"],
    bestSeller: true,
    imgIndexes: [1, 3],
  },
  {
    name: "Silk Repair Conditioner",
    brand: "Nordling",
    category: "haircare",
    shortDescription: "The companion rinse-out for silky, tangle-free strength.",
    description:
      "A weightless conditioner that detangles and smooths the cuticle without weighing hair down, formulated to pair with our Silk Repair Shampoo for compounding results.",
    ingredients: "Aqua, Cetearyl Alcohol, Hydrolyzed Silk Protein, Behentrimonium Chloride, Panthenol",
    howToUse: "Apply from mid-length to ends after shampooing. Leave for 2-3 minutes, then rinse.",
    benefits: ["Detangles and smooths cuticle", "Lightweight, no residue", "Pairs with Silk Repair Shampoo"],
    productType: "Conditioner",
    price: 26,
    stock: 90,
    tags: ["Vegan", "Cruelty-Free"],
    bestSeller: true,
    imgIndexes: [3, 5],
  },
  {
    name: "Overnight Hair Oil Elixir",
    brand: "Verre & Vine",
    category: "haircare",
    shortDescription: "A featherweight oil blend that repairs ends while you sleep.",
    description:
      "A fast-absorbing blend of camellia, argan and baobab oils penetrates the hair shaft overnight to repair split ends and add glass-like shine without any greasy residue.",
    ingredients: "Camellia Oleifera Seed Oil, Argania Spinosa Kernel Oil, Adansonia Digitata Seed Oil",
    howToUse: "Apply 2-3 drops to dry or damp ends before bed, or as a leave-in shine treatment.",
    benefits: ["Repairs split ends overnight", "Non-greasy, fast-absorbing", "Adds glass-like shine"],
    productType: "Hair Oil",
    price: 34,
    stock: 60,
    tags: ["Clean Beauty", "Vegan"],
    newArrival: true,
    featured: true,
    imgIndexes: [4, 6],
  },
  {
    name: "Volumizing Root Mousse",
    brand: "Nordling",
    category: "haircare",
    shortDescription: "A weightless foam that lifts roots without any crunch.",
    description:
      "A lightweight, alcohol-free mousse that builds long-lasting volume at the root while keeping strands soft and touchable — no stiffness, no flaking.",
    ingredients: "Aqua, Polyquaternium-11, Panthenol, Rice Protein",
    howToUse: "Apply a golf-ball size amount to roots on damp hair, then blow-dry upside down for maximum lift.",
    benefits: ["Long-lasting root lift", "Alcohol-free, no stiffness", "Heat-protectant complex"],
    productType: "Styling",
    price: 22,
    stock: 70,
    tags: ["Vegan"],
    imgIndexes: [5, 1],
  },
  {
    name: "Heat Shield Spray",
    brand: "Soleil Studio",
    category: "haircare",
    shortDescription: "A weightless heat protectant rated to 450°F.",
    description:
      "A featherlight mist that forms an invisible barrier against thermal styling tools while smoothing frizz and adding a soft, brushable finish.",
    ingredients: "Aqua, Cyclopentasiloxane, Hydrolyzed Wheat Protein, Panthenol",
    howToUse: "Mist evenly through damp or dry hair before using hot tools.",
    benefits: ["Protects up to 450°F / 232°C", "Smooths frizz and flyaways", "Weightless, non-sticky finish"],
    productType: "Styling",
    price: 24,
    stock: 80,
    tags: ["Vegan", "Cruelty-Free"],
    imgIndexes: [6, 2],
  },
  {
    name: "Scalp Detox Scrub",
    brand: "Nordling",
    category: "haircare",
    shortDescription: "A pre-shampoo treatment that resets a congested scalp.",
    description:
      "Fine bamboo exfoliants and salicylic acid gently lift buildup, oil and product residue from the scalp, leaving it balanced and ready to absorb your next treatment.",
    ingredients: "Aqua, Bamboo Powder, Salicylic Acid, Tea Tree Leaf Oil, Glycerin",
    howToUse: "Massage into dry scalp before shampooing. Leave 5 minutes, then wash as usual.",
    benefits: ["Clears buildup and residue", "Balances oily, congested scalps", "Tea tree calms irritation"],
    productType: "Scalp Care",
    price: 28,
    stock: 45,
    tags: ["Clean Beauty"],
    imgIndexes: [2, 5],
  },
  {
    name: "Leave-In Repair Cream",
    brand: "Verre & Vine",
    category: "haircare",
    shortDescription: "A rich cream for dry, damaged, or color-treated ends.",
    description:
      "A deeply nourishing leave-in that seals moisture into porous, damaged hair, taming frizz and improving elasticity with continued use.",
    ingredients: "Aqua, Shea Butter, Hydrolyzed Keratin, Argan Oil, Panthenol",
    howToUse: "Apply to towel-dried hair from mid-length to ends before styling.",
    benefits: ["Seals in moisture", "Improves elasticity & softness", "Tames frizz without weight"],
    productType: "Styling",
    price: 30,
    stock: 55,
    tags: ["Vegan"],
    imgIndexes: [3, 6],
  },
  {
    name: "Shine Drops Serum",
    brand: "Verre & Vine",
    category: "haircare",
    shortDescription: "A glass-like gloss serum for a mirror-shine finish.",
    description:
      "A few drops smooth the cuticle instantly, reflecting light for a glossy, salon-fresh finish that lasts through humidity and heat styling.",
    ingredients: "Cyclopentasiloxane, Dimethiconol, Camellia Seed Oil",
    howToUse: "Warm 1-2 drops in palms and smooth over dry hair, avoiding the scalp.",
    benefits: ["Instant glass-like shine", "Humidity and frizz resistant", "Lightweight, non-greasy"],
    productType: "Hair Oil",
    price: 27,
    stock: 65,
    tags: ["Cruelty-Free"],
    imgIndexes: [1, 4],
  },

  // ---------------- Fragrance ----------------
  {
    name: "Ondée Eau de Parfum",
    brand: "Maison Douce",
    category: "fragrance",
    shortDescription: "A watery floral with notes of white tea, peony and soft musk.",
    description:
      "An airy, sheer floral that opens with white tea and pear before settling into a soft peony and musk base — the scent equivalent of an ocean breeze through linen curtains.",
    ingredients: "Alcohol Denat., Parfum, Aqua, Limonene, Linalool",
    howToUse: "Spray onto pulse points — wrists, neck and collarbone — for best diffusion.",
    benefits: ["8-10 hour wear", "Layerable, non-overpowering", "Notes: white tea, peony, musk"],
    productType: "Eau de Parfum",
    price: 96,
    stock: 40,
    tags: ["Vegan"],
    featured: true,
    bestSeller: true,
    imgIndexes: [1, 2],
  },
  {
    name: "Velours Noir Eau de Parfum",
    brand: "Velvet Noir",
    category: "fragrance",
    shortDescription: "A sultry amber-vanilla with dark plum and smoked wood.",
    description:
      "Rich and enveloping, this evening scent opens with dark plum and cardamom before drying down into warm amber, vanilla and smoked cedar.",
    ingredients: "Alcohol Denat., Parfum, Aqua, Coumarin, Benzyl Benzoate",
    howToUse: "Apply to pulse points 15 minutes before dressing to let the scent settle.",
    benefits: ["10+ hour longevity", "Notes: plum, amber, smoked cedar", "Best for evening wear"],
    productType: "Eau de Parfum",
    price: 110,
    stock: 30,
    tags: ["Vegan"],
    bestSeller: true,
    imgIndexes: [2, 3],
  },
  {
    name: "Bloom & Bergamot Eau de Toilette",
    brand: "Terra & Bloom",
    category: "fragrance",
    shortDescription: "A crisp citrus floral for everyday, all-season wear.",
    description:
      "Sparkling bergamot and grapefruit meet a soft jasmine heart and clean cedarwood base — bright, fresh and endlessly wearable.",
    ingredients: "Alcohol Denat., Parfum, Aqua, Citral, Linalool",
    howToUse: "Mist over hair and clothing as well as skin for longer-lasting diffusion.",
    benefits: ["Bright, everyday signature", "Notes: bergamot, jasmine, cedar", "Unisex, season-less"],
    productType: "Eau de Toilette",
    price: 72,
    discountPrice: 58,
    stock: 55,
    tags: ["Vegan", "Cruelty-Free"],
    imgIndexes: [3, 5],
  },
  {
    name: "Golden Amber Parfum",
    brand: "Gilded Petal",
    category: "fragrance",
    shortDescription: "A concentrated, honeyed amber for those who like to be remembered.",
    description:
      "Extrait-strength amber and golden honey wrapped in warm spice — a single spritz lingers on skin and fabric for days, not hours.",
    ingredients: "Alcohol Denat., Parfum, Amber Extract, Vanillin, Eugenol",
    howToUse: "One spray is often enough — apply to a single pulse point and let it develop.",
    benefits: ["Extrait-strength concentration", "Multi-day lasting power", "Notes: amber, honey, warm spice"],
    productType: "Parfum",
    price: 128,
    stock: 20,
    tags: [],
    newArrival: true,
    imgIndexes: [4, 6],
  },
  {
    name: "Sea Salt & Fig Cologne",
    brand: "Soleil Studio",
    category: "fragrance",
    shortDescription: "A breezy, sun-soaked scent of green fig and salted driftwood.",
    description:
      "Evokes a late-afternoon swim — green fig leaf, sea salt accord and a whisper of driftwood musk for an effortless warm-weather signature.",
    ingredients: "Alcohol Denat., Parfum, Aqua, Hexyl Cinnamal",
    howToUse: "Apply generously — this eau fraiche is designed for a lighter, more casual layer of scent.",
    benefits: ["Light, refreshing eau fraiche", "Notes: fig, sea salt, driftwood", "Great for warm-weather layering"],
    productType: "Cologne",
    price: 64,
    stock: 50,
    tags: ["Reef-Safe", "Vegan"],
    imgIndexes: [5, 1],
  },
  {
    name: "Rose Oud Elixir",
    brand: "Maison Douce",
    category: "fragrance",
    shortDescription: "A rich Turkish rose layered over smoky oud.",
    description:
      "An opulent, old-world composition — thousands of hand-picked rose petals distilled over a smoky, resinous oud base for a scent that feels both ancient and new.",
    ingredients: "Alcohol Denat., Parfum, Rose Damascena Oil, Oud Extract",
    howToUse: "A little goes a long way — apply one spray to décolletage for a scent that rises through the day.",
    benefits: ["Deep, long-lasting sillage", "Notes: Turkish rose, smoked oud", "Statement evening fragrance"],
    productType: "Eau de Parfum",
    price: 138,
    stock: 18,
    tags: [],
    imgIndexes: [6, 2],
  },
  {
    name: "Citrus Neroli Splash",
    brand: "Soleil Studio",
    category: "fragrance",
    shortDescription: "An invigorating splash of blood orange and neroli.",
    description:
      "A vibrant, energizing splash designed for morning application — blood orange and neroli blossom over a light musk base that never overwhelms.",
    ingredients: "Alcohol Denat., Parfum, Aqua, Citral, Geraniol",
    howToUse: "Splash onto pulse points post-shower for a fresh, energizing start to the day.",
    benefits: ["Energizing citrus opening", "Light, office-friendly sillage", "Notes: blood orange, neroli, musk"],
    productType: "Splash",
    price: 48,
    stock: 60,
    tags: ["Vegan"],
    imgIndexes: [1, 3],
  },
  {
    name: "Vanilla Musk Layering Oil",
    brand: "Anoki Beauty",
    category: "fragrance",
    shortDescription: "A skin-warming fragrance oil made to layer under any scent.",
    description:
      "A concentrated blend of vanilla absolute and white musk in a lightweight jojoba base — wear alone for a soft skin scent, or layer beneath your favorite fragrance to extend its wear.",
    ingredients: "Jojoba Seed Oil, Fragrance, Vanilla Planifolia Extract, Tocopherol",
    howToUse: "Roll onto pulse points alone, or apply before your usual fragrance to boost longevity.",
    benefits: ["Extends any fragrance's longevity", "Soft, skin-like vanilla musk", "Nourishing jojoba oil base"],
    productType: "Fragrance Oil",
    price: 38,
    stock: 45,
    tags: ["Clean Beauty", "Vegan"],
    imgIndexes: [2, 4],
  },

  // ---------------- Body Care ----------------
  {
    name: "Whipped Shea Body Butter",
    brand: "Bare Ritual",
    category: "body-care",
    shortDescription: "A cloud-light butter that melts instantly into skin.",
    description:
      "Whipped to a mousse-like texture, this butter delivers 48-hour hydration without ever feeling greasy or heavy — ideal for dry, flaky skin in any season.",
    ingredients: "Butyrospermum Parkii (Shea) Butter, Cocos Nucifera Oil, Glycerin, Vitamin E",
    howToUse: "Massage generously into skin after showering while still slightly damp.",
    benefits: ["48-hour deep hydration", "Whipped, fast-absorbing texture", "Fragrance-free formula available"],
    skinType: ["Dry", "All Skin Types"],
    productType: "Body Butter",
    price: 32,
    stock: 70,
    tags: ["Clean Beauty", "Vegan"],
    bestSeller: true,
    imgIndexes: [1, 3],
  },
  {
    name: "Silk Body Oil",
    brand: "Anoki Beauty",
    category: "body-care",
    shortDescription: "A dry-touch oil that leaves a soft, satin sheen — never sticky.",
    description:
      "A fast-absorbing blend of sweet almond, camellia and vitamin E oils nourishes skin deeply while imparting a subtle, non-greasy shimmer.",
    ingredients: "Prunus Amygdalus Dulcis (Sweet Almond) Oil, Camellia Oleifera Seed Oil, Tocopherol",
    howToUse: "Massage onto damp or dry skin, focusing on elbows, knees and legs.",
    benefits: ["Dry-touch, non-greasy finish", "Subtle satin shimmer", "Deeply nourishing oil blend"],
    productType: "Body Oil",
    price: 36,
    stock: 55,
    tags: ["Vegan", "Clean Beauty"],
    newArrival: true,
    imgIndexes: [3, 5],
  },
  {
    name: "Coconut Milk Body Wash",
    brand: "Bare Ritual",
    category: "body-care",
    shortDescription: "A creamy, low-lather wash that cleanses without stripping.",
    description:
      "A gentle, pH-balanced formula infused with coconut milk and oat extract that cleanses thoroughly while leaving skin soft, never tight or dry.",
    ingredients: "Aqua, Cocos Nucifera (Coconut) Milk, Coco-Glucoside, Oat Kernel Extract",
    howToUse: "Lather with a washcloth or loofah in the shower, then rinse thoroughly.",
    benefits: ["Creamy, low-lather cleanse", "Leaves skin soft, not tight", "Gentle enough for daily use"],
    skinType: ["Sensitive", "Dry"],
    productType: "Body Wash",
    price: 22,
    stock: 90,
    tags: ["Fragrance-Free", "Clean Beauty"],
    imgIndexes: [5, 2],
  },
  {
    name: "Sugar Polish Body Scrub",
    brand: "Maison Douce",
    category: "body-care",
    shortDescription: "A fine cane-sugar scrub that buffs away rough, dull skin.",
    description:
      "Fine cane sugar granules suspended in nourishing oils gently exfoliate rough patches while a fig and vanilla scent lingers softly after rinsing.",
    ingredients: "Saccharum Officinarum (Sugar Cane) Extract, Prunus Amygdalus Dulcis Oil, Parfum",
    howToUse: "Massage onto damp skin in circular motions, then rinse. Use 2-3 times per week.",
    benefits: ["Gently buffs rough, dull skin", "Leaves skin soft and glowing", "Lightly fragranced with fig & vanilla"],
    productType: "Body Scrub",
    price: 30,
    discountPrice: 24,
    stock: 60,
    tags: ["Vegan"],
    imgIndexes: [2, 6],
  },
  {
    name: "Hand & Cuticle Cream",
    brand: "Anoki Beauty",
    category: "body-care",
    shortDescription: "A rich, fast-absorbing cream for hands that do it all.",
    description:
      "A concentrated blend of shea butter and rosehip oil repairs dry, cracked hands and cuticles fast — rich enough to work, light enough to wear all day.",
    ingredients: "Butyrospermum Parkii (Shea) Butter, Rosa Canina (Rosehip) Fruit Oil, Glycerin",
    howToUse: "Massage into hands and cuticles as needed throughout the day.",
    benefits: ["Repairs dry, cracked skin", "Absorbs quickly, non-greasy", "Softens and nourishes cuticles"],
    productType: "Hand Cream",
    price: 18,
    stock: 100,
    tags: ["Vegan", "Clean Beauty"],
    imgIndexes: [6, 1],
  },
  {
    name: "Firming Body Lotion",
    brand: "Aurel & Co",
    category: "body-care",
    shortDescription: "A peptide-infused lotion for visibly firmer, smoother skin.",
    description:
      "A daily lotion formulated with peptides and caffeine to visibly firm and smooth skin's texture over time, absorbing quickly with a soft matte finish.",
    ingredients: "Aqua, Peptide Complex, Caffeine, Centella Asiatica Extract, Squalane",
    howToUse: "Apply daily after showering, massaging in upward motions.",
    benefits: ["Visibly firms over time", "Fast-absorbing, matte finish", "Contains caffeine & centella"],
    productType: "Body Lotion",
    price: 34,
    stock: 65,
    tags: ["Clean Beauty"],
    imgIndexes: [1, 4],
  },
  {
    name: "Mineral Bath Soak",
    brand: "Terra & Bloom",
    category: "body-care",
    shortDescription: "Magnesium-rich salts for a restorative evening soak.",
    description:
      "A blend of Epsom and Dead Sea salts infused with lavender and chamomile to ease tension and support restful sleep — an everyday ritual made luxurious.",
    ingredients: "Magnesium Sulfate, Maris Sal (Sea Salt), Lavandula Angustifolia Oil, Chamomilla Recutita Extract",
    howToUse: "Dissolve two cups under warm running water and soak for at least 20 minutes.",
    benefits: ["Eases tension, supports rest", "Lavender & chamomile aromatherapy", "Softens skin as it soaks"],
    productType: "Bath Soak",
    price: 26,
    stock: 50,
    tags: ["Clean Beauty", "Vegan"],
    imgIndexes: [4, 2],
  },
  {
    name: "After-Sun Cooling Gel",
    brand: "Soleil Studio",
    category: "body-care",
    shortDescription: "An aloe-forward gel that instantly cools and calms sun-warmed skin.",
    description:
      "A featherlight, fast-absorbing gel with aloe vera and cucumber extract that cools overheated, sun-exposed skin on contact and helps replenish lost moisture.",
    ingredients: "Aloe Barbadensis Leaf Juice, Cucumis Sativus Fruit Extract, Panthenol, Allantoin",
    howToUse: "Apply generously to sun-exposed skin and allow to absorb. Store in the fridge for extra cooling.",
    benefits: ["Instant cooling relief", "Replenishes moisture post-sun", "Lightweight, non-sticky gel"],
    productType: "After-Sun",
    price: 24,
    stock: 55,
    tags: ["Reef-Safe", "Vegan"],
    imgIndexes: [5, 3],
  },

  // ---------------- Tools ----------------
  {
    name: "Jade Facial Roller",
    brand: "Anoki Beauty",
    category: "tools",
    shortDescription: "A hand-carved jade roller for de-puffing and lymphatic drainage.",
    description:
      "Cool, dual-headed jade roller designed to boost circulation, reduce puffiness and help serums absorb more evenly for a naturally sculpted look.",
    ingredients: "Natural Jade Stone, Stainless Steel",
    howToUse: "Roll upward and outward from the center of the face, or store in the fridge for extra cooling.",
    benefits: ["Reduces puffiness", "Boosts circulation & lymphatic flow", "Enhances serum absorption"],
    productType: "Facial Tool",
    price: 32,
    stock: 60,
    tags: [],
    imgIndexes: [1, 2],
  },
  {
    name: "Gua Sha Sculpting Stone",
    brand: "Anoki Beauty",
    category: "tools",
    shortDescription: "A rose quartz sculpting tool for a five-minute facial massage.",
    description:
      "Ergonomically shaped rose quartz that glides along the jawline and cheekbones to relieve tension and encourage a naturally sculpted, lifted appearance.",
    ingredients: "Natural Rose Quartz",
    howToUse: "Apply facial oil first, then glide the stone along the jaw, cheeks and brow in upward strokes.",
    benefits: ["Relieves facial tension", "Sculpts and lifts naturally", "Pairs beautifully with facial oil"],
    productType: "Facial Tool",
    price: 28,
    stock: 55,
    tags: [],
    newArrival: true,
    imgIndexes: [2, 4],
  },
  {
    name: "Precision Makeup Brush Set",
    brand: "Gilded Petal",
    category: "tools",
    shortDescription: "A 9-piece vegan-bristle set for a flawless, professional finish.",
    description:
      "Nine essential brushes — from a dense foundation buffer to a precise crease blender — crafted with ultra-soft synthetic bristles that never shed.",
    ingredients: "Synthetic Taklon Bristles, Aluminum Ferrule, Wooden Handle",
    howToUse: "Use each brush for its intended purpose, cleaning weekly with a gentle brush shampoo.",
    benefits: ["9 essential vegan brushes", "Ultra-soft, shed-free bristles", "Includes canvas travel case"],
    productType: "Brush Set",
    price: 68,
    discountPrice: 54,
    stock: 40,
    tags: ["Vegan", "Cruelty-Free"],
    featured: true,
    imgIndexes: [3, 5],
  },
  {
    name: "Silicone Cleansing Brush",
    brand: "Bare Ritual",
    category: "tools",
    shortDescription: "A gentle, rechargeable silicone brush for a deeper daily cleanse.",
    description:
      "Ultra-hygienic silicone bristles massage away makeup, oil and impurities more thoroughly than hands alone, with two speed settings for face and body.",
    ingredients: "Food-Grade Silicone, ABS Plastic",
    howToUse: "Apply cleanser, then massage in circular motions for 60 seconds. Rinse and air dry.",
    benefits: ["Deeper daily cleanse", "Hygienic, odor-resistant silicone", "USB rechargeable, waterproof"],
    productType: "Cleansing Device",
    price: 45,
    stock: 35,
    tags: [],
    imgIndexes: [4, 6],
  },
  {
    name: "Dual-Ended Blending Sponge",
    brand: "Lumière Rare",
    category: "tools",
    shortDescription: "A latex-free sponge for streak-free foundation and concealer.",
    description:
      "A dual-textured sponge — a rounded end for broad coverage and a precision tip for concealer and spot corrections — that expands with water for a flawless, airbrushed finish.",
    ingredients: "Non-Latex Polyurethane Foam",
    howToUse: "Dampen thoroughly, squeeze out excess water, then bounce over the skin to blend product.",
    benefits: ["Streak-free, airbrushed finish", "Latex-free, hypoallergenic", "Dual-ended for precision"],
    productType: "Makeup Sponge",
    price: 16,
    stock: 150,
    tags: ["Vegan"],
    imgIndexes: [5, 1],
  },
  {
    name: "LED Light Therapy Mask",
    brand: "Nordling",
    category: "tools",
    shortDescription: "A 3-in-1 LED mask for brightening, calming and firming.",
    description:
      "Clinically-inspired red, blue and near-infrared light therapy in one flexible silicone mask — a 10-minute at-home treatment that fits into any evening routine.",
    ingredients: "Medical-Grade Silicone, LED Array",
    howToUse: "Cleanse skin, then wear the mask for 10 minutes, 3-4 times per week.",
    benefits: ["Red light for firmness", "Blue light for clarity", "Near-infrared for deep recovery"],
    productType: "LED Device",
    price: 189,
    discountPrice: 159,
    stock: 25,
    tags: ["Dermatologist-Tested"],
    newArrival: true,
    featured: true,
    imgIndexes: [6, 3],
  },
  {
    name: "Ice Roller Cooling Wand",
    brand: "Terra & Bloom",
    category: "tools",
    shortDescription: "A gel-core roller that de-puffs and refreshes in seconds.",
    description:
      "A freezer-ready gel-core roller that glides over the face, neck and eye area for an instant cooling, de-puffing effect — ideal for mornings after little sleep.",
    ingredients: "Cooling Gel Core, Stainless Steel, ABS Plastic",
    howToUse: "Freeze for at least 1 hour, then roll gently over face and neck as needed.",
    benefits: ["Instant de-puffing relief", "Soothes tension headaches", "Reusable, freezer-safe gel core"],
    productType: "Facial Tool",
    price: 29,
    stock: 50,
    tags: [],
    imgIndexes: [1, 6],
  },
  {
    name: "Magnifying Vanity Mirror",
    brand: "Gilded Petal",
    category: "tools",
    shortDescription: "A dual-sided LED mirror for precision makeup application.",
    description:
      "A rechargeable vanity mirror with adjustable warm-to-cool LED lighting and 10x magnification on the reverse side — designed to mimic natural daylight for true-to-life color matching.",
    ingredients: "Tempered Glass, ABS Plastic, LED Ring Light",
    howToUse: "Charge fully before first use. Adjust brightness and tone with the touch-sensor base.",
    benefits: ["Adjustable daylight-accurate LEDs", "10x magnification reverse side", "USB rechargeable, cordless"],
    productType: "Vanity Tool",
    price: 58,
    stock: 30,
    tags: [],
    imgIndexes: [2, 5],
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Refusing to seed: missing required env var ${name}. ` +
        `Set it in .env to a password of your choosing before running the seed — ` +
        `there is no built-in default admin/customer password.`
    );
  }
  return value;
}

async function main() {
  // Validate seed credentials BEFORE touching the database at all — a bad
  // config must fail fast, not wipe existing data and then error out partway
  // through re-seeding it.
  const adminEmail = requireEnv("ADMIN_SEED_EMAIL");
  const adminPassword = requireEnv("ADMIN_SEED_PASSWORD");
  const customerEmail = requireEnv("CUSTOMER_SEED_EMAIL");
  const customerPassword = requireEnv("CUSTOMER_SEED_PASSWORD");
  if (adminPassword.length < 8 || customerPassword.length < 8) {
    throw new Error("ADMIN_SEED_PASSWORD and CUSTOMER_SEED_PASSWORD must be at least 8 characters.");
  }
  if (adminPassword === "change-me-before-seeding" || customerPassword === "change-me-before-seeding") {
    throw new Error(
      "ADMIN_SEED_PASSWORD / CUSTOMER_SEED_PASSWORD are still set to the .env.example placeholder. " +
        "Choose real passwords before seeding."
    );
  }
  if (adminPassword === customerPassword) {
    throw new Error("ADMIN_SEED_PASSWORD and CUSTOMER_SEED_PASSWORD must be different.");
  }

  console.log("Seeding database…");

  // Clear existing data (dependency-safe order)
  await prisma.$transaction([
    prisma.orderStatusEvent.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.savedForLater.deleteMany(),
    prisma.recentlyViewed.deleteMany(),
    prisma.productBundle.deleteMany(),
    prisma.productTag.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.discount.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.address.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Categories
  const categoryMap = new Map<string, string>();
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const created = await prisma.category.create({
      data: { ...c, sortOrder: i },
    });
    categoryMap.set(c.slug, created.id);
  }

  // Brands
  const brandMap = new Map<string, string>();
  for (const b of BRANDS) {
    const created = await prisma.brand.create({
      data: { name: b.name, slug: slugify(b.name), description: b.description },
    });
    brandMap.set(b.name, created.id);
  }

  // Tags
  const tagMap = new Map<string, string>();
  for (const t of TAGS) {
    const created = await prisma.tag.create({ data: { name: t } });
    tagMap.set(t, created.id);
  }

  // Products
  const skuCounter = new Map<string, number>();
  const createdProducts: { id: string; slug: string; categorySlug: string; name: string }[] = [];

  for (const p of PRODUCTS) {
    const catCount = (skuCounter.get(p.category) ?? 0) + 1;
    skuCounter.set(p.category, catCount);
    const sku = `${p.category.slice(0, 3).toUpperCase()}-${String(catCount).padStart(3, "0")}`;
    const slug = slugify(p.name);

    let variants: { type: "shade" | "size"; name: string; swatch?: string; priceOverride?: number; stock: number }[] = [];
    if (p.productType === "Lipstick") {
      variants = SHADE_SETS.lip.map((s) => ({ type: "shade", name: s.name, swatch: s.swatch, stock: 30 }));
    } else if (p.productType === "Foundation" || p.productType === "Concealer") {
      variants = SHADE_SETS.foundation.map((s) => ({ type: "shade", name: s.name, swatch: s.swatch, stock: 25 }));
    } else if (p.productType === "Serum" && p.category === "skincare") {
      variants = [
        { type: "size", name: "15ml", stock: 40 },
        { type: "size", name: "30ml", priceOverride: Math.round(p.price * 1.7 * 100) / 100, stock: 25 },
      ];
    } else if (["Eau de Parfum", "Eau de Toilette", "Parfum", "Cologne"].includes(p.productType)) {
      variants = [
        { type: "size", name: "30ml", stock: 25 },
        { type: "size", name: "50ml", priceOverride: Math.round(p.price * 1.35 * 100) / 100, stock: 18 },
        { type: "size", name: "100ml", priceOverride: Math.round(p.price * 1.8 * 100) / 100, stock: 10 },
      ];
    } else if (p.productType === "Shampoo" || p.productType === "Conditioner") {
      variants = [
        { type: "size", name: "250ml", stock: 40 },
        { type: "size", name: "500ml", priceOverride: Math.round(p.price * 1.6 * 100) / 100, stock: 22 },
      ];
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        sku,
        shortDescription: p.shortDescription,
        description: p.description,
        ingredients: p.ingredients,
        howToUse: p.howToUse,
        benefits: JSON.stringify(p.benefits),
        skinType: p.skinType ? JSON.stringify(p.skinType) : null,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        stock: p.stock,
        lowStockAt: 15,
        productType: p.productType,
        categoryId: categoryMap.get(p.category)!,
        brandId: brandMap.get(p.brand)!,
        isFeatured: !!p.featured,
        isBestSeller: !!p.bestSeller,
        isNewArrival: !!p.newArrival,
        images: {
          create: p.imgIndexes.map((idx, i) => ({
            url: pImg(p.category, idx),
            alt: p.name,
            sortOrder: i,
          })),
        },
        variants: { create: variants },
        tags: { create: p.tags.map((t) => ({ tagId: tagMap.get(t)! })) },
      },
    });

    createdProducts.push({ id: product.id, slug: product.slug, categorySlug: p.category, name: product.name });
  }

  // Frequently bought together bundles (a handful of curated pairs)
  const bySlug = new Map(createdProducts.map((p) => [p.slug, p]));
  const bundlePairs: [string, string[]][] = [
    ["velvet-matte-lipstick", ["precision-liquid-eyeliner", "volumizing-mascara"]],
    ["vitamin-c-brightening-serum", ["hyaluronic-hydration-serum", "barrier-repair-moisturizer"]],
    ["silk-repair-shampoo", ["silk-repair-conditioner", "overnight-hair-oil-elixir"]],
    ["ond-e-eau-de-parfum", ["vanilla-musk-layering-oil"]],
    ["whipped-shea-body-butter", ["silk-body-oil", "sugar-polish-body-scrub"]],
    ["jade-facial-roller", ["gua-sha-sculpting-stone"]],
  ];
  for (const [mainSlug, othersSlugs] of bundlePairs) {
    const main = bySlug.get(mainSlug);
    if (!main) continue;
    for (const otherSlug of othersSlugs) {
      const other = bySlug.get(otherSlug);
      if (!other) continue;
      await prisma.productBundle.create({
        data: { productId: main.id, bundledProductId: other.id },
      });
    }
  }

  // Users (credentials already validated at the top of main())
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      name: "Maldibay Admin",
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customerPasswordHash = await bcrypt.hash(customerPassword, 12);
  const customer = await prisma.user.create({
    data: {
      name: "Amina Rasheed",
      email: customerEmail.toLowerCase(),
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+960 777-1234",
    },
  });

  // Extra demo customers only exist to author reviews/order history — they're
  // not meant to be logged into, so each gets its own random, unpublished password.
  const extraCustomers = await Promise.all(
    ["Sara Khan", "Leila Hassan", "Noor Fathimath", "Zayn Ahmed"].map(async (name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `${slugify(name)}@example.com`,
          passwordHash: await bcrypt.hash(randomBytes(24).toString("base64url"), 12),
          role: "CUSTOMER",
          createdAt: new Date(Date.now() - (i + 1) * 12 * 24 * 60 * 60 * 1000),
        },
      })
    )
  );
  const allCustomers = [customer, ...extraCustomers];

  // Addresses for demo customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      fullName: "Amina Rasheed",
      phone: "+960 777-1234",
      line1: "12 Orchid Magu",
      line2: "Apt 4B",
      city: "Malé",
      postalCode: "20026",
      country: "Maldives",
      isDefault: true,
    },
  });
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Work",
      fullName: "Amina Rasheed",
      phone: "+960 777-1234",
      line1: "Boduthakurufaanu Magu",
      city: "Malé",
      postalCode: "20025",
      country: "Maldives",
    },
  });

  // Reviews
  const reviewSnippets = [
    { title: "Holy grail status", comment: "I've repurchased this three times now — nothing else compares. Worth every penny.", rating: 5 },
    { title: "Better than expected", comment: "Was skeptical at first but this genuinely delivers on its claims. Will be reordering.", rating: 5 },
    { title: "Lovely, with one caveat", comment: "The texture and scent are gorgeous, just wish the bottle was a bit bigger for the price.", rating: 4 },
    { title: "New favorite", comment: "This has completely replaced my old go-to. So easy to use and the results are visible fast.", rating: 5 },
    { title: "Solid, not life-changing", comment: "It's good — does what it says — but I wasn't blown away compared to the hype.", rating: 3 },
    { title: "Gorgeous packaging & formula", comment: "Feels genuinely luxurious to use every day. The formula sinks in beautifully.", rating: 5 },
    { title: "Great for sensitive skin", comment: "Finally something that doesn't irritate my skin. Gentle but still effective.", rating: 4 },
  ];

  let reviewIdx = 0;
  for (const p of createdProducts) {
    const numReviews = 2 + (reviewIdx % 4);
    for (let i = 0; i < numReviews; i++) {
      const snippet = reviewSnippets[(reviewIdx + i) % reviewSnippets.length];
      const author = allCustomers[(reviewIdx + i) % allCustomers.length];
      await prisma.review.create({
        data: {
          productId: p.id,
          userId: author.id,
          rating: snippet.rating,
          title: snippet.title,
          comment: snippet.comment,
          isVerified: i % 2 === 0,
          status: i === numReviews - 1 && reviewIdx % 5 === 0 ? "PENDING" : "APPROVED",
          createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
    reviewIdx++;
  }

  // Recompute rating aggregates
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  for (const p of allProducts) {
    const agg = await prisma.review.aggregate({
      where: { productId: p.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: p.id },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    });
  }

  // Wishlist + recently viewed for demo customer
  const wishlistPicks = createdProducts.slice(0, 6);
  for (const p of wishlistPicks) {
    await prisma.wishlistItem.create({ data: { userId: customer.id, productId: p.id } });
  }
  const recentPicks = createdProducts.slice(6, 12);
  for (const p of recentPicks) {
    await prisma.recentlyViewed.create({ data: { userId: customer.id, productId: p.id } });
  }

  // Discounts
  await prisma.discount.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off your first order",
        type: "PERCENTAGE",
        value: 10,
        isActive: true,
      },
      {
        code: "FREESHIP",
        description: "$8 off shipping on any order",
        type: "FIXED",
        value: 8,
        minSubtotal: 40,
        isActive: true,
      },
      {
        code: "GLOW20",
        description: "20% off orders over $75",
        type: "PERCENTAGE",
        value: 20,
        minSubtotal: 75,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "SKINCARE15",
        description: "15% off skincare",
        type: "PERCENTAGE",
        value: 15,
        categoryId: categoryMap.get("skincare"),
        isActive: true,
      },
    ],
  });

  // Sample orders for the demo customer
  const statusFlow: { status: string; note: string }[][] = [
    [{ status: "PENDING", note: "Order placed" }, { status: "CONFIRMED", note: "Payment confirmed" }, { status: "PROCESSING", note: "Preparing your order" }, { status: "SHIPPED", note: "Handed to courier" }, { status: "DELIVERED", note: "Delivered to customer" }],
    [{ status: "PENDING", note: "Order placed" }, { status: "CONFIRMED", note: "Payment confirmed" }, { status: "PROCESSING", note: "Preparing your order" }],
    [{ status: "PENDING", note: "Order placed" }],
    [{ status: "PENDING", note: "Order placed" }, { status: "CANCELLED", note: "Cancelled by customer" }],
  ];

  for (let o = 0; o < statusFlow.length; o++) {
    const picks = createdProducts.slice(o * 3, o * 3 + 2 + (o % 2));
    const items = picks.length ? picks : createdProducts.slice(0, 2);
    let subtotal = 0;
    const orderItemsData = [];
    for (const pick of items) {
      const full = await prisma.product.findUnique({ where: { id: pick.id } });
      if (!full) continue;
      const qty = 1 + (o % 2);
      const price = full.discountPrice ?? full.price;
      subtotal += price * qty;
      orderItemsData.push({
        productId: full.id,
        productName: full.name,
        productImage: (await prisma.productImage.findFirst({ where: { productId: full.id } }))?.url,
        price,
        quantity: qty,
      });
    }
    const shippingCost = subtotal >= 75 ? 0 : 4.5;
    const total = Math.round((subtotal + shippingCost) * 100) / 100;
    const finalStatus = statusFlow[o][statusFlow[o].length - 1].status;
    const createdAt = new Date(Date.now() - (statusFlow.length - o) * 5 * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        orderNumber: `MB-DEMO-${1000 + o}`,
        userId: customer.id,
        status: finalStatus,
        email: customer.email,
        phone: "+960 777-1234",
        shippingName: "Amina Rasheed",
        shippingLine1: "12 Orchid Magu",
        shippingLine2: "Apt 4B",
        shippingCity: "Malé",
        shippingPostal: "20026",
        shippingCountry: "Maldives",
        deliveryMethod: o % 2 === 0 ? "STANDARD" : "EXPRESS",
        paymentMethod: ["COD", "CARD", "BANK_TRANSFER"][o % 3],
        paymentStatus: finalStatus === "CANCELLED" ? "REFUNDED" : finalStatus === "DELIVERED" ? "PAID" : "PENDING",
        subtotal: Math.round(subtotal * 100) / 100,
        shippingCost,
        total,
        trackingNumber: finalStatus === "SHIPPED" || finalStatus === "DELIVERED" ? `TRK${9000000 + o}` : null,
        createdAt,
        updatedAt: createdAt,
        items: { create: orderItemsData },
        statusHistory: {
          create: statusFlow[o].map((s, i) => ({
            status: s.status,
            note: s.note,
            createdAt: new Date(createdAt.getTime() + i * 20 * 60 * 60 * 1000),
          })),
        },
      },
    });
  }

  // Homepage banners
  await prisma.banner.create({
    data: {
      placement: "promo",
      title: "Your Beauty. Your Ritual.",
      subtitle:
        "A considered edit of everyday essentials — formulated to become part of the routine you actually look forward to.",
      ctaLabel: "Shop the Ritual",
      ctaLink: "/shop",
      image: "/generated/hero/promo-ritual.jpg",
      isActive: true,
      sortOrder: 0,
    },
  });

  console.log(`Seeded ${createdProducts.length} products across ${CATEGORIES.length} categories.`);
  console.log(`Admin login: ${adminEmail}`);
  console.log(`Customer login: ${customerEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
