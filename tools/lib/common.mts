// Shared helpers for PC-only asset tools. Never import this from src/.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ART_DIR = path.join(ROOT, 'art');
export const SPRITES_DIR = path.join(ROOT, 'assets', 'sprites');

export const POSES = ['idle', 'run1', 'run2', 'attack', 'skill', 'hit', 'victory'] as const;
export type Pose = (typeof POSES)[number];
export type ArtKind = Pose | 'portrait';

export function isArtKind(value: string): value is ArtKind {
  return value === 'portrait' || (POSES as readonly string[]).includes(value);
}

/** Loads .env from the project root and returns a required variable. */
export function requireEnv(name: string): string {
  const envFile = path.join(ROOT, '.env');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set. Add it to ${envFile} (see tools/README.md).`);
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  const envFile = path.join(ROOT, '.env');
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  return process.env[name]?.trim() || fallback;
}

/** Minimal --flag value parser. Boolean flags take no value. */
export function parseArgs(argv: string[], booleanFlags: string[] = []): Map<string, string> {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) throw new Error(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (booleanFlags.includes(key)) {
      args.set(key, 'true');
    } else {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for --${key}`);
      args.set(key, value);
    }
  }
  return args;
}

export function heroArtDir(heroId: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(heroId)) {
    throw new Error(`Hero id must be kebab-case: ${heroId}`);
  }
  return path.join(ART_DIR, 'heroes', heroId);
}
