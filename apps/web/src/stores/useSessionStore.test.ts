import { renderHook, act } from '@testing-library/react';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    act(() => {
      useSessionStore.getState().reset();
    });
  });

  describe('session management', () => {
    it('should set session id', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setSession('test-session-1');
      });

      expect(result.current.sessionId).toBe('test-session-1');
    });

    it('should update session status', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setStatus('active');
      });

      expect(result.current.status).toBe('active');
    });
  });

  describe('participant management', () => {
    const mockParticipant = {
      id: 'user-1',
      name: 'Test User',
      role: 'student' as const,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      handRaised: false,
    };

    it('should add participant', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addParticipant(mockParticipant);
      });

      expect(result.current.participants.get('user-1')).toEqual(mockParticipant);
    });

    it('should remove participant', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addParticipant(mockParticipant);
        result.current.removeParticipant('user-1');
      });

      expect(result.current.participants.has('user-1')).toBe(false);
    });

    it('should update participant', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addParticipant(mockParticipant);
        result.current.updateParticipant('user-1', {
          isAudioEnabled: false,
          handRaised: true,
        });
      });

      const updatedParticipant = result.current.participants.get('user-1');
      expect(updatedParticipant?.isAudioEnabled).toBe(false);
      expect(updatedParticipant?.handRaised).toBe(true);
    });
  });

  describe('message management', () => {
    const mockMessage = {
      senderId: 'user-1',
      content: 'Hello',
      timestamp: new Date(),
      type: 'text' as const,
    };

    it('should add message', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.addMessage(mockMessage);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject(mockMessage);
    });
  });

  describe('recording management', () => {
    it('should update recording status', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setRecording(true);
      });

      expect(result.current.isRecording).toBe(true);
    });

    it('should set recording url', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setRecordingUrl('https://example.com/recording.mp4');
      });

      expect(result.current.recordingUrl).toBe(
        'https://example.com/recording.mp4',
      );
    });
  });

  describe('error handling', () => {
    it('should set and clear error', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setError(new Error('Test error'));
      });

      expect(result.current.error?.message).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('store reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.setSession('test-session');
        result.current.setStatus('active');
        result.current.addMessage({
          senderId: 'user-1',
          content: 'Hello',
          timestamp: new Date(),
          type: 'text',
        });
        result.current.reset();
      });

      expect(result.current.sessionId).toBeNull();
      expect(result.current.status).toBe('created');
      expect(result.current.messages).toHaveLength(0);
    });
  });
});
