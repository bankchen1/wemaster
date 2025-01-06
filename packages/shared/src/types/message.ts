export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  NOTIFICATION = 'notification'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  thumbnailUrl?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  type: ConversationType;
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
  SYSTEM = 'system'
}

export interface MessageQuery {
  conversationId: string;
  page: number;
  limit: number;
  before?: Date;
  after?: Date;
}
