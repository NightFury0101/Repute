/**
 * generate-images.ts
 *
 * Generates a full set of tasteful, editorial-style placeholder images for
 * Repute entirely programmatically: SVG scenes are composed from a small
 * set of reusable helper functions (gradient backgrounds, bokeh, silhouette
 * "products", drop shadows, decorative line/arc accents) and then rasterized
 * to JPEG via sharp.
 *
 * Run with:  npx tsx scripts/generate-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Brand palette — ONLY these tones are used throughout.
// ---------------------------------------------------------------------------

const COLOR = {
  ivory: "#FBF7F2",
  cream: "#F5EEE4",
  warmWhite: "#FFFDFB",
  sand: "#ECE2D4",
  blush: "#F1DCD7",
  blushDeep: "#E3BDB6",
  roseGold: "#B98A72",
  roseGoldDark: "#9C6F58",
  ink: "#211D1A",
  inkSoft: "#4A433C",
  inkMute: "#7C7266",
} as const;

type Hex = string;

// ---------------------------------------------------------------------------
// Small deterministic PRNG so every render is reproducible but each file
// gets its own distinct arrangement (no Math.random — keeps re-runs stable).
// ---------------------------------------------------------------------------

function makeRng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function rng() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length];
}

function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

let uid = 0;
function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}${uid}`;
}

// ---------------------------------------------------------------------------
// Gradient background + bokeh helper
// ---------------------------------------------------------------------------

interface BgOptions {
  w: number;
  h: number;
  stops: { color: Hex; offset: number; opacity?: number }[];
  angle?: number; // degrees, for the base linear wash
  bokeh?: { color: Hex; opacity: number }[];
  seed: string;
  vignette?: Hex; // subtle radial darkening/warming at edges
}

function angleToCoords(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const x1 = 50 - 50 * Math.cos(rad);
  const y1 = 50 - 50 * Math.sin(rad);
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);
  return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
}

function gradientBackground(opts: BgOptions): { markup: string; defs: string } {
  const { w, h, stops, angle = 135, bokeh = [], seed, vignette } = opts;
  const gradId = nextId("bg");
  const blurId = nextId("blur");
  const vigId = nextId("vig");
  const { x1, y1, x2, y2 } = angleToCoords(angle);

  const stopMarkup = stops
    .map(
      (s) =>
        `<stop offset="${s.offset}%" stop-color="${s.color}" stop-opacity="${
          s.opacity ?? 1
        }" />`
    )
    .join("");

  const rng = makeRng(seed);
  const bokehMarkup = bokeh
    .map((b) => {
      const cx = range(rng, w * 0.05, w * 0.95);
      const cy = range(rng, h * 0.05, h * 0.95);
      const r = range(rng, Math.min(w, h) * 0.16, Math.min(w, h) * 0.34);
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(
        1
      )}" fill="${b.color}" opacity="${b.opacity}" filter="url(#${blurId})" />`;
    })
    .join("");

  const vignetteMarkup = vignette
    ? `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#${vigId})" />`
    : "";

  const defs = `
    <linearGradient id="${gradId}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${stopMarkup}
    </linearGradient>
    <filter id="${blurId}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${Math.min(w, h) * 0.05}" />
    </filter>
    ${
      vignette
        ? `<radialGradient id="${vigId}" cx="50%" cy="46%" r="75%">
            <stop offset="55%" stop-color="${vignette}" stop-opacity="0" />
            <stop offset="100%" stop-color="${vignette}" stop-opacity="0.22" />
          </radialGradient>`
        : ""
    }
  `;

  const markup = `
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${gradId})" />
    <g>${bokehMarkup}</g>
    ${vignetteMarkup}
  `;

  return { markup, defs };
}

// ---------------------------------------------------------------------------
// Decorative fine line / arc accents
// ---------------------------------------------------------------------------

function decorativeAccents(
  w: number,
  h: number,
  seed: string,
  color: Hex = COLOR.roseGold,
  count = 3
): string {
  const rng = makeRng(seed + "-accent");
  let out = "";
  for (let i = 0; i < count; i++) {
    const kind = pick(rng, ["arc", "line", "dot", "ring"]);
    const cx = range(rng, w * 0.08, w * 0.92);
    const cy = range(rng, h * 0.08, h * 0.92);
    const op = range(rng, 0.18, 0.4);
    if (kind === "arc") {
      const r = range(rng, w * 0.05, w * 0.14);
      const startAngle = range(rng, 0, 360);
      const sweep = range(rng, 60, 160);
      const a1 = (startAngle * Math.PI) / 180;
      const a2 = ((startAngle + sweep) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const largeArc = sweep > 180 ? 1 : 0;
      out += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(
        1
      )} ${r.toFixed(1)} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(
        1
      )}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${op.toFixed(
        2
      )}" stroke-linecap="round" />`;
    } else if (kind === "line") {
      const len = range(rng, w * 0.05, w * 0.12);
      const ang = range(rng, 0, 360);
      const rad = (ang * Math.PI) / 180;
      const x2 = cx + len * Math.cos(rad);
      const y2 = cy + len * Math.sin(rad);
      out += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x2.toFixed(
        1
      )}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.25" opacity="${op.toFixed(
        2
      )}" stroke-linecap="round" />`;
    } else if (kind === "ring") {
      const r = range(rng, w * 0.02, w * 0.045);
      out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(
        1
      )}" r="${r.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1" opacity="${op.toFixed(
        2
      )}" />`;
    } else {
      const r = range(rng, 1.5, 3.2);
      out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(
        1
      )}" r="${r.toFixed(1)}" fill="${color}" opacity="${(op + 0.15).toFixed(
        2
      )}" />`;
    }
  }
  return `<g>${out}</g>`;
}

// ---------------------------------------------------------------------------
// Soft drop shadow ellipse
// ---------------------------------------------------------------------------

function dropShadow(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: Hex = COLOR.ink,
  opacity = 0.16
): { markup: string; defs: string } {
  const blurId = nextId("shadowblur");
  return {
    defs: `<filter id="${blurId}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${(
      ry * 0.35
    ).toFixed(1)}" /></filter>`,
    markup: `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(
      1
    )}" ry="${ry.toFixed(1)}" fill="${color}" opacity="${opacity}" filter="url(#${blurId})" />`,
  };
}

// ---------------------------------------------------------------------------
// Silhouette gradient fill helper (subtle vertical sheen on the "glass")
// ---------------------------------------------------------------------------

function silhouetteGradient(top: Hex, bottom: Hex, opacity = 1): {
  id: string;
  defs: string;
} {
  const id = nextId("sil");
  return {
    id,
    defs: `<linearGradient id="${id}" x1="20%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="${top}" stop-opacity="${opacity}" />
      <stop offset="55%" stop-color="${bottom}" stop-opacity="${opacity}" />
      <stop offset="100%" stop-color="${top}" stop-opacity="${opacity * 0.9}" />
    </linearGradient>`,
  };
}

// A thin highlight stroke used on most silhouettes for a "glass/metal" edge.
function highlightStroke(color: Hex = COLOR.warmWhite, opacity = 0.35) {
  return `stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"`;
}

// ---------------------------------------------------------------------------
// Silhouette builders.
// Each returns { markup, defs, footY } where footY is the y coordinate of
// the base of the object (useful for placing a drop shadow beneath it).
// All silhouettes are authored around a local origin (0,0 = bottom-center)
// and then translated/scaled/rotated into place by the caller.
// ---------------------------------------------------------------------------

interface Silhouette {
  markup: string;
  defs: string;
  width: number; // local bounding width at scale 1
  height: number; // local bounding height at scale 1
}

function place(
  cx: number,
  footY: number,
  scale: number,
  rotate: number,
  s: Silhouette
): string {
  return `<g transform="translate(${cx.toFixed(1)} ${footY.toFixed(
    1
  )}) rotate(${rotate}) scale(${scale})">${s.markup}</g>`;
}

/** Dropper serum bottle: rounded rect body, short neck, dropper cap + rod. */
function dropperBottle(
  fillTop: Hex,
  fillBottom: Hex,
  capColor: Hex,
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const bodyW = 92;
  const bodyH = 150;
  const rodH = 70;
  const bulbR = 20;
  const accentMarkup = accent
    ? `<rect x="${-bodyW / 2 + 8}" y="${-bodyH * 0.42}" width="${
        bodyW - 16
      }" height="${bodyH * 0.16}" rx="4" fill="${accent}" opacity="0.85" />`
    : "";
  return {
    width: bodyW + 20,
    height: bodyH + rodH + bulbR * 2,
    defs: g.defs,
    markup: `
      <g>
        <rect x="${-bodyW / 2}" y="${-bodyH}" width="${bodyW}" height="${bodyH}" rx="18"
          fill="url(#${g.id})" ${highlightStroke()} />
        ${accentMarkup}
        <rect x="${-bodyW * 0.22}" y="${-bodyH - 22}" width="${bodyW * 0.44}" height="26" rx="6"
          fill="${capColor}" />
        <rect x="${-bodyW * 0.05}" y="${-bodyH - 22 - rodH}" width="${bodyW * 0.1}" height="${rodH}"
          fill="${capColor}" opacity="0.85" />
        <ellipse cx="0" cy="${-bodyH - 22 - rodH - bulbR * 0.7}" rx="${bulbR}" ry="${bulbR * 1.15}"
          fill="${capColor}" />
      </g>`,
  };
}

