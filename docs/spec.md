# Rift Game: Phase 1 Spec

Source: `game-plan.md` (Game Plan, Nov 19, 2026). This spec turns the plan's Phase 1 into milestones you can build, and fixes the data formats for game content. Rift Game is a placeholder name.

## Phase 1 goal

Walk during the day, summon at night, fight through a short campaign. At the end of Phase 1 a family member can:

1. Earn **Signal Shards** from steps counted in their pocket, up to a daily cap, plus a bonus for reaching the daily step goal.
2. Summon heroes from two factions (Verserovers plus one more, probably the Zaurs), six heroes each, with odds shown on screen.
3. Pick a team of five and auto-battle through **10 campaign stages** against waves of Grey creatures, ending in a boss, with a short story transmission between stages.

Out of scope: the map and landmarks, the kingdom, accounts, family links, trading, real money of any kind.

### Platform constraints

- Runs in **Expo Go** on iPhone for all of Phase 1. Only libraries bundled in Expo Go, no custom native code, no config plugins that need a dev build.
- Saves stay on the phone (no server until Phase 4).
- Everything is styled as the radar and communicator device: signals, static, transmissions.

### Where the plan disagrees with itself

Decisions made in this spec:

| Topic | Plan says | Spec decision |
|---|---|---|
| Elements | Phase 1 mentions "faction elements that matter"; the hero system says "No elements" | **No elements.** Team-building comes from roles and rows, faction bonuses (2+ heroes from one faction), and boss keywords |
| Roles | Phase 1 lists tank/damage/healer/support; the hero system lists eight roles | **Eight roles** in three rows (below). Tank/damage/healer/support are just a way to explain them |
| Poses | Risks mention five poses; the Art pipeline lists seven | **Seven poses plus a portrait** (idle, run1, run2, attack, skill, hit, victory, portrait) |

## Milestones

Each milestone ends with something you can run in Expo Go or from the command line.

### M1. Content formats and battle engine (no UI)

- TypeScript types for every content kind (below) in `src/content/types.ts`.
- Content loader and validator: every JSON file is checked against its type, and every reference (hero → faction, hero → skill, stage → enemy) must resolve. `npm run check:content` fails on errors.
- Battle engine in `src/battle/`: plain TypeScript, deterministic from a seed, no React or React Native imports.
- `npm run sim -- --stage stage-01 --team zoe,... --runs 1000` simulates fights and prints win rate, average length and damage per hero.
- Starter content: 2 test heroes, 2 enemies, 1 stage.
- **Done when:** a scripted fight produces the same log for the same seed, and the simulator runs from the command line.

### M2. Battle screen

- Side-view battle that plays engine events: five heroes on the left in front/middle/back rows, enemy waves on the right.
- Basic attacks happen automatically. Each hero card shows a skill charge meter; tap the card when it is full to fire the skill.
- Code animation (squash, lunge, flash, shake, idle breathing) on placeholder sprites. Choose plain React Native with Reanimated or React Native Skia here; both are in Expo Go.
- Status icons (one icon per status), damage numbers, win/lose screen.
- **Done when:** the test stage is playable start to finish on the iPhone.

### M3. Steps and Signal Shards

- Read today's step count with the Expo pedometer (`expo-sensors`), which is in Expo Go. Check the SDK 58 docs before writing this.
- Step ledger: convert steps to shards once a day, with a daily cap and a bonus for reaching the daily goal. Steps already converted are never counted twice. Rates and caps live in `src/content/economy.json` (kid and adult values are still an open question).
- Local save of the player's state (wallet, roster, progress) on the phone, with a save version number for later migrations.
- Home screen: radar showing today's steps, shards earned, and progress to the goal.
- **Done when:** walking with the phone in a pocket adds shards the next time the app opens, and the cap holds.

### M4. Summon

- Summon screen with on-screen odds per rarity.
- Pity: a guaranteed rare or better after a set number of pulls without one. The counter is saved.
- Duplicates are never wasted; each one adds a star to that hero (stat boost).
- Summon animation: the radar picks up a signal, static, then the hero comes through. Rarity changes the signal color and the glow.
- The summon logic is plain TypeScript next to the battle engine, seeded so it can be tested and simulated.
- **Done when:** pulls spend shards, odds match the table over 10,000 simulated pulls, and pity triggers on time.

