// Cleans up a hero's raw poses into game-ready sprites.
//
//   npm run art:process -- --hero zoe
//   npm run art:process -- --hero zoe --height 480 --tolerance 40
//
// For every art/heroes/<hero>/raw/<pose>.png:
//   1. removes the flat background (flood fill from the image edges),
//   2. scales the character to the same height in every pose,
//   3. places the feet on one shared baseline, centered on the feet,
// then writes transparent PNGs to assets/sprites/heroes/<hero>/<pose>.png.
// The portrait is background-removed and trimmed but not baseline-aligned.
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp, { type Sharp } from 'sharp';

import { POSES, SPRITES_DIR, heroArtDir, parseArgs } from './lib/common.mts';

interface Rgba {
  data: Buffer;
  width: number;
  height: number;
}

async function loadRgba(file: string): Promise<Rgba> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Median color of the four corners: the generated background. */
function sampleBackground({ data, width, height }: Rgba): [number, number, number] {
  const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((p) => [
    data[p * 4],
    data[p * 4 + 1],
    data[p * 4 + 2],
  ]);
  const median = (i: number) => corners.map((c) => c[i]).sort((a, b) => a - b)[2];
  return [median(0), median(1), median(2)];
}

/** Makes background pixels connected to the image edge transparent, and softens the edge. */
function removeBackground(img: Rgba, tolerance: number): void {
  const { data, width, height } = img;
  const [br, bg, bb] = sampleBackground(img);
  const distance = (p: number) =>
    Math.sqrt((data[p * 4] - br) ** 2 + (data[p * 4 + 1] - bg) ** 2 + (data[p * 4 + 2] - bb) ** 2);

  const cleared = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const visit = (p: number) => {
    if (!cleared[p] && distance(p) <= tolerance) {
      cleared[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    if (x > 0) visit(p - 1);
    if (x < width - 1) visit(p + 1);
    if (p >= width) visit(p - width);
    if (p < width * (height - 1)) visit(p + width);
  }

  for (let p = 0; p < width * height; p++) {
    if (cleared[p]) {
      data[p * 4 + 3] = 0;
      continue;
    }
    const x = p % width;
    const touchesCleared =
      (x > 0 && cleared[p - 1]) ||
      (x < width - 1 && cleared[p + 1]) ||
      (p >= width && cleared[p - width]) ||
      (p < width * (height - 1) && cleared[p + width]);
    if (touchesCleared) {
      // Anti-aliased edge pixel: fade it by how close it is to the background.
      data[p * 4 + 3] = Math.round(255 * Math.min(1, distance(p) / (tolerance * 3)));
    }
  }
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function opaqueBounds({ data, width, height }: Rgba): Box {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < 0) throw new Error('Image is empty after background removal (try a lower --tolerance).');
  return { left, top, right, bottom };
}

/** Horizontal center of the opaque pixels in the bottom 8% of the character: the feet. */
function feetCenterX({ data, width }: Rgba, box: Box): number {
  const startY = Math.round(box.bottom - (box.bottom - box.top) * 0.08);
  let sum = 0;
  let count = 0;
  for (let y = startY; y <= box.bottom; y++) {
    for (let x = box.left; x <= box.right; x++) {
      if (data[(y * width + x) * 4 + 3] > 16) {
        sum += x;
        count++;
      }
    }
  }
  return count ? sum / count : (box.left + box.right) / 2;
}

function toSharp(img: Rgba): Sharp {
  return sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const hero = args.get('hero');
  if (!hero) throw new Error('Usage: --hero <id> [--height 480] [--tolerance 40] [--padding 24]');
  const targetHeight = Number(args.get('height') ?? 480);
  const tolerance = Number(args.get('tolerance') ?? 40);
  const padding = Number(args.get('padding') ?? 24);

  const rawDir = path.join(heroArtDir(hero), 'raw');
  const outDir = path.join(SPRITES_DIR, 'heroes', hero);
  mkdirSync(outDir, { recursive: true });

  // Pass 1: clean, trim and scale every pose to the same character height.
  const scaled: Array<{ pose: string; img: Rgba; feetX: number }> = [];
  for (const pose of POSES) {
    const file = path.join(rawDir, `${pose}.png`);
    if (!existsSync(file)) {
      console.warn(`  missing ${pose}.png, skipped`);
      continue;
    }
    const img = await loadRgba(file);
    removeBackground(img, tolerance);
    const box = opaqueBounds(img);
    const scale = targetHeight / (box.bottom - box.top + 1);
    const width = Math.max(1, Math.round((box.right - box.left + 1) * scale));
    const { data, info } = await toSharp(img)
      .extract({ left: box.left, top: box.top, width: box.right - box.left + 1, height: box.bottom - box.top + 1 })
      .resize(width, targetHeight, { kernel: 'lanczos3' })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const trimmed: Rgba = { data, width: info.width, height: info.height };
    const feetX = feetCenterX(trimmed, { left: 0, top: 0, right: trimmed.width - 1, bottom: trimmed.height - 1 });
    scaled.push({ pose, img: trimmed, feetX });
  }

  // Pass 2: one canvas per hero, feet centered and on the same baseline.
  if (scaled.length) {
    const halfWidth = Math.ceil(Math.max(...scaled.map(({ img, feetX }) => Math.max(feetX, img.width - feetX))));
    const canvasWidth = halfWidth * 2 + padding * 2;
    const canvasHeight = targetHeight + padding * 2;
    const baselineY = padding + targetHeight;
    for (const { pose, img, feetX } of scaled) {
      const input = await toSharp(img).png().toBuffer();
      await sharp({
        create: { width: canvasWidth, height: canvasHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input, left: Math.round(canvasWidth / 2 - feetX), top: baselineY - img.height }])
        .png()
        .toFile(path.join(outDir, `${pose}.png`));
      console.log(`  ${pose}.png`);
    }
    console.log(`Canvas ${canvasWidth}x${canvasHeight}, baseline at y=${baselineY}`);
  }

  // Portrait: clean and trim, fit into a square.
  const portraitFile = path.join(rawDir, 'portrait.png');
  if (existsSync(portraitFile)) {
    const img = await loadRgba(portraitFile);
    removeBackground(img, tolerance);
    const box = opaqueBounds(img);
    await toSharp(img)
      .extract({ left: box.left, top: box.top, width: box.right - box.left + 1, height: box.bottom - box.top + 1 })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outDir, 'portrait.png'));
    console.log('  portrait.png');
  }
  console.log(`Sprites written to ${path.relative(process.cwd(), outDir)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
