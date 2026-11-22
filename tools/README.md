# Asset tools (PC only)

These scripts run on the PC with Node 24 (which runs TypeScript directly). They are never bundled into the app.

## Setup

1. Get a Gemini API key from Google AI Studio.
2. Put it in `.env` at the project root (the file is git-ignored):
   ```
   GEMINI_API_KEY=your-key-here
   ```
   Never prefix it with `EXPO_PUBLIC_`: that would bundle it into the app.
3. Optional: set `GEMINI_IMAGE_MODEL` in `.env` to switch models. The default is `gemini-nano-banana-2.1`.

## Folders

```
art/heroes/<hero-id>/reference.png   Midjourney reference, one character, facing 3/4 right
art/heroes/<hero-id>/notes.txt       optional reminder lines for details that drift, one per line
art/heroes/<hero-id>/raw/<pose>.png  raw Nano Banana output
assets/sprites/heroes/<hero-id>/     processed, game-ready sprites
```

Poses: `idle`, `run1`, `run2`, `attack`, `skill`, `hit`, `victory`, plus `portrait`.

## Workflow

```bash
# 1. Generate each pose from the reference (one pose per call)
npm run art:pose -- --hero zoe --pose idle
npm run art:pose -- --hero zoe --pose attack --notes "the quiver has three cyan arrows"
#    Look at the result. Not right? Run it again with --force.

# 2. Remove backgrounds, match heights, align feet on one baseline
npm run art:process -- --hero zoe
```

`art:process` options: `--height` (character height in px, default 480), `--tolerance` (background color match, default 40), `--padding` (default 24).

## Limits

- Background removal flood-fills from the image edges, so the prompt asks for a flat white background. Background caught in closed gaps (such as between an arm and the body) stays; erase it in GIMP or regenerate.
- If the edge eats into a white part of the character, lower `--tolerance`.
- The Gemini image API changes often. If a call fails, the script prints the API's response; check the current docs at https://aistudio.google.com/docs/image-generation.
