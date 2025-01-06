import { v4 as uuidv4 } from 'uuid';
import { Classroom, User, ClassroomSettings, Poll, BreakoutRoom } from '../types/classroom';

class ClassroomService {
  private classrooms: Map<string, Classroom>;
  private activePolls: Map<string, Poll>;
  private breakoutRooms: Map<string, BreakoutRoom>;

  constructor() {
    this.classrooms = new Map();
    this.activePolls = new Map();
    this.breakoutRooms = new Map();
  }

  // 教室管理
  createClassroom(name: string, teacher: User, settings?: Partial<ClassroomSettings>): Classroom {
    const classroomId = uuidv4();
    const defaultSettings: ClassroomSettings = {
      allowChat: true,
      allowScreenShare: true,
      allowWhiteboard: true,
      allowRecording: false,
      muteOnEntry: true,
      videoOffOnEntry: true,
      requireLobby: false,
      allowRaiseHand: true,
      allowPolls: true,
      allowBreakoutRooms: true,
      ...settings
    };

    const classroom: Classroom = {
      id: classroomId,
      name,
      teacher,
      students: [],
      assistants: [],
      settings: defaultSettings,
      status: 'scheduled',
      startTime: new Date(),
      endTime: undefined
    };

    this.classrooms.set(classroomId, classroom);
    return classroom;
  }

  getClassroom(classroomId: string): Classroom | undefined {
    return this.classrooms.get(classroomId);
  }

  updateClassroomSettings(classroomId: string, settings: Partial<ClassroomSettings>): boolean {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return false;

    classroom.settings = { ...classroom.settings, ...settings };
    return true;
  }

  // 参与者管理
  addParticipant(classroomId: string, user: User): boolean {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return false;

    switch (user.role) {
      case 'student':
        classroom.students.push(user);
        break;
      case 'assistant':
        classroom.assistants.push(user);
        break;
      case 'teacher':
        // 通常不会添加新的老师
        return false;
    }

    return true;
  }

  removeParticipant(classroomId: string, userId: string): boolean {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return false;

    classroom.students = classroom.students.filter(s => s.id !== userId);
    classroom.assistants = classroom.assistants.filter(a => a.id !== userId);
    return true;
  }

  // 投票管理
  createPoll(classroomId: string, question: string, options: string[], createdBy: User): Poll {
    const poll: Poll = {
      id: uuidv4(),
      question,
      options,
      votes: {},
      createdBy,
      status: 'active',
      timestamp: new Date()
    };

    this.activePolls.set(poll.id, poll);
    return poll;
  }

  recordVote(pollId: string, userId: string, optionIndex: number): boolean {
    const poll = this.activePolls.get(pollId);
    if (!poll || poll.status !== 'active') return false;

    poll.votes[userId] = optionIndex;
    return true;
  }

  closePoll(pollId: string): boolean {
    const poll = this.activePolls.get(pollId);
    if (!poll) return false;

    poll.status = 'closed';
    return true;
  }

  // 分组讨论室管理
  createBreakoutRoom(
    classroomId: string,
    name: string,
    participants: User[],
    duration?: number
  ): BreakoutRoom {
    const room: BreakoutRoom = {
      id: uuidv4(),
      name,
      participants,
      duration,
      startTime: new Date()
    };

    this.breakoutRooms.set(room.id, room);
    return room;
  }

  addParticipantToBreakoutRoom(roomId: string, participant: User): boolean {
    const room = this.breakoutRooms.get(roomId);
    if (!room) return false;

    room.participants.push(participant);
    return true;
  }

  removeParticipantFromBreakoutRoom(roomId: string, userId: string): boolean {
    const room = this.breakoutRooms.get(roomId);
    if (!room) return false;

    room.participants = room.participants.filter(p => p.id !== userId);
    return true;
  }

  closeBreakoutRoom(roomId: string): boolean {
    return this.breakoutRooms.delete(roomId);
  }

  // 教室状态管理
  startClassroom(classroomId: string): boolean {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return false;

    classroom.status = 'live';
    classroom.startTime = new Date();
    return true;
  }

  endClassroom(classroomId: string): boolean {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) return false;

    classroom.status = 'ended';
    classroom.endTime = new Date();
    return true;
  }
}

export const classroomService = new ClassroomService();
