import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const API_KEY = 'sk_iGC9y01USxkT3ZFBtdPSsCFBoIUh6ZCF';
const MODEL = 'google/gemini-3.1-flash-image';
const OUT_DIR = 'gallery/traits/transparent/hair';

const HAIRSTYLES = [
  {
    id: 'fulani-braids-gold',
    name: 'Fulani Braids (Gold Cuffs)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: micro Fulani braids with gold beads and cuffs, braided topknot bun with cascading thin braids framing the face, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny silky hair texture with luminous specular light ribbons, crisp black ink lines, isolated on pure solid white background'
  },
  {
    id: 'box-braids-espresso',
    name: 'Box Braids (Espresso & Gold)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: long neat box braids in rich dark espresso with shiny gold hair cuffs, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny silky texture with glowing specular highlights, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'afro-puffs-black',
    name: '4C Afro Puffs (Jet Black)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: twin high voluminous 4C afro puffs in jet black with slicked base, hollow interior cutout to fit over front-facing Bratz head template, silky textured sheen with glowing highlight flecks, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'blowout-90s-caramel',
    name: '90s Salon Blowout (Caramel)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: voluminous bouncy 90s supermodel blowout in rich caramel and espresso with flipped ends and face-framing curtain layers, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny glossy hair ribbons, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'snatched-high-pony',
    name: 'Snatched High Pony (Honey)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: snatched ultra-high sleek ponytail in honey brown with wrapped hair base and bouncy flipped ends, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny wet-look hair sheen, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'space-buns-pink',
    name: 'Y2K Space Buns (Pink)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: Y2K double space buns in bubblegum pink with loose face-framing wavy tendrils and sparkles, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny silky hair ribbons, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'sleek-blunt-bob',
    name: 'Blunt Bob (Glass Black)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: chic chin-length blunt bob in jet black with sleek angled cut and glass-hair shine ribbons, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny silky texture, crisp ink lines, isolated on pure solid white background'
  },
  {
    id: 'goddess-locs-bronze',
    name: 'Goddess Locs (Bronze Wraps)',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz hairstyle wig layer: bohemian goddess locs with wavy curly ends and bronze hair wire wraps in warm chestnut, hollow interior cutout to fit over front-facing Bratz head template, ultra-shiny texture, crisp ink lines, isolated on pure solid white background'
  }
];

async function generateHair(style) {
  const backFile = path.join(OUT_DIR, `${style.id}-back.png`);
  const frontFile = path.join(OUT_DIR, `${style.id}-front.png`);
  if (fs.existsSync(backFile) && fs.existsSync(frontFile)) {
    console.log(`[HAIR] Already exists: ${style.id}`);
    return;
  }

  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(style.prompt)}?key=${API_KEY}&width=512&height=512&model=${MODEL}`;
  console.log(`[HAIR] Fetching ${style.name}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${style.id}: ${res.status} ${res.statusText}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const inputBuf = Buffer.from(arrayBuf);

  // Strip white background
  const img = sharp(inputBuf).resize(512, 512);
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }

  // Split into 3-layer sandwich: Back and Front
  const backData = Buffer.from(data);
  const frontData = Buffer.from(data);

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const idx = (y * 512 + x) * 4;
      const alpha = data[idx + 3];
      if (alpha === 0) continue;

      // Center neck/chest curtain below chin level (y >= 350) belongs in back layer
      const isCenterBottom = (y >= 350 && x >= 180 && x <= 332);
      if (isCenterBottom) {
        frontData[idx + 3] = 0; // Cut from front
      } else {
        if (y < 240) {
          backData[idx + 3] = 0; // Top dome/bangs are only in front
        }
      }
    }
  }

  // Pre-shift by -18px vertically to align with base template
  const backBuf = await sharp(backData, { raw: { width: 512, height: 512, channels: 4 } }).png().toBuffer();
  const frontBuf = await sharp(frontData, { raw: { width: 512, height: 512, channels: 4 } }).png().toBuffer();

  const shiftedBack = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([{ input: backBuf, top: -18, left: 0 }]).png().toBuffer();

  const shiftedFront = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([{ input: frontBuf, top: -18, left: 0 }]).png().toBuffer();

  await sharp(shiftedBack).toFile(backFile);
  await sharp(shiftedFront).toFile(frontFile);

  console.log(`[HAIR] Saved sandwich layers: ${style.id}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const style of HAIRSTYLES) {
    try {
      await generateHair(style);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`[HAIR] Error generating ${style.id}:`, e.message);
    }
  }
  console.log('[HAIR] Batch generation completed!');
}

main();
