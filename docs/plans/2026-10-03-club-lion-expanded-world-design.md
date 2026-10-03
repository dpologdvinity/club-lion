# Club Lion: Golden Era (Fantage × Club Penguin Reimagined)
## System Design Specification

* **Date:** 2026-10-03
* **Status:** Draft / Ready for Review
* **Target Audience:** Young Adults & Older Teens (Ages 16–25+)
* **Core Inspiration:** Fantage (2008–2018) × Club Penguin (2005–2017)
* **Architecture:** Multiplayer-Ready Client Entity Architecture (Local-First Single Player evolving to Multi-Server Rooms)

---

## 1. Executive Summary & Vision

Club Lion is reimagined from a small single-village browser demo into a massive, nostalgic virtual world that channels the golden era of browser MMOs (Fantage and Club Penguin) for an older teen and young adult audience.

### Core Pillars
1. **Fantage-Style 2D Chibi Avatars:** Players design custom humanoid avatars with skin tones, expressive anime eyes, trendy streetwear/fashion, layered hairstyles, and equipable boards/skates with sparkling particle footprint trails.
2. **Lions as Companion Pets (Puffle / Familiar DNA):** Lions are loyal companion pets that follow your avatar with smooth trailing physics, wear pet accessories (bandanas, collars, bows), react to player emotes, sleep in your condo, and can be groomed and fed.
3. **Massive Multi-District World:** A sprawling world map featuring bustling downtown shopping, quiet savanna reserves, beach boardwalks, snowy peaks, secret spy bunkers, a **Mega Theme Park** with interactive and spectator rides, and a **Mega Waterpark** with slides, lazy rivers, and wave pools.
4. **Authentic Distributed Mini-Games:** A diverse balance of relaxing cozy games (Pizzatron-style Smoothie Kitchen, dock fishing, constellation connecting, pet care) and challenging high-skill games (river stunt surfing, typing fashion blitz, obstacle downhill racing, precision trick-shots).
5. **Rich Nostalgic Culture:** Secret catalog clickables, Top Models runway catwalk showdown, Fantage-style ID cards with star ranks, Web Audio procedural Jukebox tracks, interactive mango tossing, and a 25+ stamp collection book.
6. **Multiplayer-Ready Architecture:** Designed around serializable entity packets and room event managers, allowing seamless transition from Phase 1 local play to a multi-server MMO backend.

### 1.1 Thematic Philosophy: "Tasteful Heritage, Not a Monoculture"
Rather than forcing an in-your-face cartoon lion theme where every building and item is lion-shaped, the world treats lions with subtlety, sophistication, and emotional charm:
* **The Living Bond:** Lions are the island's cherished companion familiars. They are not citizens or humanoid NPCs—they are the player's beloved pets that trot beside them, ride in coaster carts and lazy river tubes, and curl up in their condo.
* **Selective Natural Habitats:** Lions have dedicated, authentic spaces—such as the **Savanna Wildlife Sanctuary** (where wild lion cubs roam and nap under baobab trees) and the **Pet Paradise & Nursery** (grooming baths and agility runs).
* **Subtle, Non-Obvious Lion Touches Sprinkled Across the World:**
  * *Classical Architecture:* An ornate classical marble lion fountain in Downtown Plaza; antique brass lion-head door knockers on the Le Shop boutique; carved stone lion-paw armrests on coastal boardwalk benches.
  * *High Fashion & Brand Motifs:* Sneaker soles and denim tags from Le Shop feature an embossed subtle lion paw print; Top Models Runway trophy ribbons are stamped with a small gilded lion emblem.
  * *Café Culture:* Baristas at Canopy Café pour subtle lion silhouette latte art in warm drinks; the bakery serves "Golden Mane" flaky honey pastries.
  * *Amusement Park Details:* The Grand Carousel features a single majestic hand-carved gilded lion mount among the traditional horses and zebras; the roller coaster train features a sleek art-deco chrome lion prow on the front car.
  * *Cosmic & Secret Lore:* The primary constellation in the observatory night sky is *Leo the Star Lion*; the Secret Scout Agency operates under the classified codename *The Pride*.

---

## 2. Character, Avatar & Pet Companion Engine

