# Club Lion

A playable, illustrated lion neighborhood inspired by cozy virtual-world browser games.

## Run

Requires Node.js 22.18 or newer.

```sh
npm install
npm run dev
```

Open the Vite URL, normally http://localhost:5173.

## Play

- Click the ground to walk, or focus the world and use arrow keys or WASD.
- Say hello to Milo, Cleo, and Pip; send local messages and emotes.
- Visit the watering hole, Canopy café, arcade, den, Downtown Plaza, Wonder Park Entrance, Carnival Midway, and Club Pulse using the map. Walk through panorama edge paths or use named room path buttons.
- Name and customize your lion; spend earned coins on accessories and den decorations.
- Match six pairs in Memory Safari to earn 60 coins.
- Stop the bee on the blossom in Bee Stop: 10 rounds, no way to lose, up to 120 coins and a saved best score.
- Repeat the growing arrow sequence in Paw Steps to earn 10 coins per completed round.
- Catch ripe fruit in Fruit Catch: a 30-second round with 2 coins per catch and a saved best score.
- Follow the four DJ lanes in DJ Beat Drop; your best score and earned coins save.
- Blend and serve café recipes in Smoothie Kitchen; each served order pays once and saves.
- Ride Savanna Screamer and view or download a local souvenir after the circuit. The coaster awards no coins and does not persist photos. Watch the Ferris wheel, flume, teacups, and carousel in the park scenery.
- Step across Club Pulse’s 8×6 LED floor to light tiles, or press tiles to play procedural synth chimes with sound enabled.
- Claim completed adventure rewards for 50 coins each.

This version is single-player: neighbors are scripted, and messages stay on your screen. Progress saves in this browser. It does not include a multiplayer server or accounts.

## Verify

```sh
npm test
npm run typecheck
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite checks desktop and mobile interactions, persistence, reward and purchase invariants, all seven arcade activities, validation, keyboard behavior, storage failures, and automated accessibility scans. Test artifacts are written to `/tmp/club-lion-test-results`.

## Architecture

React and TypeScript with Vite. `src/game.ts` owns progression and save validation. `src/beeStop.ts` owns Bee Stop scoring as pure functions with no React or DOM dependency, which keeps every scoring band and coin band testable without a browser. Components own the world, lion presentation, sidebar, shared dialog, wardrobe/shop/map, and the seven arcade activities. Panoramic rooms use declarative manifests, one scaled stage coordinate system, and `CameraViewport`; original code-native SVG scenery replaces placeholder manifest artwork names. `src/usePlayer.ts` owns persistence. [DESIGN.md](DESIGN.md) and [UX-CONTRACT.md](UX-CONTRACT.md) document the visual and interaction decisions.

Original artwork was generated with the built-in image generation tool: a sunny savanna village without characters, a transparent chibi lion sprite, and a four-scene atlas containing a watering hole, café, arcade, and cozy den. Optimized production assets live in `public/assets`; the atlas was split into standalone backgrounds to preserve scene proportions. The plaza, park, midway, and club scenes are original vectors in `src/components/RoomScenery.tsx`; park motion reuses the shared kinetic ride geometry and respects reduced motion. Nunito and Lilita One are self-hosted in `public/fonts` with their SIL Open Font Licenses.
