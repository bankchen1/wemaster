import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveSession } from './LiveSession';
import { useSessionStore } from '../../stores/useSessionStore';

// Mock LiveKit Room
jest.mock('livekit-client', () => ({
  Room: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    localParticipant: {
      publishTrack: jest.fn(),
      unpublishTrack: jest.fn(),
    },
    on: jest.fn(),
    off: jest.fn(),
  })),
}));

describe('LiveSession', () => {
  const mockBooking = {
    id: 'booking-123',
    tutorId: 'tutor-123',
    studentId: 'student-123',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
  };

  beforeEach(() => {
    useSessionStore.getState().reset();
  });

  it('should create and join a session', async () => {
    render(<LiveSession booking={mockBooking} role="tutor" />);

    await waitFor(() => {
      const session = useSessionStore.getState().session;
      expect(session).toBeTruthy();
      expect(session?.status).toBe('created');
    });

    const startButton = screen.getByRole('button', { name: /开始课堂/i });
    expect(startButton).toBeInTheDocument();
  });

  it('should start a session', async () => {
    render(<LiveSession booking={mockBooking} role="tutor" />);

    const startButton = await screen.findByRole('button', { name: /开始课堂/i });
    await userEvent.click(startButton);

    await waitFor(() => {
      const session = useSessionStore.getState().session;
      expect(session?.status).toBe('active');
    });

    const endButton = screen.getByRole('button', { name: /结束课堂/i });
    expect(endButton).toBeInTheDocument();
  });

  it('should end a session', async () => {
    render(<LiveSession booking={mockBooking} role="tutor" />);

    const startButton = await screen.findByRole('button', { name: /开始课堂/i });
    await userEvent.click(startButton);

    const endButton = await screen.findByRole('button', { name: /结束课堂/i });
    await userEvent.click(endButton);

    await waitFor(() => {
      const session = useSessionStore.getState().session;
      expect(session?.status).toBe('completed');
    });
  });

  it('should toggle audio/video', async () => {
    render(<LiveSession booking={mockBooking} role="tutor" />);

    const audioButton = await screen.findByRole('button', { name: /麦克风/i });
    const videoButton = await screen.findByRole('button', { name: /摄像头/i });

    await userEvent.click(audioButton);
    await userEvent.click(videoButton);

    const store = useSessionStore.getState();
    expect(store.isAudioEnabled).toBe(false);
    expect(store.isVideoEnabled).toBe(false);
  });

  it('should show error message on failure', async () => {
    // Mock API error
    server.use(
      rest.post('/api/live/sessions', (req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: '服务器错误' })),
      ),
    );

    render(<LiveSession booking={mockBooking} role="tutor" />);

    await waitFor(() => {
      expect(screen.getByText(/服务器错误/i)).toBeInTheDocument();
    });
  });
});
