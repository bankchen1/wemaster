import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, message, Modal, Form, Input, Rate, Tabs } from 'antd';
import { 
  LessonStatus, 
  ButtonStatus 
} from '@wemaster/shared/types/lesson-status';
import { courseApi } from '@/api/course';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/date';

const { TabPane } = Tabs;

interface CourseStatus {
  status: LessonStatus;
  buttonStatus: ButtonStatus;
  isClickable: boolean;
  timeConfig: {
    startTime: Date;
    endTime: Date;
    completedTime?: Date;
    lastFeedbackTime?: Date;
    lastAppealTime?: Date;
  };
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  appeal?: {
    reason: string;
    status: string;
    createdAt: Date;
    resolvedAt?: Date;
  };
}

export const CoursePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [courseStatus, setCourseStatus] = useState<CourseStatus>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [appealVisible, setAppealVisible] = useState(false);
  const [rescheduleVisible, setRescheduleVisible] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchCourse();
      fetchCourseStatus();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseApi.getCourse(id as string);
      setCourse(data);
    } catch (error) {
      message.error('获取课程信息失败');
    }
  };

  const fetchCourseStatus = async () => {
    try {
      const data = await courseApi.getCourseStatus(id as string);
      setCourseStatus(data);
    } catch (error) {
      message.error('获取课程状态失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: LessonStatus) => {
    try {
      await courseApi.updateCourseStatus(id as string, { status: newStatus });
      message.success('状态更新成功');
      fetchCourseStatus();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleFeedbackSubmit = async (values) => {
    try {
      await courseApi.submitFeedback(id as string, values);
      message.success('评价提交成功');
      setFeedbackVisible(false);
      fetchCourseStatus();
    } catch (error) {
      message.error('评价提交失败');
    }
  };

  const handleAppealSubmit = async (values) => {
    try {
      await courseApi.submitAppeal(id as string, values);
      message.success('申诉提交成功');
      setAppealVisible(false);
      fetchCourseStatus();
    } catch (error) {
      message.error('申诉提交失败');
    }
  };

  const handleRescheduleSubmit = async (values) => {
    try {
      await courseApi.rescheduleCourse(id as string, values);
      message.success('课程重新安排成功');
      setRescheduleVisible(false);
      fetchCourseStatus();
    } catch (error) {
      message.error('课程重新安排失败');
    }
  };

  const renderActionButton = () => {
    if (!courseStatus?.isClickable) {
      return null;
    }

    switch (courseStatus?.buttonStatus) {
      case ButtonStatus.JOIN_CLASS:
        return (
          <Button type="primary" onClick={() => router.push(\`/classroom/\${id}\`)}>
            进入课堂
          </Button>
        );
      case ButtonStatus.MANAGE:
      case ButtonStatus.MANAGE_LESSON:
        return (
          <Button type="primary" onClick={() => setRescheduleVisible(true)}>
            管理课程
          </Button>
        );
      case ButtonStatus.LEAVE_FEEDBACK:
        return (
          <Button type="primary" onClick={() => setFeedbackVisible(true)}>
            评价课程
          </Button>
        );
      case ButtonStatus.APPEAL:
        return (
          <Button type="primary" onClick={() => setAppealVisible(true)}>
            提交申诉
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="p-6">
      <Card title="课程信息">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>课程名称：{course?.name}</p>
            <p>开始时间：{formatDateTime(courseStatus?.timeConfig.startTime)}</p>
            <p>结束时间：{formatDateTime(courseStatus?.timeConfig.endTime)}</p>
            <p>课程状态：{courseStatus?.status}</p>
          </div>
          <div className="flex justify-end items-start">
            {renderActionButton()}
          </div>
        </div>
      </Card>

      <Tabs className="mt-6">
        <TabPane tab="课程详情" key="details">
          <Card>
            <div dangerouslySetInnerHTML={{ __html: course?.description }} />
          </Card>
        </TabPane>

        {courseStatus?.feedback && (
          <TabPane tab="课程评价" key="feedback">
            <Card>
              <Rate disabled value={courseStatus.feedback.rating} />
              <p className="mt-4">{courseStatus.feedback.comment}</p>
              <p className="text-gray-500">
                评价时间：{formatDateTime(courseStatus.feedback.createdAt)}
              </p>
            </Card>
          </TabPane>
        )}

        {courseStatus?.appeal && (
          <TabPane tab="申诉信息" key="appeal">
            <Card>
              <p>申诉原因：{courseStatus.appeal.reason}</p>
              <p>申诉状态：{courseStatus.appeal.status}</p>
              <p>申诉时间：{formatDateTime(courseStatus.appeal.createdAt)}</p>
              {courseStatus.appeal.resolvedAt && (
                <p>处理时间：{formatDateTime(courseStatus.appeal.resolvedAt)}</p>
              )}
            </Card>
          </TabPane>
        )}
      </Tabs>

      <Modal
        title="课程评价"
        visible={feedbackVisible}
        onCancel={() => setFeedbackVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleFeedbackSubmit}>
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="评价内容">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="提交申诉"
        visible={appealVisible}
        onCancel={() => setAppealVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAppealSubmit}>
          <Form.Item
            name="reason"
            label="申诉原因"
            rules={[{ required: true, message: '请输入申诉原因' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              提交申诉
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重新安排课程"
        visible={rescheduleVisible}
        onCancel={() => setRescheduleVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleRescheduleSubmit}>
          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="reason" label="变更原因">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item className="text-right">
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePage;