### 2.1 The Chibi Avatar System (`Avatar.tsx`)
Player avatars are rendered using crisp vector SVG layers, allowing scalable resolution, sharp presentation on Retina/HiDPI screens, and instant CSS color tinting:

```
[Layer 0] - Shadow & Particle Emitter (sparkle trails when riding boards)
[Layer 1] - Hair (Back Layer: ponytails, long flow, capes)
[Layer 2] - Body Base (Skin tones: fair, tan, warm, espresso, bronze)
[Layer 3] - Expressive Anime Face (Eyes: sparkle anime, wink, sleepy, cool smirk)
[Layer 4] - Footwear (High-tops, canvas sneakers, skate shoes, flip-flops, boots)
[Layer 5] - Outfit (Layered: hoodies, denim jackets, cargo pants, skirts, dresses)
[Layer 6] - Hair (Front Layer: bangs, anime spikes, curls, highlight streaks)
[Layer 7] - Headwear & Face Accessories (Bucket hats, beanies, sunglasses, flower crowns)
[Layer 8] - Handheld Item (Mango smoothie cup, sparkler, fishing rod, ice cream)
```

### 2.2 Pet Companion Engine (`PetCompanion.tsx`)
* **Trailing Physics:** Pets do not teleport. A spring-damper trailing algorithm tracks the player avatar’s position path:
  $$\vec{P}_{pet}(t + \Delta t) = \vec{P}_{pet}(t) + (\vec{P}_{target} - \vec{P}_{pet}(t)) \cdot k_{follow} \cdot \Delta t$$
  Where $\vec{P}_{target}$ maintains a normalized offset behind the avatar's movement vector.
* **Pet States:** `trot` (bounding animation when moving), `idle_sit` (sitting and tail wagging when stationary), `happy_bounce` (jumping with heart particles during emotes), `sleep` (cozy curled up in condo pet bed).
* **Pet Customization:** Color coats (*Gold*, *Sand*, *Copper*, *Rose*), and equipable items (*Red Bandana*, *Golden Bell Collar*, *Daisy Wreath*, *Explorer Scarf*).

### 2.3 Locomotion, Boards & Sparkle Trails (`BoardSystem.tsx`)
* Avatars can equip rideables: **Hover-Leaf**, **Savanna Skateboard**, and **Roller Skates**.
* Equipping a board boosts walk velocity by +35% and switches the avatar into a dynamic gliding pose.
* An integrated particle system drops multi-colored star/glitter particles along the avatar's ground path that scale and fade over 600ms.

### 2.4 Actions, Emotes & Mango Tossing (`WorldActions.tsx`)
* **Toss Mango / Water Balloon:** Clicking the action reticle allows tossing a projectile anywhere on screen. It follows a parabolic ballistic trajectory, splashing on impact with audio effects and triggering environmental secrets if hitting special targets.
* **Emotes & Dances:** Waving, sitting, savanna groove dance, sipping drinks, and expressing mood flairs.

### 2.5 Standardized "Paper-Doll" Layer & Anchor Matrix
To prevent clothing clipping, floating accessories, and alignment bugs across 50+ fashion items:
* Every SVG asset adheres to a universal **120×160px coordinate canvas** with fixed anchor origins:
  * `Anchor_HeadCenter`: `(60, 38)` (Hair front/back, hats, glasses rotate and pin here).
  * `Anchor_Neck`: `(60, 68)` (Scarves, collars, necklaces).
  * `Anchor_Waist`: `(60, 98)` (Belts, skirts, pant waistbands).
  * `Anchor_HandRight`: `(32, 92)` (Handheld smoothies, sparklers, fishing rods).
  * `Anchor_Feet`: `(60, 142)` (Sneakers, roller skates, board attachment point).
* Layer ordering strictly guarantees hair flows naturally over hoodies, hats clip cleanly above bangs, and footwear anchors onto hoverboards.

