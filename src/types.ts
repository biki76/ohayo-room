export interface TranscriptSegment {
  id: string;
  speaker: 'user' | 'ai' | 'system';
  text: string;
  confidence?: number;
  timestamp: number;
  language?: 'ja' | 'bn' | 'en';
  isFinal: boolean;
}

export interface LiveKitAudioState {
  isConnected: boolean;
  isMuted: boolean;
  isRecording: boolean;
  transcript: TranscriptSegment[];
  audioLevel: number;
  error: string | null;
  roomName: string;
  participantCount: number;
}

export interface UseLiveKitAudioReturn extends LiveKitAudioState {
  connect: (roomName: string, token: string) => void;
  disconnect: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  toggleMute: () => void;
}
