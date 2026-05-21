// NihonSync Ohayo Room — Component Exports
export { OhayoRoom } from './OhayoRoom';
export { RoomHeader } from './RoomHeader';
export { TranscriptBubble } from './TranscriptBubble';
export { TranscriptFeed } from './TranscriptFeed';
export { MicButton } from './MicButton';
export { LanguageSelector } from './LanguageSelector';
export { ErrorBanner } from './ErrorBanner';

export { useLiveKitAudio } from './useLiveKitAudio';

export type {
  TranscriptSegment,
  LiveKitAudioState,
  UseLiveKitAudioReturn,
} from './types';

export {
  usePressHold,
  useIsTouchDevice,
  useAutoScroll,
  formatDuration,
  generateId,
  debounce,
  throttle,
} from './utils';