### M5. Roster and team

- Roster screen: portrait cards, rarity, stars, level, role, faction.
- Hero detail: stats, skill description, poses preview.
- Team builder: choose five heroes and place them in rows; shows active faction bonuses.
- Leveling: spend a battle reward currency to level heroes (cap set in `economy.json`).
- **Done when:** a player can build a team from summoned heroes and take it into battle.

### M6. Campaign

- Ten stages, each with 1 to 3 enemy waves. Stage 10 is a boss built around a keyword (for example, a shield only psionic damage strips).
- Story transmission before each stage: a short message from a faction leader, styled as a communicator with static.
- Stars per stage (win, no hero lost, under a turn limit) and first-clear rewards.
- **Done when:** all ten stages can be beaten with a reasonable team, and the simulator confirms each stage's win rate is in its target band.

### M7. Content and polish

- All 12 Phase 1 heroes with final art from the pipeline (7 poses plus a portrait each), skills, and personalities.
- Balance pass using the simulator.
- Sounds and UI icons from Kenney and Freesound (CC0), all listed in `CREDITS.md`.
- First EAS build through TestFlight once the Apple developer account exists. This is optional for Phase 1, since Expo Go covers testing.
- **Done when:** the kids play through the campaign without help.

## Game rules used by the formats

### Rarity

`common`, `uncommon`, `rare`, `epic`. Rarity shows in the art through size, gear, glow and auras. The default odds and pity count live in `economy.json`. Proposed: 60 / 28 / 10 / 2 percent, with rare or better guaranteed by pull 20.

### Roles and rows

| Row | Roles |
|---|---|
| front | `defender`, `charger` |
| middle | `stealth`, `trickster`, `support` |
| back | `ranged`, `caster`, `healer` |

A role sets the default row and the default AI target. The player can still move heroes between rows.

### Damage types and statuses

- Damage types: `physical`, `magic`, `burn`, `poison`, `psionic`. Burn is high damage over a short time; poison is low damage over a long time.
- Statuses: `stun`, `slow`, `shield`, `taunt`, `stealth`, `buff`, `debuff`, `cleanse`, `dispel`. Each one has exactly one icon. `cleanse` removes debuffs from allies; `dispel` removes buffs from enemies. Those two happen once instead of lasting.

### Battle model

- Time moves in **ticks** (10 per second of battle at 1× speed). Each unit acts when its action meter fills; `spd` sets how fast it fills.
- **Energy** goes from 0 to 100. A unit gains energy by attacking and by being hit. At 100 a hero's skill is ready to tap; enemies use theirs automatically.
- Damage: `power × atk × (100 / (100 + def))`, then status modifiers, then a ±5% roll from the seeded RNG.
- The engine API is pure: `createBattle(setup, seed)` returns a state, and `advance(state, inputs)` returns a new state plus a list of events (`attack`, `damage`, `heal`, `statusApplied`, `statusExpired`, `skillReady`, `skillUsed`, `unitDefeated`, `waveCleared`, `battleEnded`). The screen only plays events; it never changes battle state itself.
- Faction bonus: two or more heroes from one faction on the team turns on that faction's bonus. More heroes give a stronger tier.

## Data formats

All content is JSON under `src/content/`, one file per entity, with the file name equal to the `id`. IDs are lowercase kebab-case. TypeScript types in `src/content/types.ts` match these formats exactly. `src/content/index.ts` imports every file (Metro cannot list a folder at runtime); the content check fails if a file is missing from the index.

```
src/content/
  economy.json
  factions/verserovers.json
  heroes/zoe.json
  skills/zoe-starfall-shot.json
  enemies/grey-slime-gremlin.json
  stages/stage-01.json
```

Text the player reads (names, descriptions, transmissions) sits in the same files. Phase 1 is English only.

### Shared types