### 2.6 The Quick-Chat & Emote Action Wheel (`ActionWheel.tsx`)
An iconic pop-up radial wheel for instant, touch-friendly, safe social communication:
* **Emote Hub:** Instant expressive reaction bubbles (Floating Hearts `♡`, Starlight Sparkles `★`, Laughing Tears, Shocked Eyes, Sleeping Zzz).
* **Action Shortcuts:** Instant one-tap triggers for *Dance*, *Wave*, *Sit*, *Jam*, and *Toss Mango*.
* **Quick-Phrases:** Classic curated phrases formatted for fast mobile chatting:
  * *"Meet me at the café!"*
  * *"Let's ride the roller coaster!"*
  * *"Waterpark race!"*
  * *"Love your outfit!"*
  * *"Check out my den!"*
  * *"AFK getting a smoothie 🥭"*

---

## 3. The Grand World Map & Districts

### 3.1 Panoramic Camera Scrolling & Viewport Engine (`CameraViewport.tsx`)
To accommodate sprawling environments like multi-ride theme parks, waterparks, and long beachfronts without cramping assets:
* **Dynamic Panoramic Stages:** Rooms can range from standard single-screen (1280px) up to wide panoramic canvases (1920px–2880px).
* **Smooth Camera Following:** As the player avatar walks left or right, a cinematic virtual camera smoothly interpolates (`lerp`) to center on the avatar, bounded smoothly by the room's edges:
  $$X_{cam}(t + \Delta t) = X_{cam}(t) + (X_{target} - X_{cam}(t)) \cdot 0.12$$
  * Edge damping ensures the camera never scrolls into black borders.
  * Avatars and pets feel like they are exploring a true, expansive geographic space.

### 3.2 Declarative Modular Room Manifest Architecture (`src/rooms/types.ts`)
Instead of hardcoding room logic inside monolithic React components, rooms are defined as declarative data manifests:
```typescript
export type RoomManifest = {
  id: string;                      // e.g. "theme_park_midway"
  name: string;                    // "Wonder Park Midway"
  district: string;                // "wonder_park"
  stageWidth: number;              // e.g. 2400 (scrolling width)
  stageHeight: number;             // e.g. 720 (stage height)
  backgroundAsset: string;         // SVG / WebP stage layer
  walkablePolygon: [number, number][]; // 2D boundary polygon for walking
  depthLayers: { id: string; y: number; asset: string }[]; // scenery Y-sorting
  portals: {
    targetRoomId: string;
    targetSpawn: { x: number; y: number };
    triggerBounds: { x1: number; y1: number; x2: number; y2: number };
    label: string;
  }[];
  interactives: {
    id: string;
    type: "ride" | "instrument" | "game_launch" | "secret_clickable" | "shop";
    position: { x: number; y: number };
    actionData: Record<string, unknown>;
  }[];
  ambientAudioPreset: string;      // e.g. "carnival_ambience", "savanna_breeze"
  scriptedNpcs: WorldEntity[];     // Local room occupants & clerks
};
```
* **Scalability:** Adding any new room, slide, or secret room across any future phase requires simply creating a new manifest object—never touching core engine code!

### 3.3 The 9 Thematic Districts Overview
The world map is organized into 9 major thematic districts comprising 30+ explorable rooms:

```
                                  [ 🏔️ MT. MIST & CANYON ]
                                  • Gondola Cableway & Basecamp
                                  • Extreme Sled / Snowboard Slope
                                  • Canyon Rapids (River Surf)
                                             │
      [ 🏙️ UPTOWN DISTRICT ] ──────────────┼────────────── [ 🌳 ENCHANTED FOREST ]
      • Top Models Runway Stage              │               • Canopy Treehouse Lounge
      • Pet Paradise & Nursery               │               • Ancient Mossy Shrines
      • Luxury Furniture Mart                │               • Hidden Fairy Grotto
      • Art Gallery & Studio                 │
              │                              │                       │
      [ 🛍️ DOWNTOWN PLAZA ] ─────────────────┼────────────── [ 🌾 THE SAVANNA WILDS ]
      • Downtown Main Street & Fountain      │               • Pride Rock & Scenic Overlook
      • Le Shop (Boutique & Secrets)         │               • The Great Grasslands
      • Stella's Hair & Salon                │               • Whispering Baobab Grove
      • Canopy Café & Bakery                 │               • The Oasis Watering Hole
      • Grand Theater / Stage                │                       │
              │                              │                       │
      [ 🎪 SAVANNA WONDER PARK ] ────────────┼────────────── [ 🏖️ SUNSET BEACH & PIER ]
      • Roller Coaster & Dark Ride           │               • Sandy Palms & Cabanas
      • Ferris Wheel & Bumper Cars           │               • The Wooden Pier & Fishing Dock
      • Spectator Kinetic Swings & Flume     │               • Historic Lighthouse & Beacon
      • Carnival Midway & Arcade             │               • Shipwreck Cove (Pirate Galleon)
              │                              │
              │                              │
      [ 🌊 SPLASH OASIS WATERPARK ] ─────────┼────────────── [ 🕵️ THE UNDERGROUND & CONDO ]
      • Tsunami Wave Pool & Lazy River       │               • Secret Underground Cave & Pool
      • Speed Slides & 4-Lane Mat Racers     │               • Boiler Room & Minecart Tunnels
      • 1000-Gallon Tipping Dump Bucket      │               • Secret Scout Command Center (PSA)
      • FlowRider & Splash Battle Arena      │               • Customizable Luxury Penthouse
```