/** Perfume bottle: tapered body with faceted cap. */
function perfumeBottle(
  fillTop: Hex,
  fillBottom: Hex,
  capColor: Hex,
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const baseW = 118;
  const topW = 74;
  const bodyH = 160;
  const neckH = 24;
  const capH = 46;
  const accentMarkup = accent
    ? `<rect x="${-baseW / 2 + 10}" y="${-bodyH * 0.5}" width="${
        baseW - 20
      }" height="${bodyH * 0.14}" rx="3" fill="${accent}" opacity="0.85" />`
    : "";
  return {
    width: baseW + 20,
    height: bodyH + neckH + capH + 20,
    defs: g.defs,
    markup: `
      <g>
        <path d="M ${-baseW / 2} 0
                 L ${-baseW / 2} ${-bodyH * 0.72}
                 Q ${-baseW / 2} ${-bodyH} ${-topW / 2} ${-bodyH}
                 L ${topW / 2} ${-bodyH}
                 Q ${baseW / 2} ${-bodyH} ${baseW / 2} ${-bodyH * 0.72}
                 L ${baseW / 2} 0 Z"
              fill="url(#${g.id})" ${highlightStroke()} />
        ${accentMarkup}
        <rect x="${-topW * 0.18}" y="${-bodyH - neckH}" width="${topW * 0.36}" height="${neckH + 4}"
          fill="${capColor}" opacity="0.9" />
        <polygon points="
          ${-topW * 0.3},${-bodyH - neckH}
          ${topW * 0.3},${-bodyH - neckH}
          ${topW * 0.34},${-bodyH - neckH - capH * 0.55}
          ${topW * 0.16},${-bodyH - neckH - capH}
          ${-topW * 0.16},${-bodyH - neckH - capH}
          ${-topW * 0.34},${-bodyH - neckH - capH * 0.55}
        " fill="${capColor}" ${highlightStroke(COLOR.warmWhite, 0.3)} />
      </g>`,
  };
}

