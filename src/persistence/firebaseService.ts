/**
 * Firebase persistence service implementing cloud save/load for player progress
 * and leaderboard data. Uses Firebase Auth for anonymous authentication and
 * Firestore for data storage.
 *
 * Firestore document structure:
 * - /players/{playerId} - PlayerProgress fields + metadata
 * - /leaderboard/{entryId} - LeaderboardEntry fields
 */
import {
  signInAnonymously as firebaseSignInAnonymously,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import type { PlayerProgress, LeaderboardEntry } from '../types';
import { getFirebaseAuth, getFirebaseDb } from './firebaseConfig';

/**
 * Persistence service interface for saving and loading game data.
 */
export interface PersistenceService {
  signInAnonymously(): Promise<string>;
  saveProgress(playerId: string, progress: PlayerProgress): Promise<void>;
  loadProgress(playerId: string): Promise<PlayerProgress | null>;
  saveLeaderboard(entry: LeaderboardEntry): Promise<void>;
  getLeaderboard(limit: number): Promise<LeaderboardEntry[]>;
}

/**
 * Convert PlayerProgress to Firestore document format.
 */
function progressToDocument(progress: PlayerProgress): DocumentData {
  return {
    currentBelt: progress.currentBelt,
    currentStripes: progress.currentStripes,
    totalSessions: progress.totalSessions,
    totalCorrect: progress.totalCorrect,
    totalProblems: progress.totalProblems,
    updatedAt: serverTimestamp(),
  };
}

/**
 * Convert Firestore document data back to PlayerProgress.
 */
function documentToProgress(data: DocumentData): PlayerProgress {
  return {
    currentBelt: data.currentBelt,
    currentStripes: data.currentStripes,
    totalSessions: data.totalSessions,
    totalCorrect: data.totalCorrect,
    totalProblems: data.totalProblems,
  };
}

/**
 * Convert LeaderboardEntry to Firestore document format.
 */
function leaderboardEntryToDocument(entry: LeaderboardEntry): DocumentData {
  return {
    playerId: entry.playerId,
    playerName: entry.playerName,
    totalScore: entry.totalScore,
    totalTime: entry.totalTime,
    date: entry.date,
    createdAt: serverTimestamp(),
  };
}

/**
 * Convert Firestore document data back to LeaderboardEntry.
 */
function documentToLeaderboardEntry(data: DocumentData): LeaderboardEntry {
  return {
    playerId: data.playerId,
    playerName: data.playerName,
    totalScore: data.totalScore,
    totalTime: data.totalTime,
    date: data.date,
  };
}

/**
 * Sign in anonymously using Firebase Auth.
 * Returns the unique player ID assigned by Firebase.
 */
export async function signInAnonymously(): Promise<string> {
  const auth = getFirebaseAuth();
  const credential = await firebaseSignInAnonymously(auth);
  const user: User = credential.user;
  return user.uid;
}

/**
 * Save player progress to Firestore.
 * Creates or overwrites the document at /players/{playerId}.
 */
export async function saveProgress(
  playerId: string,
  progress: PlayerProgress
): Promise<void> {
  const db = getFirebaseDb();
  const playerRef = doc(db, 'players', playerId);
  await setDoc(playerRef, progressToDocument(progress), { merge: true });
}

/**
 * Load player progress from Firestore.
 * Returns null if no saved progress exists for the given player.
 */
export async function loadProgress(
  playerId: string
): Promise<PlayerProgress | null> {
  const db = getFirebaseDb();
  const playerRef = doc(db, 'players', playerId);
  const snapshot = await getDoc(playerRef);

  if (!snapshot.exists()) {
    return null;
  }

  return documentToProgress(snapshot.data());
}

/**
 * Save a leaderboard entry to Firestore.
 * Each entry gets a unique auto-generated document ID.
 */
export async function saveLeaderboard(entry: LeaderboardEntry): Promise<void> {
  const db = getFirebaseDb();
  const leaderboardRef = doc(collection(db, 'leaderboard'));
  await setDoc(leaderboardRef, leaderboardEntryToDocument(entry));
}

/**
 * Get the top leaderboard entries, sorted by totalScore descending.
 * Ties are broken by lowest totalTime (ascending).
 */
export async function getLeaderboard(
  limit: number
): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb();
  const leaderboardRef = collection(db, 'leaderboard');

  // Firestore doesn't support multi-field ordering with mixed directions in a
  // single query without a composite index. We fetch more entries and sort
  // client-side for tie-breaking by totalTime.
  const q = query(
    leaderboardRef,
    orderBy('totalScore', 'desc'),
    firestoreLimit(limit * 2) // fetch extra to handle tie-breaking
  );

  const snapshot = await getDocs(q);
  const entries: LeaderboardEntry[] = [];

  snapshot.forEach((docSnap) => {
    entries.push(documentToLeaderboardEntry(docSnap.data()));
  });

  // Sort with tie-breaking: highest score first, then lowest time
  entries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.totalTime - b.totalTime;
  });

  return entries.slice(0, limit);
}

/**
 * Firebase persistence service object implementing the PersistenceService interface.
 */
export const firebasePersistenceService: PersistenceService = {
  signInAnonymously,
  saveProgress,
  loadProgress,
  saveLeaderboard,
  getLeaderboard,
};