---

## 4. The Savanna Wonder Park (Mega Amusement Park)

### 4.1 Interactive Rides
1. **The Thunder Mountain Roller Coaster:** Interactive track coaster. Avatars and pets board with goggles, climb the lift hill, scream down drops, and receive a souvenir photo card.
2. **The Giant Panoramic Ferris Wheel:** Slowly lifts passenger cabins high into the air, revealing day/sunset/night views of the whole map with relaxing music.
3. **Safari Bumper Cars Arena:** Driveable electric bumper cars with arrow keys/WASD and bump collision physics.
4. **The Haunted Minecart Dark Ride:** Spooky underground track with interactive flashlight targets and hidden secrets.
5. **Dizzy Spinning Mango Teacups:** Rapid tapping spins cups into a blur with confetti and dizzy swirl animations.
6. **Baobab Sky-Drop Tower:** Thrilling 100-foot vertical ascent and sudden freefall with wind rush sound design.
7. **The Grand Golden Carousel:** Two-story illuminated carousel with carved animals and calliope organ melodies.

### 4.2 "Fun to Watch" Kinetic Spectacles
1. **The Flying Wave Swinger (Chairoplane):** Giant illuminated swing carousel spinning on an undulating wave tilt. Avatars dangle legs, hair flies in the wind, and lights trail across the sky.
2. **The Baobab Log Flume Splashdown:** Logs drift through elevated troughs and plunge down a waterfall, blasting a massive water spray with cartoon droplets hitting the foreground screen.
3. **The Swinging Pirate Galleon (The Salty Mane):** Giant wooden ship pendulum swinging to near-vertical peaks with hilarious avatar scream bubbles.
4. **Sky Gondola Aerial Tramway:** Glass cabins continuously gliding along steel cables overhead between the park and snowy peaks.
5. **Grand Kinetic Clockwork Fountain:** Animated waterwheels, marble runs, chiming bells, and dancing automaton lions performing on the hour.
6. **Nighttime Fireworks & Lake Water Show:** Choreographed colorful spotlights, fountains, and bursting fireworks reflecting over the water at night.

---

## 5. Splash Oasis (Mega Waterpark)

A tropical, sun-soaked waterpark packed with water rides, relaxing floats, and spectator splash zones:

1. **The Tsunami Wave Pool:** Sandy-bottom beach entry pool. A deep brass bell tolls, and the giant wave generator pumps rolling surf waves where avatars bob on boogie boards and donut floaties.
2. **The Lazy River Oasis:** A winding, tranquil river wrapping around the entire waterpark. Float with your pet in themed tubes (watermelon, flamingo, donut ring) past waterfalls and misty arches.
3. **The Twin Python Speed Slides:** Enclosed translucent neon flume tubes with speed spirals and transparent ceiling sections so onlookers can watch avatars shoot down.
4. **The 4-Lane Mat Racers:** Avatars slide head-first on foam mats across multi-lane speed humps to a synchronized splashdown timer.
5. **The 1,000-Gallon Tipping Dump Bucket Fortress:** An interactive aquatic playground with rope bridges and water jets, crowned by a massive wooden bucket that fills and dumps a colossal wave of water onto the crowd below!
6. **FlowRider Endless Sheet Wave:** Surf simulator where avatars carve back and forth on an artificial wave, performing balance maneuvers and funny wipeouts.
7. **Water Cannon Battle Arena:** Fixed deck water cannons and water balloon launch stations to douse friendly targets and floating plastic ducks.
8. **Tiki Swim-Up Smoothie Cabana & Surf Shack:** Swim up to underwater stools for mango coladas and shop for swimsuits, snorkels, and floaties.