/** Jar: wide rounded body with lid. */
function jar(
  fillTop: Hex,
  fillBottom: Hex,
  lidColor: Hex,
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const bodyW = 150;
  const bodyH = 110;
  const lidH = 34;
  const accentMarkup = accent
    ? `<rect x="${-bodyW / 2 + 14}" y="${-bodyH * 0.48}" width="${
        bodyW - 28
      }" height="${bodyH * 0.18}" rx="4" fill="${accent}" opacity="0.85" />`
    : "";
  return {
    width: bodyW + 16,
    height: bodyH + lidH + 10,
    defs: g.defs,
    markup: `
      <g>
        <rect x="${-bodyW / 2}" y="${-bodyH}" width="${bodyW}" height="${bodyH}" rx="16"
          fill="url(#${g.id})" ${highlightStroke()} />
        ${accentMarkup}
        <rect x="${-bodyW / 2 - 4}" y="${-bodyH - lidH}" width="${bodyW + 8}" height="${lidH}" rx="10"
          fill="${lidColor}" ${highlightStroke(COLOR.warmWhite, 0.3)} />
      </g>`,
  };
}

/** Lipstick tube: cylinder body + angled bullet tip. */
function lipstickTube(
  fillTop: Hex,
  fillBottom: Hex,
  bulletColor: Hex,
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const bodyW = 54;
  const bodyH = 150;
  const bulletH = 46;
  const accentMarkup = accent
    ? `<rect x="${-bodyW / 2}" y="${-bodyH * 0.42}" width="${bodyW}" height="${bodyH * 0.12}"
        fill="${accent}" opacity="0.85" />`
    : "";
  return {
    width: bodyW + 10,
    height: bodyH + bulletH + 10,
    defs: g.defs,
    markup: `
      <g>
        <rect x="${-bodyW / 2}" y="${-bodyH}" width="${bodyW}" height="${bodyH}" rx="10"
          fill="url(#${g.id})" ${highlightStroke()} />
        ${accentMarkup}
        <path d="M ${-bodyW / 2 + 3} ${-bodyH}
                 L ${bodyW / 2 - 3} ${-bodyH}
                 L ${bodyW / 2 - 9} ${-bodyH - bulletH * 0.7}
                 Q 0 ${-bodyH - bulletH} ${-bodyW / 2 + 9} ${-bodyH - bulletH * 0.7} Z"
          fill="${bulletColor}" ${highlightStroke(COLOR.warmWhite, 0.25)} />
      </g>`,
  };
}

