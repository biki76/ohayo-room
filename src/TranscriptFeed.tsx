import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptBubble } from './TranscriptBubble';
import type { TranscriptSegment } from './types';

const TOKENS = {
  light: '#F8F9FA',
  white: '#FFFFFF',
  muted: '#6C757D',
  dark: '#1A1A2E',
} as const;

export interface TranscriptFeedProps {
  transcript: TranscriptSegment[];
}

export const TranscriptFeed: React.FC<TranscriptFeedProps> = ({ transcript }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const lastCountRef = useRef(transcript.length);

  // Auto-scroll to bottom when new messages arrive (if user is near bottom)
  useEffect(() => {
    if (transcript.length > lastCountRef.current && isAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    lastCountRef.current = transcript.length;
  }, [transcript.length, isAutoScroll]);

  // Detect user scroll to intelligently pause/resume auto-scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 90;
    setIsAutoScroll(nearBottom);
  }, []);

  const isEmpty = transcript.length === 0;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '18px 14px',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${TOKENS.light} 0%, ${TOKENS.white} 60%)`,
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isEmpty ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            style={{
              textAlign: 'center',
              padding: '45px 16px',
              margin: 'auto 0',
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
              }}
              style={{
                fontSize: '3.2rem',
                marginBottom: 14,
                filter: 'grayscale(0.25)',
                display: 'inline-block',
              }}
            >
              🎙️
            </motion.div>
            <p
              style={{
                fontSize: '0.92rem',
                margin: '0 0 6px',
                fontWeight: 500,
                color: TOKENS.dark,
              }}
            >
              Press and hold the microphone
            </p>
            <p
              style={{
                fontSize: '0.82rem',
                margin: 0,
                color: TOKENS.muted,
                opacity: 0.75,
              }}
            >
              マイクを押して話し始めてください
            </p>
          </motion.div>
        ) : (
          transcript.map((segment) => (
            <TranscriptBubble key={segment.id} segment={segment} />
          ))
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
    </div>
  );
};

export default TranscriptFeed;
