import React from 'react';
import { motion } from 'framer-motion';
import type { TranscriptSegment } from './types';

const TOKENS = {
  sakura: '#FF6B9D',
  sakuraLight: '#FFE4EC',
  sakuraGlow: 'rgba(255, 107, 157, 0.35)',
  cyan: '#00D4FF',
  cyanLight: '#E0F7FF',
  cyanGlow: 'rgba(0, 212, 255, 0.35)',
  gold: '#FFD700',
  goldLight: '#FFF8DC',
  goldGlow: 'rgba(255, 215, 0, 0.25)',
  dark: '#1A1A2E',
  muted: '#6C757D',
  success: '#28A745',
} as const;

export interface TranscriptBubbleProps {
  segment: TranscriptSegment;
}

export const TranscriptBubble: React.FC<TranscriptBubbleProps> = ({ segment }) => {
  const isUser = segment.speaker === 'user';
  const isAI = segment.speaker === 'ai';

  const style = {
    bg: isUser ? TOKENS.sakuraLight : isAI ? TOKENS.cyanLight : TOKENS.goldLight,
    border: isUser ? TOKENS.sakura : isAI ? TOKENS.cyan : TOKENS.gold,
    glow: isUser ? TOKENS.sakuraGlow : isAI ? TOKENS.cyanGlow : TOKENS.goldGlow,
    text: isAI || isUser ? TOKENS.dark : '#8B6914',
    label: isUser ? '👤 You' : isAI ? '🤖 Sensei-chan' : '🔔 System',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
      style={{
        maxWidth: '85%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          background: style.bg,
          borderRadius: 18,
          padding: '11px 15px',
          border: `2px solid ${style.border}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 2px 10px ${style.glow}`,
        }}
      >
        {/* AI confidence top bar (3px) */}
        {isAI && segment.confidence !== undefined && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${TOKENS.cyan}, ${TOKENS.success})`,
              opacity: 0.4 + segment.confidence * 0.6,
              transformOrigin: 'left',
            }}
          />
        )}

        {/* Speaker label row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 5,
          }}
        >
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: style.border,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {style.label}
          </span>
          {segment.language && (
            <span style={{ fontSize: '0.72rem', opacity: 0.55 }}>
              {segment.language === 'ja' && '🇯🇵'}
              {segment.language === 'bn' && '🇧🇩'}
              {segment.language === 'en' && '🇬🇧'}
            </span>
          )}
        </div>

        {/* Message text */}
        <p
          style={{
            margin: 0,
            fontSize: '0.88rem',
            lineHeight: 1.55,
            color: style.text,
            wordBreak: 'break-word',
            fontWeight: 400,
          }}
        >
          {segment.text}
          {!segment.isFinal && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              style={{ color: style.border, marginLeft: 3 }}
            >
              ▮
            </motion.span>
          )}
        </p>

        {/* AI confidence mini-bar */}
        {isAI && segment.confidence !== undefined && (
          <div
            style={{
              marginTop: 7,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: '0.62rem',
                color: TOKENS.muted,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              Confidence
            </span>
            <div
              style={{
                flex: 1,
                height: 3,
                background: 'rgba(0,0,0,0.07)',
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: 70,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${segment.confidence * 100}%` }}
                transition={{ type: 'spring', stiffness: 110, damping: 18, delay: 0.15 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${TOKENS.cyan}, ${TOKENS.success})`,
                  borderRadius: 2,
                }}
              />
            </div>
            <span
              style={{
                fontSize: '0.62rem',
                color: TOKENS.muted,
                fontWeight: 600,
                minWidth: 26,
              }}
            >
              {Math.round(segment.confidence * 100)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TranscriptBubble;
