// Generates one pose for a hero with Google's Nano Banana (Gemini image) API.
//
//   npm run art:pose -- --hero zoe --pose attack
//   npm run art:pose -- --hero zoe --pose skill --notes "bow glows cyan" --force
//
// Reads art/heroes/<hero>/reference.png (the Midjourney reference, facing
// three-quarters right) and optional art/heroes/<hero>/notes.txt (reminder lines
// for details that drift). Writes art/heroes/<hero>/raw/<pose>.png.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

import { type ArtKind, heroArtDir, isArtKind, optionalEnv, parseArgs, requireEnv } from './lib/common.mts';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

const POSE_PROMPTS: Record<ArtKind, string> = {
  idle: 'Relaxed idle stance, standing, weight on both feet, facing three-quarters right.',
  run1: 'Running, first frame: left leg forward, right arm forward, facing right.',
  run2: 'Running, second frame: right leg forward, left arm forward, facing right.',
  attack: 'Mid basic attack with their weapon or signature move, leaning forward, facing right.',
  skill: 'Dramatic special-skill pose, signature power on display, facing right.',
  hit: 'Getting hit: recoiling backward, eyes squeezed shut, facing right. Cartoon, not hurt.',
  victory: 'Happy victory pose, celebrating, facing the viewer three-quarters right.',
  portrait: 'Head-and-shoulders portrait for a hero card, facing three-quarters right, friendly expression.',
};

const CONSISTENCY_RULES = [
  'Use the attached image as the exact character reference.',
  'Keep the same character: same proportions, face, dot eyes, rosy cheeks, colors, outfit, gear and every signature detail.',
  'Style: chubby round character, small dot eyes, rosy cheeks, thick clean dark outlines, bright candy colors, flat cel shading.',
  'Draw the whole character, head to feet, fully inside the frame with empty space around them.',
  'Background: one flat plain pure white color (#FFFFFF). No ground, no shadow, no scenery, no text.',
  'Only one character in the image.',
];

function findImageBase64(node: unknown): string | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findImageBase64(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (record.type === 'image' && typeof record.data === 'string') return record.data;
    for (const key of ['inlineData', 'inline_data']) {
      const inline = record[key];
      if (inline && typeof inline === 'object') {
        const data = (inline as Record<string, unknown>).data;
        if (typeof data === 'string') return data;
      }
    }
    for (const value of Object.values(record)) {
      const found = findImageBase64(value);
      if (found) return found;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2), ['force']);
  const hero = args.get('hero');
  const pose = args.get('pose');
  if (!hero || !pose || !isArtKind(pose)) {
    throw new Error('Usage: --hero <id> --pose <idle|run1|run2|attack|skill|hit|victory|portrait> [--notes "..."] [--force]');
  }

  const dir = heroArtDir(hero);
  const referencePath = args.get('ref') ?? path.join(dir, 'reference.png');
  if (!existsSync(referencePath)) throw new Error(`Reference image not found: ${referencePath}`);
  const outPath = path.join(dir, 'raw', `${pose}.png`);
  if (existsSync(outPath) && !args.has('force')) {
    throw new Error(`${outPath} already exists. Pass --force to replace it.`);
  }

  const notesFile = path.join(dir, 'notes.txt');
  const reminders = [
    ...(existsSync(notesFile) ? readFileSync(notesFile, 'utf8').split(/\r?\n/) : []),
    ...(args.get('notes') ? [args.get('notes') as string] : []),
  ]
    .map((line) => line.trim())
    .filter(Boolean);

  const prompt = [
    ...CONSISTENCY_RULES,
    reminders.length ? `Details to keep exactly: ${reminders.join(' ')}` : '',
    `Pose: ${POSE_PROMPTS[pose]}`,
  ]
    .filter(Boolean)
    .join('\n');

  const referencePng = await sharp(readFileSync(referencePath)).png().toBuffer();
  const apiKey = requireEnv('GEMINI_API_KEY');
  const model = optionalEnv('GEMINI_IMAGE_MODEL', 'gemini-nano-banana-2.1');

  console.log(`Generating ${hero}/${pose} with ${model}...`);
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      model,
      input: [
        { type: 'text', text: prompt },
        { type: 'image', mime_type: 'image/png', data: referencePng.toString('base64') },
      ],
      response_format: {
        type: 'image',
        mime_type: 'image/png',
        aspect_ratio: pose === 'portrait' ? '1:1' : '3:4',
        image_size: '1K',
      },
    }),
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(body, null, 2)}`);
  }
  const base64 = findImageBase64(body);
  if (!base64) {
    throw new Error(`No image in the response:\n${JSON.stringify(body, null, 2).slice(0, 4000)}`);
  }

  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, await sharp(Buffer.from(base64, 'base64')).png().toBuffer());
  console.log(`Saved ${path.relative(process.cwd(), outPath)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
