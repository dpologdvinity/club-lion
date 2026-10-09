import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const API_KEY = 'sk_iGC9y01USxkT3ZFBtdPSsCFBoIUh6ZCF';
const MODEL = 'google/gemini-3.1-flash-image';
const OUT_DIR = 'gallery/bases';

const SKIN_TONES = [
  {
    id: 'base-porcelain',
    name: 'Fair Porcelain',
    skinDesc: 'luminous fair pale porcelain skin with soft cool pink blush glow'
  },
  {
    id: 'base-warm-ivory',
    name: 'Warm Ivory',
    skinDesc: 'warm creamy ivory skin tone with soft peachy blush glow'
  },
  {
    id: 'base-golden-honey',
    name: 'Golden Honey',
    skinDesc: 'warm sun-kissed golden honey skin with bronze cheekbone highlight'
  },
  {
    id: 'base-warm-almond',
    name: 'Warm Almond',
    skinDesc: 'rich warm golden almond skin tone with radiant peachy-amber blush'
  },
  {
    id: 'base-mocha',
    name: 'Mocha Brown',
    skinDesc: 'deep warm mocha brown skin tone with luminous copper cheekbone glow'
  },
  {
    id: 'base-rich-cocoa',
    name: 'Rich Cocoa',
    skinDesc: 'rich deep warm cocoa dark skin tone with golden specular cheekbone highlight'
  },
  {
    id: 'base-midnight',
    name: 'Midnight Espresso',
    skinDesc: 'deep dark espresso midnight skin tone with radiant cool-toned glow'
  }
];

async function generateBase(tone) {
  const outFile = path.join(OUT_DIR, `${tone.id}.png`);
  if (fs.existsSync(outFile)) {
    console.log(`[SKIN] Already exists: ${tone.id}`);
    return;
  }

  const prompt = `2D digital fashion illustration of authentic early 2000s Bratz doll base bust template, centered front-facing, head with sleek bald skin-tone wig cap, ${tone.skinDesc}, signature Bratz face structure: dramatic feline almond cat eyes with heavy winged black liquid eyeliner and spidery doll lashes, tiny cute button nose with highlight dot, smooth bare skin on lower face with NO lips and NO mouth, smooth bare forehead with NO eyebrows, high cheekbones tapering to a petite rounded chin, bare slender neck, bare collarbones and shoulders, crisp black ink line art, authentic Bratz aesthetic, isolated on pure solid white background`;

  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?key=${API_KEY}&width=512&height=512&model=${MODEL}`;
  console.log(`[SKIN] Fetching ${tone.name}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${tone.id}: ${res.status} ${res.statusText}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const inputBuf = Buffer.from(arrayBuf);

  // Strip pure white background
  const img = sharp(inputBuf).resize(512, 512);
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 242 && g > 242 && b > 242) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toFile(outFile);

  console.log(`[SKIN] Saved transparent: ${outFile}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const tone of SKIN_TONES) {
    try {
      await generateBase(tone);
      await new Promise(r => setTimeout(r, 1500)); // Rate limit buffer
    } catch (e) {
      console.error(`[SKIN] Error generating ${tone.id}:`, e.message);
    }
  }
  console.log('[SKIN] Batch generation completed!');
}

main();
