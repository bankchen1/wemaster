import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface Participant {
  id: string;
  name: string;
  role: 'tutor' | 'student';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface SessionState {
  sessionId: string | null;
  status: 'created' | 'active' | 'completed' | 'cancelled';
  participants: Map<string, Participant>;
  messages: Message[];
  isRecording: boolean;
  recordingUrl: string | null;
  whiteboardData: any;
  error: Error | null;
}

interface SessionActions {
  setSession: (sessionId: string) => void;
  setStatus: (status: SessionState['status']) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, update: Partial<Participant>) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  setRecording: (isRecording: boolean) => void;
  setRecordingUrl: (url: string) => void;
  updateWhiteboard: (data: any) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState: SessionState = {
  sessionId: null,
  status: 'created',
  participants: new Map(),
  messages: [],
  isRecording: false,
  recordingUrl: null,
  whiteboardData: null,
  error: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setSession: (sessionId) =>
        set((state) => {
          state.sessionId = sessionId;
        }),

      setStatus: (status) =>
        set((state) => {
          state.status = status;
        }),

      addParticipant: (participant) =>
        set((state) => {
          state.participants.set(participant.id, participant);
        }),

      removeParticipant: (participantId) =>
        set((state) => {
          state.participants.delete(participantId);
        }),

      updateParticipant: (participantId, update) =>
        set((state) => {
          const participant = state.participants.get(participantId);
          if (participant) {
            state.participants.set(participantId, { ...participant, ...update });
          }
        }),

      addMessage: (message) =>
        set((state) => {
          state.messages.push({
            ...message,
            id: crypto.randomUUID(),
          });
        }),

      setRecording: (isRecording) =>
        set((state) => {
          state.isRecording = isRecording;
        }),

      setRecordingUrl: (url) =>
        set((state) => {
          state.recordingUrl = url;
        }),

      updateWhiteboard: (data) =>
        set((state) => {
          state.whiteboardData = data;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () => set(initialState),
    })),
  ),
);
