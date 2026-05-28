# Requirements Document

## Introduction

משחק מתמטיקה חינוכי לילדי כיתה א' (גילאי 6-7) בנושא חיבור וחיסור עד 20, עם מוטיב ג'ודו. המשחק כולל מערכת התקדמות חגורות בדומה לג'ודו אמיתי, אנימציות מגניבות, ומצב תחרויות/טורנירים. המטרה היא לעודד ילדים לתרגל חשבון בצורה מהנה ומאתגרת.

## Glossary

- **Game**: The Judo Math educational application for first-grade children
- **Player**: A child user interacting with the Game
- **Math_Problem**: A single addition or subtraction exercise with operands and result between 0 and 20
- **Belt**: A colored rank representing the Player's overall progression level, following the Judo order: White, Yellow, Orange, Green, Blue, Brown, Black
- **Stripe**: An incremental advancement marker within a Belt, representing partial progress toward the next Belt color
- **Game_Session**: A single round of play consisting of a fixed set of Math_Problems
- **Score**: The percentage of correct answers in a Game_Session
- **Advancement_Threshold**: The minimum Score (75%) required for belt or stripe progression
- **Belt_Ceremony**: An animated celebration displayed when a Player earns a new Belt or Stripe
- **Tournament**: A competitive mode where Players compete against each other or against time
- **Animation_Engine**: The component responsible for rendering visual effects and animations
- **Progress_Tracker**: The component responsible for tracking and persisting Player belt and stripe advancement
- **Web_Platform**: The Game running in a web browser (desktop or mobile) via responsive web application
- **Android_Platform**: The Game running as a native or Progressive Web App on Android devices
- **Responsive_Layout**: The UI layout system that adapts Game elements to different screen sizes and orientations

## Requirements

### Requirement 1: Math Problem Generation

**User Story:** As a Player, I want to solve addition and subtraction problems appropriate for my level, so that I can practice math skills in a fun way.

#### Acceptance Criteria

1. THE Game SHALL generate Math_Problems using only addition and subtraction operations
2. WHEN generating a Math_Problem, THE Game SHALL ensure all operands are whole numbers between 0 and 20
3. WHEN generating a Math_Problem, THE Game SHALL ensure the result is a whole number between 0 and 20
4. WHEN generating a subtraction Math_Problem, THE Game SHALL ensure the result is not negative
5. WHEN a Player answers a Math_Problem, THE Game SHALL display whether the answer is correct or incorrect within 1 second

### Requirement 2: Answer Input

**User Story:** As a Player (age 6-7), I want an easy way to enter my answers, so that I can focus on the math rather than struggling with the interface.

#### Acceptance Criteria

1. THE Game SHALL display a number input mechanism suitable for children aged 6-7
2. THE Game SHALL display numbers and operators in a font size of at least 32px
3. WHEN a Player submits an answer, THE Game SHALL provide immediate visual feedback indicating correctness
4. WHEN a Player submits a correct answer, THE Animation_Engine SHALL play a positive reinforcement animation
5. WHEN a Player submits an incorrect answer, THE Animation_Engine SHALL play a gentle encouragement animation and display the correct answer

### Requirement 3: Belt Progression System

**User Story:** As a Player, I want to earn Judo belts as I improve, so that I feel motivated to keep practicing.

#### Acceptance Criteria

1. THE Progress_Tracker SHALL maintain the following Belt order: White, Yellow, Orange, Green, Blue, Brown, Black
2. THE Progress_Tracker SHALL assign the White Belt to every new Player at registration
3. WHEN a Player completes a Game_Session with a Score of 75% or higher, THE Progress_Tracker SHALL award one Stripe toward the next Belt
4. WHEN a Player completes a Game_Session with a Score below 75%, THE Progress_Tracker SHALL not award a Stripe for that session
5. THE Progress_Tracker SHALL require a minimum of 3 Stripes to advance from one Belt color to the next Belt color
6. WHEN a Player earns the required number of Stripes for advancement, THE Progress_Tracker SHALL promote the Player to the next Belt color and reset the Stripe count to zero

### Requirement 4: Stripe Sub-Progression

**User Story:** As a Player, I want to see my gradual progress within each belt, so that I stay motivated between belt promotions.

#### Acceptance Criteria

1. THE Game SHALL display the current number of Stripes earned on the Player's current Belt
2. WHEN a Player earns a new Stripe, THE Animation_Engine SHALL play a stripe-earned animation
3. THE Game SHALL display a progress indicator showing how many Stripes remain until the next Belt promotion
4. WHILE a Player has earned at least one Stripe, THE Game SHALL visually render the Stripes on the Belt icon

### Requirement 5: Belt Ceremony Animations

**User Story:** As a Player, I want to see a cool celebration when I earn a new belt, so that the achievement feels special and exciting.

#### Acceptance Criteria

