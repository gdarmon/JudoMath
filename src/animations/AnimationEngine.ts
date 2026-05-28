/**
 * Animation Engine - Manages CSS-based animations for game feedback.
 *
 * Provides a unified interface for triggering animations:
 * - correct: positive reinforcement pulse
 * - incorrect: gentle shake encouragement
 * - stripe: celebratory glow/pulse for earning a stripe
 * - idle_reminder: gentle bounce to re-engage inactive player (30s)
 * - belt_ceremony: CSS fallback celebration (Lottie handled separately in task 8.2)
 *
 * All animations use GPU-accelerated properties (transform, opacity)
 * targeting 30fps minimum on all platforms.
 */

import type { AnimationConfig } from '../types';
import './AnimationEngine.css';

/** Maps animation type to its CSS class name */
const ANIMATION_CLASS_MAP: Record<AnimationConfig['type'], string> = {
  correct: 'anim-correct',
  incorrect: 'anim-incorrect',
  stripe: 'anim-stripe',
  idle_reminder: 'anim-idle-reminder',
  belt_ceremony: 'anim-belt-ceremony',
};

/** Default durations (ms) for each animation type if not specified */
const DEFAULT_DURATIONS: Record<AnimationConfig['type'], number> = {
  correct: 600,
  incorrect: 500,
  stripe: 1000,
  idle_reminder: 1500,
  belt_ceremony: 4000,
};

/**
 * AnimationEngine manages CSS-based animations for game feedback.
 * Implements the AnimationEngine interface from the design document.
 */
class AnimationEngineImpl {
  private playing = false;
  private currentElement: HTMLElement | null = null;
  private currentClass: string | null = null;
  private abortController: AbortController | null = null;

  /**
   * Play an animation on the target element (or document body if no target).
   * Resolves when the animation completes or is stopped.
   *
   * @param config - Animation configuration (type, duration, optional beltColor)
   * @param targetElement - Optional DOM element to animate. If not provided,
   *   the animation class is applied to document.body.
   */
  play(config: AnimationConfig, targetElement?: HTMLElement | null): Promise<void> {
    // Stop any currently playing animation
    this.stop();

    const element = targetElement || document.body;
    const animClass = ANIMATION_CLASS_MAP[config.type];
    const duration = config.duration || DEFAULT_DURATIONS[config.type];

    if (!animClass) {
      return Promise.resolve();
    }

    this.playing = true;
    this.currentElement = element;
    this.currentClass = animClass;
    this.abortController = new AbortController();

    // Apply the animation class
    element.classList.add(animClass);

    return new Promise<void>((resolve) => {
      const cleanup = () => {
        this.playing = false;
        element.classList.remove(animClass);
        this.currentElement = null;
        this.currentClass = null;
        this.abortController = null;
        resolve();
      };

      // Listen for abort (stop() called externally)
      this.abortController!.signal.addEventListener('abort', cleanup, { once: true });

      // For idle_reminder, the animation loops infinitely until stopped
      if (config.type === 'idle_reminder') {
        // Don't auto-resolve; wait for stop() to be called
        return;
      }

      // Auto-resolve after the specified duration
      const timeoutId = setTimeout(cleanup, duration);

      // If aborted before timeout, clear the timeout
      this.abortController!.signal.addEventListener(
        'abort',
        () => clearTimeout(timeoutId),
        { once: true }
      );
    });
  }

  /**
   * Stop the currently playing animation immediately.
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
    }

    // Defensive cleanup in case abort didn't fire
    if (this.currentElement && this.currentClass) {
      this.currentElement.classList.remove(this.currentClass);
    }

    this.playing = false;
    this.currentElement = null;
    this.currentClass = null;
    this.abortController = null;
  }

  /**
   * Returns whether an animation is currently playing.
   */
  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Get the CSS class name for a given animation type.
   * Useful for components that want to apply animation classes directly.
   */
  getAnimationClass(type: AnimationConfig['type']): string {
    return ANIMATION_CLASS_MAP[type];
  }

  /**
   * Get the default duration for a given animation type.
   */
  getDefaultDuration(type: AnimationConfig['type']): number {
    return DEFAULT_DURATIONS[type];
  }
}

/** Singleton animation engine instance */
export const animationEngine = new AnimationEngineImpl();

export { AnimationEngineImpl, ANIMATION_CLASS_MAP, DEFAULT_DURATIONS };
export default animationEngine;
