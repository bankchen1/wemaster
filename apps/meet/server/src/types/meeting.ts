export interface Meeting {
    id: string;
    name: string;
    host: string;
    participants: Participant[];
    createdAt: Date;
    settings: MeetingSettings;
}

export interface Participant {
    id: string;
    name: string;
    role: 'host' | 'participant';
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenSharing: boolean;
}

export interface MeetingSettings {
    allowChat: boolean;
    allowScreenShare: boolean;
    muteOnEntry: boolean;
    videoOffOnEntry: boolean;
    requireLobby: boolean;
    allowRecording: boolean;
}