1. WHEN a Player is promoted to a new Belt color, THE Animation_Engine SHALL play a Belt_Ceremony animation lasting between 3 and 8 seconds
2. WHEN a Belt_Ceremony is triggered, THE Animation_Engine SHALL display the new Belt color prominently
3. WHEN a Belt_Ceremony is triggered, THE Animation_Engine SHALL play a congratulatory sound effect
4. WHEN a Belt_Ceremony completes, THE Game SHALL allow the Player to dismiss the ceremony and continue playing

### Requirement 6: Game Session Structure

**User Story:** As a Player, I want game sessions that are short and focused, so that I can play without losing concentration.

#### Acceptance Criteria

1. THE Game SHALL present exactly 10 Math_Problems per Game_Session
2. WHEN a Game_Session ends, THE Game SHALL display the Player's Score as a percentage
3. WHEN a Game_Session ends, THE Game SHALL display how many problems were answered correctly out of the total
4. WHEN a Game_Session ends, THE Game SHALL offer the Player the option to start a new Game_Session or return to the main menu

### Requirement 7: Tournament Mode

**User Story:** As a Player, I want to compete in tournaments, so that I can challenge myself and compare my performance.

#### Acceptance Criteria

1. THE Game SHALL provide a Tournament mode accessible from the main menu
2. WHEN a Tournament starts, THE Game SHALL present a series of 3 consecutive Game_Sessions
3. WHEN a Tournament is in progress, THE Game SHALL display a timer showing elapsed time for each Math_Problem
4. WHEN a Tournament ends, THE Game SHALL display the Player's total Score across all sessions
5. WHEN a Tournament ends, THE Game SHALL display the Player's total completion time
6. THE Game SHALL maintain a leaderboard showing the top 10 Tournament scores

### Requirement 8: Visual Design and Animations

**User Story:** As a Player, I want the game to look cool with Judo-themed graphics, so that I enjoy playing and feel like a real martial artist.

#### Acceptance Criteria

1. THE Game SHALL use a Judo dojo-themed visual design for the main game screen
2. THE Animation_Engine SHALL render all animations at a minimum of 30 frames per second
3. THE Game SHALL display a Judo character avatar representing the Player
4. WHEN a Player advances a Belt, THE Game SHALL update the avatar's belt color to match the new Belt
5. THE Game SHALL use child-friendly colors and rounded visual elements appropriate for ages 6-7

### Requirement 9: Player Profile and Persistence

**User Story:** As a Player, I want my progress to be saved, so that I can continue from where I left off.

#### Acceptance Criteria

1. THE Game SHALL persist the Player's current Belt and Stripe count between sessions
2. THE Game SHALL persist the Player's total number of completed Game_Sessions
3. THE Game SHALL persist the Player's overall correct answer percentage
4. WHEN the Game is launched, THE Game SHALL restore the Player's last saved progress
5. THE Game SHALL use a persistence mechanism that functions on both the Web_Platform and the Android_Platform
6. WHEN a Player switches between the Web_Platform and the Android_Platform using the same account, THE Game SHALL restore the Player's saved progress

### Requirement 10: Accessibility and Usability for Young Children

**User Story:** As a parent, I want the game to be easy for my first-grader to use independently, so that my child can play without constant help.

#### Acceptance Criteria

1. THE Game SHALL provide navigation using large, clearly labeled buttons with icons
2. THE Game SHALL use minimal text, supplemented with visual icons, for all menu options
3. WHILE running on the Android_Platform or a mobile web browser, THE Game SHALL support touch input for all interactive elements
4. WHILE running on the Web_Platform on a desktop device, THE Game SHALL support mouse and keyboard input for all interactive elements
5. IF the Player is inactive for more than 30 seconds during a Game_Session, THEN THE Game SHALL display a gentle reminder animation to encourage continued play
6. THE Game SHALL not include any external links, advertisements, or in-app purchases


### Requirement 11: Cross-Platform Support

**User Story:** As a Player, I want to play the game on my family's computer browser or on an Android phone/tablet, so that I can practice math wherever I am.

#### Acceptance Criteria

1. THE Game SHALL run in modern web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile devices
2. THE Game SHALL run on Android devices running Android 8.0 or higher as a native app or Progressive Web App
3. THE Responsive_Layout SHALL adapt all Game screens to viewport widths ranging from 320px to 1920px
4. WHILE running on a device with a viewport width below 768px, THE Responsive_Layout SHALL display Game elements in a single-column vertical layout
5. WHILE running on a device with a viewport width of 768px or above, THE Responsive_Layout SHALL display Game elements in an optimized multi-column layout
6. THE Animation_Engine SHALL render all animations at a minimum of 30 frames per second on both the Web_Platform and the Android_Platform
7. WHEN the device orientation changes, THE Responsive_Layout SHALL re-adapt the Game layout within 500 milliseconds
8. THE Game SHALL provide equivalent functionality on both the Web_Platform and the Android_Platform
