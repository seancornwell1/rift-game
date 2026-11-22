@AGENTS.md

# Rift Game: project rules

A family iPhone game: walk to earn summons, collect heroes from dimensions at war, battle with a team of five. The game plan is `game-plan.md` (converted from the original `game-plan.md.docx`); the build spec with milestones and data formats is `docs/spec.md`. Read the spec before starting a milestone.

## Expo Go only (for now)

- The app must run in **Expo Go** on iPhone. Only use libraries bundled in Expo Go. Never add custom native code, `ios/` or `android/` folders, or config plugins that need a development build.
- Check `package.json` for the SDK (currently 58) and read the matching versioned docs before using any Expo API.
- Install packages with `npx expo install <pkg>`. Tools that run only on the PC (such as `sharp`) are dev dependencies and must never be imported from `src/`.

## Content lives in data files

- Every hero, faction, skill, enemy, stage and economy value is JSON under `src/content/`, in the formats in `docs/spec.md`. Adding a hero or faction means adding files, not changing code.
- No game numbers or names hard-coded in screens or the engine. If a value needs tuning, it belongs in a data file.
- If a format must change, update `docs/spec.md`, `src/content/types.ts` and the content check in the same change.

## Battle engine is separate from rendering

- `src/battle/` (and the summon and step ledger logic) is plain TypeScript: no React, React Native, Expo or Skia imports, no `Date.now()` or `Math.random()`. Time comes in as input and randomness comes from a seeded RNG passed in.
- The engine is pure: `createBattle(setup, seed)` and `advance(state, inputs)` return new state plus events. Screens only play events and send inputs, such as a skill tap.
- Every fight can be simulated by script (`npm run sim`). Balance changes are checked with the simulator, not by feel.
- Same seed and inputs must give the same result. Keep a test for that.

## TypeScript

- `strict` is on and stays on. No `any`, no `@ts-ignore`; use `unknown` and narrow it. Parse JSON content through the validator, never with a cast.
- Use erasable syntax only (no `enum`, no `namespace`, no constructor parameter properties) so Node can run engine and tool scripts directly.
- Before calling a task done, run `npx tsc --noEmit` and `npx expo lint`.

## Kid safety (non-negotiable)

- No ads, no in-app purchases or real money of any kind, no ad or tracking SDKs.
- No chat with strangers. Any future social features are family links only, by invite.
- Never show, store or send exact locations. Spawns are only at public places, never homes. Location data stays coarse (map tile level) and on the phone unless a family feature needs it.
- Steps are counted in the pocket. Never design anything that needs looking at the phone while walking.
- Nothing scary or violent beyond cartoon battles: the Grey drain color and joy.

## Secrets

- `GEMINI_API_KEY` lives in `.env`, which is git-ignored. It is used only by scripts in `tools/` on the PC.
- Never give a secret an `EXPO_PUBLIC_` prefix and never import `.env` values from `src/`. Anything with that prefix is bundled into the app.

## Art pipeline

- `art/` holds raw generated art (references, Nano Banana poses). `assets/sprites/` holds processed sprites the app uses. Never edit processed sprites by hand; re-run the tools.
- Style: chubby round characters, small dot eyes, rosy cheeks, thick clean outlines, bright candy colors. Rarity shows through size, gear, glow and auras.
- Each hero has seven poses plus a portrait: `idle`, `run1`, `run2`, `attack`, `skill`, `hit`, `victory`, `portrait`. The reference faces three-quarters right.
- Cleanup by script (`tools/`):
  1. Remove the background (generate on a flat, plain background so it removes cleanly).
  2. Scale every pose of a hero to the **same character height**.
  3. Align the **feet on one shared baseline**, so heroes don't jitter between poses.
  4. Export transparent PNGs to `assets/sprites/heroes/<hero-id>/<pose>.png`.
- Animation is done in code (squash, lunge, flash, particles, shake, breathing, alternating run frames). No drawn in-between frames.
- When prompting Nano Banana: name specific colors instead of "bright", keep skin light enough that dot eyes show, and add reminder lines for details that drift.
- Free assets (Kenney, Freesound CC0) must be listed in `CREDITS.md` with source and license.

## Layout

```
src/app/        Expo Router screens only
src/battle/     battle engine (plain TS)
src/content/    JSON content + types + index
src/components/ UI components
docs/           spec
tools/          PC-only asset scripts (Nano Banana, sprite cleanup)
art/            raw art (not bundled)
assets/         app icons and processed sprites (bundled)
```
