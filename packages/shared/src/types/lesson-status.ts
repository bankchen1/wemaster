export enum LessonStatus {
  UPCOMING = 'upcoming',     // 24h内即将开始
  IN_PROCESS = 'in_process', // 课程进行中
  PENDING = 'pending',       // 等待导师确认
  SCHEDULED = 'scheduled',   // 已计划
  RESCHEDULED = 'rescheduled', // 重新计划
  CANCELED = 'canceled',     // 已取消
  COMPLETED = 'completed'    // 已完成
}

export enum ButtonStatus {
  WAITING = 'waiting',         // 不可点击
  JOIN_CLASS = 'join_class',   // 进入课堂
  MANAGE = 'manage',           // 管理课程
  MANAGE_LESSON = 'manage_lesson', // 管理课程
  INVALID = 'invalid',         // 不可点击
  LEAVE_FEEDBACK = 'leave_feedback', // 评价
  APPEAL = 'appeal',           // 申诉
  APPEAL_INFO = 'appeal_info'  // 申诉信息
}

export interface LessonStatusConfig {
  status: LessonStatus;
  buttonStatus: ButtonStatus;
  isClickable: boolean;
  timeLimit?: {
    feedbackDays: number;    // 评价时限（工作日）
    appealHours: number;     // 申诉时限（小时）
  };
}

export interface LessonTimeConfig {
  startTime: Date;           // 课程开始时间
  endTime: Date;            // 课程结束时间
  completedTime?: Date;     // 课程完成时间
  lastFeedbackTime?: Date;  // 最后评价时间
  lastAppealTime?: Date;    // 最后申诉时间
}
