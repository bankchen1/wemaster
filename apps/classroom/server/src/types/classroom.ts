export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'teacher' | 'student' | 'assistant';
}

export interface ClassroomSettings {
  allowChat: boolean;
  allowScreenShare: boolean;
  allowWhiteboard: boolean;
  allowRecording: boolean;
  muteOnEntry: boolean;
  videoOffOnEntry: boolean;
  requireLobby: boolean;
  allowRaiseHand: boolean;
  allowPolls: boolean;
  allowBreakoutRooms: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  teacher: User;
  students: User[];
  assistants: User[];
  settings: ClassroomSettings;
  status: 'scheduled' | 'live' | 'ended';
  startTime: Date;
  endTime?: Date;
}

export interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
}

export interface WhiteboardData {
  id: string;
  classroomId: string;
  pages: WhiteboardPage[];
  currentPage: number;
}

export interface WhiteboardPage {
  id: string;
  objects: any[]; // Fabric.js objects
  background?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>; // userId -> optionIndex
  createdBy: User;
  status: 'active' | 'closed';
  timestamp: Date;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: User[];
  duration?: number; // in minutes
  startTime: Date;
}

export interface ClassSchedule {
  id: string;
  classroomId: string;
  title: string;
  description?: string;
  teacher: User;
  startTime: Date;
  endTime: Date;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: Date;
  maxStudents?: number;
  enrolledStudents: User[];
  waitlist: User[];
  status: 'scheduled' | 'cancelled' | 'completed';
  tags?: string[];
  price?: number;
  currency?: string;
}
