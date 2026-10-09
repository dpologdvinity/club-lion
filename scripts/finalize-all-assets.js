import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const HAIR_STYLES = [
  'shiny-wavy-butterflies',
  'sleek-blunt-bob',
  'space-buns-pink',
  'blowout-90s-caramel',
  'fulani-braids-gold',
  'box-braids-espresso',
  'afro-puffs-black',
  'goddess-locs-bronze',
  'snatched-high-pony'
];

const BASES = [
  'template-bratz-blank-base.png',
  'bases/base-porcelain.png',
  'bases/base-warm-ivory.png',
  'bases/base-golden-honey.png',
  'bases/base-caramel.png',
  'bases/base-warm-almond.png',
  'bases/base-mocha.png',
  'bases/base-rich-cocoa.png',
  'bases/base-midnight.png'
];

async function finalizeBases() {
  console.log('[FINALIZE] Refining skull dome on bases...');
  for (const b of BASES) {
    const fullPath = path.join('gallery', b);
    if (!fs.existsSync(fullPath)) continue;
    
    const { data, info } = await sharp(fullPath).raw().toBuffer({ resolveWithObject: true });
    // Mask extra alien-tall dome above y=80
    for (let y = 0; y < 80; y++) {
      for (let x = 0; x < 512; x++) {
        data[(y * 512 + x) * 4 + 3] = 0;
      }
    }
    // Soft anti-aliased edge at y=80-82
    for (let y = 80; y <= 82; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        if (data[idx + 3] > 0) {
          data[idx + 3] = Math.round(data[idx + 3] * ((y - 79) / 3));
        }
      }
    }
    
    await sharp(data, { raw: { width: 512, height: 512, channels: 4 } }).png().toFile(fullPath);
    console.log(`[FINALIZE] Refined: ${b}`);
  }
}

async function finalizeHairstyles() {
  console.log('[FINALIZE] Cleaning front hair face/neck openings...');
  for (const id of HAIR_STYLES) {
    const frontPath = path.join('gallery/traits/transparent/hair', `${id}-front.png`);
    if (!fs.existsSync(frontPath)) continue;
    
    const { data, info } = await sharp(frontPath).raw().toBuffer({ resolveWithObject: true });
    
    // Clear face opening (lips, chin, neck) from front layer
    // x: 175 to 337, y: 235 to 440
    // Only if not sleek-blunt-bob (which already had natural side parting)
    if (id !== 'sleek-blunt-bob') {
      for (let y = 235; y <= 440; y++) {
        for (let x = 175; x <= 337; x++) {
          const idx = (y * 512 + x) * 4;
          data[idx + 3] = 0;
        }
      }
    }
    
    await sharp(data, { raw: { width: 512, height: 512, channels: 4 } }).png().toFile(frontPath);
    console.log(`[FINALIZE] Cleaned front hair: ${id}`);
  }
}

async function main() {
  await finalizeBases();
  await finalizeHairstyles();
  console.log('[FINALIZE] All base templates and hairstyles finalized!');
}

main().catch(console.error);
