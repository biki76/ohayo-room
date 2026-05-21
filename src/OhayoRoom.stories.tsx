import type { Meta, StoryObj } from '@storybook/react';
import { OhayoRoom } from './OhayoRoom';

const meta: Meta<typeof OhayoRoom> = {
  title: 'OhayoRoom/Main',
  component: OhayoRoom,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  argTypes: {
    roomName: { control: 'text' },
    token: { control: 'text' },
    userName: { control: 'text' },
    onLeave: { action: 'left room' },
  },
};

export default meta;
type Story = StoryObj<typeof OhayoRoom>;

export const Default: Story = {
  args: {
    roomName: 'nihongo-practice-001',
    token: 'mock-token',
    userName: 'Rahim',
  },
};

export const Connected: Story = {
  args: {
    roomName: 'nihongo-practice-live',
    token: 'mock-token',
    userName: 'Yuki',
  },
  parameters: {
    docs: {
      description: {
        story: 'Room auto-connects on mount. Shows connected state with participants.',
      },
    },
  },
};

export const WithTranscript: Story = {
  args: {
    roomName: 'active-session',
    token: 'mock-token',
    userName: 'Kenji',
  },
  parameters: {
    docs: {
      description: {
        story: 'Press and hold the mic to generate mock transcript entries.',
      },
    },
  },
};
