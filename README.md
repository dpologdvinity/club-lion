# 🦁 Club Lion

A playable, illustrated virtual world browser game inspired by the golden era of Club Penguin and Fantage. Explore a sunny savanna neighborhood, customize your chibi avatar and lion companion, play arcade minigames, ride a roller coaster, mix beats behind a DJ booth, crack spy ciphers, decorate your luxury penthouse, and collect stamps — all running locally in your browser with zero server costs.

> **Play it now:** `npm install && npm run dev` → [http://localhost:5173](http://localhost:5173)

---

## ✨ Features at a Glance

| Category                     | Highlights                                                                                                                                                                         |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🗺️ 13 Explorable Rooms**   | Savanna Square, Watering Hole, Canopy Café, Arcade, Your Den, Downtown Plaza, Wonder Park, Carnival Midway, Club Pulse, Splash Oasis, Lazy River, Penthouse Condo, Secret Scout HQ |
| **🎮 10 Playable Minigames** | Memory Safari, Bee Stop, Paw Steps, Fruit Catch, DJ Beat Drop, Smoothie Kitchen, Mango Run, Waterhole Angler, Top Models Runway, Spy Terminal                                      |
| **🎢 Interactive Rides**     | Savanna Screamer roller coaster with souvenir photo, spectator Ferris wheel, flume, teacups, and carousel                                                                          |
| **🌊 Waterpark**             | Tsunami wave pool with kinetic physics, 1000-gallon tipping dump bucket, and lazy river tube drift                                                                                 |
| **🎵 Procedural Audio**      | 4-track Web Audio jukebox, 7 world instruments, DJ Beat Drop synths — zero MP3 files                                                                                               |
| **🏠 Condo System**          | 16×16 isometric furniture grid with placement, rotation, collision, and depth sorting                                                                                              |
| **🕵️ Spy Puzzles**           | Laser tripwire grid navigation and substitution cipher cracking with rank progression                                                                                              |
| **👥 Social System**         | Friends list, online presence, jump-to-friend fast-travel, and social emotes                                                                                                       |
| **👔 Avatar Customization**  | Chibi vector avatar with skin tones, eye styles, hairstyles, outfits, and accessories                                                                                              |
| **🐾 Pet Companion**         | Lion pet with spring-damper trailing physics, customizable coats, and accessories                                                                                                  |
| **📖 Stamp Book**            | 26+ collectible stamps across World Secrets, Park Thrills, Fashion, and Arcade categories                                                                                          |
| **💾 Local-First**           | All progress in localStorage with versioned saves, cross-tab sync, and export/import backup                                                                                        |

---

## 🎮 How to Play

### Getting Around

- **Click the ground** to walk, or focus the world and use **Arrow Keys / WASD**.
- Use the **map** or **destination previews** below the world to travel between rooms.
- Walk through **panorama edge paths** or use the **named room buttons** below the stage.
- Press **M** to toggle mute at any time.

### Meet the Neighborhood

- Say hello to **Milo**, **Cleo**, and **Pip** — scripted neighbors who live in the savanna.
- Send local messages and emotes through the chat bar.
- Toss mangos and water balloons with the action wheel's ballistic targeting.

### Earn Coins & Collect Stamps

| Activity          | Coins      | Details                                        |
| :---------------- | :--------- | :--------------------------------------------- |
| Memory Safari     | 60         | Match 6 pairs of safari animals                |
| Bee Stop          | 15–120     | Stop the bee on the blossom across 10 rounds   |
| Paw Steps         | 10/round   | Repeat growing arrow sequences (Simon Says)    |
| Fruit Catch       | 2/catch    | Catch ripe fruit in a 30-second frenzy         |
| DJ Beat Drop      | varies     | Mix 4 stems behind the turntable at Club Pulse |
| Smoothie Kitchen  | per order  | Blend and serve café recipes at Canopy Café    |
| Waterhole Angler  | per catch  | Relaxing dock fishing with 8 species           |
| Top Models Runway | per show   | Style your avatar for the catwalk judges       |
| Spy Terminal      | per puzzle | Crack laser grids and cipher codes at Scout HQ |
| Adventure Rewards | 50 each    | Greet 3 neighbors, play a game, visit your den |

### Customize Everything

- **Name and style your lion** with 4 coat colors and shop accessories.
- **Spend coins** on fashion items and den decorations in the shop.
- **Decorate your penthouse** with the isometric 16×16 furniture grid.
- **Collect stamps** that unlock from exploring, playing, and discovering secrets.

### The Jukebox

Four procedurally synthesized music tracks — no audio files downloaded:

1. 🎶 **Savanna Nightclub** — Four-on-the-floor kick, synth bass arpeggio, snare
2. 🎹 **Canopy Lo-Fi Lounge** — Warm electric piano, vinyl crackle, acoustic brush
3. 🎵 **Waterhole Twilight** — Pan flute melody, ambient water ripples, evening crickets
4. 🎪 **Carnival Calliope** — Mechanical organ waltz in 3/4 time

### The Spy Terminal

Enter the Secret Scout Command Center through a hidden portal in Downtown Plaza:

- **Laser Tripwire Grid** — Navigate timing-pulsed security beams across multi-stage grids
- **Classified Agent Cipher** — Crack substitution ciphers with hint letters and intelligence clues
- Earn spy ranks from Recruit through Commander with agent badges

---

## 🗺️ World Map

```
              ┌─────────────────┐
              │  Savanna Square  │ ← Start here
              └────────┬────────┘
        ┌──────────────┼──────────────┐
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │Watering │    │ Canopy  │    │   The   │
   │  Hole   │    │  Café   │    │ Arcade  │
   └─────────┘    └─────────┘    └─────────┘
                  ┌────┴────┐
                  │Your Den │
                  └────┬────┘
           ┌───────────┴───────────┐
      ┌────┴─────┐           ┌─────┴────┐
      │ Downtown │           │  Wonder  │
      │  Plaza   │           │   Park   │
      └──┬───┬───┘           └────┬─────┘
         │   │               ┌────┴─────┐
    ┌────┴┐ ┌┴────────┐      │ Carnival │
    │Pent-│ │ Secret  │      │  Midway  │
    │house│ │Scout HQ │      └────┬─────┘
    │Condo│ └─────────┘      ┌────┴─────┐
    └─────┘                  │  Club    │
                             │  Pulse   │
                             └────┬─────┘
                        ┌─────────┴─────────┐
                   ┌────┴─────┐       ┌─────┴────┐
                   │  Splash  │       │   Lazy   │
                   │  Oasis   │       │  River   │
                   └──────────┘       └──────────┘
```

---

## 🛠️ Tech Stack

| Layer              | Technology                                                      |
| :----------------- | :-------------------------------------------------------------- |
| **Framework**      | React 19 + TypeScript 5.9 (strict mode)                         |
| **Build**          | Vite 8 with HMR                                                 |
| **Styling**        | Vanilla CSS with design tokens (no CSS-in-JS, no Tailwind)      |
| **Audio**          | 100% procedural Web Audio API (zero MP3 assets)                 |
| **Icons**          | Lucide React                                                    |
| **Rendering**      | Code-native SVG scenery and panoramic camera viewport           |
| **Persistence**    | localStorage with versioned saves and cross-tab sync            |
| **Testing**        | Node.js built-in test runner (unit) + Playwright Chromium (E2E) |
| **Fonts**          | Self-hosted Nunito + Lilita One (SIL OFL licensed)              |
| **Infrastructure** | $0 — runs 100% locally, no server required                      |

### Production Build

```
dist/index.html                   0.95 kB │ gzip:   0.46 kB
dist/assets/index-*.css          81.01 kB │ gzip:  18.06 kB
dist/assets/index-*.js          495.35 kB │ gzip: 149.76 kB
+ 7 WebP scene assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22.18** or newer
- **npm** (included with Node.js)

### Install & Run

```sh
npm ci
npm run dev
```

Open the Vite URL, normally [http://localhost:5173](http://localhost:5173).

### All Commands

| Command                | Purpose                                           |
| :--------------------- | :------------------------------------------------ |
| `npm run dev`          | Start dev server with HMR at `localhost:5173`     |
| `npm test`             | Run 387 unit tests (~100ms, Node built-in runner) |
| `npm run typecheck`    | Strict TypeScript type checking                   |
| `npm run format:check` | Verify Prettier formatting                        |
| `npm run format`       | Auto-fix Prettier formatting                      |
| `npm run build`        | Typecheck + production build to `dist/`           |
| `npm run preview`      | Serve production build locally                    |
| `npm run verify`       | All unit tests + typecheck + format + build       |
| `npm run test:e2e`     | Playwright Chromium tests (desktop + mobile)      |

### E2E Tests

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite runs at desktop (1280×720) and mobile (390×844) viewports, checking interactions, persistence, reward invariants, all minigames, keyboard navigation, and automated WCAG AA accessibility scans via axe-core.

---

## 📐 Architecture Overview

> See [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical deep-dive.

```
src/
├── App.tsx                    # Root shell: navigation, modals, panels
├── game.ts                    # Progression engine: coins, saves, rewards
├── usePlayer.ts               # React persistence hook (localStorage)
├── main.tsx                   # Vite entry point
├── styles.css                 # All styles with design tokens (~5,800 lines)
├── components/
│   ├── World.tsx              # Panoramic stage, avatar, hotspots
│   ├── RoomScenery.tsx        # All room vector scenery (~1,660 lines)
│   ├── CameraViewport.tsx     # Smooth-follow panoramic camera
│   ├── Avatar.tsx             # Chibi vector avatar renderer
│   ├── Lion.tsx               # Lion sprite with accessories
│   ├── PetCompanion.tsx       # Spring-damper trailing physics
│   ├── DanceFloor.tsx         # Interactive LED tile floor
│   ├── SpyTerminal.tsx        # Laser grid + cipher puzzles
│   ├── Condo.tsx              # Isometric furniture editor
│   ├── FriendsPanel.tsx       # Social graph UI
│   ├── AccountModal.tsx       # Guest account + cloud sync
│   ├── JukeboxModal.tsx       # Track selection + preview
│   ├── AudioControls.tsx      # Global volume/mute widget
│   └── ... (25 more components)
├── rooms/
│   ├── types.ts               # RoomManifest, RoomPortal types
│   ├── registry.ts            # Room manifest registry
│   ├── camera.ts              # Camera math (offset, pointer→stage, clamp)
│   └── manifests/             # Declarative room definitions
│       ├── downtownPlaza.ts
│       ├── wonderParkEntrance.ts
│       ├── clubPulse.ts
│       ├── splashOasisEntry.ts
│       ├── penthouseCondo.ts
│       ├── secretScoutBase.ts
│       └── ... (4 more rooms)
├── types/
│   └── world.ts               # AvatarLook, PetState, CatalogItem types
└── utils/
    ├── proceduralJukebox.ts   # 4-track Web Audio synthesizer
    ├── instrumentSynths.ts    # 7 world instrument synthesizers
    ├── spyPuzzles.ts          # Laser grid + cipher generation
    ├── condoGrid.ts           # Isometric coordinate engine
    ├── socialGraph.ts         # Friend request/presence graph
    ├── networkProtocol.ts     # Entity delta packet encoding
    ├── roomNetworkSync.ts     # Lerp/dead reckoning sync
    ├── kineticRides.ts        # Ride geometry (Ferris, flume, teacups)
    ├── waterparkPhysics.ts    # Wave pool + bucket cycle physics
    └── ... (12 more utilities)
```

### Key Design Decisions

- **$0 Infrastructure** — No server, no accounts required, no API calls. Everything runs in the browser with localStorage.
- **Procedural Audio Only** — All music and sound effects synthesized via Web Audio API oscillators. Zero MP3/WAV/OGG files.
- **Declarative Rooms** — Each room is a data manifest (portals, walkable polygon, interactives, layers). Adding a room never requires touching engine code.
- **Pure Game Logic** — `game.ts` is a pure function library with no React dependency. All progression, purchases, and save validation are fully testable without a browser.
- **Panoramic Camera** — Rooms scroll smoothly as the avatar walks. One coordinate system unifies scenery, portals, avatars, and interactives.

---

## 🧪 Testing

### Unit Tests (387 tests)

Pure logic tests using Node's built-in test runner — no browser, no mocks, ~100ms total:

```sh
npm test
```

Covers:

- **Game progression** — coin balances, one-time rewards, purchase ownership, save round-trips, V1→V2 migration
- **Minigame engines** — Bee Stop scoring bands, rhythm hit detection, smoothie recipes, fishing species, fashion scoring, spy puzzle generation
- **Physics** — coaster track geometry, waterpark wave/bucket cycles, kinetic ride motion, ballistic trajectories, particle trails, pet follower spring dynamics
- **Audio** — procedural jukebox scheduling, instrument synth parameters, audio bus lifecycle, keyboard shortcut binding
- **Social** — friend graph mutations, presence tracking, jump coordinate safety, social graph sanitization
- **Network** — delta packet encoding/decoding, room spatial isolation, lerp/dead reckoning interpolation
- **Condo** — isometric coordinate projection, furniture placement/rotation/collision, depth sorting, layout serialization

### E2E Browser Tests (70+ desktop + mobile)

Playwright Chromium tests at two viewports:

```sh
npx playwright install chromium
npm run test:e2e
```

Test suites:

- `world.spec.ts` — Core world navigation, chat, movement, persistence
- `phase2.spec.ts` — Park rides, DJ booth, smoothie kitchen
- `phase3.spec.ts` — Waterpark, instruments, fishing, runway, stamps
- `phase4.spec.ts` — Jukebox, condo, spy terminal, friends, account modal
- `bee-stop.spec.ts`, `fruit-catch.spec.ts`, `dance-floor.spec.ts`, etc. — Individual activity suites
- All suites include **axe-core WCAG AA accessibility scans**

### Full Verification

```sh
npm run verify      # unit tests + typecheck + format + build
npm run test:e2e    # browser tests (requires chromium)
```

---

## 🎨 Visual System

The visual system is documented in [DESIGN.md](DESIGN.md). Key tokens:

| Token      | Value               | Usage                                  |
| :--------- | :------------------ | :------------------------------------- |
| Primary    | `#294b3c`           | Navigation, headings, focused controls |
| Background | `#faf8f2`           | Page background (warm ivory)           |
| Accent     | `#ee964c`           | Action buttons (warm orange)           |
| Surface    | `#fffdf9`           | Panel backgrounds                      |
| Fonts      | Lilita One + Nunito | Display headings + body text           |

All runtime CSS variables are in [`src/styles.css`](src/styles.css). Original code-native SVG scenery is in [`src/components/RoomScenery.tsx`](src/components/RoomScenery.tsx). Interaction contracts are documented in [UX-CONTRACT.md](UX-CONTRACT.md).

---

## 🏗️ Development Model

Club Lion is built by a multi-agent team of three AI models operating as interchangeable peers:

| Model              | Agent Platform |
| :----------------- | :------------- |
| `gemini-3.8-flash` | Antigravity    |
| `claude-sonnet-5`  | Claude Code    |
| `gpt-6.1-sol`      | Codex          |

Development follows a **4-role lifecycle** documented in [`docs/WORKFLOW.md`](docs/WORKFLOW.md):

1. **Orchestrator** — Assigns tasks, creates isolated worktrees, manages the merge queue
2. **Implementer** — Develops with RED-GREEN TDD inside worktrees
3. **Reviewer** — Audits diffs against plan, design, and UX contract
4. **Verifier** — Rebases onto master, resolves conflicts, runs full verification gate

### Commit Convention

Conventional Commits with multi-agent attribution:

```
feat(jukebox): procedural web audio jukebox and global audio controls

Implementer: claude-sonnet-5 (claude code)
Reviewer: gemini-3.8-flash (antigravity)
Verifier: gpt-6.1-sol (codex)
Assigner: gemini-3.8-flash (antigravity)
```

### Implementation Progress

| Phase       | Status      | Unit Tests | Description                                                             |
| :---------- | :---------- | :--------- | :---------------------------------------------------------------------- |
| **Phase 1** | ✅ Complete | 76         | Chibi avatar, pet companion, downtown core, shop, salon, action wheel   |
| **Phase 2** | ✅ Complete | 165        | Wonder Park, roller coaster, Club Pulse, DJ Beat Drop, Smoothie Kitchen |
| **Phase 3** | ✅ Complete | 224        | Splash Oasis waterpark, world instruments, fishing, runway, stamp book  |
| **Phase 4** | ✅ Complete | 387        | Jukebox, condo, spy terminal, network protocol, friends, account modal  |

Full attribution history: [`docs/TASK-TRACKER.md`](docs/TASK-TRACKER.md)

---

## 📁 Project Structure

```
club-lion/
├── public/
│   ├── assets/            # WebP scene backgrounds and lion sprite
│   ├── fonts/             # Self-hosted Nunito + Lilita One (OFL)
│   └── favicon.svg
├── src/                   # Application source (~24,800 lines TypeScript)
│   ├── components/        # 37 React components (~10,750 lines)
│   ├── rooms/             # Room engine and 8 manifests
│   ├── types/             # Shared type definitions
│   └── utils/             # 18 pure utility modules (~9,150 lines)
├── tests/                 # Playwright E2E tests (~3,350 lines)
│   ├── fixtures/          # Standalone HTML/TSX test harnesses
│   └── *.spec.ts          # Browser test suites
├── docs/                  # Architecture plans, workflow, and tracker
├── DESIGN.md              # Visual system and design tokens
├── UX-CONTRACT.md         # Interaction invariants and accessibility
├── ARCHITECTURE.md        # Technical architecture deep-dive
└── AGENTS.md              # Repository guidelines for AI agents
```

---

## 📜 Credits & Licenses

- **Fonts:** [Nunito](https://fonts.google.com/specimen/Nunito) and [Lilita One](https://fonts.google.com/specimen/Lilita+One) under the [SIL Open Font License](public/fonts/Nunito-OFL.txt)
- **Icons:** [Lucide](https://lucide.dev/) (ISC License)
- **Artwork:** Original AI-generated scene backgrounds (WebP) and original code-native SVG vector scenery
- **Audio:** 100% procedural — synthesized at runtime via Web Audio API

This is a local single-player game. Neighbors are scripted characters, and messages stay on your screen. Progress saves in your browser's localStorage.
