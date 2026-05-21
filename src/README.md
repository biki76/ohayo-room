# 🌸 Ohayo Room — NihonSync Real-Time Japanese Speaking Practice

Production-ready React component for real-time Japanese speaking practice powered by LiveKit audio.

## 📦 Installation

```bash
npm install framer-motion livekit-client
# or
yarn add framer-motion livekit-client
```

## 🚀 Quick Start

```tsx
import { OhayoRoom } from './OhayoRoom';

function App() {
  return (
    <OhayoRoom
      roomName="nihongo-practice-001"
      token="your_livekit_token_here"
      userName="Rahim"
      onLeave={() => router.push('/dashboard')}
    />
  );
}
```

## 📁 File Structure

```
ohayo-room/
├── types.ts                    # TypeScript interfaces
├── useLiveKitAudio.ts          # Mock hook (development)
├── useLiveKitAudio.real.ts     # Real LiveKit integration
├── OhayoRoom.tsx               # Main component
├── utils.ts                    # Utility hooks & helpers
└── index.ts                    # Barrel exports
```

## 🔌 Switching to Real LiveKit

1. Install LiveKit client:
   ```bash
   npm install livekit-client
   ```

2. Set environment variable:
   ```env
   REACT_APP_LIVEKIT_URL=wss://your-livekit-server.com
   ```

3. Swap the import in `OhayoRoom.tsx`:
   ```tsx
   // Before:
   import { useLiveKitAudio } from './useLiveKitAudio';

   // After:
   import { useLiveKitAudio } from './useLiveKitAudio.real';
   ```

## 🎨 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Sakura | `#FF6B9D` | User messages, primary accent |
| Cyan | `#00D4FF` | AI messages, audio rings |
| Gold | `#FFD700` | System messages |
| Dark | `#1A1A2E` | Header, primary text |
| Light | `#F8F9FA` | Background |

## 📱 Mobile Specifications

- **Touch target**: 80px mic button (44px minimum exceeded)
- **Safe area**: 32px bottom padding
- **Gesture support**: Mouse + touch with `preventDefault` on press
- **Viewport**: Optimized for 375–480px width
- **Animation**: 60fps spring animations via Framer Motion

## 🔧 Component Architecture

```
OhayoRoom.tsx
├── Header (sticky)
│   ├── Connection status indicator
│   ├── Mute toggle
│   └── Leave button
│
├── Transcript Area (auto-scroll)
│   ├── User → Sakura Pink bubbles
│   ├── AI (Sensei-chan) → Cyan bubbles + confidence bar
│   └── System → Gold bubbles
│
└── Mic Controls
    ├── Audio waveform (20 animated bars)
    ├── SVG concentric rings (audio level + press duration)
    ├── Ripple pulse animation
    └── Language selector (🇯🇵 🇧🇩 🇬🇧)
```

## 🎯 Key Features

| Feature | Implementation |
|---------|---------------|
| Press & Hold | `onMouseDown/Up/TouchStart/End` — walkie-talkie feel |
| Audio Rings | SVG `stroke-dashoffset` — performant, no DOM thrashing |
| Color Coding | Pink=User, Cyan=AI, Gold=System |
| Confidence Bar | 3px top border on AI bubbles |
| Waveform | 20 `motion.div` bars with spring physics |
| Auto-scroll | `scrollIntoView({ behavior: 'smooth' })` |

## 📝 TypeScript Types

```typescript
interface TranscriptSegment {
  id: string;
  speaker: 'user' | 'ai' | 'system';
  text: string;
  confidence?: number;      // 0–1
  timestamp: number;
  language?: 'ja' | 'bn' | 'en';
  isFinal: boolean;
}

interface OhayoRoomProps {
  roomName: string;
  token: string;
  userName: string;
  onLeave?: () => void;
}
```

## 🧪 Development with Mock Hook

The mock `useLiveKitAudio` simulates:
- Connection state changes
- Audio level fluctuations (0–100)
- Recording start/stop with 60s auto-limit
- AI response generation after user speaks
- Mute toggling

Perfect for UI development without a LiveKit server.

## 📄 License

MIT © NihonSync
