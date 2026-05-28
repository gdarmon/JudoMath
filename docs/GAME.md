# Game Rules

This document describes how Judo Math behaves from the player's point of view.

## Audience

The game is built for a child in first grade. The core loop is intentionally
short, visual, and encouraging:

1. Solve one arithmetic problem.
2. Get immediate feedback.
3. Earn a small celebration when correct.
4. Build toward a stripe and then a new judo belt.

The game avoids shame-based feedback. A wrong answer shows the correct answer
briefly and moves on.

## Math Scope

Current normal sessions practice:

- Addition.
- Subtraction.
- Whole numbers from 0 to 20.
- Subtraction never produces a negative answer.
- Generated answers stay in the 0 to 20 range.

The generator lives in `src/logic/problemGenerator.ts`.

## Normal Session

| Rule | Value |
| --- | --- |
| Questions per session | 10 |
| Answer choices | 6 |
| Progress threshold | 75% |
| Reward clip duration | 30 seconds |
| Streak praise starts | 3 correct answers in a row |

Each question is multiple choice. Correct answers trigger feedback, streak
praise when relevant, and a short judo clip. Wrong answers reset the streak and
show a gentle correction.

## Belts and Stripes

The game uses this judo belt order:

1. White
2. Yellow
3. Orange
4. Green
5. Blue
6. Brown
7. Black

Progression rules:

- A session score of at least 75% earns 1 stripe.
- A session score below 75% does not earn a stripe.
- 3 stripes promote the player to the next belt.
- Promotion resets stripes to 0 on the new belt.
- Black belt can still earn stripes, but does not promote further.

The implementation lives in `src/logic/beltProgression.ts`.

## Encouragement

The app uses short Hebrew phrases designed to feel warm and kid-friendly.

Examples:

- `כל הכבוד!`
- `לא נורא, ננסה שוב`
- `איפון! רצף מעולה!`
- `אבא גאה בך`
- `אמא ממש שמחה`

All user-facing strings live in `src/i18n/he.ts`, including streak messages.

## Reward Clips

Reward clips are short judo-related YouTube embeds shown after correct answers.

Current behavior:

- The clip pool is curated in `src/data/judoClips.ts`.
- Clips use `youtube-nocookie.com` embeds.
- Clips are chosen through `src/logic/clipRotation.ts`.
- The rotation avoids repeats until the full pool has been used.
- If a clip fails to load, the app tries another clip.

The app does not inject ads. YouTube can still control its own playback and ad
behavior, so browser validation checks embeddability and load errors rather than
guaranteeing that YouTube will never display promotional content.

## Tournament Mode

Tournament mode is a faster challenge flow:

- 3 sessions.
- 10 questions per session.
- The app records answer timing per problem.
- Final result combines all tournament sessions into one score and total time.

Tournament logic lives in `src/logic/tournament.ts`; the screen is
`src/components/TournamentScreen.tsx`.

## Persistence

The app saves local player progress with IndexedDB:

- Current belt.
- Current stripes.
- Total sessions.
- Total correct answers.
- Total problems.

The active local persistence code is `src/persistence/offlineCache.ts`.
