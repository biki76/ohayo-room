import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for press-and-hold gesture with touch + mouse support
 * Prevents default scroll behavior on touch devices
 */
export function usePressHold(
  onPressStart: () => void,
  onPressEnd: () => void,
  options: { disabled?: boolean; maxDuration?: number } = {}
) {
  const { disabled = false, maxDuration = 60000 } = options;
  const pressStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPressed = useRef(false);

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled || isPressed.current) return;

      e.preventDefault();
      isPressed.current = true;
      pressStartTime.current = Date.now();
      onPressStart();

      timeoutRef.current = setTimeout(() => {
        handleEnd();
      }, maxDuration);
    },
    [disabled, maxDuration, onPressStart]
  );

  const handleEnd = useCallback(() => {
    if (!isPressed.current) return;

    isPressed.current = false;
    pressStartTime.current = null;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    onPressEnd();
  }, [onPressEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    isPressed: isPressed.current,
  };
}

/**
 * Hook to detect if device is touch-capable
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

import { useState } from 'react';

/**
 * Hook for auto-scrolling to bottom of container
 */
export function useAutoScroll<T extends HTMLElement>(
  dependency: unknown[]
) {
  const containerRef = useRef<T>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    if (isAutoScrolling && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, dependency);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAutoScrolling(isNearBottom);
  }, []);

  return { containerRef, bottomRef, handleScroll, isAutoScrolling };
}

/**
 * Format duration in ms to human readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance-critical operations
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