---

## 6. The Nightlife & Entertainment Scene (Clubs, Lounges & Bars)

Tailored directly for young adults and older teens, the island features a vibrant after-dark social scene with iconic music, dancing, and hangout venues:

### 6.1 Club Pulse (The Main Dance Club)
* **The Dance Floor:** An interactive multi-color LED tile floor that lights up and pulses beneath avatars' feet as they walk and dance.
* **DJ Booth & Mini-Game (`DJ Beat Drop`):** Hop behind the turntable mixer! Mix 4 audio stems (Kicks, Bass, Synths, Vocal Chops), time record scratches with arrow keys, and build up the crowd's "Hype Meter" to trigger laser cannons and confetti drops!
* **VIP Mezzanine Lounge:** Elevated second-floor lounge with velvet ropes, glowing neon lion-crest wall art, curved leather booths, and panoramic views of the dance floor below.

### 6.2 The Velvet Sunset (Rooftop Lounge & Mocktail Bar)
* **Atmosphere:** An open-air terrace perched atop Uptown with panoramic skyline views of the illuminated city and moonlit bay.
* **The Bar Counter:** Interactive drink menu where avatars can order handcrafted beverages (e.g., *Midnight Mango Spritz*, *Lavender Smoke Cold Brew*, *Electric Dragonfruit Fizz*). Avatars hold their glass with fruit garnishes and can sit at high-top barstools.
* **Social Hangouts:** Regulation pool/billiards table, outdoor gas fire pits, and plush lounge seating with lo-fi house beats.

### 6.3 The Hidden Den (Underground Speakeasy & Jazz Cellar)
* **Secret Entrance:** Hidden behind an antique telephone booth in the Canopy Café alleyway (enter a secret 4-digit code to swing the door open).
* **Atmosphere:** Exposed brick, warm amber candelabras, velvet armchairs, and smooth generative jazz piano playing in the background.

### 6.4 The Moonlit Cove (Beachfront Firepit Club)
* **Atmosphere:** An outdoor tiki beach club right on the sand with bamboo bars, glowing string lights draped between palm trees, a roaring central bonfire, acoustic guitar circles, and ocean waves crashing in the background.

---

## 7. The Complete Mini-Games Roster

Games are categorized by style and distributed directly into their themed environments:

| Room & District | Game Title | Category | Mechanics |
| :--- | :--- | :--- | :--- |
| **Club Pulse** | **DJ Beat Drop** | ⚡ Challenging | Turntable rhythm game: mix synth stems, scratch vinyl, and time drops to max out the club hype meter. |
| **Canopy Café** | **Smoothie Kitchen** | 🧘 Relaxing | Pizzatron-style conveyor line: blend fruits, ice, and syrups to customer orders with tactile ASMR sound effects. |
| **Watering Hole Pier** | **Waterhole Angler** | 🧘 Relaxing | Calming dock fishing: cast line, watch ripple shadows, reel in exotic fish, dodge old boots, catch Golden Catfish. |
| **Observatory Hill** | **Star Catcher** | 🧘 Relaxing | Connect night sky star nodes to form savanna animal constellations with soothing harp chimes. |
| **Pet Nursery** | **Pet Groom & Play** | 🧘 Relaxing | Bubble bath scrubbing, mane brushing, trick training, and ball tossing to max out pet happiness. |
| **Top Models Runway** | **Top Models Fashion Show**| ⚡ Challenging | Timed runway showdown: judges call a fashion theme (*Y2K*, *Retro*, *Savanna Chic*); style your avatar within 30s for scored catwalk praise. |
| **Le Shop Boutique** | **TypeStyle / Fashion Blitz** | ⚡ Challenging | Fast-paced typing/rhythm game: type words and patterns rapidly to cut fabrics and sew runway gowns. |
| **Canyon River** | **River Rapids Surf** | ⚡ Challenging | Stunt riding down canyon rapids: catch air off ramps, grind river logs, and string arrow-key trick combos. |
| **Snowy Mountain Peak**| **Extreme Sled Run** | ⚡ Challenging | Downhill obstacle race down alpine slopes dodging pine trees and snowdrifts for high speeds. |
| **Retro Arcade** | **Baobab Bouncer** | ⚡ Challenging | Precision ricochet arcade: aim and bounce fruit projectiles to hit tricky moving bumper blocks. |
| **Retro Arcade** | **Paw Steps & Bee Stop** | ⚡ Challenging | High-speed memory reflex (Simon Says) and microsecond rhythm bar timing. |
| **Secret Scout Base** | **Laser Grid & Cipher Hack** | ⚡ Challenging | Club Penguin PSA-style spy puzzles: navigate laser tripwires and crack coded secret agent ciphers. |

