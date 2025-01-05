import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParticipantList } from './ParticipantList';
import { useSessionStore } from '../../stores/useSessionStore';

describe('ParticipantList', () => {
  const mockParticipants = [
    {
      id: 'tutor-1',
      name: 'John Doe',
      role: 'tutor',
      isAudioEnabled: true,
      isVideoEnabled: true,
    },
    {
      id: 'student-1',
      name: 'Jane Smith',
      role: 'student',
      isAudioEnabled: false,
      isVideoEnabled: true,
    },
  ];

  beforeEach(() => {
    useSessionStore.getState().reset();
    useSessionStore.setState({
      participants: mockParticipants,
      currentUser: { id: 'tutor-1', role: 'tutor' },
    });
  });

  it('should display participant list', () => {
    render(<ParticipantList />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show audio/video status', () => {
    render(<ParticipantList />);

    expect(screen.getByTestId('audio-on-tutor-1')).toBeInTheDocument();
    expect(screen.getByTestId('audio-off-student-1')).toBeInTheDocument();
  });

  it('should handle participant controls for tutor', async () => {
    render(<ParticipantList />);

    const controlButton = screen.getByTestId('controls-student-1');
    await userEvent.click(controlButton);

    expect(screen.getByText(/禁用麦克风/i)).toBeInTheDocument();
    expect(screen.getByText(/禁用摄像头/i)).toBeInTheDocument();
  });

  it('should update participant status', async () => {
    render(<ParticipantList />);

    const controlButton = screen.getByTestId('controls-student-1');
    await userEvent.click(controlButton);

    const muteButton = screen.getByText(/禁用麦克风/i);
    await userEvent.click(muteButton);

    await waitFor(() => {
      const participants = useSessionStore.getState().participants;
      expect(participants[1].isAudioEnabled).toBe(false);
    });
  });
});
