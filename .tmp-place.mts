const { ROOM_MANIFESTS } = await import(process.cwd() + "/src/rooms/registry.ts");
const PLAN: Record<string, string[]> = {
  "pet-paradise": ["whack-a-veggie"], "splash-oasis-entry": ["slide-splash", "splash-power-up"],
};
const NAMES: Record<string,string> = {"memory-mixup":"Memory Mixup","candy-swap":"Candy Swap","snack-tac-toe":"Snack Tac Toe","whack-a-veggie":"Whack A Veggie",bullseye:"Bullseye","buzzer-beater":"Buzzer Beater","mad-math":"Mad Math","galaxy-hero":"Galaxy Hero",staries:"Staries","rocket-board":"Rocket Board","type-boo":"Type Boo","king-me":"King Me","check-mate":"Check Mate","mouse-out":"Mouse Out","stained-glass":"Stained Glass","snow-day":"Snow Day",boxy:"Boxy","pearly-pop":"Pearly Pop","bobo-fish":"BoBo Fish","magic-pop":"Magic Pop","bricks-breaking":"Bricks Breaking","jelly-fishin":"Jelly Fishin'","bubble-bug":"Bubble Bug","go-cart":"Go Cart","putt-putt":"Putt Putt Revolution","slide-splash":"Slide n Splash","splash-power-up":"Splash Power-Up"};
type B = { l: number; r: number; t: number; b: number };
const W = 110, H = 170;
const cab = (x: number, y: number, name: string): B => { const half = Math.max(W, name.length * 12 + 50) / 2; return { l: x - half, r: x + half, t: y - H, b: y + 60 }; };
export function blockers(m: any): B[] {
  const out: B[] = [];
  for (const i of m.interactives) {
    if (i.object) { const w = Math.max(80, i.object.width), h = Math.max(80, i.object.height); out.push({ l: i.position.x - w/2, r: i.position.x + w/2, t: i.position.y - h, b: i.position.y + 60 }); }
    else { const L = (i.label?.length ?? 10) * 11 + 100; out.push({ l: i.position.x - L/2, r: i.position.x + L/2, t: i.position.y - 105, b: i.position.y - 5 }); }
  }
  for (const n of m.neighbors ?? []) out.push({ l: n.x - 46, r: n.x + 46, t: n.y - 150, b: n.y + 30 });
  for (const p of m.props ?? []) out.push({ l: p.x - 50, r: p.x + 50, t: p.y - 60, b: p.y + 30 });
  for (const p of m.portals ?? []) out.push({ l: p.triggerBounds.x1 - 40, r: p.triggerBounds.x2 + 40, t: p.triggerBounds.y1 - 200, b: p.triggerBounds.y2 });
  return out;
}
const hit = (a: B, b: B) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const res: string[] = [];
for (const [room, games] of Object.entries(PLAN)) {
  const m = ROOM_MANIFESTS[room];
  const boxes = blockers({ ...m, interactives: m.interactives.filter((i: any) => !games.includes(String(i.actionData?.gameId))) });
  // Painted bathtubs in Pet Paradise are scenery, not objects.
  if (room === "pet-paradise") for (const x of [430, 1210, 2170]) boxes.push({ l: x - 140, r: x + 140, t: 380, b: 640 });
  const top = Math.min(...m.walkablePolygon.map((p: number[]) => p[1]));
  const floorTop = top < 300 ? 540 : top;
  games.forEach((g, k) => {
    const pref = (m.stageWidth * (k + 1)) / (games.length + 1);
    let best: [number, number] | null = null, bd = 1e9;
    for (let y = floorTop - 15; y <= Math.max(floorTop + 40, 600); y += 5)
      for (let x = 160; x <= m.stageWidth - 160; x += 10) {
        const c = cab(x, y, NAMES[g]);
        if (boxes.some((b) => hit(c, b))) continue;
        const d = Math.abs(x - pref) + Math.abs(y - floorTop) * 2;
        if (d < bd) { bd = d; best = [x, y]; }
      }
    if (!best) { res.push(`${g} ${room} NONE`); return; }
    boxes.push(cab(best[0], best[1], NAMES[g]));
    res.push(`${g} ${room} ${best[0]} ${best[1]}`);
  });
}
console.log(res.join("\n"));
