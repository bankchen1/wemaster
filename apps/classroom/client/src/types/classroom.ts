export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  enrolledStudents: string[];
  waitlist: string[];
  teacher: User;
  price: number;
  currency?: string;
  tags: string[];
  status: 'scheduled' | 'cancelled' | 'completed';
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  chatEnabled: boolean;
  whiteboardEnabled: boolean;
  recordingEnabled: boolean;
  breakoutRoomsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface WhiteboardData {
  id: string;
  objects: any[];
  background: string;
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, string>;
  createdAt: string;
  endedAt?: string;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
  startTime: string;
  endTime?: string;
}

export interface Classroom {
  id: string;
  schedule: ClassSchedule;
  settings: ClassroomSettings;
  participants: User[];
  messages: ChatMessage[];
  whiteboards: WhiteboardData[];
  polls: Poll[];
  breakoutRooms: BreakoutRoom[];
  recording?: string;
  status: 'waiting' | 'inProgress' | 'ended';
  startedAt?: string;
  endedAt?: string;
}
