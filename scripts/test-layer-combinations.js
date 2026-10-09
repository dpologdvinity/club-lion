import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const COMBOS = [
  {
    name: 'avatar-combo-butterfly-waves.png',
    title: 'Butterfly Waves Glam',
    layers: [
      { input: 'gallery/traits/transparent/hair/shiny-wavy-butterflies-back.png' },
      { input: 'gallery/bases/base-caramel.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-arched-dark-brown.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-chocolate-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/butterfly-halter-pink.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/shiny-wavy-butterflies-front.png' }
    ]
  },
  {
    name: 'avatar-combo-goth-bob.png',
    title: 'Sleek Goth Siren',
    layers: [
      { input: 'gallery/traits/transparent/hair/sleek-blunt-bob-back.png' },
      { input: 'gallery/bases/base-porcelain.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-arched-jet-black.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-vampire-plum-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/black-lace-corset.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/sleek-blunt-bob-front.png' }
    ]
  },
  {
    name: 'avatar-combo-honey-blowout.png',
    title: '90s Salon Blowout',
    layers: [
      { input: 'gallery/traits/transparent/hair/blowout-90s-caramel-back.png' },
      { input: 'gallery/bases/base-golden-honey.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-thin-90s-pencil.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-frosted-nude-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/fur-trim-jacket-pink.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/blowout-90s-caramel-front.png' }
    ]
  },
  {
    name: 'avatar-combo-cocoa-locs.png',
    title: 'Bronze Goddess Locs',
    layers: [
      { input: 'gallery/traits/transparent/hair/goddess-locs-bronze-back.png' },
      { input: 'gallery/bases/base-rich-cocoa.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-arched-jet-black.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-hot-pink-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/butterfly-halter-pink.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/goddess-locs-bronze-front.png' }
    ]
  },
  {
    name: 'avatar-combo-espresso-braids.png',
    title: 'Espresso Box Braids',
    layers: [
      { input: 'gallery/traits/transparent/hair/box-braids-espresso-back.png' },
      { input: 'gallery/bases/base-mocha.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-arched-dark-brown.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-cherry-red-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/black-lace-corset.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/box-braids-espresso-front.png' }
    ]
  },
  {
    name: 'avatar-combo-pink-spacebuns.png',
    title: 'Y2K Pink Space Buns',
    layers: [
      { input: 'gallery/traits/transparent/hair/space-buns-pink-back.png' },
      { input: 'gallery/bases/base-warm-ivory.png' },
      { input: 'gallery/traits/transparent/eyebrows/bratz-brows-bleached-platinum.png' },
      { input: 'gallery/traits/transparent/lips/bratz-lips-baby-pink-gloss.png' },
      { input: 'gallery/traits/transparent/clothes/fur-trim-jacket-pink.png' },
      { input: 'gallery/traits/transparent/jewelry/bamboo-hoops-gold-official.png' },
      { input: 'gallery/traits/transparent/hair/space-buns-pink-front.png' }
    ]
  }
];

async function compositeAll() {
  for (const combo of COMBOS) {
    const validLayers = [];
    for (const l of combo.layers) {
      if (fs.existsSync(l.input)) {
        const buf = await sharp(l.input).resize(512, 512).png().toBuffer();
        validLayers.push({
          input: buf,
          top: 0,
          left: 0
        });
      } else {
        console.warn(`Missing: ${l.input}`);
      }
    }

    const outPath = path.join('gallery', combo.name);
    const canvas = sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 24, g: 25, b: 34, alpha: 1 }
      }
    });

    await canvas.composite(validLayers).png().toFile(outPath);
    console.log(`Generated preview: ${outPath} (${combo.title})`);
  }
}

compositeAll().catch(console.error);
