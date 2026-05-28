import { Belt } from '../types'
import type { ChampionshipStage } from '../types'

export const CHAMPIONSHIP_QUESTION_COUNT = 20

export const CHAMPIONSHIP_STAGES: ChampionshipStage[] = [
  {
    id: 'qualifiers',
    title: 'מוקדמות אליפות הארץ',
    shortTitle: 'מוקדמות',
    description: 'הכניסה הראשונה לאליפות. קצב מהיר, אבל עדיין רגוע.',
    minBelt: Belt.White,
    maxBelt: Belt.Yellow,
    questionCount: CHAMPIONSHIP_QUESTION_COUNT,
    secondsPerQuestion: 15,
  },
  {
    id: 'quarterFinal',
    title: 'רבע גמר אליפות הארץ',
    shortTitle: 'רבע גמר',
    description: 'כבר מרגישים תחרות אמיתית. פחות זמן לכל שאלה.',
    minBelt: Belt.Orange,
    maxBelt: Belt.Green,
    questionCount: CHAMPIONSHIP_QUESTION_COUNT,
    secondsPerQuestion: 12,
  },
  {
    id: 'semiFinal',
    title: 'חצי גמר אליפות הארץ',
    shortTitle: 'חצי גמר',
    description: 'שלב חזק ומהיר. צריך ריכוז של ג׳ודוקא.',
    minBelt: Belt.Blue,
    maxBelt: Belt.Blue,
    questionCount: CHAMPIONSHIP_QUESTION_COUNT,
    secondsPerQuestion: 10,
  },
  {
    id: 'final',
    title: 'אליפות הארץ',
    shortTitle: 'הגמר',
    description: 'הבמה הגדולה. סבב מהיר על המקום הכי גבוה.',
    minBelt: Belt.Brown,
    maxBelt: Belt.Black,
    questionCount: CHAMPIONSHIP_QUESTION_COUNT,
    secondsPerQuestion: 8,
  },
]

export function getChampionshipStageForBelt(belt: Belt): ChampionshipStage {
  return (
    CHAMPIONSHIP_STAGES.find(
      (stage) => belt >= stage.minBelt && belt <= stage.maxBelt,
    ) ?? CHAMPIONSHIP_STAGES[0]
  )
}

export function calculateChampionshipPlacement(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount <= 0) return 10

  const correct = Math.max(0, Math.min(totalCount, correctCount))
  const missed = totalCount - correct
  if (missed === 0) return 1

  const questionsPerPlace = totalCount / 10
  const place = Math.floor((missed - 1) / questionsPerPlace) + 2
  return Math.max(1, Math.min(10, place))
}
