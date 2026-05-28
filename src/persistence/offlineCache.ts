/**
 * Offline cache using IndexedDB for player progress persistence
 * and pending sync queue for reconnection scenarios.
 *
 * Requirements: 9.4 (restore progress on launch), 9.5 (cross-platform persistence)
 */

import type { PlayerProgress } from '../types';

export interface PendingSyncItem {
  id?: number; // auto-increment key
  action: 'saveProgress' | 'saveLeaderboard';
  data: unknown;
  timestamp: number;
}

interface StoredProgress {
  playerId: string;
  progress: PlayerProgress;
  lastSyncTimestamp: number;
}

export class OfflineCache {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'judomath-offline';
  private readonly DB_VERSION = 1;
  private onlineHandler: (() => void) | null = null;
  private syncFn: ((item: PendingSyncItem) => Promise<void>) | null = null;

  /**
   * Initialize the IndexedDB database and create object stores if needed.
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for player progress, keyed by playerId
        if (!db.objectStoreNames.contains('playerProgress')) {
          db.createObjectStore('playerProgress', { keyPath: 'playerId' });
        }

        // Store for pending sync items with auto-increment key
        if (!db.objectStoreNames.contains('pendingSync')) {
          const syncStore = db.createObjectStore('pendingSync', {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  }

  /**
   * Save player progress to IndexedDB.
   */
  async saveProgress(playerId: string, progress: PlayerProgress): Promise<void> {
    const db = this.getDb();
    const stored: StoredProgress = {
      playerId,
      progress,
      lastSyncTimestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('playerProgress', 'readwrite');
      const store = transaction.objectStore('playerProgress');
      const request = store.put(stored);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save progress'));
    });
  }

  /**
   * Load player progress from IndexedDB.
   */
  async loadProgress(playerId: string): Promise<PlayerProgress | null> {
    const db = this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('playerProgress', 'readonly');
      const store = transaction.objectStore('playerProgress');
      const request = store.get(playerId);

      request.onsuccess = () => {
        const result = request.result as StoredProgress | undefined;
        resolve(result ? result.progress : null);
      };
      request.onerror = () => reject(new Error('Failed to load progress'));
    });
  }

  /**
   * Queue a sync action for later execution when back online.
   */
  async queueSync(action: PendingSyncItem['action'], data: unknown): Promise<void> {
    const db = this.getDb();
    const item: Omit<PendingSyncItem, 'id'> = {
      action,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingSync', 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to queue sync item'));
    });
  }

  /**
   * Get all pending sync items ordered by timestamp.
   */
  async getPendingSyncItems(): Promise<PendingSyncItem[]> {
    const db = this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingSync', 'readonly');
      const store = transaction.objectStore('pendingSync');
      const index = store.index('timestamp');
      const request = index.openCursor();
      const items: PendingSyncItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          items.push({ ...cursor.value, id: cursor.primaryKey as number });
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      request.onerror = () => reject(new Error('Failed to get pending sync items'));
    });
  }

  /**
   * Remove a successfully synced item from the pending queue.
   */
  async clearSyncItem(id: number): Promise<void> {
    const db = this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction('pendingSync', 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear sync item'));
    });
  }

  /**
   * Attempt to sync all pending offline changes.
   * For each item: call the sync function, remove on success, leave on failure.
   */
  async syncOfflineChanges(
    syncFn: (item: PendingSyncItem) => Promise<void>
  ): Promise<void> {
    const items = await this.getPendingSyncItems();

    for (const item of items) {
      try {
        await syncFn(item);
        if (item.id !== undefined) {
          await this.clearSyncItem(item.id);
        }
      } catch {
        // Leave failed items for next sync attempt
        continue;
      }
    }
  }

  /**
   * Register an online event listener that triggers sync on reconnect.
   * Call this after init() with the sync function to use.
   */
  registerOnlineSync(syncFn: (item: PendingSyncItem) => Promise<void>): void {
    this.syncFn = syncFn;

    // Remove previous listener if any
    this.unregisterOnlineSync();

    this.onlineHandler = () => {
      if (this.syncFn) {
        this.syncOfflineChanges(this.syncFn).catch(() => {
          // Silently fail - will retry on next online event
        });
      }
    };

    window.addEventListener('online', this.onlineHandler);
  }

  /**
   * Remove the online event listener.
   */
  unregisterOnlineSync(): void {
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = null;
    }
  }

  /**
   * Check if the browser is currently online.
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Close the database connection and clean up listeners.
   */
  close(): void {
    this.unregisterOnlineSync();
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private getDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('OfflineCache not initialized. Call init() first.');
    }
    return this.db;
  }
}

// Singleton instance for app-wide use
export const offlineCache = new OfflineCache();
