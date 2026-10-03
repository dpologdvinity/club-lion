# Club Lion — Mango Run (Second Minigame) Design Spec

Date: 2026-10-02
Author: opencode
Status: Draft (awaiting review)

## Context

- Repo: Club Lion (React + TypeScript + Vite). Single-player, localStorage save. 
- Existing: Memory Safari (6 pairs, 60 coins, increments gamesPlayed once per win), adventure "game" requires gamesPlayed >= 1.
- Arcade is "The arcade" place (PLACES.arcade). Games panel currently renders MemorySafari directly (App.tsx:296-303).
- DOM-first UI, CSS design tokens in src/styles.css, a11y baseline (focus, reduced motion, live regions).

## Requirements

- Add "Mango Run" steering minigame to the arcade.
- End condition: endless with lives. 3 hits -> game over. Score = distance + mangoes collected. Personal best tracked (local to save).
- Reward: scaled by score, repeatable (each win gives coins = score). Adventure "game" remains satisfied after first completion (gamesPlayed behavior). 
- Keyboard: arrow/WASD steer lion. Respect reduced motion. 
- Accessible: focusable controls, ARIA live regions for HUD. 
- No network. Local-only. Follow existing patterns (MemorySafari: intro/win states, onFinish/onClose).

## Decisions

- Approach: DOM sprites (positioned divs) in new `src/components/MangoRun.tsx`. Matches existing DOM patterns.
- Scoring: `score = Math.floor(distanceTraveled) + mangoesCollected * 10`.
- Lives: start 3. Collide with obstacle -> lose 1 life, brief invulnerability (500ms), flash. Game over when lives reach 0.
- Entities: mangoes (collectible), obstacles (rocks/thorn bushes). Collected mangoes removed immediately.
- Spawning: time-based intervals with small randomness; difficulty ramps slightly over time.
- Game loop: requestAnimationFrame with delta. Cleanup on unmount.
- States: Intro, Playing, GameOver (score, coins this round, best). Restart, Back to pride.
- Integration: Games panel becomes a picker (Memory Safari | Mango Run). Initial state when opening Games is picker.
- Reward: `completeMangoRun(player, score)` increments gamesPlayed and adds score coins; tracks `mangoRunBest = max(best, score)`. Repeatable. 
- Save: add `mangoRunBest?: number`. Tolerant defaults in restorePlayer.

## Architecture

### game.ts
- Extend Player: `mangoRunBest?: number`.
- Add `completeMangoRun(player: Player, score: number): Player`:
  - if (!Number.isSafeInteger(score) || score < 0) return player
  - const best = Math.max(player.mangoRunBest ?? 0, score)
  - return { ...player, coins: player.coins + score, gamesPlayed: player.gamesPlayed + 1, mangoRunBest: best }
- restorePlayer: validate/fill mangoRunBest (>=0 int) if present, else omit or 0? Default undefined is fine; component reads with ?? 0.

### MangoRun.tsx (new)
- Props: `{ onFinish: (score: number) => void; onClose: () => void }`
- State: mode 'intro'|'playing'|'gameover', lion pos, obstacles[], mangoes[], lives, mangoesCount, distance, best, invulnUntil (ms), keys set.
- Bounds: playfield area (matches dialog content area). Clamp lion.
- Collisions: AABB (axis-aligned rects) for simplicity.
- Spawning: interval + difficulty curve. Avoid spawning directly on lion.
- HUD: lives (hearts), distance, mangoes, best. ARIA live regions for key changes.
- Reduced motion: respect `prefers-reduced-motion: reduce` (disable nonessential animations/transitions, use lower speed).
- Cleanup: cancel rAF, clear intervals/timeouts on unmount.

### App.tsx
- Add state `activeGame: 'memory'|'mango'|null` when panel==='games'. Opening Games sets activeGame to null (picker). 
- Games panel: null -> GamesPicker (onSelect memory/mango). 'memory' -> MemorySafari (onClose -> reset to picker or close panel? Keep MemorySafari's onClose closes panel for now; or change to return to picker? Match new flow: provide onBack to picker). Alternatively, pass onClose behavior: in picker mode, onClose closes panel; in game mode, onClose returns to picker. Add `onBackToPicker()`.

But minimize changes: add GamesPicker. MemorySafari stays same API but when used from picker, wrap onClose to go back? Easier: Games panel manages substate. Initial open: show picker. Selecting game shows that game with onClose -> back to picker (or panel close if prefer). Current MemorySafari's "Back to pride" closes panel; keep consistent (back to pride = close panel). Picker is just the entry.

### Panels.tsx
- Add `GamesPicker` component with two cards. Props `{ onSelect: (g:'memory'|'mango')=>void }`.

### styles.css
- Add `.mango-run`, `.mr-playfield`, `.mr-lion`, `.mr-mango`, `.mr-obstacle`, `.mr-hud`, `.mr-heart`, states (invuln). Reuse tokens (colors.surface, border, accent, etc.), rounded, shadows. Respect reduced motion.

## Testing

- Unit: game.test.ts
  - restorePlayer with missing mangoRunBest -> defaults ok
  - completeMangoRun adds score, sets best (max), increments gamesPlayed, repeatable twice, rejects negative/non-int
- E2E: tests/world.spec.ts
  - open Games -> picker shows both, select Mango Run
  - steer with arrow keys, lives decrease on obstacle, game over screen appears
  - restart works, back to pride closes panel
  - coins increase by score on completion, best persists

## Compatibility

Version 1 save format; restorePlayer backward compatible. No migration. 
No multiplayer, no network. Single-player only.

## Risks

- Spawn fairness (avoidable traps) -> minimum spawn gap from lion, bias away from current lane.
- rAF performance minor; small DOM count.
- Accessibility: ensure game area focusable for keyboard-only. 

## Spec review

Self-check: no placeholders, consistent with existing patterns, scope focused. Ready for user review.