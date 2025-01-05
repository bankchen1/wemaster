import mixpanel from 'mixpanel-browser';
import { init as initSentry } from '@sentry/browser';
import posthog from 'posthog-js';

// 初始化分析工具
export const initAnalytics = () => {
  // Mixpanel
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);

  // PostHog
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });

  // Sentry
  initSentry({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
};

// 用户行为跟踪
export const trackUserBehavior = {
  // 页面访问
  pageView: (pageName: string) => {
    mixpanel.track('Page View', { page: pageName });
    posthog.capture('page_view', { page: pageName });
  },

  // 会议相关事件
  meeting: {
    created: (meetingId: string, details: any) => {
      mixpanel.track('Meeting Created', {
        meeting_id: meetingId,
        ...details,
      });
      posthog.capture('meeting_created', {
        meeting_id: meetingId,
        ...details,
      });
    },

    joined: (meetingId: string, userId: string) => {
      mixpanel.track('Meeting Joined', {
        meeting_id: meetingId,
        user_id: userId,
      });
      posthog.capture('meeting_joined', {
        meeting_id: meetingId,
        user_id: userId,
      });
    },

    ended: (meetingId: string, duration: number) => {
      mixpanel.track('Meeting Ended', {
        meeting_id: meetingId,
        duration,
      });
      posthog.capture('meeting_ended', {
        meeting_id: meetingId,
        duration,
      });
    },
  },

  // 聊天相关事件
  chat: {
    messageSent: (meetingId: string, messageType: string) => {
      mixpanel.track('Message Sent', {
        meeting_id: meetingId,
        type: messageType,
      });
      posthog.capture('message_sent', {
        meeting_id: meetingId,
        type: messageType,
      });
    },

    fileShared: (meetingId: string, fileType: string, fileSize: number) => {
      mixpanel.track('File Shared', {
        meeting_id: meetingId,
        type: fileType,
        size: fileSize,
      });
      posthog.capture('file_shared', {
        meeting_id: meetingId,
        type: fileType,
        size: fileSize,
      });
    },
  },

  // 功能使用事件
  feature: {
    screenShared: (meetingId: string) => {
      mixpanel.track('Screen Shared', {
        meeting_id: meetingId,
      });
      posthog.capture('screen_shared', {
        meeting_id: meetingId,
      });
    },

    whiteboardUsed: (meetingId: string) => {
      mixpanel.track('Whiteboard Used', {
        meeting_id: meetingId,
      });
      posthog.capture('whiteboard_used', {
        meeting_id: meetingId,
      });
    },

    recordingStarted: (meetingId: string) => {
      mixpanel.track('Recording Started', {
        meeting_id: meetingId,
      });
      posthog.capture('recording_started', {
        meeting_id: meetingId,
      });
    },
  },

  // 错误事件
  error: {
    occurred: (error: Error, context: any) => {
      mixpanel.track('Error Occurred', {
        error: error.message,
        ...context,
      });
      posthog.capture('error_occurred', {
        error: error.message,
        ...context,
      });
    },

    handled: (error: Error, resolution: string) => {
      mixpanel.track('Error Handled', {
        error: error.message,
        resolution,
      });
      posthog.capture('error_handled', {
        error: error.message,
        resolution,
      });
    },
  },

  // 用户会话
  session: {
    started: (userId: string) => {
      mixpanel.identify(userId);
      posthog.identify(userId);
    },

    ended: () => {
      mixpanel.reset();
      posthog.reset();
    },

    userProperties: (properties: any) => {
      mixpanel.people.set(properties);
      posthog.setPersonProperties(properties);
    },
  },

  // 性能指标
  performance: {
    metric: (name: string, value: number, tags: any = {}) => {
      mixpanel.track('Performance Metric', {
        metric: name,
        value,
        ...tags,
      });
      posthog.capture('performance_metric', {
        metric: name,
        value,
        ...tags,
      });
    },
  },
};

// 用户行为分析
export const analyzeUserBehavior = {
  // 获取会议统计
  getMeetingStats: async (meetingId: string) => {
    const response = await fetch(`/api/analytics/meetings/${meetingId}`);
    return response.json();
  },

  // 获取用户参与度
  getUserEngagement: async (userId: string) => {
    const response = await fetch(`/api/analytics/users/${userId}/engagement`);
    return response.json();
  },

  // 获取功能使用情况
  getFeatureUsage: async () => {
    const response = await fetch('/api/analytics/features/usage');
    return response.json();
  },

  // 获取错误报告
  getErrorReport: async (timeRange: string) => {
    const response = await fetch(`/api/analytics/errors?timeRange=${timeRange}`);
    return response.json();
  },
};

export default {
  init: initAnalytics,
  track: trackUserBehavior,
  analyze: analyzeUserBehavior,
};
