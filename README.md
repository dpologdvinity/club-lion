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
- Visit the watering hole, Canopy café, arcade, and your den using the map.
- Name and customize your lion; spend earned coins on accessories and den decorations.
- Play Memory Safari or Fruit Catch at the arcade to earn coins. Claim completed adventure rewards for 50 coins each.

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

The browser suite checks desktop and mobile interactions, persistence, reward and purchase invariants, completed game play, validation, keyboard behavior, storage failures, and automated accessibility scans. Test artifacts are written to `/tmp/club-lion-test-results`.

## Architecture

React and TypeScript with Vite. `src/game.ts` owns progression and save validation. Components own the world, lion presentation, sidebar, shared dialog, wardrobe/shop/map, and arcade games. `src/usePlayer.ts` owns persistence. [DESIGN.md](DESIGN.md) and [UX-CONTRACT.md](UX-CONTRACT.md) document the visual and interaction decisions.

Original artwork was generated with the built-in image generation tool: a sunny savanna village without characters, a transparent chibi lion sprite, and a four-scene atlas containing a watering hole, café, arcade, and cozy den. Optimized production assets live in `public/assets`; the atlas was split into standalone backgrounds to preserve scene proportions. Nunito and Lilita One are self-hosted in `public/fonts` with their SIL Open Font Licenses.
