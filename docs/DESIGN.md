# Design

Judo Math is designed as a focused practice tool for a young child, not as a
school worksheet. The interface should feel friendly, fast, and rewarding while
keeping the math readable.

## Design Goals

- Make a child want to start another round.
- Keep every interaction obvious on a phone.
- Avoid negative or discouraging language.
- Give clear progress toward a visible judo goal.
- Keep Hebrew natural while rendering math left-to-right.
- Work as both a browser game and an installed Android/PWA experience.

## Audience Principles

The player is expected to be young, easily distracted, and still building
confidence with arithmetic. That means:

- Sessions are short.
- Buttons are large.
- Feedback is immediate.
- Wrong answers are treated as practice, not failure.
- Progress uses concrete rewards: stripes, belts, and clips.

## Visual Language

The game uses a soft judo/dojo theme:

- A centered child-friendly 3D judoka avatar wearing the selected judo suit skin.
- Belt colors as the primary progression signal.
- Warm highlights for actions and celebrations.
- Large math typography.
- Rounded, touch-friendly answer buttons.
- Full-screen focus during sessions.

Shared design tokens live in `src/styles/variables.css`.

## Suit Skins

Suit skins are meant to feel like visible status rewards, not just settings.
The child can unlock:

- White suit from the start.
- Black suit after 3 belt promotions.
- Blue suit after another 3 belt promotions.

When a skin is selected, two things change:

- The main avatar switches to the matching 3D judoka image.
- The app accent color and soft background shift toward the selected skin.

Locked skins remain visible in the profile screen with an unlock hint. This
gives the child a future goal without interrupting practice.

Avatar image assets live in `src/assets/avatars/`. `JudoAvatar` only adds the
soft background, shadow, and ready-stance motion around those generated assets.

## Hebrew and Math Direction

The app shell is Hebrew RTL:

```html
<html lang="he" dir="rtl">
```

Math expressions, timers, and score fractions use left-to-right styling where
needed through the `is-ltr` utility class. This prevents expressions like
`7 + 5` or `3/10` from being visually reversed inside Hebrew UI.

## Main Menu

Purpose: start play quickly and show progress at a glance.

Key elements:

- Avatar.
- App title.
- Current belt badge.
- Three primary actions: play, tournament, profile.

The menu should remain uncluttered. New modes should be introduced through clear
action cards or a dedicated mode-selection screen, not by crowding the first
screen.

## Game Session

Purpose: keep the child inside a simple solve-feedback-reward loop.

Key elements:

- Back button.
- Question counter.
- Current belt indicator.
- Progress bar.
- Large problem display.
- Six answer choices.
- Inactivity reminder after 30 seconds.

Feedback behavior:

- Correct answer: green/positive state and optional streak praise.
- Wrong answer: gentle incorrect state and a brief correct-answer reveal.
- Input is disabled during feedback to avoid accidental double taps.

## Reward Clip Modal

Purpose: make correct answers feel rewarding without derailing the whole session.

Key elements:

- Full-screen modal.
- Clip title.
- Embedded YouTube video.
- 30-second countdown.
- Choice to keep watching after the timer ends.
- Button to return to the game.
- Fallback if the video does not load.

The modal is intentionally skippable because sometimes the child wants speed,
and sometimes the parent wants practice without waiting for every clip. Once the
timer ends, the video stays open until the child chooses whether to keep
watching or continue the game.

## Session Results

Purpose: explain what was earned and encourage another attempt.

The results screen should make these clear:

- How many answers were correct.
- Whether a stripe was earned.
- Whether a belt promotion happened.
- How to play again.
- How to return to the menu.

## Belt Ceremony

Purpose: make promotion feel special.

The ceremony uses a dialog overlay with animation. The animation is celebratory
but short, so it does not block repeated practice for too long.

## National Championship Mode

Purpose: provide a more exciting timed challenge that appears to grow with the
child's belt progress.

Championship UI emphasizes:

- Current championship stage.
- Current question.
- Countdown timer per question.
- Fast numeric entry.
- Final placement from 1st to 10th.

The championship starts with an intro screen so the child understands the stage,
question count, and time limit before the timer begins. The stage naming follows
the feeling of a real competition: qualifiers, quarter final, semi final, and
the national championship final.

The mode should feel more intense than normal play, but still safe and
encouraging. Timeout should never scold the child; it simply counts the answer
as missed and moves forward.

## Accessibility and Usability

The app should maintain:

- Touch targets of at least 44px.
- Text that remains readable on small phones.
- ARIA labels on icon-like controls.
- Keyboard-friendly input where possible.
- Visible focus states.
- No reliance on color alone for critical feedback.
- Responsive layouts from narrow phone screens to desktop browsers.

## Copy Tone

The tone should sound like a supportive parent or coach:

- Short.
- Warm.
- Energetic.
- Not sarcastic.
- No insults.
- No pressure after mistakes.

All visible copy should be centralized in `src/i18n/he.ts` so wording changes do
not require hunting through components.

## Future Design Notes

If more math topics are added, introduce a topic-selection screen before the
game mode screen. Avoid putting every topic directly on the main menu. The first
screen should stay simple enough for a young child to understand without help.
