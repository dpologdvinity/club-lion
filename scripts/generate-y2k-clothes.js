import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const API_KEY = 'sk_iGC9y01USxkT3ZFBtdPSsCFBoIUh6ZCF';
const MODEL = 'google/gemini-3.1-flash-image';
const OUT_DIR = 'gallery/traits/transparent/clothes';

const CLOTHES = [
  {
    id: 'butterfly-halter-pink',
    name: 'Pink Metallic Butterfly Halter',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz clothing asset: shiny metallic lavender-pink holographic sequin butterfly halter top with thin tie-strings, centered front-facing bust crop, hollow interior for face and neck to fit over front-facing Bratz doll template, crisp black ink line art, isolated on pure solid white background'
  },
  {
    id: 'black-lace-corset',
    name: 'Black Satin Lace Corset',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz clothing asset: black satin lace-up corset bustier top with silver eyelets and sweetheart neckline, centered front-facing bust crop, hollow interior for face and neck to fit over front-facing Bratz doll template, crisp black ink line art, isolated on pure solid white background'
  },
  {
    id: 'fur-trim-jacket-pink',
    name: 'Pink Faux Fur Cropped Jacket',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz clothing asset: baby pink fluffy faux-fur collar cropped jacket over black fitted top with silver cross charm, centered front-facing bust crop, hollow interior for face and neck to fit over front-facing Bratz doll template, crisp black ink line art, isolated on pure solid white background'
  },
  {
    id: 'rhinestone-baby-tee',
    name: 'White Rhinestone Baby Tee',
    prompt: '2D digital fashion illustration of authentic early 2000s Bratz clothing asset: tight white cropped baby tee with glittering pink rhinestone script graphic and cap sleeves, centered front-facing bust crop, hollow interior for face and neck to fit over front-facing Bratz doll template, crisp black ink line art, isolated on pure solid white background'
  }
];

async function generateTop(item) {
  const outFile = path.join(OUT_DIR, `${item.id}.png`);
  if (fs.existsSync(outFile)) {
    console.log(`[CLOTHES] Already exists: ${item.id}`);
    return;
  }

  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(item.prompt)}?key=${API_KEY}&width=512&height=512&model=${MODEL}`;
  console.log(`[CLOTHES] Fetching ${item.name}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${item.id}: ${res.status} ${res.statusText}`);
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

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toFile(outFile);

  console.log(`[CLOTHES] Saved: ${outFile}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const item of CLOTHES) {
    try {
      await generateTop(item);
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`[CLOTHES] Error generating ${item.id}:`, e.message);
    }
  }
  console.log('[CLOTHES] Batch generation completed!');
}

main();
