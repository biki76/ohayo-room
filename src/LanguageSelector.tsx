import React from 'react';
import { motion } from 'framer-motion';

const TOKENS = {
  dark: '#1A1A2E',
  sakura: '#FF6B9D',
  surface: 'rgba(255, 255, 255, 0.82)',
} as const;

export interface LanguageSelectorProps {
  selected: 'ja' | 'bn' | 'en';
  onSelect: (lang: 'ja' | 'bn' | 'en') => void;
}

const LANGUAGES: { code: 'ja' | 'bn' | 'en'; flag: string; label: string }[] = [
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'bn', flag: '🇧🇩', label: 'বাংলা' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selected, onSelect }) => (
  <div
    style={{
      display: 'flex',
      gap: 8,
      justifyContent: 'center',
      padding: '10px 18px 26px',
    }}
  >
    {LANGUAGES.map((lang) => (
      <motion.button
        key={lang.code}
        whileTap={{ scale: 0.93 }}
        onClick={() => onSelect(lang.code)}
        style={{
          background: selected === lang.code ? TOKENS.dark : TOKENS.surface,
          border: `2px solid ${selected === lang.code ? TOKENS.sakura : 'rgba(0,0,0,0.05)'}`,
          borderRadius: 14,
          padding: '6px 13px',
          fontSize: '0.78rem',
          fontWeight: selected === lang.code ? 600 : 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          color: selected === lang.code ? '#FFFFFF' : TOKENS.dark,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(12px)',
          outline: 'none',
          boxShadow: selected === lang.code
            ? `0 2px 10px ${TOKENS.sakura}20`
            : '0 1px 4px rgba(0,0,0,0.03)',
        }}
        aria-pressed={selected === lang.code}
        aria-label={`Select ${lang.label}`}
      >
        <span style={{ fontSize: '1.05rem' }}>{lang.flag}</span>
        <span>{lang.label}</span>
      </motion.button>
    ))}
  </div>
);

export default LanguageSelector;
