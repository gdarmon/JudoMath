# Implementation Plan: Judo Math Game

## Overview

Implement a cross-platform educational math game (PWA) for first-grade children using React + TypeScript, Firebase backend, Zustand state management, Lottie animations, and fast-check property-based testing. The implementation follows an incremental approach: core logic first, then UI components, animations, persistence, tournament mode, and finally integration wiring.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - [x] 1.1 Initialize React + TypeScript PWA project with Vite
    - Create project with Vite React-TS template
    - Install dependencies: zustand, firebase, lottie-react, fast-check, vitest, @testing-library/react, playwright
    - Configure Vite for PWA (vite-plugin-pwa)
    - Set up directory structure: `src/logic/`, `src/components/`, `src/animations/`, `src/persistence/`, `src/store/`, `src/types/`
    - _Requirements: 11.1, 11.2_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create `src/types/index.ts` with MathProblem, Belt enum, PlayerProgress, SessionResult, ProgressionResult, TournamentState, TournamentSession, TournamentResult, LeaderboardEntry, AnimationConfig, GameStore interfaces
    - Ensure Belt enum follows order: White=0, Yellow=1, Orange=2, Green=3, Blue=4, Brown=5, Black=6
    - _Requirements: 1.1, 3.1, 7.2, 7.6_

  - [x] 1.3 Set up Vitest and fast-check testing configuration
    - Configure vitest.config.ts with test environment (jsdom)
    - Create test directory structure: `src/__tests__/logic/`, `src/__tests__/components/`, `src/__tests__/integration/`
    - Verify fast-check runs with a trivial property test
    - _Requirements: All (testing infrastructure)_

- [x] 2. Implement math problem generation logic
  - [x] 2.1 Implement generateSession and validateAnswer functions
    - Create `src/logic/problemGenerator.ts`
    - Implement `generateSession(config: ProblemGeneratorConfig): MathProblem[]` ensuring all operands in [0,20], results in [0,20], no negative subtraction results
    - Implement `validateAnswer(problem: MathProblem, playerAnswer: number): boolean`
    - Default config: count=10, maxOperand=20, maxResult=20
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1_

  - [x] 2.2 Write property test for problem generation invariants
    - **Property 1: Problem generation invariants**
    - For any generated session, every MathProblem must have operator '+' or '-', operands in [0,20], and correctAnswer in [0,20]
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [x] 2.3 Write property test for session size
    - **Property 5: Session contains exactly 10 problems**
    - For any call to generateSession with default config, the returned array must contain exactly 10 problems
    - **Validates: Requirements 6.1**

- [x] 3. Implement scoring and belt progression logic
  - [x] 3.1 Implement calculateScore function
    - Create `src/logic/scoring.ts`
    - Implement `calculateScore(correctCount: number, totalCount: number): number` returning Math.round(correctCount / totalCount * 100)
    - _Requirements: 6.2_

  - [x] 3.2 Write property test for score calculation
    - **Property 2: Score calculation correctness**
    - For any correctCount ≤ totalCount where totalCount > 0, result must equal Math.round(correctCount / totalCount * 100)
    - **Validates: Requirements 6.2**

  - [x] 3.3 Implement evaluateProgression function
    - Create `src/logic/beltProgression.ts`
    - Implement `evaluateProgression(currentProgress: PlayerProgress, sessionResult: SessionResult): ProgressionResult`
    - Award stripe when score ≥ 75%, no change when score < 75%
    - Promote belt when stripes reach 3, reset stripes to 0
    - Do not promote beyond Black belt
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.4 Write property test for stripe award threshold
    - **Property 3: Stripe award threshold**
    - Stripe awarded if and only if score ≥ 75%; progress unchanged when score < 75%
    - **Validates: Requirements 3.3, 3.4**

  - [x] 3.5 Write property test for belt promotion mechanics
    - **Property 4: Belt promotion mechanics**
    - When stripes=2 and score≥75% and belt is not Black, belt advances and stripes reset to 0
    - **Validates: Requirements 3.5, 3.6**

