import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Load .env
const envFile = fs.readFileSync(".env", "utf8");
const match = envFile.match(/POLI?NATIONS_API_KEY=["']?([^"'\s]+)["']?/);
const apiKey = match ? match[1] : "";

if (!apiKey) {
  console.error("No Pollinations API key found in .env");
  process.exit(1);
}

console.log("Using Pollinations API key:", apiKey.slice(0, 8) + "...");

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
