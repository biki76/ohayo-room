import React from 'react';
import { motion } from 'framer-motion';

const TOKENS = {
  dark: '#1A1A2E',
  darker: '#16213E',
  light: '#F8F9FA',
  muted: '#6C757D',
  success: '#28A745',
  danger: '#DC3545',
} as const;

export interface RoomHeaderProps {
  isConnected: boolean;
  isMuted: boolean;
  roomName: string;
  participantCount: number;
  onToggleMute: () => void;
  onLeave?: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  isConnected,
  isMuted,
  roomName,
  participantCount,
  onToggleMute,
  onLeave,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: `linear-gradient(135deg, ${TOKENS.dark} 0%, ${TOKENS.darker} 100%)`,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        minHeight: 56,
      }}
    >
      {/* Left: Status indicator + room info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Animated connection pulse dot */}
        <div style={{ position: 'relative', width: 12, height: 12 }}>
          <motion.div
            animate={{
              scale: isConnected ? [1, 1.6, 1] : 1,
              opacity: isConnected ? [0.6, 0, 0.6] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              backgroundColor: isConnected ? TOKENS.success : TOKENS.danger,
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: isConnected ? TOKENS.success : TOKENS.danger,
              boxShadow: isConnected
                ? `0 0 8px ${TOKENS.success}, 0 0 16px ${TOKENS.success}40`
                : 'none',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: TOKENS.light,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            🌸 Ohayo Room
          </h1>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '0.72rem',
              color: TOKENS.muted,
              lineHeight: 1.3,
            }}
          >
            {isConnected
              ? `${roomName} · ${participantCount} participant${participantCount !== 1 ? 's' : ''}`
              : 'Waiting for connection...'}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Mute Toggle */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMute}
          style={{
            background: isMuted
              ? `${TOKENS.danger}20`
              : 'rgba(255,255,255,0.07)',
            border: `1.5px solid ${isMuted ? TOKENS.danger : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10,
            padding: '7px 12px',
            color: isMuted ? TOKENS.danger : TOKENS.light,
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s ease',
            outline: 'none',
          }}
          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={isMuted}
        >
          <span style={{ fontSize: '0.95rem' }}>{isMuted ? '🔇' : '🔊'}</span>
          <span>{isMuted ? 'Muted' : 'Live'}</span>
        </motion.button>

        {/* Leave Button */}
        {onLeave && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onLeave}
            style={{
              background: 'rgba(220,53,69,0.12)',
              border: `1.5px solid ${TOKENS.danger}40`,
              borderRadius: 10,
              padding: '7px 12px',
              color: TOKENS.danger,
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            aria-label="Leave room"
          >
            Leave
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default RoomHeader;