- [x] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement tournament logic
  - [x] 5.1 Implement tournament state management and scoring
    - Create `src/logic/tournament.ts`
    - Implement `calculateTournamentResult(state: TournamentState): TournamentResult` computing total score across 3 sessions and total time
    - Implement tournament state transitions (start, next session, complete)
    - _Requirements: 7.2, 7.4, 7.5_

  - [x] 5.2 Write property test for tournament structure
    - **Property 6: Tournament consists of exactly 3 sessions**
    - Any completed tournament must contain exactly 3 sessions, each with 10 problems
    - **Validates: Requirements 7.2**

  - [x] 5.3 Write property test for tournament score aggregation
    - **Property 7: Tournament score aggregation**
    - Total score equals total correct across all sessions / total problems, as percentage
    - **Validates: Requirements 7.4**

  - [x] 5.4 Implement leaderboard logic
    - Create `src/logic/leaderboard.ts`
    - Implement sorting by totalScore descending, ties broken by lowest totalTime
    - Limit results to top 10 entries
    - _Requirements: 7.6_

  - [x] 5.5 Write property test for leaderboard ordering and size
    - **Property 8: Leaderboard ordering and size**
    - getLeaderboard(10) returns at most 10 entries sorted by totalScore desc, ties by lowest totalTime
    - **Validates: Requirements 7.6**

- [x] 6. Implement UI components - Main screens
  - [x] 6.1 Create App shell and routing
    - Create `src/App.tsx` with screen navigation (menu, game, tournament, profile)
    - Implement responsive layout with CSS Grid/Flexbox
    - Add breakpoint at 768px: single-column below, multi-column at/above
    - _Requirements: 11.3, 11.4, 11.5_

  - [x] 6.2 Create Main Menu screen
    - Create `src/components/MainMenu.tsx`
    - Large icon buttons for: Play, Tournament, Profile
    - Minimal text with visual icons, child-friendly colors and rounded elements
    - Display current belt and player avatar
    - _Requirements: 10.1, 10.2, 8.1, 8.5_

  - [x] 6.3 Create Number Input Pad component
    - Create `src/components/NumberInput.tsx`
    - Large touch-friendly number buttons (0-20 range input)
    - Font size at least 32px for numbers and operators
    - Disable submit when answer is outside [0,20]
    - Support touch input on mobile, mouse/keyboard on desktop
    - _Requirements: 2.1, 2.2, 10.3, 10.4_

  - [x] 6.4 Create Problem Display component
    - Create `src/components/ProblemDisplay.tsx`
    - Display operand1, operator, operand2 with large font (≥32px)
    - Show visual feedback on answer submission (correct/incorrect) within 1 second
    - _Requirements: 1.5, 2.2, 2.3_

- [x] 7. Implement UI components - Game session and profile
  - [x] 7.1 Create Game Session screen
    - Create `src/components/GameSession.tsx`
    - Wire problem display, number input, and session progress bar
    - Show current problem index (e.g., "3/10")
    - Display belt and stripe indicator during play
    - Implement 30-second inactivity timer with reminder animation trigger
    - _Requirements: 6.1, 6.3, 4.1, 4.3, 10.5_

  - [x] 7.2 Create Session Results screen
    - Create `src/components/SessionResults.tsx`
    - Display score as percentage and correct/total count
    - Show stripe earned indicator if applicable
    - Offer buttons: "Play Again" and "Main Menu"
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 7.3 Create Player Profile screen
    - Create `src/components/PlayerProfile.tsx`
    - Display avatar with current belt color
    - Show belt name, stripe count, stripes remaining for next belt
    - Display total sessions and overall correct percentage
    - _Requirements: 4.1, 4.3, 4.4, 8.3, 8.4, 9.2, 9.3_

  - [x] 7.4 Write property test for avatar belt color mapping
    - **Property 9: Avatar belt color mapping**
    - For any Belt enum value, the color mapping returns a distinct valid color string (bijective mapping)
    - **Validates: Requirements 8.4**

