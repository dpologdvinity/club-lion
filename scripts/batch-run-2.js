import fs from "node:fs";
import path from "node:path";
import { generateTransparentTrait } from "./generate-traits.js";

const BATCH2 = [
  // --- HAIRSTYLES ---
  { cat: "hair", id: "knotless-braids-black", prompt: "isolated 2d game sprite wig layer: waist length knotless box braids jet black, hair only, no face, no head" },
  { cat: "hair", id: "knotless-braids-caramel", prompt: "isolated 2d game sprite wig layer: caramel brown ombre knotless braids, hair only, no face, no head" },
  { cat: "hair", id: "passion-twists-brown", prompt: "isolated 2d game sprite wig layer: voluminous bohemian passion twists dark brown, hair only, no face, no head" },
  { cat: "hair", id: "marley-twists-burgundy", prompt: "isolated 2d game sprite wig layer: textured marley twists deep wine burgundy, hair only, no face, no head" },
  { cat: "hair", id: "microlocs-jet-black", prompt: "isolated 2d game sprite wig layer: sleek microlocs cascading past shoulders jet black, hair only, no face, no head" },
  { cat: "hair", id: "bob-locs-platinum", prompt: "isolated 2d game sprite wig layer: chin-length faux locs bob platinum blonde, hair only, no face, no head" },
  { cat: "hair", id: "cornrows-straight-back", prompt: "isolated 2d game sprite wig layer: neat cornrows braided straight back jet black, hair only, no face, no head" },
  { cat: "hair", id: "cornrows-zigzag-cuffs", prompt: "isolated 2d game sprite wig layer: intricate geometric zigzag cornrows with gold cuffs, hair only, no face, no head" },
  { cat: "hair", id: "4c-high-top-fade", prompt: "isolated 2d game sprite wig layer: crisp shaped 4C high top fade haircut, hair only, no face, no head" },
  { cat: "hair", id: "afro-pick-crown-black", prompt: "isolated 2d game sprite wig layer: full round 4C afro crown with wooden pick tucked in, hair only, no face, no head" },
  { cat: "hair", id: "3b-ringlets-chestnut", prompt: "isolated 2d game sprite wig layer: cascading 3B ringlet curls chestnut brown, hair only, no face, no head" },
  { cat: "hair", id: "butterfly-cut-blonde", prompt: "isolated 2d game sprite wig layer: layered bouncy butterfly cut honey blonde, hair only, no face, no head" },
  { cat: "hair", id: "layered-flip-90s-black", prompt: "isolated 2d game sprite wig layer: 90s flicked flipped ends shoulder-length haircut jet black, hair only, no face, no head" },
  { cat: "hair", id: "crimped-mermaid-pink", prompt: "isolated 2d game sprite wig layer: extra long crimped y2k mermaid hair bubblegum pink, hair only, no face, no head" },
  { cat: "hair", id: "wet-waves-espresso", prompt: "isolated 2d game sprite wig layer: glossy wet look beach waves espresso brown, hair only, no face, no head" },
  { cat: "hair", id: "slick-high-bun-black", prompt: "isolated 2d game sprite wig layer: ultra sleek snatched top knot bun jet black, hair only, no face, no head" },
  { cat: "hair", id: "twin-pigtails-lavender", prompt: "isolated 2d game sprite wig layer: high twin pigtails with ribbons pastel lavender, hair only, no face, no head" },
  { cat: "hair", id: "side-part-bodywave-black", prompt: "isolated 2d game sprite wig layer: deep side part glamorous body wave hair jet black, hair only, no face, no head" },
  { cat: "hair", id: "textured-pixie-dark", prompt: "isolated 2d game sprite wig layer: choppy layered chic pixie cut dark brown, hair only, no face, no head" },

  // --- BANGS & EDGES ---
  { cat: "bangs", id: "wispy-korean-bangs", prompt: "isolated 2d game sprite layer: airy see-through wispy bangs fringe, bangs only, no face" },
  { cat: "bangs", id: "swoop-side-bang", prompt: "isolated 2d game sprite layer: dramatic y2k swooped side fringe bang covering one eyebrow, bangs only, no face" },
  { cat: "bangs", id: "baby-hair-heart-swirl", prompt: "isolated 2d game sprite layer: gelled baby hair edges styled into tiny heart swirls on forehead, edges only, no face" },

  // --- EYES ---
  { cat: "eyes", id: "doe-hazel-gold", prompt: "isolated 2d game sprite layer: pair of round doe eyes with hazel gold reflective irises, eyes only, no skin, no face" },
  { cat: "eyes", id: "siren-emerald-green", prompt: "isolated 2d game sprite layer: pair of sharp siren feline eyes with vivid emerald green irises, eyes only, no skin, no face" },
  { cat: "eyes", id: "almond-grey-silver", prompt: "isolated 2d game sprite layer: pair of almond doll eyes with luminous silver grey irises, eyes only, no skin, no face" },
  { cat: "eyes", id: "anime-gold-starburst", prompt: "isolated 2d game sprite layer: pair of big anime eyes with gold starburst catchlights, eyes only, no skin, no face" },
  { cat: "eyes", id: "half-lidded-amber", prompt: "isolated 2d game sprite layer: pair of sultry half-lidded bedroom eyes with warm amber irises, eyes only, no skin, no face" },

  // --- EYELINER ---
  { cat: "eyeliner", id: "double-wing-black", prompt: "isolated 2d game sprite layer: pair of sharp jet black double winged eyeliner flicks, liner only, no face, no skin" },
  { cat: "eyeliner", id: "fox-eye-inner-flick", prompt: "isolated 2d game sprite layer: pair of fox eye liner with sharp inner corner and elongated tail, liner only, no face, no skin" },
  { cat: "eyeliner", id: "smudged-grunge-kohl", prompt: "isolated 2d game sprite layer: pair of sultry smokey smudged grunge black kohl eyeliner, liner only, no face, no skin" },

  // --- EYESHADOW ---
  { cat: "eyeshadow", id: "bronze-nude-shimmer", prompt: "isolated 2d game sprite layer: pair of warm bronze champagne shimmer blended eyeshadow, makeup only, no face, no skin" },
  { cat: "eyeshadow", id: "holographic-glitter-silver", prompt: "isolated 2d game sprite layer: pair of high-sparkle holographic silver glitter lid eyeshadow, makeup only, no face, no skin" },
  { cat: "eyeshadow", id: "icy-blue-frosted-y2k", prompt: "isolated 2d game sprite layer: pair of 2000s frosted baby blue shimmer eyeshadow, makeup only, no face, no skin" },
  { cat: "eyeshadow", id: "velvet-burgundy-cutcrease", prompt: "isolated 2d game sprite layer: pair of sharp velvet burgundy wine cut crease eyeshadow, makeup only, no face, no skin" },

  // --- LIPS ---
  { cat: "lips", id: "juicy-cherry-red-gloss", prompt: "isolated 2d game sprite layer: pair of glossy juicy candied cherry red high-shine lips, lips only, no face" },
  { cat: "lips", id: "frosted-pink-pearl-y2k", prompt: "isolated 2d game sprite layer: pair of 90s frosted baby pink pearlescent shimmer lips, lips only, no face" },
  { cat: "lips", id: "deep-chocolate-matte", prompt: "isolated 2d game sprite layer: pair of rich dark chocolate brown velvet matte lips, lips only, no face" },
  { cat: "lips", id: "peach-nectar-glass-gloss", prompt: "isolated 2d game sprite layer: pair of sheer peach nectar glass lipgloss lips, lips only, no face" },

  // --- BLUSH & FRECKLES ---
  { cat: "blush", id: "high-cheekbone-bronzer", prompt: "isolated 2d game sprite layer: sculpted warm golden bronze high cheekbone contour blush pair, blush only, no face" },
  { cat: "blush", id: "cold-girl-pink-nose", prompt: "isolated 2d game sprite layer: frosty cold-girl baby pink cheek and tip of nose blush, blush only, no face" },
  { cat: "freckles", id: "gold-foil-freckles", prompt: "isolated 2d game sprite layer: shimmering gold foil dust cheek freckles, freckles only, no face" },
  { cat: "freckles", id: "marilyn-cheek-mole", prompt: "isolated 2d game sprite layer: classic dark Marilyn beauty mark on upper left cheek, mark only, no face" },

  // --- PIERCINGS ---
  { cat: "piercings", id: "nostril-hoop-silver", prompt: "isolated 2d game sprite layer: delicate silver nostril ring hoop, jewelry only, no face" },
  { cat: "piercings", id: "medusa-philtrum-diamond", prompt: "isolated 2d game sprite layer: sparkling diamond stud medusa philtrum piercing above lip, jewelry only, no face" },
  { cat: "piercings", id: "vertical-labret-spike", prompt: "isolated 2d game sprite layer: silver vertical labret curved barbell with spike, jewelry only, no face" },
  { cat: "piercings", id: "bridge-piercing-silver", prompt: "isolated 2d game sprite layer: silver barbell bridge piercing between eyes, jewelry only, no face" },
  { cat: "piercings", id: "dimple-piercings-pair", prompt: "isolated 2d game sprite layer: pair of silver crystal cheek dimple studs, jewelry only, no face" },

  // --- JEWELRY ---
  { cat: "jewelry", id: "chunky-twisted-gold-hoops", prompt: "isolated 2d game sprite layer: pair of thick twisted chunky gold croissant hoop earrings, earrings only, no face" },
  { cat: "jewelry", id: "iced-out-cuban-choker", prompt: "isolated 2d game sprite layer: iced-out diamond pave Cuban curb chain choker necklace, necklace only, no body" },
  { cat: "jewelry", id: "cross-pendant-necklace-gold", prompt: "isolated 2d game sprite layer: thin gold rope chain with ornate sparkling cross pendant, necklace only, no body" },
  { cat: "jewelry", id: "pearl-choker-vintage", prompt: "isolated 2d game sprite layer: triple strand vintage white pearl choker with orb pendant, necklace only, no body" },
  { cat: "jewelry", id: "goth-spiked-collar-black", prompt: "isolated 2d game sprite layer: black leather choker collar with silver cone spikes and O-ring, jewelry only, no body" },

  // --- CLOTHES ---
  { cat: "clothes", id: "baby-tee-angel-graphic", prompt: "isolated 2d game sprite layer: cropped white baby tee with glitter pink Angel graphic, clothing only, no body" },
  { cat: "clothes", id: "halter-chain-top-silver", prompt: "isolated 2d game sprite layer: backless metallic silver chainmail cowl halter top, clothing only, no body" },
  { cat: "clothes", id: "bandeau-tube-top-white", prompt: "isolated 2d game sprite layer: strapless ruched white cotton bandeau tube top, clothing only, no body" },
  { cat: "clothes", id: "low-rise-flare-jeans", prompt: "isolated 2d game sprite layer: low-rise vintage faded wash flare bell bottom denim jeans, clothing only, no body" },
  { cat: "clothes", id: "pleated-tennis-skirt-black", prompt: "isolated 2d game sprite layer: high-waisted black micro pleated tennis mini skirt, clothing only, no body" },
  { cat: "clothes", id: "fur-collar-cardigan-pink", prompt: "isolated 2d game sprite layer: cropped pastel pink button-up knit cardigan with faux fur collar, clothing only, no body" },
  { cat: "clothes", id: "slip-dress-leopard-satin", prompt: "isolated 2d game sprite layer: slinky leopard print satin cowl neck mini slip dress with lace trim, clothing only, no body" },

  // --- SHOES ---
  { cat: "shoes", id: "thigh-high-heeled-boots", prompt: "isolated 2d game sprite layer: pair of black stretch patent leather thigh-high stiletto boots, shoes only, no legs" },
  { cat: "shoes", id: "combat-boots-platform", prompt: "isolated 2d game sprite layer: pair of chunky black lug-sole lace-up combat boots with buckle straps, shoes only, no legs" },
  { cat: "shoes", id: "strappy-heels-silver", prompt: "isolated 2d game sprite layer: pair of metallic silver lace-up square-toe stiletto heels, shoes only, no legs" },
  { cat: "shoes", id: "furry-boots-y2k-white", prompt: "isolated 2d game sprite layer: pair of fluffy white faux fur knee-high yeti rave boots, shoes only, no legs" },
  { cat: "shoes", id: "chunky-loafers-platform", prompt: "isolated 2d game sprite layer: pair of chunky black platform penny loafers with gold horsebit buckle, shoes only, no legs" }
];

async function runQueue(concurrency = 4) {
  console.log(`Starting Batch 2: ${BATCH2.length} modular transparent traits (Concurrency: ${concurrency})...`);
  let index = 0;
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    function next() {
      if (completed === BATCH2.length) {
        console.log(`All Batch 2 (${BATCH2.length}) traits generated successfully!`);
        resolve();
        return;
      }

      while (active < concurrency && index < BATCH2.length) {
        const item = BATCH2[index++];
        active++;
        const outPath = path.join("gallery/traits/transparent", item.cat, `${item.id}.png`);

        generateTransparentTrait(item.prompt, outPath)
          .then(() => {
            completed++;
            active--;
            next();
          })
          .catch((err) => {
            console.error(`Error generating ${item.id}:`, err.message);
            completed++;
            active--;
            next();
          });
      }
    }

    next();
  });
}

runQueue(4);
