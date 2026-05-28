import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Test infrastructure verification', () => {
  it('vitest runs correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('fast-check runs a trivial property', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (n) => {
        return n + 0 === n
      }),
      { numRuns: 100 }
    )
  })

  it('fast-check verifies addition commutativity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (a, b) => {
          return a + b === b + a
        }
      ),
      { numRuns: 100 }
    )
  })
})
