import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Room,
  RoomEvent,
  Participant,
  Track,
  TrackPublication,
  LocalTrack,
  RemoteTrack,
} from 'livekit-client';
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

  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalTrack | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio level analyzer
  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const analyze = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalized = Math.min((average / 128) * 100, 100);
      setAudioLevel(Math.floor(normalized));
      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const connect = useCallback(async (targetRoomName: string, token: string) => {
    try {
      setError(null);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: false,
          videoCodec: 'vp8',
        },
      });

      roomRef.current = room;

      // Event listeners
      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setRoomName(targetRoomName);
        setParticipantCount(room.numParticipants + 1);

        setTranscript(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            speaker: 'system',
            text: `Connected to ${targetRoomName}. Welcome to Ohayo Room! 🌸`,
            timestamp: Date.now(),
            isFinal: true,
          },
        ]);
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsRecording(false);
        setParticipantCount(0);
        stopAudioAnalysis();
      });

      room.on(RoomEvent.ParticipantConnected, () => {
        setParticipantCount(room.numParticipants + 1);
      });

      room.on(RoomEvent.ParticipantDisconnected, () => {
        setParticipantCount(room.numParticipants + 1);
      });

      room.on(RoomEvent.TrackSubscribed, (_track: RemoteTrack, _publication: TrackPublication, _participant: Participant) => {
        // Handle remote audio tracks
      });

      room.on(RoomEvent.TrackUnsubscribed, (_track: RemoteTrack, _publication: TrackPublication, _participant: Participant) => {
        // Cleanup remote tracks
      });

      room.on(RoomEvent.LocalTrackPublished, (_publication: TrackPublication) => {
        // Local track published
      });

      await room.connect(process.env.REACT_APP_LIVEKIT_URL || 'wss://your-livekit-server.com', token);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to room';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, [stopAudioAnalysis]);

  const disconnect = useCallback(async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    stopAudioAnalysis();

    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }

    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    setIsConnected(false);
    setIsRecording(false);
    setIsMuted(false);
    setAudioLevel(0);
    setParticipantCount(0);
  }, [stopAudioAnalysis]);

  const startRecording = useCallback(async () => {
    if (!roomRef.current || !isConnected || isMuted) return;

    try {
      setIsRecording(true);
      setError(null);

      // Get local audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
        video: false,
      });

      // Start audio level analysis
      startAudioAnalysis(stream);

      // Publish audio track to LiveKit
      const audioTrack = stream.getAudioTracks()[0];
      await roomRef.current.localParticipant.publishTrack(audioTrack, {
        source: Track.Source.Microphone,
        audioBitrate: 24000,
        dtx: true,
        red: true,
      });

      // Auto-stop after 60s max
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [isConnected, isMuted, startAudioAnalysis]);

  const stopRecording = useCallback(async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    setIsRecording(false);
    stopAudioAnalysis();

    // Unpublish local audio track
    if (roomRef.current) {
      const publications = roomRef.current.localParticipant.getTrackPublications();
      const audioPublication = publications.find(
        pub => pub.track?.source === Track.Source.Microphone
      );

      if (audioPublication) {
        await roomRef.current.localParticipant.unpublishTrack(audioPublication.track!);
      }
    }

    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
  }, [stopAudioAnalysis]);

  const toggleMute = useCallback(async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (newMuted && isRecording) {
      await stopRecording();
    }

    // Update LiveKit track mute state
    if (roomRef.current) {
      const publications = roomRef.current.localParticipant.getTrackPublications();
      publications.forEach(pub => {
        if (pub.track) {
          pub.track.muted = newMuted;
        }
      });
    }
  }, [isMuted, isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