```ts
type Id = string;                      // kebab-case, equal to the file name
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';
type Role = 'defender' | 'charger' | 'stealth' | 'trickster' | 'support'
          | 'ranged' | 'caster' | 'healer';
type Row = 'front' | 'middle' | 'back';
type DamageType = 'physical' | 'magic' | 'burn' | 'poison' | 'psionic';
type Status = 'stun' | 'slow' | 'shield' | 'taunt' | 'stealth'
            | 'buff' | 'debuff' | 'cleanse' | 'dispel';
type Stat = 'hp' | 'atk' | 'def' | 'spd';

interface Stats { hp: number; atk: number; def: number; spd: number }

type Target =
  | 'self'
  | 'enemy-front'        // nearest enemy row (default for front-row roles)
  | 'enemy-back'         // furthest enemy row
  | 'enemy-lowest-hp'
  | 'enemy-highest-atk'
  | 'enemy-random'
  | 'enemy-all'
  | 'ally-lowest-hp'
  | 'ally-all'
  | 'ally-row';          // the user's own row
```

### Faction

```json
{
  "id": "verserovers",
  "name": "Verserovers",
  "tagline": "Dimension elves who guide the way.",
  "colors": { "primary": "#c9b8f0", "secondary": "#8fb4ff", "accent": "#3fe0ff" },
  "favoredRoles": ["stealth", "ranged"],
  "bonus": {
    "description": "Verserovers act faster together.",
    "tiers": [
      { "count": 2, "statBonus": { "spd": 0.05 } },
      { "count": 4, "statBonus": { "spd": 0.10, "atk": 0.05 } }
    ]
  },
  "playable": true
}
```

- `statBonus` values are fractions (0.05 = +5%).
- `playable: false` covers factions you cannot pull yet, such as The Stranded or the enemy.

### Hero

```json
{
  "id": "zoe",
  "name": "Zoë",
  "faction": "verserovers",
  "rarity": "rare",
  "role": "ranged",
  "damageType": "physical",
  "personality": "Cool-headed sharpshooter who never misses twice.",
  "baseStats": { "hp": 820, "atk": 96, "def": 38, "spd": 104 },
  "growth":   { "hp": 62,  "atk": 7,  "def": 3,  "spd": 0 },
  "basicAttack": { "power": 1.0, "target": "enemy-back" },
  "skill": "zoe-starfall-shot",
  "art": {
    "portrait": "heroes/zoe/portrait.png",
    "poses": {
      "idle": "heroes/zoe/idle.png",
      "run1": "heroes/zoe/run1.png",
      "run2": "heroes/zoe/run2.png",
      "attack": "heroes/zoe/attack.png",
      "skill": "heroes/zoe/skill.png",
      "hit": "heroes/zoe/hit.png",
      "victory": "heroes/zoe/victory.png"
    }
  }
}
```

- Stats at level `n` are `baseStats + growth × (n − 1)`, then multiplied by the star bonus from `economy.json`.
- `art` paths are relative to `assets/sprites/`. Until the art is ready, the renderer shows a colored placeholder in the faction color.
- `basicAttack.target` defaults to the role's usual target when left out.

### Skill

```json
{
  "id": "zoe-starfall-shot",
  "name": "Starfall Shot",
  "description": "Fires a charged arrow at the furthest enemy and stuns it briefly.",
  "energyCost": 100,
  "effects": [
    { "kind": "damage", "target": "enemy-back", "power": 2.4, "damageType": "physical" },
    { "kind": "status", "target": "enemy-back", "status": "stun", "durationTicks": 15, "chance": 1.0 }
  ],
  "animation": "freeze-zoom"
}
```

Effect kinds:

| kind | fields |
|---|---|
| `damage` | `target`, `power`, `damageType`, optional `hits` (default 1) |
| `heal` | `target`, `power` (× caster atk) |
| `status` | `target`, `status`, `durationTicks` (not used by `cleanse` and `dispel`), optional `chance` (default 1), optional `stat` and `amount` for `buff`, `debuff` and `slow`, optional `shieldPower` for `shield` |
| `dot` | `target`, `damageType` (`burn` or `poison`), `powerPerTick`, `durationTicks`, `intervalTicks` |
| `energy` | `target`, `amount` (gives or drains energy) |
| `revive` | `target` (`ally-lowest-hp` picks a defeated ally), `hpFraction` |