/** Compact: clamshell base + lid ellipse with mirror ring accent. */
function compact(
  fillTop: Hex,
  fillBottom: Hex,
  lidColor: Hex,
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const w = 150;
  const baseH = 40;
  const lidR = w / 2;
  return {
    width: w + 16,
    height: baseH + lidR * 2 + 8,
    defs: g.defs,
    markup: `
      <g>
        <rect x="${-w / 2}" y="${-baseH}" width="${w}" height="${baseH}" rx="8"
          fill="url(#${g.id})" ${highlightStroke()} />
        <ellipse cx="0" cy="${-baseH - lidR * 0.6}" rx="${lidR}" ry="${lidR * 0.62}"
          fill="${lidColor}" ${highlightStroke(COLOR.warmWhite, 0.3)} />
        <circle cx="0" cy="${-baseH - lidR * 0.6}" r="${lidR * 0.34}" fill="none"
          stroke="${accent ?? COLOR.roseGold}" stroke-width="1.5" opacity="0.7" />
      </g>`,
  };
}

/** Pump bottle: taller rounded body + pump head and angled nozzle arm. */
function pumpBottle(
  fillTop: Hex,
  fillBottom: Hex,
  pumpColor: Hex,
  opts: { wide?: boolean } = {},
  accent?: Hex
): Silhouette {
  const g = silhouetteGradient(fillTop, fillBottom);
  const bodyW = opts.wide ? 130 : 100;
  const bodyH = opts.wide ? 150 : 190;
  const pumpH = 40;
  const accentMarkup = accent
    ? `<rect x="${-bodyW / 2 + 10}" y="${-bodyH * 0.4}" width="${
        bodyW - 20
      }" height="${bodyH * 0.15}" rx="4" fill="${accent}" opacity="0.85" />`
    : "";
  return {
    width: bodyW + 60,
    height: bodyH + pumpH + 30,
    defs: g.defs,
    markup: `
      <g>
        <rect x="${-bodyW / 2}" y="${-bodyH}" width="${bodyW}" height="${bodyH}" rx="20"
          fill="url(#${g.id})" ${highlightStroke()} />
        ${accentMarkup}
        <rect x="${-bodyW * 0.16}" y="${-bodyH - pumpH}" width="${bodyW * 0.32}" height="${pumpH}" rx="7"
          fill="${pumpColor}" />
        <path d="M ${bodyW * 0.16} ${-bodyH - pumpH * 0.65}
                 L ${bodyW * 0.16 + 46} ${-bodyH - pumpH * 0.65 - 10}
                 L ${bodyW * 0.16 + 46} ${-bodyH - pumpH * 0.65 + 2}
                 L ${bodyW * 0.16 + 10} ${-bodyH - pumpH * 0.65 + 10} Z"
          fill="${pumpColor}" opacity="0.9" />
      </g>`,
  };
}

/** Facial roller: thin handle + two angled roller heads (rose-quartz style). */
function facialRoller(
  headColor: Hex,
  headColor2: Hex,
  frameColor: Hex
): Silhouette {
  const handleW = 16;
  const handleH = 120;
  const headR = 34;
  return {
    width: 220,
    height: 180,
    defs: "",
    markup: `
      <g transform="rotate(-18)">
        <rect x="${-handleW / 2}" y="${-handleH}" width="${handleW}" height="${handleH}" rx="8"
          fill="${frameColor}" />
        <line x1="0" y1="${-handleH}" x2="${headR * 1.7}" y2="${-handleH - headR * 1.1}"
          stroke="${frameColor}" stroke-width="7" stroke-linecap="round" />
        <circle cx="${headR * 1.7}" cy="${-handleH - headR * 1.1}" r="${headR}"
          fill="${headColor}" ${highlightStroke(COLOR.warmWhite, 0.35)} />
        <circle cx="${headR * 1.7}" cy="${-handleH - headR * 1.1}" r="${headR * 0.42}"
          fill="${headColor2}" opacity="0.55" />
      </g>`,
  };
}

