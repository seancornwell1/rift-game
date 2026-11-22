# Rift Game — Game Plan

Nov 19, 2026 · @Sean Cornwell

A family phone game for iPhone: walk to earn summons, collect heroes from dimensions at war, battle with a five-hero team, and build a kingdom. Built entirely by Claude Code, with art from image generators and free libraries. The first goal is a playable steps → summon → battle loop; everything else is layered on after.

## The game in one page

**Premise.** The app itself is the story's device: a radar and communicator that picks up signals from other dimensions. One faction in an interdimensional war, The Grey, has broken into our world and drains the color from everything it touches. The other factions are coming through to stop it, and the player becomes their contact. Each faction is built on a broad, slightly alien theme rather than a single creature: the equinines range from bipeds to centaurs to unicorns, the dinosaur clans from scouts to towering chieftains.

**The four systems**

| System | What you do | What it gives |
| --- | --- | --- |
| Walking | Steps count in your pocket all day | Summon currency |
| Map and landmarks | Visit real parks, libraries and playgrounds; clear Grey zones near home | Materials, rare spawns, story progress |
| Gacha and heroes | Summon heroes from the factions, level them, choose a team of five | Your roster |
| Battles | Auto-battles with timed skills, campaign stages and landmark fights | Rewards, progress through the story |
| Kingdom | Build and upgrade a home base that produces while you're away | Hero upgrades, daily rewards |

**How they connect:** walking and landmarks fund summons, summons build the team, battles move the story and earn resources, and the kingdom turns resources into stronger heroes. No real money anywhere.

**Everyone plays the same game.** Each family member has their own account, heroes and kingdom, in one shared world: the same spawns at the same park, and the ability to help each other.

## Factions, heroes and the enemy

Every faction is built on a broad, slightly alien theme, and each favors certain hero roles rather than being weak to another faction. All looks are locked in Midjourney lineups (see Art pipeline).

