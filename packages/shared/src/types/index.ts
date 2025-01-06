// 会议相关类型
export interface Meeting {
  id: string;
  roomName: string;
  hostId: string;
  participants: Participant[];
  startTime: Date;
  endTime?: Date;
  status: MeetingStatus;
  settings: MeetingSettings;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  joinTime: Date;
  leaveTime?: Date;
  audioEnabled: boolean;
  videoEnabled: boolean;
  handRaised: boolean;
}

export enum ParticipantRole {
  HOST = 'host',
  COHOST = 'cohost',
  PARTICIPANT = 'participant',
  OBSERVER = 'observer'
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export interface MeetingSettings {
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  waitingRoom: boolean;
  participantControls: ParticipantControls;
}

export interface ParticipantControls {
  canToggleAudio: boolean;
  canToggleVideo: boolean;
  canShareScreen: boolean;
  canChat: boolean;
}

// 课堂相关类型
export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  students: Student[];
  schedule: Schedule[];
  materials: Material[];
  settings: ClassroomSettings;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  status: StudentStatus;
  joinDate: Date;
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface Schedule {
  id: string;
  startTime: Date;
  endTime: Date;
  topic: string;
  description?: string;
  meetingId?: string;
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  url: string;
  uploadedAt: Date;
  size: number;
}

export enum MaterialType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  OTHER = 'other'
}

export interface ClassroomSettings {
  allowChat: boolean;
  allowFileSharing: boolean;
  allowStudentPresentation: boolean;
  autoRecording: boolean;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderBeforeClass: number; // minutes
}