---

## 8. Interactive World Instruments & Procedural Soundscapes

Zero heavy audio file downloads. Powered entirely by the **Web Audio API** using procedural oscillators, envelope shapers (ADSR), harmonic overtone generators, and biquad filters, interactive musical instruments are placed naturally throughout the world for players to click, play, and step on:

### 8.1 World Instruments Placed Across Districts
1. 🎹 **The Grand Upright Piano (Canopy Café & Underground Speakeasy):**
   * Clicking the piano opens an interactive 8-key wooden keyboard overlay (or players can use number keys `1`–`8`).
   * Produces authentic acoustic piano tones with warm resonance and natural decay. Keys visibly depress when played.
2. 🪵 **The Savanna Marimba & Balafon (The Oasis Watering Hole):**
   * Tuned rosewood bars mounted on hollow gourds.
   * Tapping keys produces sunny, warm, rhythmic wooden marimba notes tuned to a tropical pentatonic scale that sounds harmonious no matter what pattern you tap!
3. 🥁 **Full Drum Kit & Bongos (Beach Bonfire & Club Pulse Stage):**
   * Includes kick drum, snare with snappy crack, hi-hat cymbals, crash cymbal, and a pair of tuned wooden congas/bongos.
   * Tapping elements triggers crisp percussion hits with animated drumsticks and cymbal wobbles.
4. 🎸 **Electric Guitar & Bass Stand (Rooftop Lounge & Le Shop):**
   * An iconic cherry-red electric guitar plugged into a tube amp.
   * Clicking strings triggers crunchy, distorted power chords with rock vibrato.
5. 👣 **The Giant Walkable Floor Piano (Carnival Boardwalk):**
   * A massive 12-key walk-on floor keyboard (inspired by the classic movie *Big* and FAO Schwarz).
   * As avatars walk, run, or dance across the keys, each tile lights up with glowing pastel LEDs and rings out a vibrant synthesizer chime!
6. 🔔 **The Resonant Handpan / Steel Tongue Drum (Enchanted Forest Grotto):**
   * A circular metallic tongue drum sitting on a mossy boulder.
   * Tapping produces ethereal, meditative chime tones that echo softly with gentle reverb through the forest trees.
7. 📯 **The Lighthouse Brass Foghorn (Sunset Beach Pier):**
   * Pulling the brass chain sounds a deep, booming two-tone nautical foghorn that echoes across the ocean waters.

### 8.2 Wearable Handheld Instruments & Synchronized Jam Mode
* Players can equip wearable instruments from the shop: **Acoustic Guitar**, **Brass Saxophone**, **Keytar**, and **Maracas**.
* Clicking the **"Jam"** emote causes the avatar to rock out, strumming or blowing their instrument with colorful musical note particles floating above their head.
* **Harmonic Room Key Engine:** All instruments and jam riffs are locked to a shared room scale (C Major / A Minor). When multiple players jam together in the same room, their notes never clash—they naturally harmonize like an impromptu band!

---

## 9. Economy, Secrets, Audio & Progression