/** Makeup brush: tapered handle + fan of bristles. */
function makeupBrush(handleColor: Hex, ferruleColor: Hex, bristleColor: Hex): Silhouette {
  const handleW = 14;
  const handleH = 140;
  const ferruleH = 22;
  const bristleH = 70;
  const bristleW = 46;
  return {
    width: 100,
    height: handleH + ferruleH + bristleH + 10,
    defs: "",
    markup: `
      <g transform="rotate(-10)">
        <path d="M ${-handleW / 2} 0 L ${-handleW * 0.7} ${-handleH * 0.75}
                 Q ${-handleW * 0.5} ${-handleH} 0 ${-handleH}
                 Q ${handleW * 0.5} ${-handleH} ${handleW * 0.7} ${-handleH * 0.75}
                 L ${handleW / 2} 0 Z" fill="${handleColor}" />
        <rect x="${-handleW * 0.55}" y="${-handleH - ferruleH}" width="${handleW * 1.1}" height="${ferruleH}"
          fill="${ferruleColor}" />
        <path d="M ${-bristleW / 2} ${-handleH - ferruleH}
                 Q 0 ${-handleH - ferruleH - bristleH} ${bristleW / 2} ${-handleH - ferruleH}
                 Q 0 ${-handleH - ferruleH + 14} ${-bristleW / 2} ${-handleH - ferruleH} Z"
          fill="${bristleColor}" opacity="0.92" ${highlightStroke(COLOR.warmWhite, 0.25)} />
      </g>`,
  };
}

// ---------------------------------------------------------------------------
// Rendering pipeline
// ---------------------------------------------------------------------------

