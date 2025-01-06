import { message } from 'antd';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}

export const handleError = (error: AxiosError<ErrorResponse> | Error) => {
  if ('isAxiosError' in error) {
    // Axios 错误
    const axiosError = error as AxiosError<ErrorResponse>;
    const response = axiosError.response;

    if (response) {
      switch (response.status) {
        case 400:
          message.error(response.data.message || '请求参数错误');
          break;
        case 401:
          message.error('登录已过期，请重新登录');
          // 重定向到登录页
          window.location.href = \`/auth/login?redirect=\${encodeURIComponent(window.location.pathname)}\`;
          break;
        case 403:
          message.error('没有权限访问此资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error('未知错误，请稍后重试');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络连接失败，请检查网络设置');
    } else {
      // 请求配置出错
      message.error('请求配置错误');
    }
  } else {
    // 普通 JS 错误
    message.error(error.message || '发生未知错误');
  }

  // 记录错误日志
  console.error('Error:', error);
};

// 业务错误代码映射
export const businessErrorMap = {
  COURSE_NOT_FOUND: '课程不存在',
  COURSE_ALREADY_BOOKED: '该时段已被预约',
  INSUFFICIENT_BALANCE: '余额不足',
  INVALID_OPERATION: '无效的操作',
  TIME_CONFLICT: '时间冲突',
  BOOKING_EXPIRED: '预约已过期',
  FEEDBACK_TIMEOUT: '评价已超时',
  APPEAL_TIMEOUT: '申诉已超时',
};

// 处理业务错误
export const handleBusinessError = (code: string, defaultMessage: string = '操作失败') => {
  const message = businessErrorMap[code] || defaultMessage;
  message.error(message);
};
