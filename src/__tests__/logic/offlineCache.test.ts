import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineCache } from '../../persistence/offlineCache';
import { Belt } from '../../types';
import type { PlayerProgress } from '../../types';

describe('OfflineCache', () => {
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

  describe('init', () => {
    it('should initialize without errors', async () => {
      const newCache = new OfflineCache();
      await expect(newCache.init()).resolves.toBeUndefined();
      newCache.close();
    });
  });

  describe('saveProgress / loadProgress', () => {
    const testProgress: PlayerProgress = {
      currentBelt: Belt.Green,
      currentStripes: 2,
      totalSessions: 15,
      totalCorrect: 120,
      totalProblems: 150,
    };

    it('should save and load player progress', async () => {
      await cache.saveProgress('player-1', testProgress);
      const loaded = await cache.loadProgress('player-1');
      expect(loaded).toEqual(testProgress);
    });

    it('should return null for non-existent player', async () => {
      const loaded = await cache.loadProgress('non-existent');
      expect(loaded).toBeNull();
    });

    it('should overwrite existing progress on save', async () => {
      await cache.saveProgress('player-1', testProgress);

      const updatedProgress: PlayerProgress = {
        ...testProgress,
        currentStripes: 0,
        currentBelt: Belt.Blue,
      };
      await cache.saveProgress('player-1', updatedProgress);

      const loaded = await cache.loadProgress('player-1');
      expect(loaded).toEqual(updatedProgress);
    });

    it('should store progress for multiple players independently', async () => {
      const progress2: PlayerProgress = {
        currentBelt: Belt.White,
        currentStripes: 1,
        totalSessions: 3,
        totalCorrect: 25,
        totalProblems: 30,
      };

      await cache.saveProgress('player-1', testProgress);
      await cache.saveProgress('player-2', progress2);

      expect(await cache.loadProgress('player-1')).toEqual(testProgress);
      expect(await cache.loadProgress('player-2')).toEqual(progress2);
    });
  });

  describe('queueSync / getPendingSyncItems', () => {
    it('should queue and retrieve sync items', async () => {
      await cache.queueSync('saveProgress', { playerId: 'p1', progress: {} });
      const items = await cache.getPendingSyncItems();
      expect(items).toHaveLength(1);
      expect(items[0].action).toBe('saveProgress');
      expect(items[0].data).toEqual({ playerId: 'p1', progress: {} });
      expect(items[0].id).toBeDefined();
    });

    it('should return items ordered by timestamp', async () => {
      await cache.queueSync('saveProgress', { order: 1 });
      await cache.queueSync('saveLeaderboard', { order: 2 });
      await cache.queueSync('saveProgress', { order: 3 });

      const items = await cache.getPendingSyncItems();
      expect(items).toHaveLength(3);
      // Items should be in timestamp order
      for (let i = 1; i < items.length; i++) {
        expect(items[i].timestamp).toBeGreaterThanOrEqual(items[i - 1].timestamp);
      }
    });

    it('should return empty array when no pending items', async () => {
      const items = await cache.getPendingSyncItems();
      expect(items).toHaveLength(0);
    });
  });

  describe('clearSyncItem', () => {
    it('should remove a specific sync item by id', async () => {
      await cache.queueSync('saveProgress', { data: 'first' });
      await cache.queueSync('saveLeaderboard', { data: 'second' });

      const items = await cache.getPendingSyncItems();
      expect(items).toHaveLength(2);

      await cache.clearSyncItem(items[0].id!);

      const remaining = await cache.getPendingSyncItems();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].action).toBe('saveLeaderboard');
    });
  });

  describe('syncOfflineChanges', () => {
    it('should call syncFn for each pending item and clear on success', async () => {
      await cache.queueSync('saveProgress', { id: 1 });
      await cache.queueSync('saveLeaderboard', { id: 2 });

      const syncFn = vi.fn().mockResolvedValue(undefined);
      await cache.syncOfflineChanges(syncFn);

      expect(syncFn).toHaveBeenCalledTimes(2);
      const remaining = await cache.getPendingSyncItems();
      expect(remaining).toHaveLength(0);
    });

    it('should leave failed items in the queue for retry', async () => {
      await cache.queueSync('saveProgress', { id: 1 });
      await cache.queueSync('saveLeaderboard', { id: 2 });

      const syncFn = vi.fn()
        .mockResolvedValueOnce(undefined) // first succeeds
        .mockRejectedValueOnce(new Error('Network error')); // second fails

      await cache.syncOfflineChanges(syncFn);

      expect(syncFn).toHaveBeenCalledTimes(2);
      const remaining = await cache.getPendingSyncItems();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].action).toBe('saveLeaderboard');
    });

    it('should do nothing when no pending items exist', async () => {
      const syncFn = vi.fn();
      await cache.syncOfflineChanges(syncFn);
      expect(syncFn).not.toHaveBeenCalled();
    });
  });

  describe('registerOnlineSync', () => {
    it('should trigger sync when online event fires', async () => {
      await cache.queueSync('saveProgress', { test: true });

      const syncFn = vi.fn().mockResolvedValue(undefined);
      cache.registerOnlineSync(syncFn);

      // Simulate going online
      window.dispatchEvent(new Event('online'));

      // Wait for async sync to complete
      await vi.waitFor(() => {
        expect(syncFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should replace previous listener on re-register', async () => {
      const syncFn1 = vi.fn().mockResolvedValue(undefined);
      const syncFn2 = vi.fn().mockResolvedValue(undefined);

      cache.registerOnlineSync(syncFn1);
      cache.registerOnlineSync(syncFn2);

      await cache.queueSync('saveProgress', { test: true });
      window.dispatchEvent(new Event('online'));

      await vi.waitFor(() => {
        expect(syncFn2).toHaveBeenCalled();
      });
      expect(syncFn1).not.toHaveBeenCalled();
    });
  });

  describe('unregisterOnlineSync', () => {
    it('should stop listening for online events', async () => {
      await cache.queueSync('saveProgress', { test: true });

      const syncFn = vi.fn().mockResolvedValue(undefined);
      cache.registerOnlineSync(syncFn);
      cache.unregisterOnlineSync();

      window.dispatchEvent(new Event('online'));

      // Give time for any async operations
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(syncFn).not.toHaveBeenCalled();
    });
  });

  describe('isOnline', () => {
    it('should return navigator.onLine value', () => {
      // In jsdom, navigator.onLine defaults to true
      expect(cache.isOnline()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw if used before init', async () => {
      const uninitCache = new OfflineCache();
      await expect(uninitCache.saveProgress('p1', {
        currentBelt: Belt.White,
        currentStripes: 0,
        totalSessions: 0,
        totalCorrect: 0,
        totalProblems: 0,
      })).rejects.toThrow('OfflineCache not initialized');
    });
  });
});