Effects resolve in order. A `status` effect that has the same `target` as an earlier `damage` effect hits the same unit(s) the damage picked.

`animation` names a code animation preset (`lunge`, `freeze-zoom`, `projectile`, `area-flash`, `heal-glow`).

### Enemy

```json
{
  "id": "grey-slime-gremlin",
  "name": "Slime Gremlin",
  "family": "grey",
  "role": "charger",
  "damageType": "physical",
  "baseStats": { "hp": 600, "atk": 70, "def": 25, "spd": 90 },
  "growth":   { "hp": 50,  "atk": 5,  "def": 2,  "spd": 0 },
  "basicAttack": { "power": 1.0 },
  "skill": "gremlin-color-drain",
  "keywords": [],
  "art": { "poses": { "idle": "enemies/grey-slime-gremlin/idle.png" } }
}
```

- `skill` is optional. Enemies use it automatically when their energy is full.
- `keywords` hold boss rules. Phase 1 set:
  - `psionic-shield`: has a shield that only psionic damage removes.
  - `immune-unless-stunned`: takes no damage unless stunned.
  - `poison-blocks-healing`: cannot heal while poisoned. This keyword goes on enemies that heal.
- Awakened Grey (Grey that join the player) are heroes with `faction: "grey"` and are not part of Phase 1.

### Stage

```json
{
  "id": "stage-01",
  "chapter": 1,
  "order": 1,
  "name": "Static on the Playground",
  "transmission": {
    "speaker": "zoe",
    "lines": [
      "Contact! Your radar picked us up.",
      "The Grey are draining the color from your world. We need a team."
    ]
  },
  "recommendedLevel": 1,
  "waves": [
    { "enemies": [
      { "enemy": "grey-slime-gremlin", "level": 1, "row": "front" },
      { "enemy": "grey-slime-gremlin", "level": 1, "row": "front" }
    ] },
    { "enemies": [
      { "enemy": "grey-hollow-knight", "level": 2, "row": "front", "boss": false }
    ] }
  ],
  "rules": { "maxRarity": null, "turnLimitTicks": 1800 },
  "stars": ["win", "no-hero-lost", "under-turn-limit"],
  "rewards": {
    "firstClear": { "signalShards": 50, "xpCrystals": 200 },
    "repeat":     { "xpCrystals": 60 }
  },
  "targetWinRate": [0.85, 0.98]
}
```

- `transmission.speaker` is a hero or faction id.
- `rules.maxRarity` supports "commons and uncommons only" challenge stages.
- `targetWinRate` is the band the simulator checks with the recommended reference team for that stage.

### Economy

```json
{
  "steps": {
    "shardsPerThousandSteps": 10,
    "dailyShardCap": 100,
    "dailyGoalSteps": 6000,
    "dailyGoalBonusShards": 20
  },
  "summon": {
    "cost": 30,
    "odds": { "common": 0.60, "uncommon": 0.28, "rare": 0.10, "epic": 0.02 },
    "pity": { "pulls": 20, "minRarity": "rare" }
  },
  "heroes": {
    "maxLevel": 30,
    "xpPerLevel": [0, 100, 150, 220],
    "starBonus": [0, 0.08, 0.16, 0.25, 0.35]
  }
}
```

All numbers are first guesses for the simulator to tune. Kid and adult step rates are an open question.

### Save data (on the phone)

```ts
interface SaveV1 {
  version: 1;
  wallet: { signalShards: number; xpCrystals: number };
  steps: { lastConvertedDate: string; convertedToday: number }; // date as YYYY-MM-DD
  summon: { pullsSinceRare: number };
  roster: Record<Id, { level: number; xp: number; stars: number }>;
  team: Array<{ hero: Id; row: Row }>;                          // up to 5
  campaign: Record<Id, { cleared: boolean; stars: number }>;
}
```

Never store an exact location in a save.

## Open questions carried from the plan

- Game name, enemy name (candidates: The Hush, The Pale Choir, The Wane, The Stillness), and the Desserts faction name, all chosen with June.
- Second Phase 1 faction (the Zaurs are the likely pick).
- The twelve Phase 1 heroes: names, roles, skills, personalities.
- Step cap and exchange rate for kids versus adults.
