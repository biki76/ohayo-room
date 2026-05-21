import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveKitAudio } from '../useLiveKitAudio';

describe('useLiveKitAudio (mock)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioLevel).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.transcript).toEqual([]);
  });

  it('connects to room', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.roomName).toBe('test-room');
    expect(result.current.participantCount).toBeGreaterThan(0);
    expect(result.current.transcript).toHaveLength(1);
    expect(result.current.transcript[0].speaker).toBe('system');
  });

  it('disconnects from room', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioLevel).toBe(0);
    expect(result.current.participantCount).toBe(0);
  });

  it('toggles mute state', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('stops recording when muted', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.startRecording();
      result.current.toggleMute();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isMuted).toBe(true);
  });

  it('generates audio levels while recording', async () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.startRecording();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.audioLevel).toBeGreaterThan(0);
    });
  });

  it('auto-stops recording after 60s', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.transcript.some(t => t.text.includes('60s limit'))).toBe(true);
  });

  it('generates transcript on stopRecording', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.startRecording();
      result.current.stopRecording();
    });

    const userMessages = result.current.transcript.filter(t => t.speaker === 'user');
    expect(userMessages.length).toBeGreaterThan(0);
  });

  it('generates AI response after user message', async () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.startRecording();
      result.current.stopRecording();
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      const aiMessages = result.current.transcript.filter(t => t.speaker === 'ai');
      expect(aiMessages.length).toBeGreaterThan(0);
    });
  });

  it('does not start recording when disconnected', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
  });

  it('does not start recording when muted', () => {
    const { result } = renderHook(() => useLiveKitAudio());

    act(() => {
      result.current.connect('test-room', 'mock-token');
      result.current.toggleMute();
      result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
  });
});
