# Rift Game

A family iPhone game: walk to earn summons, collect heroes from dimensions at war, battle with a team of five. Built with Expo (SDK 58) and run in Expo Go.

- Game plan: `game-plan.md.docx`
- Phase 1 spec and data formats: [docs/spec.md](docs/spec.md)
- Project rules: [CLAUDE.md](CLAUDE.md)
- Asset tools: [tools/README.md](tools/README.md)

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the iPhone Camera app to open it in Expo Go. The phone and the PC must be on the same Wi-Fi; if that doesn't work, use `npx expo start --tunnel`.

## Checks

```bash
npm run typecheck
npx expo lint
```