- [x] 8. Implement animations
  - [x] 8.1 Implement Animation Engine and feedback animations
    - Create `src/animations/AnimationEngine.ts`
    - Implement correct answer animation (positive reinforcement, CSS-based)
    - Implement incorrect answer animation (gentle encouragement, show correct answer)
    - Implement stripe-earned animation
    - Implement idle reminder animation (30s inactivity)
    - Target 30fps minimum for all animations
    - _Requirements: 2.4, 2.5, 4.2, 8.2, 10.5, 11.6_

  - [x] 8.2 Implement Belt Ceremony animation
    - Create Lottie-based belt ceremony animation (3-8 seconds duration)
    - Display new belt color prominently
    - Play congratulatory sound effect
    - Add dismiss button to continue playing after ceremony
    - Implement graceful fallback to CSS if Lottie fails to load
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Checkpoint - UI and animations verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement persistence and state management
  - [x] 10.1 Set up Zustand store
    - Create `src/store/gameStore.ts`
    - Implement GameStore interface with player, currentSession, tournament, and UI state
    - Wire game logic functions to store actions
    - _Requirements: 9.1, 9.4_

  - [x] 10.2 Implement Firebase persistence service
    - Create `src/persistence/firebaseService.ts`
    - Configure Firebase Auth (anonymous + account linking)
    - Implement saveProgress, loadProgress, saveLeaderboard, getLeaderboard
    - Set up Firestore document structure for players and leaderboard
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_

  - [x] 10.3 Implement offline support with IndexedDB
    - Create `src/persistence/offlineCache.ts`
    - Implement IndexedDB stores for playerProgress and pendingSync
    - Implement syncOfflineChanges for reconnection
    - Queue changes when offline, sync on reconnect
    - _Requirements: 9.4, 9.5_

  - [x] 10.4 Write property test for persistence round-trip
    - **Property 10: Player progress persistence round-trip**
    - For any valid PlayerProgress, serialize then deserialize must produce equal object
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 11. Implement Tournament Mode UI
  - [x] 11.1 Create Tournament screen
    - Create `src/components/TournamentScreen.tsx`
    - Display timer for each problem (elapsed time)
    - Show current session index (1/3, 2/3, 3/3)
    - Wire to tournament logic for 3 consecutive sessions
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 11.2 Create Tournament Results and Leaderboard screens
    - Create `src/components/TournamentResults.tsx` showing total score and completion time
    - Create `src/components/Leaderboard.tsx` showing top 10 entries
    - Wire leaderboard to Firebase persistence
    - _Requirements: 7.4, 7.5, 7.6_

- [x] 12. Implement responsive layout and cross-platform support
  - [x] 12.1 Implement responsive layout system
    - Create `src/styles/` with responsive CSS using breakpoints at 768px
    - Single-column layout for viewport < 768px
    - Multi-column layout for viewport ≥ 768px
    - Support viewport range 320px to 1920px
    - Handle orientation changes within 500ms
    - _Requirements: 11.3, 11.4, 11.5, 11.7_

  - [x] 12.2 Write property test for responsive layout breakpoint
    - **Property 11: Responsive layout breakpoint behavior**
    - For any viewport width in [320, 1920], single-column when < 768px, multi-column when ≥ 768px
    - **Validates: Requirements 11.4, 11.5**

  - [x] 12.3 Configure PWA manifest and service worker
    - Set up web app manifest with icons and theme
    - Configure service worker for offline caching (vite-plugin-pwa)
    - Ensure installability on Android 8.0+
    - _Requirements: 11.1, 11.2, 11.8_

- [x] 13. Integration wiring and final assembly
  - [x] 13.1 Wire all components together
    - Connect UI screens to Zustand store
    - Wire store actions to game logic functions
    - Connect persistence layer to store (auto-save on progress changes)
    - Wire animation engine to game events (correct/incorrect/stripe/belt)
    - Ensure no orphaned or disconnected code
    - _Requirements: All_

  - [x] 13.2 Implement accessibility and safety features
    - Ensure all interactive elements support touch and mouse/keyboard
    - Verify no external links, ads, or in-app purchases exist
    - Add large clearly-labeled buttons with icons throughout
    - Verify font sizes ≥ 32px for math content
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_

  - [x] 13.3 Write integration tests
    - Test full game session flow (start → 10 problems → results → progression)
    - Test belt promotion flow (earn 3 stripes → ceremony → new belt)
    - Test tournament flow (3 sessions → results → leaderboard)
    - Test offline mode (disconnect → play → reconnect → sync)
    - _Requirements: All_

- [x] 14. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TypeScript throughout with React for UI, Zustand for state, Firebase for persistence, and Lottie for animations
- All game logic (problem generation, scoring, belt progression) is implemented as pure functions for testability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "3.1", "5.4"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3"] },
    { "id": 4, "tasks": ["3.4", "3.5", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.5", "6.1"] },
    { "id": 6, "tasks": ["6.2", "6.3", "6.4", "10.1"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.3", "7.4", "8.1"] },
    { "id": 8, "tasks": ["8.2", "10.2", "10.3"] },
    { "id": 9, "tasks": ["10.4", "11.1", "11.2"] },
    { "id": 10, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 11, "tasks": ["13.1", "13.2"] },
    { "id": 12, "tasks": ["13.3"] }
  ]
}
```
