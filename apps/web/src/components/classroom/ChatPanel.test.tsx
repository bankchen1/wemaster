import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from './ChatPanel';
import { useSessionStore } from '../../stores/useSessionStore';

describe('ChatPanel', () => {
  const mockMessages = [
    {
      id: '1',
      senderId: 'tutor-1',
      content: 'Hello student',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      senderId: 'student-1',
      content: 'Hi tutor',
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    useSessionStore.getState().reset();
    useSessionStore.setState({
      messages: mockMessages,
      currentUser: { id: 'tutor-1', role: 'tutor' },
    });
  });

  it('should display chat messages', () => {
    render(<ChatPanel />);

    expect(screen.getByText('Hello student')).toBeInTheDocument();
    expect(screen.getByText('Hi tutor')).toBeInTheDocument();
  });

  it('should send new message', async () => {
    render(<ChatPanel />);

    const input = screen.getByPlaceholderText(/输入消息/i);
    await userEvent.type(input, 'New message{enter}');

    await waitFor(() => {
      const messages = useSessionStore.getState().messages;
      expect(messages).toHaveLength(3);
      expect(messages[2].content).toBe('New message');
    });
  });

  it('should show emoji picker', async () => {
    render(<ChatPanel />);

    const emojiButton = screen.getByRole('button', { name: /表情/i });
    await userEvent.click(emojiButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    render(<ChatPanel />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    await userEvent.upload(input, file);

    await waitFor(() => {
      const messages = useSessionStore.getState().messages;
      expect(messages).toHaveLength(3);
      expect(messages[2].type).toBe('image');
    });
  });
});
