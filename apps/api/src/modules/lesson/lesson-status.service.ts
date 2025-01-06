import { Injectable } from '@nestjs/common';
import { 
  LessonStatus, 
  ButtonStatus, 
  LessonStatusConfig,
  LessonTimeConfig 
} from '@wemaster/shared/types/lesson-status';
import { 
  differenceInMinutes, 
  differenceInHours,
  differenceInBusinessDays,
  addMinutes,
  addHours 
} from 'date-fns';

@Injectable()
export class LessonStatusService {
  private readonly STATUS_CONFIG: Record<LessonStatus, LessonStatusConfig> = {
    [LessonStatus.UPCOMING]: {
      status: LessonStatus.UPCOMING,
      buttonStatus: ButtonStatus.WAITING,
      isClickable: false
    },
    [LessonStatus.IN_PROCESS]: {
      status: LessonStatus.IN_PROCESS,
      buttonStatus: ButtonStatus.JOIN_CLASS,
      isClickable: true
    },
    [LessonStatus.PENDING]: {
      status: LessonStatus.PENDING,
      buttonStatus: ButtonStatus.MANAGE,
      isClickable: true
    },
    [LessonStatus.SCHEDULED]: {
      status: LessonStatus.SCHEDULED,
      buttonStatus: ButtonStatus.MANAGE_LESSON,
      isClickable: true
    },
    [LessonStatus.RESCHEDULED]: {
      status: LessonStatus.RESCHEDULED,
      buttonStatus: ButtonStatus.MANAGE_LESSON,
      isClickable: true
    },
    [LessonStatus.CANCELED]: {
      status: LessonStatus.CANCELED,
      buttonStatus: ButtonStatus.INVALID,
      isClickable: false
    },
    [LessonStatus.COMPLETED]: {
      status: LessonStatus.COMPLETED,
      buttonStatus: ButtonStatus.LEAVE_FEEDBACK,
      isClickable: true,
      timeLimit: {
        feedbackDays: 7,
        appealHours: 24
      }
    }
  };

  /**
   * 获取课程当前状态
   */
  getCurrentStatus(timeConfig: LessonTimeConfig): LessonStatus {
    const now = new Date();
    const startTime = new Date(timeConfig.startTime);
    const endTime = new Date(timeConfig.endTime);

    // 检查是否已完成
    if (timeConfig.completedTime) {
      return LessonStatus.COMPLETED;
    }

    // 检查是否已取消
    if (timeConfig.lastAppealTime) {
      return LessonStatus.CANCELED;
    }

    // 检查是否在进行中
    const minutesBeforeStart = differenceInMinutes(startTime, now);
    const minutesAfterEnd = differenceInMinutes(now, endTime);

    if (minutesBeforeStart <= 15 && minutesAfterEnd <= 15) {
      return LessonStatus.IN_PROCESS;
    }

    // 检查是否即将开始
    if (minutesBeforeStart <= 24 * 60 && minutesBeforeStart > 15) {
      return LessonStatus.UPCOMING;
    }

    return LessonStatus.SCHEDULED;
  }

  /**
   * 获取按钮状态
   */
  getButtonStatus(status: LessonStatus, timeConfig: LessonTimeConfig): ButtonStatus {
    const config = this.STATUS_CONFIG[status];
    const now = new Date();

    if (status === LessonStatus.COMPLETED) {
      // 检查评价时限
      if (timeConfig.completedTime) {
        const businessDays = differenceInBusinessDays(
          now,
          timeConfig.completedTime
        );
        if (businessDays > config.timeLimit.feedbackDays) {
          return ButtonStatus.INVALID;
        }
      }

      // 检查申诉时限
      if (!timeConfig.lastAppealTime) {
        const hours = differenceInHours(now, timeConfig.completedTime);
        if (hours <= config.timeLimit.appealHours) {
          return ButtonStatus.APPEAL;
        }
      } else {
        return ButtonStatus.APPEAL_INFO;
      }

      return ButtonStatus.LEAVE_FEEDBACK;
    }

    return config.buttonStatus;
  }

  /**
   * 检查按钮是否可点击
   */
  isButtonClickable(status: LessonStatus): boolean {
    return this.STATUS_CONFIG[status].isClickable;
  }

  /**
   * 获取状态转换后的时间配置
   */
  getUpdatedTimeConfig(
    currentStatus: LessonStatus,
    newStatus: LessonStatus,
    timeConfig: LessonTimeConfig
  ): LessonTimeConfig {
    const now = new Date();
    const updatedConfig = { ...timeConfig };

    switch (newStatus) {
      case LessonStatus.COMPLETED:
        updatedConfig.completedTime = now;
        break;
      case LessonStatus.CANCELED:
        updatedConfig.lastAppealTime = now;
        break;
      case LessonStatus.RESCHEDULED:
        // 重新计划时需要更新开始和结束时间
        const duration = differenceInMinutes(timeConfig.endTime, timeConfig.startTime);
        updatedConfig.startTime = addMinutes(now, 30); // 默认从30分钟后开始
        updatedConfig.endTime = addMinutes(updatedConfig.startTime, duration);
        break;
    }

    return updatedConfig;
  }

  /**
   * 检查状态转换是否有效
   */
  isValidStatusTransition(
    currentStatus: LessonStatus,
    newStatus: LessonStatus
  ): boolean {
    const validTransitions: Record<LessonStatus, LessonStatus[]> = {
      [LessonStatus.SCHEDULED]: [
        LessonStatus.RESCHEDULED,
        LessonStatus.CANCELED,
        LessonStatus.UPCOMING
      ],
      [LessonStatus.RESCHEDULED]: [
        LessonStatus.CANCELED,
        LessonStatus.UPCOMING
      ],
      [LessonStatus.UPCOMING]: [
        LessonStatus.IN_PROCESS,
        LessonStatus.CANCELED
      ],
      [LessonStatus.IN_PROCESS]: [
        LessonStatus.COMPLETED
      ],
      [LessonStatus.COMPLETED]: [],
      [LessonStatus.CANCELED]: [],
      [LessonStatus.PENDING]: [
        LessonStatus.SCHEDULED,
        LessonStatus.CANCELED
      ]
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
