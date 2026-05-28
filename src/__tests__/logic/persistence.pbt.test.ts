import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { OfflineCache } from '../../persistence/offlineCache';
import type { PlayerProgress } from '../../types';
import { Belt } from '../../types';

describe('Feature: judo-math-game, Property 10: Player progress persistence round-trip', () => {
  let cache: OfflineCache;

  beforeEach(async () => {
    // Delete the database before each test to ensure clean state
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('judomath-offline');
      req.onsuccess = () => resolve();
      req.onerror = () => reject();
    });
    cache = new OfflineCache();
    await cache.init();
  });

  afterEach(() => {
    cache.close();
  });

  /**
   * **Validates: Requirements 9.1, 9.2, 9.3**
   *
   * For any valid PlayerProgress object, serializing it to the persistence
   * format (saving to IndexedDB via OfflineCache) and then deserializing it
   * back (loading from IndexedDB) must produce an object equal to the original,
   * preserving currentBelt, currentStripes, totalSessions, totalCorrect, and totalProblems.
   */
  it('saving and loading any valid PlayerProgress produces an equal object', async () => {
    const beltValues = [Belt.White, Belt.Yellow, Belt.Orange, Belt.Green, Belt.Blue, Belt.Brown, Belt.Black];

    const playerProgressArb: fc.Arbitrary<PlayerProgress> = fc.record({
      currentBelt: fc.integer({ min: 0, max: 6 }).map((i) => beltValues[i]),
      currentStripes: fc.integer({ min: 0, max: 2 }),
      totalSessions: fc.integer({ min: 0, max: 10000 }),
      totalCorrect: fc.integer({ min: 0, max: 100000 }),
      totalProblems: fc.integer({ min: 0, max: 100000 }),
    });

    await fc.assert(
      fc.asyncProperty(playerProgressArb, async (progress) => {
        const playerId = 'test-player';

        await cache.saveProgress(playerId, progress);
        const loaded = await cache.loadProgress(playerId);

        expect(loaded).not.toBeNull();
        expect(loaded).toEqual(progress);
      }),
      { numRuns: 100 }
    );
  });
});
