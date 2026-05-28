/**
 * Hebrew strings — single source of truth for the UI.
 *
 * To tweak wording, edit values here. Components import from this module
 * rather than hard-coding any user-facing text.
 */

import { Belt } from '../types'

export const dir = 'rtl' as const
export const lang = 'he' as const

/* App-wide */
export const APP_TITLE = "ג'ודו מתמטיקה"
export const APP_SUBTITLE = 'הרוויחו חגורה — תרגיל אחר תרגיל'

/* Belt names (Hebrew) */
export const BELT_NAMES: Record<Belt, string> = {
  [Belt.White]: 'לבנה',
  [Belt.Yellow]: 'צהובה',
  [Belt.Orange]: 'כתומה',
  [Belt.Green]: 'ירוקה',
  [Belt.Blue]: 'כחולה',
  [Belt.Brown]: 'חומה',
  [Belt.Black]: 'שחורה',
}

export const beltLabel = (belt: Belt) => `חגורה ${BELT_NAMES[belt]}`

/* Main menu */
export const MENU = {
  play: 'לשחק',
  playSub: 'פתרו ותקבלו פסים',
  tournament: 'טורניר',
  tournamentSub: '3 סבבים נגד השעון',
  profile: 'הפרופיל שלי',
  profileSub: 'החגורה והנתונים שלי',
} as const

/* Game session */
export const GAME = {
  questionOf: (n: number, total: number) => `שאלה ${n} מתוך ${total}`,
  questionShort: (n: number, total: number) => `${n}/${total}`,
  back: 'חזרה לתפריט',
  backShort: 'חזרה',
  reminder: 'עדיין כאן? בואו נמשיך! 👋',
  inactiveAriaLabel: 'תזכורת — בואו נמשיך לשחק',
} as const

/* Problem display */
export const PROBLEM = {
  correctIcon: 'תשובה נכונה',
  incorrectIcon: 'תשובה לא נכונה',
  correctMessage: 'כל הכבוד! 🎉',
  streakMessages: [
    'איפון! רצף מעולה!',
    'אלוף, אתה חזק על המזרן!',
    'תותח! עוד תשובה מדויקת!',
    'זריקה יפה של מספרים!',
    'אבא גאה בך',
    'אמא ממש שמחה',
    'וואזה-ארי! ממשיכים קדימה!',
    'איזה ריכוז של ג׳ודוקא!',
    'כל הכבוד, הרצף שלך עובד!',
    'ניצחון קטן ועוד אחד!',
  ],
  incorrectMessage: 'לא נורא, ננסה שוב',
  correctAnswerIs: (n: number) => `התשובה הנכונה היא ${n}`,
  questionMark: '?',
} as const

/* Answer choices */
export const CHOICES = {
  groupLabel: 'בחרו תשובה',
  answerAria: (n: number) => `תשובה ${n}`,
} as const

/* Session results */
export const RESULTS = {
  perfect: 'מושלם!',
  great: 'כל הכבוד!',
  good: 'יפה מאוד!',
  keepGoing: 'עוד מעט תצליחו!',
  scoreAria: (pct: number) => `הציון שלך: ${pct} אחוז`,
  scoreLabel: (correct: number, total: number) => `${correct} מתוך ${total} נכונות`,
  scoreLabelAria: (correct: number, total: number) => `${correct} נכונות מתוך ${total}`,
  stripeEarned: 'הרווחת פס!',
  stripeAriaLabel: 'פס חדש',
  beltPromotion: 'חגורה חדשה!',
  beltPromotionAria: (belt: Belt) => `קודמת לחגורה ${BELT_NAMES[belt]}`,
  newBeltLabel: 'חגורה חדשה: ',
  playAgain: 'משחק נוסף',
  mainMenu: 'תפריט ראשי',
  regionLabel: 'תוצאות הסבב',
} as const

/* Belt ceremony */
export const CEREMONY = {
  title: '🎉 כל הכבוד! 🎉',
  subtitle: 'קיבלת חגורה חדשה! המשיכו ככה!',
  beltLabel: (belt: Belt) => `חגורה ${BELT_NAMES[belt]}`,
  continue: 'המשך לשחק',
  dialogAria: (belt: Belt) => `טקס הענקת חגורה ${BELT_NAMES[belt]}`,
} as const

/* Reward clip overlay */
export const REWARD = {
  title: 'כל הכבוד!',
  skip: 'דלג והמשך',
  skipAria: 'דלג על הסרטון והמשך',
  dialogAria: 'סרטון פרס',
  fallbackText: 'הסרטון לא נטען — אבל הרווחת כוכב!',
  countdownAria: (s: number) => `נותרו ${s} שניות`,
} as const

/* Tournament screen */
export const TOURNAMENT = {
  sessionLabel: (idx: number, total: number) => `סבב ${idx} מתוך ${total}`,
  problemLabel: (idx: number, total: number) => `שאלה ${idx} מתוך ${total}`,
  timerAria: (s: string) => `זמן שעבר: ${s}`,
  timerSeconds: (n: number) => `${n.toFixed(1)} שנ׳`,
  back: 'חזרה',
  backAria: 'חזרה לתפריט',
} as const

/* Tournament results */
export const TOURNAMENT_RESULTS = {
  champion: 'אלוף!',
  amazing: 'מדהים!',
  wellDone: 'יפה מאוד!',
  goodTry: 'ניסיון יפה!',
  scoreAria: (pct: number) => `ציון כללי: ${pct} אחוז`,
  timeLabel: 'זמן',
  timeAria: (t: string) => `זמן סיום: ${t}`,
  sessionsLabel: 'סבבים',
  sessionsAria: (done: number, total: number) => `${done} מתוך ${total} סבבים הושלמו`,
  sessionsValue: (done: number, total: number) => `${done}/${total}`,
  playAgain: 'טורניר נוסף',
  mainMenu: 'תפריט ראשי',
  regionLabel: 'תוצאות הטורניר',
} as const

/* Player profile */
export const PROFILE = {
  stripesTitle: 'התקדמות פסים',
  stripesAria: (have: number, total: number) => `${have} מתוך ${total} פסים`,
  stripesText: (have: number, total: number) => `${have}/${total} פסים`,
  stripesRemaining: (n: number) => `עוד ${n} כדי לעלות חגורה!`,
  statsTitle: 'הסטטיסטיקה שלי',
  sessionsPlayed: 'סבבים ששיחקת',
  correctRate: 'אחוז הצלחה',
  back: 'חזרה לתפריט',
  avatarAria: (belt: Belt) => `אווטאר עם חגורה ${BELT_NAMES[belt]}`,
} as const

/* Leaderboard (kept simple — feature still exists) */
export const LEADERBOARD = {
  title: 'טבלת מובילים',
  loading: 'טוען...',
  loadingAria: 'טוען טבלת מובילים',
  empty: 'עוד אין תוצאות. היה הראשון!',
  ariaLabel: 'טבלת מובילים',
  rowAria: (rank: number, name: string, score: number, time: string) =>
    `מקום ${rank}: ${name}, ציון ${score} אחוז, זמן ${time}`,
} as const

/* Number input pad (kept for tournament keyboard input) */
export const NUMPAD = {
  padAria: 'לוח הקלדת מספרים',
  digitAria: (d: number) => `${d}`,
  clear: 'נקה',
  clearAria: 'נקה',
  backspace: 'מחק',
  backspaceAria: 'מחק',
  submit: 'אישור',
  submitAria: 'שליחת תשובה',
} as const
