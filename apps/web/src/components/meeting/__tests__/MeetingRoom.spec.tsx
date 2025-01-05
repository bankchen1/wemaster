import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingRoom } from '../MeetingRoom';
import { MeetingClient } from '@/lib/meeting-client';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/lib/meeting-client');
jest.mock('@/components/ui/use-toast');

describe('MeetingRoom', () => {
  const mockProps = {
    meetingId: 'test-meeting',
    token: 'test-token',
    userName: 'Test User',
    userEmail: 'test@example.com',
    isHost: true,
    onMeetingEnd: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ matrixRoomId: 'test-room' }),
      })
    );

    // Mock useToast
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });

    // Mock MeetingClient methods
    (MeetingClient as jest.Mock).mockImplementation(() => ({
      initializeJitsi: jest.fn().mockResolvedValue(true),
      initializeMatrix: jest.fn().mockResolvedValue(true),
      startRecording: jest.fn().mockResolvedValue(undefined),
      stopRecording: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn(),
    }));
  });

  it('renders meeting room components', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByTestId('jitsi-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });

  it('initializes meeting client on mount', async () => {
    render(<MeetingRoom {...mockProps} />);

    await waitFor(() => {
      expect(MeetingClient).toHaveBeenCalledWith({
        meetingId: mockProps.meetingId,
        token: mockProps.token,
        userName: mockProps.userName,
        userEmail: mockProps.userEmail,
        onMeetingEnd: mockProps.onMeetingEnd,
      });
    });
  });

  it('shows recording controls for host', () => {
    render(<MeetingRoom {...mockProps} />);

    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('hides recording controls for non-host', () => {
    render(<MeetingRoom {...mockProps} isHost={false} />);

    expect(screen.queryByText('Start Recording')).not.toBeInTheDocument();
  });

  it('handles recording toggle', async () => {
    render(<MeetingRoom {...mockProps} />);

    const recordButton = screen.getByText('Start Recording');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Stop Recording'));

    await waitFor(() => {
      expect(screen.getByText('Start Recording')).toBeInTheDocument();
    });
  });

  it('handles initialization errors', async () => {
    const mockError = new Error('Initialization failed');
    (MeetingClient as jest.Mock).mockImplementation(() => ({
      initializeJitsi: jest.fn().mockRejectedValue(mockError),
      dispose: jest.fn(),
    }));

    render(<MeetingRoom {...mockProps} />);

    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to join the meeting',
        variant: 'destructive',
      });
    });
  });

  it('cleans up on unmount', () => {
    const mockDispose = jest.fn();
    (MeetingClient as jest.Mock).mockImplementation(() => ({
      initializeJitsi: jest.fn().mockResolvedValue(true),
      initializeMatrix: jest.fn().mockResolvedValue(true),
      dispose: mockDispose,
    }));

    const { unmount } = render(<MeetingRoom {...mockProps} />);
    unmount();

    expect(mockDispose).toHaveBeenCalled();
  });

  it('handles recording errors', async () => {
    (MeetingClient as jest.Mock).mockImplementation(() => ({
      initializeJitsi: jest.fn().mockResolvedValue(true),
      initializeMatrix: jest.fn().mockResolvedValue(true),
      startRecording: jest.fn().mockRejectedValue(new Error('Recording failed')),
      dispose: jest.fn(),
    }));

    render(<MeetingRoom {...mockProps} />);

    const recordButton = screen.getByText('Start Recording');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to toggle recording',
        variant: 'destructive',
      });
    });
  });
});
