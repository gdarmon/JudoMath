# Judo Math

Judo Math is a Hebrew, mobile-first math practice game for young children. It
uses short arithmetic sessions, judo belt progression, streak praise, and short
YouTube reward clips to keep practice feeling like play.

Live app: https://gdarmon.github.io/JudoMath/

## What the Game Does

- Practices first-grade arithmetic with addition and subtraction up to 20.
- Shows 10 questions per normal session.
- Uses 6 answer choices so the child must think, but still has a low-friction
  touch experience.
- Awards a stripe when a session score is at least 75%.
- Promotes to the next judo belt after 3 earned stripes.
- Unlocks visual suit skins as the child advances: black after 3 belt
  promotions and blue after another 3.
- Gives gentle feedback on wrong answers and positive streak praise after 3+
  correct answers in a row.
- Plays a short judo reward clip after each correct answer.
- Includes a national championship mode with timed 20-question rounds and
  placement from 1st to 10th.
- Saves local progress offline in IndexedDB.
- Runs on the web, as an installable PWA, and as an Android Trusted Web
  Activity wrapper.

## Documentation

- [Game Rules](docs/GAME.md) - gameplay, progression, rewards, and tournaments.
- [Code Architecture](docs/CODE.md) - how the React app, logic modules,
  persistence, clips, and tests are organized.
- [Design](docs/DESIGN.md) - UX principles, screen structure, visual language,
  Hebrew/RTL behavior, and accessibility notes.
- [Android](docs/ANDROID.md) - APK/AAB and Trusted Web Activity release notes.

## Quick Start

Requirements:

- Node 20+
- npm

Install and run locally:

```bash
npm install
npm run dev
```

Run the test suite:

```bash
npm run test
```

Build production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and build the production PWA. |
| `npm run preview` | Serve the built app locally. |
| `npm run test` | Run Vitest tests once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run Playwright tests. |
| `npm run clips:fetch` | Refresh the curated judo clip list from configured sources. |
| `npm run clips:validate` | Validate clip IDs through YouTube metadata checks. |
| `npm run clips:check-browser` | Validate reward embeds in a real browser context. |
| `npm run twa:icons` | Generate PNG icons for PWA/TWA builds. |
| `npm run twa:init` | Initialize Bubblewrap from the deployed web manifest. |
| `npm run twa:build` | Build Android TWA APK/AAB artifacts locally. |

## Project Map

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Top-level screen routing and progress save/load wiring. |
| `src/components/` | UI screens and reusable game components. |
| `src/logic/` | Pure game logic: problem generation, scoring, belts, clips, tournaments. |
| `src/persistence/` | IndexedDB offline cache and optional Firebase service code. |
| `src/data/judoClips.ts` | Curated reward clip pool. |
| `src/i18n/he.ts` | Hebrew UI strings and encouragement text. |
| `src/styles/` | Shared design tokens, responsive rules, and accessibility CSS. |
| `scripts/` | Clip tools, icon generation, and release helpers. |
| `docs/` | Product, code, design, and Android documentation. |

## Deployment

The production web app is deployed by GitHub Actions on every push to `main`.
The workflow installs dependencies, runs tests, generates icons, builds the app,
and deploys `dist/` to GitHub Pages.

Android builds are handled separately through the TWA workflow and Bubblewrap.
See [docs/ANDROID.md](docs/ANDROID.md) for signing, APK, AAB, and Play Store
details.

## Notes for Future Changes

- Keep all user-facing Hebrew text in `src/i18n/he.ts`.
- Keep math behavior in pure logic modules where possible, then cover it with
  tests before changing UI.
- Keep unlockable suit skins in `src/logic/skins.ts`; use the shared avatar
  component so the selected skin stays consistent.
- Reward clips should be refreshed through the scripts and verified in the
  browser before release.
- If Firebase sync is enabled later, document the setup and update
  [docs/CODE.md](docs/CODE.md) to describe the active data flow.
