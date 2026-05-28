import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { animationEngine, AnimationEngineImpl, ANIMATION_CLASS_MAP, DEFAULT_DURATIONS } from '../../animations/AnimationEngine';
import type { AnimationConfig } from '../../types';

describe('AnimationEngine', () => {
  let engine: AnimationEngineImpl;
  let targetElement: HTMLDivElement;

  beforeEach(() => {
    engine = new AnimationEngineImpl();
    targetElement = document.createElement('div');
    document.body.appendChild(targetElement);
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine.stop();
    document.body.removeChild(targetElement);
    vi.useRealTimers();
  });

  describe('play()', () => {
    it('should add the correct CSS class for "correct" animation', () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      engine.play(config, targetElement);

      expect(targetElement.classList.contains('anim-correct')).toBe(true);
    });

    it('should add the correct CSS class for "incorrect" animation', () => {
      const config: AnimationConfig = { type: 'incorrect', duration: 500 };
      engine.play(config, targetElement);

      expect(targetElement.classList.contains('anim-incorrect')).toBe(true);
    });

    it('should add the correct CSS class for "stripe" animation', () => {
      const config: AnimationConfig = { type: 'stripe', duration: 1000 };
      engine.play(config, targetElement);

      expect(targetElement.classList.contains('anim-stripe')).toBe(true);
    });

    it('should add the correct CSS class for "idle_reminder" animation', () => {
      const config: AnimationConfig = { type: 'idle_reminder', duration: 1500 };
      engine.play(config, targetElement);

      expect(targetElement.classList.contains('anim-idle-reminder')).toBe(true);
    });

    it('should add the correct CSS class for "belt_ceremony" animation', () => {
      const config: AnimationConfig = { type: 'belt_ceremony', duration: 4000 };
      engine.play(config, targetElement);

      expect(targetElement.classList.contains('anim-belt-ceremony')).toBe(true);
    });

    it('should set isPlaying to true while animation is active', () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      engine.play(config, targetElement);

      expect(engine.isPlaying()).toBe(true);
    });

    it('should resolve and remove class after duration for "correct"', async () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      const promise = engine.play(config, targetElement);

      vi.advanceTimersByTime(600);
      await promise;

      expect(targetElement.classList.contains('anim-correct')).toBe(false);
      expect(engine.isPlaying()).toBe(false);
    });

    it('should resolve and remove class after duration for "incorrect"', async () => {
      const config: AnimationConfig = { type: 'incorrect', duration: 500 };
      const promise = engine.play(config, targetElement);

      vi.advanceTimersByTime(500);
      await promise;

      expect(targetElement.classList.contains('anim-incorrect')).toBe(false);
      expect(engine.isPlaying()).toBe(false);
    });

    it('should resolve and remove class after duration for "stripe"', async () => {
      const config: AnimationConfig = { type: 'stripe', duration: 1000 };
      const promise = engine.play(config, targetElement);

      vi.advanceTimersByTime(1000);
      await promise;

      expect(targetElement.classList.contains('anim-stripe')).toBe(false);
      expect(engine.isPlaying()).toBe(false);
    });

    it('should not auto-resolve for "idle_reminder" (loops until stopped)', () => {
      const config: AnimationConfig = { type: 'idle_reminder', duration: 1500 };
      engine.play(config, targetElement);

      vi.advanceTimersByTime(5000);

      // idle_reminder loops infinitely, so it should still be playing
      expect(engine.isPlaying()).toBe(true);
      expect(targetElement.classList.contains('anim-idle-reminder')).toBe(true);
    });

    it('should use default duration when not specified in config', () => {
      const config: AnimationConfig = { type: 'correct', duration: 0 };
      engine.play(config, targetElement);

      // With duration 0, it uses the default
      expect(engine.isPlaying()).toBe(true);
    });

    it('should apply animation to document.body when no target element provided', () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      engine.play(config);

      expect(document.body.classList.contains('anim-correct')).toBe(true);

      engine.stop();
      expect(document.body.classList.contains('anim-correct')).toBe(false);
    });

    it('should stop previous animation when a new one is played', () => {
      const config1: AnimationConfig = { type: 'correct', duration: 600 };
      const config2: AnimationConfig = { type: 'incorrect', duration: 500 };

      engine.play(config1, targetElement);
      expect(targetElement.classList.contains('anim-correct')).toBe(true);

      engine.play(config2, targetElement);
      expect(targetElement.classList.contains('anim-correct')).toBe(false);
      expect(targetElement.classList.contains('anim-incorrect')).toBe(true);
    });
  });

  describe('stop()', () => {
    it('should remove the animation class and set isPlaying to false', () => {
      const config: AnimationConfig = { type: 'stripe', duration: 1000 };
      engine.play(config, targetElement);

      expect(engine.isPlaying()).toBe(true);

      engine.stop();

      expect(engine.isPlaying()).toBe(false);
      expect(targetElement.classList.contains('anim-stripe')).toBe(false);
    });

    it('should stop idle_reminder animation', async () => {
      const config: AnimationConfig = { type: 'idle_reminder', duration: 1500 };
      const promise = engine.play(config, targetElement);

      engine.stop();
      await promise;

      expect(engine.isPlaying()).toBe(false);
      expect(targetElement.classList.contains('anim-idle-reminder')).toBe(false);
    });

    it('should be safe to call stop when no animation is playing', () => {
      expect(() => engine.stop()).not.toThrow();
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('isPlaying()', () => {
    it('should return false initially', () => {
      expect(engine.isPlaying()).toBe(false);
    });

    it('should return true during animation', () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      engine.play(config, targetElement);

      expect(engine.isPlaying()).toBe(true);
    });

    it('should return false after animation completes', async () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      const promise = engine.play(config, targetElement);

      vi.advanceTimersByTime(600);
      await promise;

      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('getAnimationClass()', () => {
    it('should return correct class for each animation type', () => {
      expect(engine.getAnimationClass('correct')).toBe('anim-correct');
      expect(engine.getAnimationClass('incorrect')).toBe('anim-incorrect');
      expect(engine.getAnimationClass('stripe')).toBe('anim-stripe');
      expect(engine.getAnimationClass('idle_reminder')).toBe('anim-idle-reminder');
      expect(engine.getAnimationClass('belt_ceremony')).toBe('anim-belt-ceremony');
    });
  });

  describe('getDefaultDuration()', () => {
    it('should return correct default durations', () => {
      expect(engine.getDefaultDuration('correct')).toBe(600);
      expect(engine.getDefaultDuration('incorrect')).toBe(500);
      expect(engine.getDefaultDuration('stripe')).toBe(1000);
      expect(engine.getDefaultDuration('idle_reminder')).toBe(1500);
      expect(engine.getDefaultDuration('belt_ceremony')).toBe(4000);
    });
  });

  describe('ANIMATION_CLASS_MAP', () => {
    it('should have entries for all animation types', () => {
      expect(ANIMATION_CLASS_MAP.correct).toBe('anim-correct');
      expect(ANIMATION_CLASS_MAP.incorrect).toBe('anim-incorrect');
      expect(ANIMATION_CLASS_MAP.stripe).toBe('anim-stripe');
      expect(ANIMATION_CLASS_MAP.idle_reminder).toBe('anim-idle-reminder');
      expect(ANIMATION_CLASS_MAP.belt_ceremony).toBe('anim-belt-ceremony');
    });
  });

  describe('DEFAULT_DURATIONS', () => {
    it('should have positive durations for all animation types', () => {
      for (const type of Object.keys(DEFAULT_DURATIONS) as AnimationConfig['type'][]) {
        expect(DEFAULT_DURATIONS[type]).toBeGreaterThan(0);
      }
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton animationEngine', () => {
      expect(animationEngine).toBeInstanceOf(AnimationEngineImpl);
    });

    it('should be usable as the shared instance', () => {
      const config: AnimationConfig = { type: 'correct', duration: 600 };
      animationEngine.play(config, targetElement);

      expect(animationEngine.isPlaying()).toBe(true);

      animationEngine.stop();
      expect(animationEngine.isPlaying()).toBe(false);
    });
  });
});
