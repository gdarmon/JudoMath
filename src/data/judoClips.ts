/**
 * Curated pool of judo YouTube clips used as a reward when a child
 * answers a problem correctly. Each clip is played for ~30 seconds
 * and can be skipped at any time.
 *
 * To add more clips, append entries to the JUDO_CLIPS array below.
 * Required fields: youtubeId (the part after `v=` in a YouTube URL)
 * and title. Optional: a `start` time (in seconds) so each play
 * begins at a kid-appropriate moment in a longer video.
 *
 * If a clip ever fails to embed (some YouTube videos disable
 * embedding), the player will automatically fall back to the next
 * clip in the rotation, so the child experience never gets stuck.
 */

export interface JudoClip {
  /** YouTube video id — the part after `v=` or after `youtu.be/`. */
  youtubeId: string
  /** Short, kid-friendly description shown above the video. */
  title: string
  /** Optional start time in seconds (default 0). */
  start?: number
}

export const CLIP_DURATION_SECONDS = 30

export const JUDO_CLIPS: JudoClip[] = [
  // International Judo Federation — official world tour highlights.
  { youtubeId: 'PCcCs1QZ1eA', title: 'Top Judo Throws (IJF Highlights)' },
  { youtubeId: 'mzFP6BPnZuk', title: 'IJF World Tour: Best Ippons' },
  { youtubeId: 'AlxBfP_5pUI', title: 'IJF: Spectacular Judo Moments' },
  { youtubeId: 'b4-mEGKGRy8', title: 'IJF Grand Slam Highlights' },

  // Famous athletes & techniques.
  { youtubeId: 'Yfa5gFfm1nA', title: 'Teddy Riner — Champion Highlights' },
  { youtubeId: 'tVQGzJsRZUE', title: 'Shohei Ono — Best Ippons' },
  { youtubeId: 'IS5mwymTIJw', title: 'Uta Abe — Olympic Judo' },
  { youtubeId: 'C7NsrGmKUWk', title: 'Hifumi Abe — Champion Throws' },

  // Kid-friendly technique introductions.
  { youtubeId: 'lBoEi9KmL3M', title: 'Judo Basics: Bowing & Respect' },
  { youtubeId: 'bdvsRFwBOdk', title: 'Judo Falls (Ukemi) for Beginners' },
  { youtubeId: 'M_LfRTpnXYk', title: 'How to Do Ippon Seoi Nage' },
  { youtubeId: 'PoLbQjEYqFg', title: 'How to Do O Goshi (Hip Throw)' },
  { youtubeId: '0rUNhPgxV5w', title: 'How to Do O Soto Gari' },
  { youtubeId: 'hVL7iRZjVyA', title: 'How to Do Tai Otoshi' },

  // Olympic / World Championships moments.
  { youtubeId: 'Eu8ZOMK0ANY', title: 'Tokyo 2020: Best Judo Moments' },
  { youtubeId: 'KCb9_AFJ08A', title: 'Paris 2024: Judo Highlights' },
  { youtubeId: 'qsOLzKRX3UM', title: 'World Judo: Surprise Throws' },
  { youtubeId: 'YKfM85DIqwo', title: 'Spectacular Counter Throws' },

  // History & culture.
  { youtubeId: 'KnnRdhFw9HQ', title: 'The Story of Judo' },
  { youtubeId: 'nYP-kVDpY4o', title: 'Judo: Spirit of the Dojo' },
]
