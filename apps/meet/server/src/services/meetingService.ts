import { v4 as uuidv4 } from 'uuid';
import { Meeting, Participant, MeetingSettings } from '../types/meeting';

class MeetingService {
    private meetings: Map<string, Meeting>;

    constructor() {
        this.meetings = new Map();
    }

    createMeeting(name: string, hostId: string, settings?: Partial<MeetingSettings>): Meeting {
        const meetingId = uuidv4();
        const defaultSettings: MeetingSettings = {
            allowChat: true,
            allowScreenShare: true,
            muteOnEntry: true,
            videoOffOnEntry: true,
            requireLobby: false,
            allowRecording: false,
            ...settings
        };

        const meeting: Meeting = {
            id: meetingId,
            name,
            host: hostId,
            participants: [],
            createdAt: new Date(),
            settings: defaultSettings
        };

        this.meetings.set(meetingId, meeting);
        return meeting;
    }

    getMeeting(meetingId: string): Meeting | undefined {
        return this.meetings.get(meetingId);
    }

    addParticipant(meetingId: string, participant: Participant): boolean {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) return false;

        meeting.participants.push(participant);
        return true;
    }

    removeParticipant(meetingId: string, participantId: string): boolean {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) return false;

        const index = meeting.participants.findIndex(p => p.id === participantId);
        if (index === -1) return false;

        meeting.participants.splice(index, 1);
        return true;
    }

    updateParticipantStatus(
        meetingId: string,
        participantId: string,
        updates: Partial<Participant>
    ): boolean {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) return false;

        const participant = meeting.participants.find(p => p.id === participantId);
        if (!participant) return false;

        Object.assign(participant, updates);
        return true;
    }

    endMeeting(meetingId: string): boolean {
        return this.meetings.delete(meetingId);
    }

    updateMeetingSettings(
        meetingId: string,
        settings: Partial<MeetingSettings>
    ): boolean {
        const meeting = this.meetings.get(meetingId);
        if (!meeting) return false;

        meeting.settings = { ...meeting.settings, ...settings };
        return true;
    }
}

export const meetingService = new MeetingService();
