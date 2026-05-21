import React, { useState, useRef, useEffect } from 'react';
import { useLiveKitAudio } from './useLiveKitAudio';
import { RoomHeader } from './RoomHeader';
import { TranscriptFeed } from './TranscriptFeed';
import { MicButton } from './MicButton';
import { LanguageSelector } from './LanguageSelector';
import { ErrorBanner } from './ErrorBanner';

const TOKENS = {
  light: '#F8F9FA',
  white: '#FFFFFF',
  dark: '#1A1A2E',
} as const;

export interface OhayoRoomProps {
  roomName: string;
  token: string;
  userName: string;
  onLeave?: () => void;
}

/**
 * 🌸 OhayoRoom — Composer Component
 *
 * Consumes useLiveKitAudio hook and renders the full UI by composing:
 * - RoomHeader      (sticky status bar)
 * - ErrorBanner     (conditional error display)
 * - TranscriptFeed  (scrollable color-coded transcript)
 * - MicButton       (press-and-hold with waveform + rings + ripple)
 * - LanguageSelector (🇯🇵 🇧🇩 🇬🇧)
 */
export const OhayoRoom: React.FC<OhayoRoomProps> = ({
  roomName,
  token,
  onLeave,
}) => {
  const {
    isConnected,
    isMuted,
    isRecording,
    transcript,
    audioLevel,
    error,
    roomName: activeRoom,
    participantCount,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    toggleMute,
  } = useLiveKitAudio();

  const [selectedLanguage, setSelectedLanguage] = useState<'ja' | 'bn' | 'en'>('ja');
  const hasConnected = useRef(false);

  // Auto-connect on mount
  useEffect(() => {
    if (!hasConnected.current) {
      hasConnected.current = true;
      connect(roomName, token);
    }
    return () => {
      disconnect();
    };
  }, [roomName, token, connect, disconnect]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        background: TOKENS.light,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif',
        color: TOKENS.dark,
      }}
    >
      <RoomHeader
        isConnected={isConnected}
        isMuted={isMuted}
        roomName={activeRoom || roomName}
        participantCount={participantCount}
        onToggleMute={toggleMute}
        onLeave={() => {
          disconnect();
          onLeave?.();
        }}
      />

      <ErrorBanner message={error} />

      <TranscriptFeed transcript={transcript} />

      <div
        style={{
          background: `linear-gradient(180deg, ${TOKENS.white} 0%, ${TOKENS.light} 100%)`,
          borderTop: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <MicButton
          isConnected={isConnected}
          isMuted={isMuted}
          isRecording={isRecording}
          audioLevel={audioLevel}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
        />

        <LanguageSelector
          selected={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      </div>
    </div>
  );
};

export default OhayoRoom;