### 9.1 Le Shop Secret Catalog Clickables
* Multi-page flip catalog with realistic sound effects.
* Hidden clickable hot spots tucked into catalog artwork:
  * Page 2: Coffee cup steam unlocks the *Barista Apron*.
  * Page 4: Price tag star unlocks the *Retro Neon Visor*.
  * Page 6: Hidden leaf unlocks the *Golden Mane Wreath*.
  * Page 8: Pirate skull on beach page unlocks the *Eyepatch & Cutlass*.

### 9.2 The Procedural Web Audio Jukebox (`Jukebox.tsx`)
Zero external MP3 weight. Procedural Web Audio synthesizers generate 4 complete authentic music tracks:
1. *Savanna Nightclub:* Four-on-the-floor kick, synth bassline, and catchy arpeggios.
2. *Canopy Lo-Fi Lounge:* Warm electric piano chords with gentle vinyl crackle and acoustic brush percussion.
3. *Waterhole Twilight:* Soothing pan flute melodies, ambient water ripples, and evening crickets.
4. *Carnival Calliope:* Nostalgic mechanical carousel organ waltz.

### 9.3 Fantage-Style ID Card (`PlayerCard.tsx`)
* Clickable on self or any neighbor/player in a room:
  * Animated avatar preview wearing current outfit and riding board.
  * Companion pet lion preview with pet name and happiness hearts.
  * **Star Rank Level:** XP progression gained from playing games, riding park rides, and discovering secrets.
  * **Editable Status Quote:** Custom tagline visible to other players.
  * **4 Ribbon Medal Slots:** Showcase rarest earned achievements.

### 9.4 The Savanna Stamp Book
* 25+ collectible stamps categorized across:
  * *World Secrets:* (e.g. Find 5 catalog secrets, trigger night mode, uncover pirate chest).
  * *Park & Water Thrills:* (e.g. Ride all 7 theme park rides, get drenched by the 1000-gallon dump bucket).
  * *Fashion & Style:* (e.g. Score 5 stars on the runway, dye hair 3 times, own 10 outfits).
  * *Arcade Mastery:* (e.g. Catch the Golden Catfish, blend 50 smoothies, score 1,000 on River Surf).

### 9.5 Prestigious "Grail" Collectibles & Boutique Rotations
To give the economy sustained long-term appeal for young adults, shops feature high-tier aspirational items:
* **The Chroma Hoverboard:** Animated rainbow glow board with prismatic chromatic trail particles.
* **Vintage Hair Capsule:** Limited-edition retro hairstyles (e.g., *Y2K Star Streaks*, *Messy Grunge Shag*) that rotate with seasonal in-game events.
* **Golden Bell Lion Collar & Aviator Goggles:** Ultra-rare companion accessories.
* **Penthouse Grand Jukebox & Velvet Modular Sofa:** Top-tier condo customization flex items.

### 9.6 Global Audio & Persistent Header Controls (`AudioControls.tsx`)
* A discreet, stylish audio widget pinned in the global top header at all times:
  * Master volume slider (0% to 100%).
  * Independent toggles for **Music / Jukebox** vs. **Sound FX / Instruments**.
  * **Instant Mute Shortcut (`M` key):** Seamless for players who want to study or listen to their own Spotify / background audio without closing the game.

### 9.7 Smart Contextual NPC Chatter (Phase 1 Life)
In Phase 1 (prior to live multiplayer servers), scripted room occupants make rooms feel lively and responsive:
* **Contextual Keywords:** Typing words in local chat triggers responses from nearby NPCs:
  * Typing *"smoothie"* or *"latte"* at Canopy Café prompts the barista to say *"Coming right up! Freshly blended 🥭"* and toss an imaginary cup.
  * Typing *"dance"* at Club Pulse causes nearby dancers to mirror your emote.
  * Typing *"coaster"* at Wonder Park makes the ride attendant cheer *"Hold on tight!"*.
* **Audience Reactions:** Playing instruments (piano, marimba, drums) causes nearby NPCs to listen and pop small `♡` or `♫` appreciation bubbles.

