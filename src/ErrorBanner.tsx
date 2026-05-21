import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOKENS = {
  danger: '#DC3545',
} as const;

export interface ErrorBannerProps {
  message: string | null;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        style={{
          background: `${TOKENS.danger}10`,
          borderLeft: `3px solid ${TOKENS.danger}`,
          padding: '9px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>⚠️</span>
        <span
          style={{
            fontSize: '0.82rem',
            color: TOKENS.danger,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {message}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ErrorBanner;