| Faction | Colors | Favors | Notes |
| --- | --- | --- | --- |
| Verserovers (dimension elves) | Light lavender skin, periwinkle and sky-blue constellation streaks, cyan accents | Stealth, ranged, short stuns | The guides and the "main" faction. Flagship hero: **Zoë**, the rare sharpshooter |
| Nextbots (conscious constructs) | Orange and white | Defenders, supports, buffs | Faces only on screens, as LED eyes. Common is a little helper bot with a blinking-cursor face |
| Zaurs (biped dinosaurs) | Red and silver | Chargers, ranged, burn (big damage, short time) | Honor-bound hotheads. Designs locked; needs a recolor to red and silver |
| Equuis (equinines) | Silver and gold | Chargers, casters, fast healing | Range from bipeds to centaurs to unicorns. Rivals to the Verserovers. Needs a recolor to silver and gold |
| Wandering Willows (plants, trees, mushrooms) | Green and purple | Tricksters, casters, poison (small damage, long time) | Pudgy and neutral. Collect species capable of intellect |
| The Stranded (warped humans) | Gold and pale sky blue | Psionic single-target takedowns, group debuffs | Held back as a mid-campaign story reveal |
| Desserts (June's faction, name pending) | Bubblegum pink and mint | Slows and freezes, sticky control, speed buffs, revives | Original designs; common is a gingerbread hero with a bitten ear and a mint scarf |
| The enemy (name pending) | Drab greys and slate blue, with flat neon eye glyphs and glitch tears | Life drain, single-target control | Also obtainable: awakened members fight for the player and show a warm accent color |

**The enemy:** drains color and joy rather than being violent. Orderly drab bodies (slime gremlins, bucket-helmed hollow knights, masked heralds, a baroque angelic sovereign) broken by neon eye glyphs and glitch tears. The neon is the stolen color glitching inside them. Name to be chosen with June; candidates include The Hush.

**Hero system, three layers:**

- **Roles:** defender and charger (front row), stealth, trickster and support (middle), ranged, caster and healer (back).
- **Damage types:** physical, magic, burn, poison, psionic.
- **Status effects:** stun, slow, shield, taunt, stealth, buff, debuff, cleanse, dispel, each with one clear icon.

**No elements.** Instead: faction bonuses for two or more heroes from one faction, and challenge bosses built around keywords (a shield only psionic damage strips, immunity unless stunned, healing stopped by poison), plus rule challenges like commons and uncommons only. Every hero gets a moment to shine.

**Roster size:** 12 heroes in Phase 1 (two factions), about 36 for a full family launch (six per faction), then a hero or two a month.

## Platform and tools

Recommendation: **Expo (React Native) in TypeScript**, built in the cloud for iPhone. It's the path that works from a Windows PC with no Mac, and TypeScript is where Claude Code is strongest.

| Need | Tool | Why |
| --- | --- | --- |
| App framework | Expo + React Native, TypeScript | Native iPhone app, written on Windows |
| iPhone builds | Expo's cloud build service (EAS Build) | Builds the iPhone app on Apple hardware in the cloud; no Mac needed |
| Installing on family phones | TestFlight | Private installs on your and the kids' iPhones, no App Store listing |
| Step counting | Expo's pedometer (iPhone motion data) | Counts steps in the pocket, easy on battery |
| Map | Apple Maps through react-native-maps | Free on iPhone |
| Landmarks | OpenStreetMap data | Free; parks, libraries and playgrounds are already tagged |
| Battle and kingdom graphics | React Native Skia | Fast 2D drawing and animation inside the app |
| Accounts and shared world | Supabase (free tier) | Sign-in, saves, family links |

**Apple developer account ($99/year): not needed yet.** During development the game runs on your iPhone through the free Expo Go app. The account is needed when the kids should have the game installed as its own app through TestFlight, realistically at the end of Phase 1.

**Trade-off:** a game engine like Unity would offer more game tooling, but it's editor-heavy and hard to drive from prompts, and it adds work to build for iPhone from Windows. Expo keeps everything in code Claude Code can write and test.

## How the app is put together

- **Content as data.** Every hero, faction, skill, stage, building and enemy is a data file in a documented format. Adding a faction means adding files, not rewriting code.
- **Battle engine.** Runs separately from the graphics, so fights can be simulated and balanced by script before anyone sees them.
- **Step ledger.** Reads the phone's step count and converts it to currency once a day, with a daily cap so nobody's game breaks.
- **Seeded spawns.** Spawns at each location are generated from the map tile and the date, so the whole family sees the same hero at the same park, with almost no server work.
- **Landmark catalog.** A script pulls public places near home from OpenStreetMap once and caches them.
- **Kingdom simulation.** Idle production calculated from timestamps when the app opens.
- **Accounts.** Supabase stores each person's saves and links family accounts together. Only added in phase 4; until then saves stay on the phone.
- **The story shell.** The whole interface is styled as the radar and communicator device: signals, static, transmissions from faction leaders.

## Art pipeline

The style is locked: chubby round characters, small dot eyes, rosy cheeks, thick clean outlines, bright candy colors, rarity shown through size, gear, glow and auras.

1. **Faction lineups in Midjourney, by hand.** Midjourney has no official API, so this stays manual. Use the approved dinosaur lineup as the Style Reference for new factions; it carries less signature color than the others. Lessons: name specific colors instead of "bright"; dark skin hides dot eyes (the elves were lightened for this); lower the style weight (--sw) when a reference's anatomy bleeds in.
2. **One reference image per hero in Midjourney:** a single character, facing three-quarters right, every signature detail present. A three-quarter version doubles as card and portrait art.
3. **Poses through Nano Banana (Gemini).** Upload the reference, set the consistency rules once, then ask for one pose at a time. Tested on Zoë and it works: she stayed recognizable across all poses. Add reminder lines for details that drift.
4. **Poses per hero:** idle, two running frames, attack, skill, hit and victory. Seven images plus a portrait.
5. **Cleanup by script.** Claude Code removes backgrounds, scales every pose to the same height and aligns the feet on one baseline so heroes don't jitter.
6. **Animation in code.** No drawn in-betweens: wind-up squash, lunge, flash and particles into attacks; freeze-frame and zoom on skills; shake and flash on hits; gentle breathing on idle; the two run frames alternated for entrances. Layered puppet rigs for favorite heroes are a Phase 5 luxury.
7. **Free libraries for the rest.** UI icons and sound effects from Kenney (CC0), sounds from Freesound (CC0 filter), all logged in a credits file.

**Art per Phase 1:** 12 heroes × 8 images, about 100 images, at roughly half an hour of hands-on time per hero.

## Phases

Each phase ends with something the kids can play. Times assume a few evenings a week and are rough.

| Phase | What's playable at the end | Rough time |
| --- | --- | --- |
| 0. Foundations | A test app on your iPhone through TestFlight; accounts set up | 2 to 3 weeks |
| 1. Core loop | Steps earn currency, summon heroes, battle through 10 campaign stages with a team of five | 2 to 3 months |
| 2. Kingdom | A home base that produces while you're away and upgrades heroes | 1 to 2 months |
| 3. Map and landmarks | Real places as spawn points and battle sites, Grey zones near home to clear | 2 months |
| 4. Family | Separate accounts in one shared world, helping each other, simple trading | 1 month |
| 5. Growth | New factions, events, story chapters, layered animation for favorite heroes | Ongoing |

All five phases is roughly 8 to 10 months of evenings. That's long, which is why every phase is designed to be fun on its own: if you stop after phase 1, the kids still have a game.

**Phase 0 checklist**

- [ ] Expo Go installed on your iPhone (the Apple developer account waits until the end of Phase 1)
- [ ] Expo account and a first cloud build installed through TestFlight
- [ ] GitHub repo for the project
- [ ] Midjourney plan for concept art; Google AI Studio key for Nano Banana
- [ ] A spec doc and CLAUDE.md rules in the repo, as with your other projects

## Phase 1 in detail

The goal: walk during the day, summon at night, and fight through a short campaign.

**Steps**

- Steps convert to Signal Shards, the summon currency, every day, up to a daily cap.
- A small bonus for hitting a daily step goal, so a big walk feels rewarding.

**Summon**

- Two factions to start: the Verserovers (with Zoë as the flagship) and a second faction still to choose, six heroes each across the rarity tiers.
- Rules from Gum Goblins 2: no real money, duplicates power up a hero instead of being wasted, a guaranteed rare after a set number of pulls, and odds shown on screen.
- A summon animation worth the wait: the radar picks up a signal, static, then the hero comes through.

**Battle**

- Side-view auto-battles, your five heroes against waves of Grey creatures.
- Each hero has a basic attack and one skill you can tap when it's charged.
- Simple roles (tank, damage, healer, support) and faction elements that matter, so team-building is a real choice.
- 10 campaign stages ending in a boss, with a short story transmission between stages.

**Out of scope for phase 1:** the map, the kingdom, accounts and trading.

## Budget, risks and kid safety

**Budget, about $18 a month:** a basic Midjourney plan (about $10/month) now, plus the Apple developer account ($99/year, about $8/month) from the end of Phase 1. Expo's cloud builds, Supabase, Apple Maps, OpenStreetMap and Nano Banana's free tier cover the rest at family scale. Check current prices before subscribing.

**Risks**

- **Art volume.** Five poses per hero adds up fast. Keep phase 1 to about 12 heroes and grow from there.
- **Scope.** This is the biggest project you've planned. The phases exist so each one stands on its own.
- **Cloud iPhone builds** have monthly limits on the free tier. Most day-to-day testing can happen in Expo's preview app instead of full builds.
- **Free-tier changes.** Image generation limits change often; keep the pipeline able to switch providers.

**Kid safety**

- Never show exact locations to other players; family links only, by invite.
- Spawns only at public places, never at homes.
- Steps count in the pocket, so nobody needs to look at the phone while walking.
- No chat with strangers, no ads, no purchases.

## Open questions

- [ ] **Game name.** Rift Game is a placeholder.
- [ ] **Enemy name,** chosen with June. Candidates: The Hush, The Pale Choir, The Wane, The Stillness.
- [ ] **Dessert faction name,** June's pick.
- [ ] **Second Phase 1 faction** to pair with the Verserovers. The Zaurs give the clearest contrast.
- [ ] **Twelve Phase 1 heroes:** names, roles, skills and personalities.
- [ ] **Recolors:** Zaurs to red and silver, Equuis to silver and gold; remove stray faces from the Nextbots in GIMP.
- [ ] **Step cap and exchange rate** for kids versus adults.