### 9.8 Universal Touch & Keyboard Control Parity
* **Full Desktop Keyboard Navigation:** Full WASD / arrow-key walking, Spacebar interact, `1`–`8` instrument keys, `M` mute toggle, and Escape modal dismiss.
* **Full Mobile / Tablet Touch Controls:** On-screen virtual joystick / tap-to-move, large touch-friendly button targets (minimum 44×44px), swipe-to-turn catalog pages, and touch drag-and-drop for wardrobe styling.

---

## 10. Multiplayer-Ready Architecture & Data Model

### 10.1 Network-Serializable Entity Schemas (`src/types/world.ts`)
```typescript
export type AvatarLook = {
  skinTone: "fair" | "tan" | "warm" | "deep" | "bronze";
  eyeStyle: "chibi_sparkle" | "anime_cool" | "sleepy" | "wink";
  hairId: string;
  hairColor: string;
  outfitId: string;
  shoesId: string;
  boardId?: string;
  handheldId?: string;
};

export type PetState = {
  id: string;
  name: string;
  species: "lion";
  color: "gold" | "sand" | "copper" | "rose";
  accessory?: string;
  position: { x: number; y: number };
  mood: "happy" | "sleepy" | "bouncy";
};

export type WorldEntity = {
  id: string;
  name: string;
  look: AvatarLook;
  pet?: PetState;
  position: { x: number; y: number };
  action: "idle" | "walk" | "ride" | "dance" | "wave" | "sit";
  bubble?: { text: string; timestamp: number };
  badgeTitle?: string;
  isLocalPlayer?: boolean;
};

export type RoomState = {
  roomId: string;
  entities: Record<string, WorldEntity>;
  timeOfDay: "day" | "sunset" | "night";
};
```

### 10.2 Local-to-Multiplayer Abstraction Layer
```
               ┌───────────────────────────────┐
               │    React UI & World Canvas    │
               └───────────────┬───────────────┘
                               │ (Room Entities & Events)
                               ▼
               ┌───────────────────────────────┐
               │     IWorldNetworkAdapter      │
               └───────┬───────────────┬───────┘
                       │               │
        (Phase 1: Local)               (Phase 4: Real Multiplayer)
                       ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │    MockWorldServer     │      │   WebSocketServer      │
       │  • Scripted Neighbors  │      │  • Multi-Server Rooms  │
       │  • Local Storage Sync  │      │  • Global Chat & Sync  │
       └────────────────────────┘      └────────────────────────┘
```

---

## 11. Phased Implementation Roadmap

* **Phase 1: The Chibi Avatar, Companion Pet Lion, & Downtown Core**
  * Avatar rendering engine (SVG layers: skin, eyes, hair, clothes, shoes).
  * Companion pet lion follower physics and synchronized emote reactions.
  * Downtown Plaza (Le Shop with secret catalog clickables, Stella Salon, Canopy Café).
  * Fantage ID Card & Action Emotes (tossing mangos, dances).
* **Phase 2: Savanna Wonder Park (Theme Park) & Nightlife Core**
  * Wonder Park map & interactive rides (Roller Coaster, Ferris Wheel, Bumper Cars, Flume).
  * **Club Pulse & Rooftop Lounge:** Interactive light-up dance floor & DJ Beat Drop mini-game.
  * 🧘 Smoothie Kitchen (Canopy Café) & ⚡ River Rapids Surf (Canyon).
  * Equipable boards with sparkle footprint trails.
* **Phase 3: Splash Oasis (Waterpark), Musical Instruments & Runway Showdown**
  * Splash Oasis waterpark (Tsunami Wave Pool, Lazy River, Tipping Dump Bucket, Speed Slides).
  * **Interactive World Instruments:** Upright piano, savanna marimba, drum kit, giant floor keyboard, and wearable jam mode.
  * ⚡ Top Models Fashion Show runway competition.
  * 🧘 Waterhole Angler (cozy dock fishing) & Stamp Book (25+ stamps).
* **Phase 4: Condo Jukebox, Secret Agent Missions & Multiplayer Servers**
  * Condo customization, furniture placement, and Web Audio Jukebox.
  * Secret Scout Command Center (PSA/EPF spy missions, secret base).
  * WebSocket Room Server infrastructure connecting live players across servers.
