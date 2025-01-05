import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface LiveSession {
  id: string;
  status: 'created' | 'active' | 'completed';
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  tutorId: string;
  studentId: string;
  isTutor: boolean;
}

interface SessionEvent {
  type: string;
  action: string;
  userId: string;
  metadata?: any;
}

export function useLiveSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/live-sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession({
        ...data,
        isTutor: data.tutorId === user.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/start`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      const data = await response.json();
      setSession(prev => ({
        ...prev!,
        ...data,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to end session');
      }
      const data = await response.json();
      setSession(prev => ({
        ...prev!,
        ...data,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  };

  const logEvent = async (event: SessionEvent) => {
    if (!session) return;

    try {
      await fetch(`/api/live-sessions/${session.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error('Failed to log event:', err);
    }
  };

  return {
    session,
    loading,
    error,
    fetchSession,
    startSession,
    endSession,
    logEvent,
  };
}
