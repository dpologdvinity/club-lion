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
2. **Lions as Companion Pets (Puffle / Fantage Pet DNA):** Lions are loyal companion pets that follow your avatar with smooth trailing physics, wear pet accessories (bandanas, collars, bows), react to player emotes, sleep in your condo, and can be groomed and fed.
3. **Massive Multi-District World:** A sprawling world map featuring bustling downtown shopping, quiet savanna reserves, beach boardwalks, snowy peaks, secret spy bunkers, a **Mega Theme Park** with interactive and spectator rides, and a **Mega Waterpark** with slides, lazy rivers, and wave pools.
4. **Authentic Distributed Mini-Games:** A diverse balance of relaxing cozy games (Pizzatron-style Smoothie Kitchen, dock fishing, constellation connecting, pet care) and challenging high-skill games (river stunt surfing, typing fashion blitz, obstacle downhill racing, precision trick-shots).
5. **Rich Nostalgic Culture:** Secret catalog clickables, Top Models runway catwalk showdown, Fantage-style ID cards with star ranks, Web Audio procedural Jukebox tracks, interactive mango tossing, and a 25+ stamp collection book.
6. **Multiplayer-Ready Architecture:** Designed around serializable entity packets and room event managers, allowing seamless transition from Phase 1 local play to a multi-server MMO backend.

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

---

## 3. The Grand World Map & Districts

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

## 6. The Complete Mini-Games Roster

Games are categorized by style and distributed directly into their themed environments:

| Room & District | Game Title | Category | Mechanics |
| :--- | :--- | :--- | :--- |
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

## 7. Economy, Secrets, Audio & Progression

### 7.1 Le Shop Secret Catalog Clickables
* Multi-page flip catalog with realistic sound effects.
* Hidden clickable hot spots tucked into catalog artwork:
  * Page 2: Coffee cup steam unlocks the *Barista Apron*.
  * Page 4: Price tag star unlocks the *Retro Neon Visor*.
  * Page 6: Hidden leaf unlocks the *Golden Mane Wreath*.
  * Page 8: Pirate skull on beach page unlocks the *Eyepatch & Cutlass*.

### 7.2 The Procedural Web Audio Jukebox (`Jukebox.tsx`)
Zero external MP3 weight. Procedural Web Audio synthesizers generate 4 complete authentic music tracks:
1. *Savanna Nightclub:* Four-on-the-floor kick, synth bassline, and catchy arpeggios.
2. *Canopy Lo-Fi Lounge:* Warm electric piano chords with gentle vinyl crackle and acoustic brush percussion.
3. *Waterhole Twilight:* Soothing pan flute melodies, ambient water ripples, and evening crickets.
4. *Carnival Calliope:* Nostalgic mechanical carousel organ waltz.

### 7.3 Fantage-Style ID Card (`PlayerCard.tsx`)
* Clickable on self or any neighbor/player in a room:
  * Animated avatar preview wearing current outfit and riding board.
  * Companion pet lion preview with pet name and happiness hearts.
  * **Star Rank Level:** XP progression gained from playing games, riding park rides, and discovering secrets.
  * **Editable Status Quote:** Custom tagline visible to other players.
  * **4 Ribbon Medal Slots:** Showcase rarest earned achievements.

### 7.4 The Savanna Stamp Book
* 25+ collectible stamps categorized across:
  * *World Secrets:* (e.g. Find 5 catalog secrets, trigger night mode, uncover pirate chest).
  * *Park & Water Thrills:* (e.g. Ride all 7 theme park rides, get drenched by the 1000-gallon dump bucket).
  * *Fashion & Style:* (e.g. Score 5 stars on the runway, dye hair 3 times, own 10 outfits).
  * *Arcade Mastery:* (e.g. Catch the Golden Catfish, blend 50 smoothies, score 1,000 on River Surf).

---

## 8. Multiplayer-Ready Architecture & Data Model

### 8.1 Network-Serializable Entity Schemas (`src/types/world.ts`)
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

### 8.2 Local-to-Multiplayer Abstraction Layer
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

## 9. Phased Implementation Roadmap

* **Phase 1: The Chibi Avatar, Companion Pet Lion, & Downtown Core**
  * Avatar rendering engine (SVG layers: skin, eyes, hair, clothes, shoes).
  * Companion pet lion follower physics and synchronized emote reactions.
  * Downtown Plaza (Le Shop with secret catalog clickables, Stella Salon, Canopy Café).
  * Fantage ID Card & Action Emotes (tossing mangos, dances).
* **Phase 2: Savanna Wonder Park (Theme Park) & First Games Slice**
  * Wonder Park map & interactive rides (Roller Coaster, Ferris Wheel, Bumper Cars).
  * Spectator kinetic rides (Log Flume splashdown, Wave Swinger, Pirate Galleon).
  * 🧘 Smoothie Kitchen (Canopy Café) & ⚡ River Rapids Surf (Canyon).
  * Equipable boards with sparkle footprint trails.
* **Phase 3: Splash Oasis (Waterpark) & Runway Showdown**
  * Splash Oasis waterpark (Tsunami Wave Pool, Lazy River, Tipping Dump Bucket, Speed Slides).
  * ⚡ Top Models Fashion Show runway competition.
  * 🧘 Waterhole Angler (cozy dock fishing) & Stamp Book (25+ stamps).
* **Phase 4: Condo Jukebox, Secret Agent Missions & Multiplayer Servers**
  * Condo customization, furniture placement, and Web Audio Jukebox.
  * Secret Scout Command Center (PSA/EPF spy missions, secret base).
  * WebSocket Room Server infrastructure connecting live players across servers.
