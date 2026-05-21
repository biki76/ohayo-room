import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseLiveKitAudioReturn, TranscriptSegment } from './types';

export function useLiveKitAudio(): UseLiveKitAudioReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [participantCount, setParticipantCount] = useState(0);

  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate audio level fluctuations when recording
  useEffect(() => {
    if (isRecording && !isMuted) {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 100);
    } else {
      setAudioLevel(0);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [isRecording, isMuted]);

  const connect = useCallback((roomName: string, _token: string) => {
    setError(null);
    setRoomName(roomName);
    setIsConnected(true);
    setParticipantCount(Math.floor(Math.random() * 3) + 2);

    // Add system welcome message
    setTranscript(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        speaker: 'system',
        text: `Connected to ${roomName}. Welcome to Ohayo Room! 🌸`,
        timestamp: Date.now(),
        isFinal: true,
      },
    ]);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsRecording(false);
    setAudioLevel(0);
    setParticipantCount(0);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!isConnected || isMuted) return;
    setIsRecording(true);
    setError(null);

    // Simulate auto-stop after 60s max
    recordingTimeoutRef.current = setTimeout(() => {
      setIsRecording(false);
      setTranscript(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          speaker: 'system',
          text: 'Recording stopped (60s limit reached).',
          timestamp: Date.now(),
          isFinal: true,
        },
      ]);
    }, 60000);
  }, [isConnected, isMuted]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    // Simulate transcript generation
    const mockTexts = [
      'Konnichiwa! Genki desu ka?',
      'Watashi wa nihongo wo benkyou shiteimasu.',
      'Arigatou gozaimasu!',
      'Sumimasen, mou ichido itte kudasai.',
    ];
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];

    setTranscript(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        speaker: 'user',
        text: randomText,
        timestamp: Date.now(),
        language: 'ja',
        isFinal: true,
      },
    ]);

    // Simulate AI response after a delay
    setTimeout(() => {
      setTranscript(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          speaker: 'ai',
          text: `Sensei-chan: Great pronunciation! Your Japanese is improving. Keep practicing! 頑張って！`,
          confidence: 0.85 + Math.random() * 0.15,
          timestamp: Date.now(),
          language: 'ja',
          isFinal: true,
        },
      ]);
    }, 1500);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && isRecording) {
        setIsRecording(false);
      }
      return newMuted;
    });
  }, [isRecording]);

  return {
    isConnected,
    isMuted,
    isRecording,
    transcript,
    audioLevel,
    error,
    roomName,
    participantCount,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    toggleMute,
  };
}
