import { describe, expect, it } from 'vitest'
import { Belt } from '../../types'
import {
  calculateChampionshipPlacement,
  getChampionshipStageForBelt,
} from '../../logic/championship'

describe('championship stage mapping', () => {
  it('uses qualifiers for White and Yellow belts', () => {
    expect(getChampionshipStageForBelt(Belt.White).id).toBe('qualifiers')
    expect(getChampionshipStageForBelt(Belt.Yellow).id).toBe('qualifiers')
  })

  it('uses quarter final for Orange and Green belts', () => {
    expect(getChampionshipStageForBelt(Belt.Orange).id).toBe('quarterFinal')
    expect(getChampionshipStageForBelt(Belt.Green).id).toBe('quarterFinal')
  })

  it('uses semi final for Blue belt', () => {
    expect(getChampionshipStageForBelt(Belt.Blue).id).toBe('semiFinal')
  })

  it('uses final for Brown and Black belts', () => {
    expect(getChampionshipStageForBelt(Belt.Brown).id).toBe('final')
    expect(getChampionshipStageForBelt(Belt.Black).id).toBe('final')
  })
})

describe('calculateChampionshipPlacement', () => {
  it('gives first place for a perfect score', () => {
    expect(calculateChampionshipPlacement(20, 20)).toBe(1)
  })

  it('maps performance into places 1-10', () => {
    expect(calculateChampionshipPlacement(18, 20)).toBe(2)
    expect(calculateChampionshipPlacement(16, 20)).toBe(3)
    expect(calculateChampionshipPlacement(10, 20)).toBe(6)
    expect(calculateChampionshipPlacement(2, 20)).toBe(10)
    expect(calculateChampionshipPlacement(0, 20)).toBe(10)
  })

  it('handles empty totals defensively', () => {
    expect(calculateChampionshipPlacement(0, 0)).toBe(10)
  })
})
