// 用户相关类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'tutor' | 'admin';
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  language: string;
  currency: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

// 导师相关类型
export interface Tutor {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  headline: string;
  bio: string;
  video?: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalLessons: number;
  subjects: Subject[];
  education: Education[];
  experience: Experience[];
  availability: Availability[];
  languages: Language[];
  verificationStatus: VerificationStatus;
  featured: boolean;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  verified: boolean;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  current: boolean;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface Language {
  code: string;
  name: string;
  level: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// 课程相关类型
export interface Course {
  id: string;
  tutorId: string;
  title: string;
  description: string;
  subject: Subject;
  level: string;
  duration: number;
  price: number;
  currency: string;
  maxStudents: number;
  schedule: Schedule[];
  materials: Material[];
  objectives: string[];
  requirements: string[];
  status: CourseStatus;
}

export interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  availableSlots: number;
}

export interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link';
  url: string;
  size?: number;
  duration?: number;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

// 预约相关类型
export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  courseId?: string;
  type: 'trial' | 'regular';
  status: BookingStatus;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  currency: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  meetingUrl?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// 评价相关类型
export interface Review {
  id: string;
  studentId: string;
  tutorId: string;
  courseId?: string;
  bookingId: string;
  rating: number;
  content: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

// 消息相关类型
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content: string;
  attachments?: Attachment[];
  read: boolean;
  createdAt: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 搜索相关类型
export interface SearchFilters {
  subject?: string;
  level?: string;
  price?: {
    min?: number;
    max?: number;
  };
  availability?: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  };
  language?: string;
  rating?: number;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

// 支付相关类型
export interface Payment {
  id: string;
  userId: string;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type PaymentType = 'booking' | 'package' | 'subscription';
export type PaymentMethod = 'card' | 'paypal' | 'wechat' | 'alipay';
