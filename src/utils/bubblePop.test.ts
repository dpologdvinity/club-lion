import test from "node:test";
import assert from "node:assert/strict";
import {
  BUBBLE_POP_MAX_SCORE,
  CHALLENGE_MAX_BUBBLES,
  START_SCORE,
  makeBubble,
  scorePop,
  type Bubble,
} from "./bubblePop.ts";

const pop = (color: Bubble["color"], golden = false) => ({ color, golden });

test("same-color pops build a combo that multiplies points up to five times", () => {
  let state = START_SCORE;
  const points: number[] = [];
  for (let i = 0; i < 7; i++) {
    const next = scorePop(state, pop("pink"));
    points.push(next.points);
    state = next.state;
  }
  assert.deepEqual(points, [10, 20, 30, 40, 50, 50, 50]);
  assert.equal(state.score, 250);
  assert.equal(state.combo, 7);
  assert.equal(state.bestCombo, 7);
});

test("a different color restarts the chain but keeps the best combo", () => {
  let state = scorePop(START_SCORE, pop("sky")).state;
  state = scorePop(state, pop("sky")).state;
  const broken = scorePop(state, pop("mint"));
  assert.equal(broken.points, 10);
  assert.equal(broken.state.combo, 1);
  assert.equal(broken.state.bestCombo, 2);
  assert.equal(broken.state.lastColor, "mint");
});

test("golden bubbles score big and extend any chain without changing its color", () => {
  const first = scorePop(START_SCORE, pop("sun", true));
  assert.equal(first.points, 50);
  let state = scorePop(START_SCORE, pop("lilac")).state;
  const golden = scorePop(state, pop("pink", true));
  assert.equal(golden.points, 100);
  assert.equal(golden.state.lastColor, "lilac");
  state = golden.state;
  const after = scorePop(state, pop("lilac"));
  assert.equal(after.state.combo, 3);
  assert.equal(after.points, 30);
});

test("the score cap covers every bubble a challenge can spawn at the top multiplier", () => {
  assert.equal(BUBBLE_POP_MAX_SCORE, CHALLENGE_MAX_BUBBLES * 250);
});

test("relaxed bubbles are big, slow, and never golden", () => {
  for (const roll of [0, 0.3, 0.99]) {
    const bubble = makeBubble(1, false, () => roll);
    assert.equal(bubble.golden, false);
    assert.ok(bubble.size >= 92);
    assert.ok(bubble.riseMs >= 9_000);
    assert.ok(bubble.x >= 10 && bubble.x <= 90);
  }
  assert.equal(makeBubble(1, false, () => 0).surprise?.id, "cub");
  assert.equal(makeBubble(1, false, () => 0.9).surprise, null);
});

test("challenge bubbles can be golden and float up faster", () => {
  const golden = makeBubble(2, true, () => 0.01);
  assert.equal(golden.golden, true);
  assert.ok(golden.riseMs < 9_000);
  assert.equal(makeBubble(3, true, () => 0.5).golden, false);
});
