import fs from "node:fs";
import path from "node:path";
import { generateTransparentTrait } from "./generate-traits.js";

const TRAITS = [
  // --- HAIRSTYLES ---
  { cat: "hair", id: "fulani-braids-black", prompt: "isolated 2d game sprite wig layer: black fulani braids with wooden beads and cowrie shells, hair only, no face, no head" },
  { cat: "hair", id: "fulani-braids-blonde", prompt: "isolated 2d game sprite wig layer: honey blonde fulani braids with gold beads, hair only, no face, no head" },
  { cat: "hair", id: "goddess-locs-dark", prompt: "isolated 2d game sprite wig layer: dark brown long goddess locs with wavy tendrils, hair only, no face, no head" },
  { cat: "hair", id: "goddess-locs-copper", prompt: "isolated 2d game sprite wig layer: copper auburn goddess locs with curly ends, hair only, no face, no head" },
  { cat: "hair", id: "afro-puffs-black", prompt: "isolated 2d game sprite wig layer: twin voluminous 4C afro puffs with curly edges, hair only, no face, no head" },
  { cat: "hair", id: "afro-tapered-fade", prompt: "isolated 2d game sprite wig layer: defined 4C curly tapered afro cut with razor fade, hair only, no face, no head" },
  { cat: "hair", id: "space-buns-pink", prompt: "isolated 2d game sprite wig layer: pastel pink twin space buns with face-framing strands, hair only, no face, no head" },
  { cat: "hair", id: "blowout-90s-espresso", prompt: "isolated 2d game sprite wig layer: 90s voluminous layered salon blowout espresso brown, hair only, no face, no head" },
  { cat: "hair", id: "sleek-bob-jet-black", prompt: "isolated 2d game sprite wig layer: razor blunt chin-length sleek jet black bob, hair only, no face, no head" },
  { cat: "hair", id: "high-ponytail-blonde", prompt: "isolated 2d game sprite wig layer: sleek snatched high ponytail platinum blonde, hair only, no face, no head" },
  { cat: "hair", id: "bantu-knots-dark", prompt: "isolated 2d game sprite wig layer: neat geometric bantu knots with laid swirl baby hair edges, hair only, no face, no head" },
  { cat: "hair", id: "3c-curls-honey", prompt: "isolated 2d game sprite wig layer: bouncy defined 3C spiral curls in warm honey highlights, hair only, no face, no head" },
  { cat: "hair", id: "wolf-cut-goth-black", prompt: "isolated 2d game sprite wig layer: textured shaggy wolf cut with choppy layers jet black, hair only, no face, no head" },
  { cat: "hair", id: "box-braids-jumbo-burgundy", prompt: "isolated 2d game sprite wig layer: jumbo square parts box braids deep burgundy wine, hair only, no face, no head" },
  { cat: "hair", id: "finger-waves-platinum", prompt: "isolated 2d game sprite wig layer: sleek sculpted 1920s finger waves platinum blonde, hair only, no face, no head" },

  // --- BANGS & EDGES ---
  { cat: "bangs", id: "curtain-bangs-soft", prompt: "isolated 2d game sprite layer: wispy curtain fringe bangs framing cheekbones, bangs only, no face" },
  { cat: "bangs", id: "micro-bangs-blunt", prompt: "isolated 2d game sprite layer: edgy straight micro blunt baby bangs, fringe only, no face" },
  { cat: "bangs", id: "laid-edges-swirls", prompt: "isolated 2d game sprite layer: intricate swooped baby hair edges art with swooped sideburn curls, edges only, no face" },

  // --- EYES ---
  { cat: "eyes", id: "almond-amber-gold", prompt: "isolated 2d game sprite layer: pair of expressive almond doll eyes with glossy amber gold irises and catchlights, eyes only, no skin, no face" },
  { cat: "eyes", id: "siren-ice-blue", prompt: "isolated 2d game sprite layer: pair of sharp siren feline eyes with icy blue irises and bright highlights, eyes only, no skin, no face" },
  { cat: "eyes", id: "doe-deep-brown", prompt: "isolated 2d game sprite layer: pair of large round doe eyes with glossy deep chocolate brown irises, eyes only, no skin, no face" },
  { cat: "eyes", id: "anime-violet-sparkle", prompt: "isolated 2d game sprite layer: pair of anime star catchlight eyes with violet purple irises, eyes only, no skin, no face" },
  { cat: "eyes", id: "cat-hazel-green", prompt: "isolated 2d game sprite layer: pair of cat-eye shape glossy hazel green irises with delicate black ring, eyes only, no skin, no face" },

  // --- EYELINER ---
  { cat: "eyeliner", id: "bold-cat-wing", prompt: "isolated 2d game sprite layer: pair of dramatic thick jet black winged cat eyeliner flicks, liner only, no face, no skin" },
  { cat: "eyeliner", id: "siren-inner-corner", prompt: "isolated 2d game sprite layer: sharp inner corner siren eyeliner with elongated outer wings, liner only, no face, no skin" },
  { cat: "eyeliner", id: "graphic-white-double", prompt: "isolated 2d game sprite layer: futuristic graphic white double wing floating liner, liner only, no face, no skin" },

  // --- EYESHADOW ---
  { cat: "eyeshadow", id: "smokey-charcoal", prompt: "isolated 2d game sprite layer: sultry blended charcoal black smokey eyeshadow pair, makeup only, no face, no skin" },
  { cat: "eyeshadow", id: "frosted-pink-y2k", prompt: "isolated 2d game sprite layer: 2000s frosted baby pink shimmer eyeshadow with silver brow bone highlight, makeup only, no face, no skin" },
  { cat: "eyeshadow", id: "sunset-gold-glitter", prompt: "isolated 2d game sprite layer: warm sunset peach and chunky gold glitter cut crease eyeshadow, makeup only, no face, no skin" },

  // --- LIPS ---
  { cat: "lips", id: "ombre-brown-nude-gloss", prompt: "isolated 2d game sprite layer: 90s brown lip liner with ultra-glossy clear nude center ombre lips, lips only, no face" },
  { cat: "lips", id: "hot-pink-diva-gloss", prompt: "isolated 2d game sprite layer: bright hot pink plump glossy high-shine lips, lips only, no face" },
  { cat: "lips", id: "cherry-red-matte", prompt: "isolated 2d game sprite layer: bold velvety dark cherry red matte lips, lips only, no face" },
  { cat: "lips", id: "vampire-plum-goth", prompt: "isolated 2d game sprite layer: deep black-plum gothic gradient lips with glossy finish, lips only, no face" },
  { cat: "lips", id: "frosted-bronze-90s", prompt: "isolated 2d game sprite layer: 90s frosted bronze metallic shimmer lipstick, lips only, no face" },

  // --- BLUSH & FRECKLES ---
  { cat: "blush", id: "doll-pink-apples", prompt: "isolated 2d game sprite layer: soft glowing doll apple-cheek baby pink blush pair, blush only, no face" },
  { cat: "blush", id: "sunkissed-terracotta", prompt: "isolated 2d game sprite layer: sun-drenched warm terracotta nose and cheek bridge blush, blush only, no face" },
  { cat: "freckles", id: "star-constellation-gold", prompt: "isolated 2d game sprite layer: tiny gold glitter star constellation cheek freckles, freckles only, no face" },
  { cat: "freckles", id: "natural-nose-freckles", prompt: "isolated 2d game sprite layer: delicate natural dusting of cheek and nose bridge freckles, freckles only, no face" },

  // --- PIERCINGS ---
  { cat: "piercings", id: "gold-nose-stud-double", prompt: "isolated 2d game sprite layer: tiny gold crystal nose stud and thin gold nostril hoop, jewelry only, no face" },
  { cat: "piercings", id: "septum-horseshoe-gold", prompt: "isolated 2d game sprite layer: chunky gold spiked horseshoe septum ring, jewelry only, no face" },
  { cat: "piercings", id: "eyebrow-barbell-silver", prompt: "isolated 2d game sprite layer: silver curved eyebrow piercing barbell with spike ends, jewelry only, no face" },
  { cat: "piercings", id: "lip-snake-bites", prompt: "isolated 2d game sprite layer: pair of silver lower lip snake bite labret rings, jewelry only, no face" },

  // --- JEWELRY ---
  { cat: "jewelry", id: "bamboo-hoops-gold", prompt: "isolated 2d game sprite layer: pair of oversized 90s golden bamboo hoop earrings, earrings only, no face" },
  { cat: "jewelry", id: "layered-cuban-chains", prompt: "isolated 2d game sprite layer: triple layered chunky gold Cuban link chains with lock pendant, necklace only, no body" },
  { cat: "jewelry", id: "diamond-tennis-choker", prompt: "isolated 2d game sprite layer: sparkling iced diamond tennis choker necklace, necklace only, no body" },
  { cat: "jewelry", id: "butterfly-belly-chain", prompt: "isolated 2d game sprite layer: delicate gold waist belly chain with hanging butterfly charms, jewelry only, no body" },

  // --- CLOTHES ---
  { cat: "clothes", id: "butterfly-top-pink", prompt: "isolated 2d game sprite layer: y2k iridescent pink sequin halter butterfly crop top, clothing only, no body" },
  { cat: "clothes", id: "corset-leather-black", prompt: "isolated 2d game sprite layer: lace-up black faux leather bustier corset top, clothing only, no body" },
  { cat: "clothes", id: "cargo-skirt-camo", prompt: "isolated 2d game sprite layer: low-rise utility pleated cargo mini skirt with buckle belt, clothing only, no body" },
  { cat: "clothes", id: "fur-trim-jacket-denim", prompt: "isolated 2d game sprite layer: cropped denim jacket with fluffy white faux fur collar and cuffs, clothing only, no body" },

  // --- SHOES ---
  { cat: "shoes", id: "platform-boots-black", prompt: "isolated 2d game sprite layer: pair of sky-high black patent leather platform knee-high chunky boots, shoes only, no legs" },
  { cat: "shoes", id: "strappy-stiletto-gold", prompt: "isolated 2d game sprite layer: pair of gold metallic lace-up strappy stiletto heels, shoes only, no legs" },
  { cat: "shoes", id: "chunky-sneakers-pink", prompt: "isolated 2d game sprite layer: pair of chunky 2000s dad platform sneakers white and bubblegum pink, shoes only, no legs" }
];

async function runQueue(concurrency = 4) {
  console.log(`Starting generation of ${TRAITS.length} modular transparent traits (Concurrency: ${concurrency})...`);
  let index = 0;
  let active = 0;
  let completed = 0;

  return new Promise((resolve) => {
    function next() {
      if (completed === TRAITS.length) {
        console.log(`All ${TRAITS.length} traits generated successfully!`);
        resolve();
        return;
      }

      while (active < concurrency && index < TRAITS.length) {
        const item = TRAITS[index++];
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
