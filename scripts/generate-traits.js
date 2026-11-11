import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Key lives in .env (git-ignored) or the shell environment, never in source.
try {
  process.loadEnvFile();
} catch {
  /* no .env: fall back to the shell environment */
}
const apiKey = process.env.POLLINATIONS_API_KEY;

if (!apiKey) {
  console.error("Set POLLINATIONS_API_KEY in .env");
  process.exit(1);
}

export async function generateTransparentTrait(prompt, outputPath, width = 256, height = 256) {
  const url = `https://gen.pollinations.ai/image/${encodeURIComponent(
    prompt + ", isolated 2d game sprite layer on pure solid white background, game asset sprite, no background, pure white background"
  )}?key=${apiKey}&width=${width}&height=${height}&seed=42`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${await response.text()}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Process with sharp: remove white background
  const image = sharp(buffer);
  const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 238 && g > 238 && b > 238) {
      data[i + 3] = 0; // Transparent
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log(`✓ Saved: ${outputPath}`);
}
