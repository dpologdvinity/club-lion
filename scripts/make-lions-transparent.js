import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const LIONS = [
  'lion-chibi-living-cub',
  'lion-bratz-cute-cub',
  'lion-bratz-sassy-cub',
  'lion-living-cub-no-lashes'
];

async function processLion(name) {
  const inputPath = `public/assets/${name}.jpg`;
  if (!fs.existsSync(inputPath)) {
    console.error(`Missing input: ${inputPath}`);
    return;
  }

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  
  // 4-channel buffer
  const outData = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    outData[i * 4] = data[i * 3];
    outData[i * 4 + 1] = data[i * 3 + 1];
    outData[i * 4 + 2] = data[i * 3 + 2];
    outData[i * 4 + 3] = 255;
  }
  
  const isBgColor = (x, y) => {
    const idx = (y * w + x) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    return r > 235 && g > 235 && b > 235;
  };
  
  // 1. Flood fill from 4 outer borders
  const visited = new Uint8Array(w * h);
  const queue = [];
  
  for (let x = 0; x < w; x++) {
    if (isBgColor(x, 0)) { queue.push(x, 0); visited[0 * w + x] = 1; }
    if (isBgColor(x, h - 1)) { queue.push(x, h - 1); visited[(h - 1) * w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    if (isBgColor(0, y) && !visited[y * w + 0]) { queue.push(0, y); visited[y * w + 0] = 1; }
    if (isBgColor(w - 1, y) && !visited[y * w + (w - 1)]) { queue.push(w - 1, y); visited[y * w + (w - 1)] = 1; }
  }
  
  let head = 0;
  while (head < queue.length) {
    const qx = queue[head++];
    const qy = queue[head++];
    outData[(qy * w + qx) * 4 + 3] = 0;
    
    const neighbors = [[qx+1, qy], [qx-1, qy], [qx, qy+1], [qx, qy-1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nidx = ny * w + nx;
        if (!visited[nidx] && isBgColor(nx, ny)) {
          visited[nidx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
  
  // 2. Identify any remaining enclosed white pockets (e.g. between legs, under belly)
  // Eye whites are in head region (y < 520) and are surrounded by dark lines.
  // Pockets between legs/tail are at y > 520, or have neutral white color.
  for (let y = 520; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!visited[idx] && isBgColor(x, y)) {
        // Find connected component
        const comp = [];
        const cq = [x, y];
        visited[idx] = 1;
        let cHead = 0;
        let isPocket = true;
        
        while (cHead < cq.length) {
          const cx = cq[cHead++];
          const cy = cq[cHead++];
          comp.push([cx, cy]);
          
          const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 520 && ny < h) {
              const nidx = ny * w + nx;
              if (!visited[nidx] && isBgColor(nx, ny)) {
                visited[nidx] = 1;
                cq.push(nx, ny);
              }
            }
          }
        }
        
        // Clear pocket
        for (const [px, py] of comp) {
          outData[(py * w + px) * 4 + 3] = 0;
        }
        console.log(`[LION] Cleared enclosed pocket in ${name} of size ${comp.length} at (${x}, ${y})`);
      }
    }
  }
  
  // 3. Smooth anti-aliased edge
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (outData[idx + 3] === 255) {
        const hasTrans = 
          outData[((y-1)*w + x)*4 + 3] === 0 ||
          outData[((y+1)*w + x)*4 + 3] === 0 ||
          outData[(y*w + x - 1)*4 + 3] === 0 ||
          outData[(y*w + x + 1)*4 + 3] === 0;
          
        if (hasTrans) {
          const r = outData[idx], g = outData[idx+1], b = outData[idx+2];
          if (r > 215 && g > 215 && b > 215) {
            const brightness = (r + g + b) / (3 * 255);
            outData[idx + 3] = Math.round(255 * (1 - brightness * 0.85));
          }
        }
      }
    }
  }
  
  // Output to public/assets/ and gallery/lions/
  const pubOut = `public/assets/${name}.png`;
  const galOut = `gallery/lions/${name}.png`;
  
  await sharp(outData, { raw: { width: w, height: h, channels: 4 } }).png().toFile(pubOut);
  await sharp(outData, { raw: { width: w, height: h, channels: 4 } }).png().toFile(galOut);
  
  console.log(`[LION] Saved: ${pubOut} & ${galOut}`);
}

async function main() {
  for (const lion of LIONS) {
    await processLion(lion);
  }
}

main().catch(console.error);
