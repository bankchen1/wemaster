export enum BookingStatus {
  PENDING = 'pending',           // 等待导师确认
  CONFIRMED = 'confirmed',       // 导师已确认
  COMPLETED = 'completed',       // 课程已完成
  CANCELLED = 'cancelled',       // 已取消
  RESCHEDULING = 'rescheduling', // 申请改期中
  APPEALING = 'appealing',       // 申诉处理中
  REFUNDED = 'refunded'          // 已退款
}

export enum AppealStatus {
  PENDING_TUTOR = 'pending_tutor',           // 等待导师回复
  PENDING_STUDENT = 'pending_student',       // 等待学生确认
  PENDING_PLATFORM = 'pending_platform',     // 等待平台介入
  PLATFORM_PROCESSING = 'platform_processing', // 平台处理中
  COMPLETED = 'completed',                    // 处理完成
  CANCELLED = 'cancelled'                     // 已取消
}

export interface TimeSlot {
  id: string;
  tutorId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  bookingId?: string;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  courseId: string;
  timeSlot: TimeSlot;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  originalTimeSlot?: TimeSlot;  // 用于存储改期前的时间
  cancelReason?: string;
  cancelledBy?: string;
  refundAmount?: number;
}

export interface Appeal {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  status: AppealStatus;
  reason: string;
  content: string;
  tutorResponse?: string;
  platformResponse?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  deadlineForTutor: Date;      // 导师回复截止时间
  deadlineForStudent: Date;     // 学生确认截止时间
  deadlineForPlatform?: Date;   // 平台处理截止时间
  evidence?: AppealEvidence[];  // 申诉证据
}

export interface AppealEvidence {
  id: string;
  appealId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface RescheduleRequest {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  originalTimeSlot: TimeSlot;
  proposedTimeSlot: TimeSlot;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: Date;
  updatedAt: Date;
  responseMessage?: string;
}