function svgDocument(w: number, h: number, defs: string[], body: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${defs.join("\n")}</defs>
  ${body.join("\n")}
</svg>`;
}

async function renderJpeg(svg: string, outPath: string, quality = 84) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality }).toFile(outPath);
}

// ---------------------------------------------------------------------------
// Scene composers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "generated");

async function genHomeHero() {
  const w = 1920;
  const h = 1200;
  const defs: string[] = [];
  const body: string[] = [];

  const bg = gradientBackground({
    w,
    h,
    angle: 120,
    stops: [
      { color: COLOR.ivory, offset: 0 },
      { color: COLOR.blush, offset: 55 },
      { color: COLOR.sand, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.blushDeep, opacity: 0.28 },
      { color: COLOR.roseGold, opacity: 0.14 },
      { color: COLOR.warmWhite, opacity: 0.4 },
    ],
    seed: "home-hero",
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, "home-hero", COLOR.roseGold, 5));

  const cx = w * 0.76;
  const footY = h * 0.86;
  const sh = dropShadow(cx, footY + 14, 130, 22, COLOR.ink, 0.14);
  defs.push(sh.defs);
  body.push(sh.markup);

  const bottle = dropperBottle(COLOR.warmWhite, COLOR.blushDeep, COLOR.roseGoldDark, COLOR.roseGold);
  defs.push(bottle.defs);
  body.push(place(cx, footY, 2.05, -3, bottle));

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "hero", "home-hero.jpg"));
}

async function genPromoRitual() {
  const w = 1920;
  const h = 1080;
  const defs: string[] = [];
  const body: string[] = [];

  const bg = gradientBackground({
    w,
    h,
    angle: 100,
    stops: [
      { color: COLOR.inkSoft, offset: 0, opacity: 0.94 },
      { color: COLOR.roseGoldDark, offset: 58 },
      { color: COLOR.ink, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.roseGold, opacity: 0.22 },
      { color: COLOR.blushDeep, opacity: 0.12 },
      { color: COLOR.sand, opacity: 0.08 },
    ],
    seed: "promo-ritual",
    vignette: COLOR.ink,
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, "promo-ritual", COLOR.blush, 4));

  const cx = w * 0.28;
  const footY = h * 0.88;
  const sh = dropShadow(cx, footY + 12, 150, 24, COLOR.ink, 0.35);
  defs.push(sh.defs);
  body.push(sh.markup);

  const perfume = perfumeBottle(COLOR.blush, COLOR.roseGoldDark, COLOR.ink, COLOR.roseGold);
  defs.push(perfume.defs);
  body.push(place(cx, footY, 1.9, 2, perfume));

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "hero", "promo-ritual.jpg"));
}

async function genFeaturedCollection() {
  const w = 1600;
  const h = 2000;
  const defs: string[] = [];
  const body: string[] = [];

  const bg = gradientBackground({
    w,
    h,
    angle: 160,
    stops: [
      { color: COLOR.cream, offset: 0 },
      { color: COLOR.ivory, offset: 50 },
      { color: COLOR.blush, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.blushDeep, opacity: 0.22 },
      { color: COLOR.sand, opacity: 0.3 },
    ],
    seed: "featured-collection",
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, "featured-collection", COLOR.roseGold, 5));

  const footY = h * 0.72;

  // Jar — back left
  {
    const cx = w * 0.32;
    const sh = dropShadow(cx, footY + 8, 110, 18, COLOR.ink, 0.13);
    defs.push(sh.defs);
    body.push(sh.markup);
    const s = jar(COLOR.warmWhite, COLOR.sand, COLOR.roseGoldDark, COLOR.blushDeep);
    defs.push(s.defs);
    body.push(place(cx, footY, 1.7, -4, s));
  }

  // Bottle — center, tallest
  {
    const cx = w * 0.53;
    const footY2 = h * 0.78;
    const sh = dropShadow(cx, footY2 + 10, 120, 20, COLOR.ink, 0.16);
    defs.push(sh.defs);
    body.push(sh.markup);
    const s = dropperBottle(COLOR.blush, COLOR.roseGold, COLOR.ink, COLOR.roseGoldDark);
    defs.push(s.defs);
    body.push(place(cx, footY2, 1.95, 3, s));
  }

  // Compact — front right
  {
    const cx = w * 0.73;
    const footY3 = h * 0.68;
    const sh = dropShadow(cx, footY3 + 6, 100, 16, COLOR.ink, 0.13);
    defs.push(sh.defs);
    body.push(sh.markup);
    const s = compact(COLOR.warmWhite, COLOR.blush, COLOR.roseGold, COLOR.roseGoldDark);
    defs.push(s.defs);
    body.push(place(cx, footY3, 1.5, 6, s));
  }

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "hero", "featured-collection.jpg"));
}

async function genAboutHero() {
  const w = 1920;
  const h = 1080;
  const defs: string[] = [];
  const body: string[] = [];

  const bg = gradientBackground({
    w,
    h,
    angle: 70,
    stops: [
      { color: COLOR.warmWhite, offset: 0 },
      { color: COLOR.cream, offset: 55 },
      { color: COLOR.blush, offset: 100, opacity: 0.8 },
    ],
    bokeh: [
      { color: COLOR.sand, opacity: 0.3 },
      { color: COLOR.blushDeep, opacity: 0.14 },
    ],
    seed: "about-hero",
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, "about-hero", COLOR.roseGold, 4));

  const cx = w * 0.16;
  const footY = h * 0.84;
  const sh = dropShadow(cx, footY + 8, 80, 14, COLOR.ink, 0.1);
  defs.push(sh.defs);
  body.push(sh.markup);

  const s = jar(COLOR.ivory, COLOR.blush, COLOR.roseGold, COLOR.roseGoldDark);
  defs.push(s.defs);
  body.push(place(cx, footY, 1.15, -6, s));

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "hero", "about-hero.jpg"));
}

async function genOgImage() {
  const w = 1200;
  const h = 630;
  const defs: string[] = [];
  const body: string[] = [];

  const bg = gradientBackground({
    w,
    h,
    angle: 135,
    stops: [
      { color: COLOR.ivory, offset: 0 },
      { color: COLOR.sand, offset: 60 },
      { color: COLOR.blush, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.roseGold, opacity: 0.16 },
      { color: COLOR.warmWhite, opacity: 0.4 },
    ],
    seed: "og-image",
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, "og-image", COLOR.roseGoldDark, 4));

  const cx = w * 0.8;
  const footY = h * 0.82;
  const sh = dropShadow(cx, footY + 6, 60, 12, COLOR.ink, 0.14);
  defs.push(sh.defs);
  body.push(sh.markup);

  const s = perfumeBottle(COLOR.warmWhite, COLOR.blushDeep, COLOR.roseGoldDark, COLOR.roseGold);
  defs.push(s.defs);
  body.push(place(cx, footY, 1.0, -3, s));

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "og-image.jpg"));
}

// ---------------------------------------------------------------------------
// Category images
// ---------------------------------------------------------------------------

interface CategoryDef {
  key: string;
  angle: number;
  stops: { color: Hex; offset: number; opacity?: number }[];
  bokeh: { color: Hex; opacity: number }[];
  build: (seed: string) => { silhouette: Silhouette; scale: number; rotate: number }[];
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "makeup",
    angle: 130,
    stops: [
      { color: COLOR.blush, offset: 0 },
      { color: COLOR.ivory, offset: 55 },
      { color: COLOR.sand, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.blushDeep, opacity: 0.26 },
      { color: COLOR.roseGold, opacity: 0.12 },
    ],
    build: () => [
      { silhouette: lipstickTube(COLOR.warmWhite, COLOR.blushDeep, COLOR.roseGoldDark, COLOR.roseGold), scale: 1.5, rotate: -6 },
      { silhouette: compact(COLOR.blush, COLOR.sand, COLOR.roseGold, COLOR.roseGoldDark), scale: 1.15, rotate: 8 },
    ],
  },
  {
    key: "skincare",
    angle: 115,
    stops: [
      { color: COLOR.ivory, offset: 0 },
      { color: COLOR.cream, offset: 60 },
      { color: COLOR.blush, offset: 100, opacity: 0.7 },
    ],
    bokeh: [
      { color: COLOR.sand, opacity: 0.3 },
      { color: COLOR.blushDeep, opacity: 0.12 },
    ],
    build: () => [
      { silhouette: dropperBottle(COLOR.warmWhite, COLOR.sand, COLOR.roseGoldDark, COLOR.roseGold), scale: 1.9, rotate: -2 },
    ],
  },
  {
    key: "haircare",
    angle: 100,
    stops: [
      { color: COLOR.cream, offset: 0 },
      { color: COLOR.sand, offset: 55 },
      { color: COLOR.blushDeep, offset: 100, opacity: 0.55 },
    ],
    bokeh: [
      { color: COLOR.roseGold, opacity: 0.16 },
      { color: COLOR.warmWhite, opacity: 0.3 },
    ],
    build: () => [
      { silhouette: pumpBottle(COLOR.warmWhite, COLOR.roseGoldDark, COLOR.ink, { wide: true }, COLOR.roseGold), scale: 1.55, rotate: 0 },
    ],
  },
  {
    key: "fragrance",
    angle: 145,
    stops: [
      { color: COLOR.blush, offset: 0 },
      { color: COLOR.blushDeep, offset: 60, opacity: 0.7 },
      { color: COLOR.ivory, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.roseGoldDark, opacity: 0.18 },
      { color: COLOR.warmWhite, opacity: 0.35 },
    ],
    build: () => [
      { silhouette: perfumeBottle(COLOR.warmWhite, COLOR.blushDeep, COLOR.roseGoldDark, COLOR.roseGold), scale: 1.65, rotate: 3 },
    ],
  },
  {
    key: "body-care",
    angle: 95,
    stops: [
      { color: COLOR.sand, offset: 0 },
      { color: COLOR.cream, offset: 55 },
      { color: COLOR.blush, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.blushDeep, opacity: 0.2 },
      { color: COLOR.roseGold, opacity: 0.1 },
    ],
    build: () => [
      { silhouette: pumpBottle(COLOR.blush, COLOR.warmWhite, COLOR.roseGoldDark, { wide: true }, COLOR.roseGoldDark), scale: 1.5, rotate: -4 },
    ],
  },
  {
    key: "tools",
    angle: 120,
    stops: [
      { color: COLOR.ivory, offset: 0 },
      { color: COLOR.sand, offset: 50 },
      { color: COLOR.cream, offset: 100 },
    ],
    bokeh: [
      { color: COLOR.blushDeep, opacity: 0.16 },
      { color: COLOR.roseGold, opacity: 0.12 },
    ],
    build: () => [
      { silhouette: facialRoller(COLOR.blush, COLOR.warmWhite, COLOR.roseGoldDark), scale: 1.4, rotate: 0 },
    ],
  },
];

async function genCategoryImage(cat: CategoryDef) {
  const w = 1000;
  const h = 1250;
  const defs: string[] = [];
  const body: string[] = [];
  const seed = `category-${cat.key}`;

  const bg = gradientBackground({
    w,
    h,
    angle: cat.angle,
    stops: cat.stops,
    bokeh: cat.bokeh,
    seed,
  });
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, seed, COLOR.roseGold, 4));

  const items = cat.build(seed);
  const baseFootY = h * 0.74;
  const spread = items.length > 1 ? w * 0.16 : 0;
  items.forEach((item, i) => {
    const cx = w / 2 + (i - (items.length - 1) / 2) * spread;
    const footY = baseFootY - (items.length > 1 && i === 0 ? 30 : 0);
    const sh = dropShadow(cx, footY + 10, 95 * item.scale * 0.6, 16 * item.scale * 0.6, COLOR.ink, 0.15);
    defs.push(sh.defs);
    body.push(sh.markup);
    defs.push(item.silhouette.defs);
    body.push(place(cx, footY, item.scale, item.rotate, item.silhouette));
  });

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "categories", `${cat.key}.jpg`));
}

// ---------------------------------------------------------------------------
// Product pool — 6 categories x 6 variants, studio-style
// ---------------------------------------------------------------------------

const ACCENTS = [COLOR.roseGold, COLOR.roseGoldDark, COLOR.blushDeep, COLOR.inkSoft, COLOR.roseGold, COLOR.blushDeep];

function studioBackdrop(w: number, h: number, seed: string, tone: "ivory" | "cream" | "warm") {
  const stopsMap: Record<string, { color: Hex; offset: number }[]> = {
    ivory: [
      { color: COLOR.warmWhite, offset: 0 },
      { color: COLOR.ivory, offset: 60 },
      { color: COLOR.sand, offset: 100 },
    ],
    cream: [
      { color: COLOR.ivory, offset: 0 },
      { color: COLOR.cream, offset: 55 },
      { color: COLOR.blush, offset: 100, opacity: 0.6 },
    ],
    warm: [
      { color: COLOR.warmWhite, offset: 0 },
      { color: COLOR.sand, offset: 50 },
      { color: COLOR.cream, offset: 100 },
    ],
  };
  return gradientBackground({
    w,
    h,
    angle: 100,
    stops: stopsMap[tone],
    bokeh: [{ color: COLOR.blush, opacity: 0.14 }],
    seed,
  });
}

function buildProductSilhouette(catKey: string, variant: number, accent: Hex): Silhouette {
  switch (catKey) {
    case "makeup":
      return variant % 2 === 0
        ? lipstickTube(COLOR.warmWhite, COLOR.blush, COLOR.roseGoldDark, accent)
        : compact(COLOR.warmWhite, COLOR.sand, COLOR.roseGold, accent);
    case "skincare":
      return variant % 3 === 0
        ? jar(COLOR.warmWhite, COLOR.cream, COLOR.roseGoldDark, accent)
        : dropperBottle(COLOR.warmWhite, COLOR.sand, COLOR.roseGoldDark, accent);
    case "haircare":
      return pumpBottle(COLOR.warmWhite, COLOR.sand, COLOR.ink, { wide: variant % 2 === 0 }, accent);
    case "fragrance":
      return perfumeBottle(COLOR.warmWhite, COLOR.blush, COLOR.roseGoldDark, accent);
    case "body-care":
      return variant % 3 === 0
        ? jar(COLOR.warmWhite, COLOR.blush, COLOR.roseGold, accent)
        : pumpBottle(COLOR.warmWhite, COLOR.blush, COLOR.roseGoldDark, { wide: true }, accent);
    case "tools":
      return variant % 2 === 0
        ? facialRoller(COLOR.blush, COLOR.warmWhite, COLOR.roseGoldDark)
        : makeupBrush(COLOR.roseGoldDark, COLOR.roseGold, COLOR.inkSoft);
    default:
      return dropperBottle(COLOR.warmWhite, COLOR.sand, COLOR.roseGoldDark, accent);
  }
}

async function genProductImage(catKey: string, variant: number) {
  const w = 1000;
  const h = 1250;
  const defs: string[] = [];
  const body: string[] = [];
  const seed = `product-${catKey}-${variant}`;

  const tones: ("ivory" | "cream" | "warm")[] = ["ivory", "cream", "warm"];
  const bg = studioBackdrop(w, h, seed, tones[variant % tones.length]);
  defs.push(bg.defs);
  body.push(bg.markup);

  body.push(decorativeAccents(w, h, seed, COLOR.roseGold, 2));

  const accent = ACCENTS[variant % ACCENTS.length];
  const rotate = [-6, -3, 0, 3, 6, -4][variant % 6];
  const scale = 1.55 + ((variant % 3) - 1) * 0.08;

  const cx = w / 2;
  const footY = h * 0.72;
  const sh = dropShadow(cx, footY + 12, 130, 22, COLOR.ink, 0.15);
  defs.push(sh.defs);
  body.push(sh.markup);

  const s = buildProductSilhouette(catKey, variant, accent);
  defs.push(s.defs);
  body.push(place(cx, footY, scale, rotate, s));

  const svg = svgDocument(w, h, defs, body);
  await renderJpeg(svg, path.join(OUT, "products", `${catKey}-${variant + 1}.jpg`));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  fs.mkdirSync(path.join(OUT, "hero"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "categories"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "products"), { recursive: true });

  console.log("Generating hero images...");
  await genHomeHero();
  await genPromoRitual();
  await genFeaturedCollection();
  await genAboutHero();

  console.log("Generating category images...");
  for (const cat of CATEGORIES) {
    await genCategoryImage(cat);
  }

  console.log("Generating product pool images...");
  for (const cat of CATEGORIES) {
    for (let v = 0; v < 6; v++) {
      await genProductImage(cat.key, v);
    }
  }

  console.log("Generating og-image...");
  await genOgImage();

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
