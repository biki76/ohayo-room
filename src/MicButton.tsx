import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOKENS = {
  sakura: '#FF6B9D',
  cyan: '#00D4FF',
  gold: '#FFD700',
  dark: '#1A1A2E',
  darker: '#16213E',
  light: '#F8F9FA',
  muted: '#6C757D',
  success: '#28A745',
} as const;

export interface MicButtonProps {
  isConnected: boolean;
  isMuted: boolean;
  isRecording: boolean;
  audioLevel: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

/* ─── Audio Waveform (20 spring bars) ─── */
const AudioWaveform: React.FC<{ audioLevel: number; isRecording: boolean }> = ({
  audioLevel,
  isRecording,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2.5,
      height: 40,
      marginBottom: 12,
    }}
  >
    {Array.from({ length: 20 }).map((_, i) => {
      const normalized = audioLevel / 100;
      const bellCurve = Math.sin((i / 19) * Math.PI);
      const height = isRecording
        ? Math.max(3, 3 + normalized * 34 * (0.25 + bellCurve * 0.75))
        : 3;

      return (
        <motion.div
          key={i}
          animate={{
            height,
            opacity: isRecording ? 0.45 + normalized * 0.55 : 0.2,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 16,
            mass: 0.35,
          }}
          style={{
            width: 2.5,
            borderRadius: 1.5,
            background: `linear-gradient(180deg, ${TOKENS.sakura}, ${TOKENS.cyan})`,
            flexShrink: 0,
          }}
        />
      );
    })}
  </div>
);

/* ─── SVG Concentric Rings ─── */
const SVGRings: React.FC<{
  audioLevel: number;
  pressDuration: number;
  maxDuration: number;
  isRecording: boolean;
}> = ({ audioLevel, pressDuration, maxDuration, isRecording }) => {
  const size = 144;
  const c = size / 2;
  const innerR = 56;
  const outerR = 66;
  const innerCirc = 2 * Math.PI * innerR;
  const outerCirc = 2 * Math.PI * outerR;

  const audioOffset = innerCirc - (audioLevel / 100) * innerCirc;
  const durationProgress = Math.min(pressDuration / maxDuration, 1);
  const durationOffset = outerCirc - durationProgress * outerCirc;

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <circle cx={c} cy={c} r={innerR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle cx={c} cy={c} r={outerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2} />

      <motion.circle
        cx={c} cy={c} r={innerR}
        fill="none" stroke={TOKENS.cyan} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={innerCirc}
        animate={{ strokeDashoffset: isRecording ? audioOffset : innerCirc }}
        transition={{ type: 'spring', stiffness: 130, damping: 18 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />

      <motion.circle
        cx={c} cy={c} r={outerR}
        fill="none"
        stroke={durationProgress > 0.8 ? TOKENS.gold : TOKENS.sakura}
        strokeWidth={3} strokeLinecap="round" strokeDasharray={outerCirc}
        animate={{ strokeDashoffset: isRecording ? durationOffset : outerCirc }}
        transition={{ type: 'spring', stiffness: 55, damping: 14 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
};

/* ─── Ripple Pulse Effect ─── */
const RipplePulse: React.FC<{ isRecording: boolean }> = ({ isRecording }) => (
  <AnimatePresence>
    {isRecording && (
      <>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.65,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: `2px solid ${TOKENS.sakura}25`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </>
    )}
  </AnimatePresence>
);

/* ─── Main Mic Button ─── */
export const MicButton: React.FC<MicButtonProps> = ({
  isConnected,
  isMuted,
  isRecording,
  audioLevel,
  onStartRecording,
  onStopRecording,
}) => {
  const [pressDuration, setPressDuration] = useState(0);
  const pressStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const maxDuration = 60000;

  const updateDuration = useCallback(() => {
    if (pressStartRef.current) {
      const elapsed = Date.now() - pressStartRef.current;
      setPressDuration(elapsed);
      if (elapsed < maxDuration) {
        animFrameRef.current = requestAnimationFrame(updateDuration);
      } else {
        handleRelease();
      }
    }
  }, []);

  const handlePress = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isConnected || isMuted) return;
      pressStartRef.current = Date.now();
      onStartRecording();
      animFrameRef.current = requestAnimationFrame(updateDuration);
    },
    [isConnected, isMuted, onStartRecording, updateDuration]
  );

  const handleRelease = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    pressStartRef.current = null;
    setPressDuration(0);
    onStopRecording();
  }, [onStopRecording]);

  const disabled = !isConnected || isMuted;
  const seconds = (pressDuration / 1000).toFixed(1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 16px 6px',
      }}
    >
      <AudioWaveform audioLevel={audioLevel} isRecording={isRecording} />

      {/* Button container with rings + ripple */}
      <div
        style={{
          position: 'relative',
          width: 96,
          height: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RipplePulse isRecording={isRecording} />
        <SVGRings
          audioLevel={audioLevel}
          pressDuration={pressDuration}
          maxDuration={maxDuration}
          isRecording={isRecording}
        />

        <motion.button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          whileTap={{ scale: disabled ? 1 : 0.86 }}
          animate={{
            scale: isRecording ? [1, 1.05, 1] : 1,
            boxShadow: isRecording
              ? `0 0 30px ${TOKENS.sakura}45, 0 0 60px ${TOKENS.sakura}18`
              : disabled
              ? 'none'
              : `0 4px 18px rgba(26,26,46,0.12)`,
          }}
          transition={{
            scale: { repeat: isRecording ? Infinity : 0, duration: 1.5, ease: 'easeInOut' },
            boxShadow: { duration: 0.3 },
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: 'none',
            background: disabled
              ? TOKENS.muted
              : isRecording
              ? `linear-gradient(135deg, ${TOKENS.sakura}, ${TOKENS.cyan})`
              : `linear-gradient(135deg, ${TOKENS.dark}, ${TOKENS.darker})`,
            color: TOKENS.light,
            fontSize: '2rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            outline: 'none',
          }}
          aria-label={
            disabled
              ? isMuted
                ? 'Unmute to speak'
                : 'Connect to start'
              : isRecording
              ? `Recording ${seconds}s — release to stop`
              : 'Press and hold to record'
          }
          disabled={disabled}
        >
          {isRecording ? '🔴' : '🎙️'}
        </motion.button>
      </div>

      {/* Status text */}
      <motion.p
        animate={{ color: isRecording ? TOKENS.sakura : TOKENS.muted }}
        style={{
          margin: '12px 0 0',
          fontSize: '0.8rem',
          fontWeight: isRecording ? 600 : 400,
          textAlign: 'center',
          minHeight: 18,
        }}
      >
        {isRecording
          ? `Recording ${seconds}s`
          : disabled
          ? isMuted
            ? '🔇 Unmute to speak'
            : '⚡ Connect to start'
          : 'Press & hold to speak'}
      </motion.p>
    </div>
  );
};

export default MicButton;
