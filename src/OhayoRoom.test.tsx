import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OhayoRoom } from '../OhayoRoom';

describe('OhayoRoom Component', () => {
  const defaultProps = {
    roomName: 'test-room-001',
    token: 'test-token',
    userName: 'TestUser',
    onLeave: vi.fn(),
  };

  it('renders with correct title', () => {
    render(<OhayoRoom {...defaultProps} />);
    expect(screen.getByText('🌸 Ohayo Room')).toBeInTheDocument();
  });

  it('shows disconnected state initially', () => {
    render(<OhayoRoom {...defaultProps} />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows initial empty state message', () => {
    render(<OhayoRoom {...defaultProps} />);
    expect(screen.getByText(/Press and hold the microphone/)).toBeInTheDocument();
  });

  it('has mic button with correct aria label', () => {
    render(<OhayoRoom {...defaultProps} />);
    expect(screen.getByLabelText('Hold to record')).toBeInTheDocument();
  });

  it('has language selector', () => {
    render(<OhayoRoom {...defaultProps} />);
    expect(screen.getByText('🇯🇵')).toBeInTheDocument();
    expect(screen.getByText('🇧🇩')).toBeInTheDocument();
    expect(screen.getByText('🇬🇧')).toBeInTheDocument();
  });

  it('calls onLeave when leave button clicked', () => {
    render(<OhayoRoom {...defaultProps} />);
    const leaveButton = screen.getByText('Leave');
    fireEvent.click(leaveButton);
    expect(defaultProps.onLeave).toHaveBeenCalledTimes(1);
  });

  it('toggles mute when mute button clicked', async () => {
    render(<OhayoRoom {...defaultProps} />);
    const muteButton = screen.getByLabelText('Unmute');

    fireEvent.click(muteButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Mute')).toBeInTheDocument();
    });
  });

  it('displays system welcome message after connection', async () => {
    render(<OhayoRoom {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Connected to/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows recording state on mic press', async () => {
    render(<OhayoRoom {...defaultProps} />);
    const micButton = screen.getByLabelText('Hold to record');

    fireEvent.mouseDown(micButton);

    await waitFor(() => {
      expect(screen.getByText(/Recording/)).toBeInTheDocument();
    });

    fireEvent.mouseUp(micButton);
  });

  it('displays participant count when connected', async () => {
    render(<OhayoRoom {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/participants/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
