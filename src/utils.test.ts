import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePressHold, useIsTouchDevice, useAutoScroll, formatDuration, generateId, debounce, throttle } from '../utils';

describe('usePressHold', () => {
  it('should call onPressStart when pressed', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const { result } = renderHook(() => usePressHold(onStart, onEnd));

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('should call onPressEnd when released', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const { result } = renderHook(() => usePressHold(onStart, onEnd));

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
      result.current.onMouseUp();
    });

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('should auto-release after maxDuration', () => {
    vi.useFakeTimers();
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const { result } = renderHook(() => usePressHold(onStart, onEnd, { maxDuration: 1000 }));

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onEnd).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should not trigger when disabled', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const { result } = renderHook(() => usePressHold(onStart, onEnd, { disabled: true }));

    act(() => {
      result.current.onMouseDown({ preventDefault: vi.fn() } as unknown as React.MouseEvent);
    });

    expect(onStart).not.toHaveBeenCalled();
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(5000)).toBe('5s');
    expect(formatDuration(59000)).toBe('59s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(125000)).toBe('2:05');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^test\d+-/);
  });

  it('works without prefix', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-/);
  });
});

describe('debounce', () => {
  it('delays function execution', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1');
    vi.useRealTimers();
  });

  it('cancels previous call', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('second');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('limits execution rate', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
