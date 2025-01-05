import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tabs,
  List,
  Tag,
  Progress,
  Empty,
  Space,
  Rate,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import { Link } from 'react-router-dom';
import type { TabsProps } from 'antd';
import styles from './Courses.module.scss';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Course {
  id: string;
  title: string;
  subject: string;
  tutorName: string;
  tutorAvatar: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson?: {
    id: string;
    startTime: string;
  };
  status: 'active' | 'completed' | 'upcoming';
}

export const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('获取课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (values: any) => {
    try {
      await fetch(`/api/courses/${selectedCourse?.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      message.success('评价提交成功');
      setReviewModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('评价提交失败');
    }
  };

  const renderCourseList = (status: Course['status']) => {
    const filteredCourses = courses.filter(
      course => course.status === status
    );

    return (
      <List
        dataSource={filteredCourses}
        renderItem={course => (
          <List.Item>
            <Card className={styles.courseCard} hoverable>
              <Row gutter={24} align="middle">
                <Col span={16}>
                  <Title level={4}>{course.title}</Title>
                  <Space>
                    <Tag color="blue">{course.subject}</Tag>
                    <span>导师：{course.tutorName}</span>
                  </Space>
                  <div className={styles.progress}>
                    <Progress
                      percent={course.progress}
                      size="small"
                      format={() => (
                        `${course.completedLessons}/${course.totalLessons}课时`
                      )}
                    />
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  {status === 'active' && course.nextLesson && (
                    <Button type="primary">
                      <Link to={`/live/${course.nextLesson.id}`}>
                        进入下一课
                      </Link>
                    </Button>
                  )}
                  {status === 'completed' && (
                    <Button
                      onClick={() => {
                        setSelectedCourse(course);
                        setReviewModalVisible(true);
                      }}
                    >
                      评价课程
                    </Button>
                  )}
                  {status === 'upcoming' && (
                    <Button disabled>
                      待开始
                    </Button>
                  )}
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  const items: TabsProps['items'] = [
    {
      key: 'active',
      label: '进行中的课程',
      children: renderCourseList('active'),
    },
    {
      key: 'upcoming',
      label: '即将开始的课程',
      children: renderCourseList('upcoming'),
    },
    {
      key: 'completed',
      label: '已完成的课程',
      children: renderCourseList('completed'),
    },
  ];

  return (
    <div className={styles.courses}>
      <Card>
        <Title level={3}>我的课程</Title>
        <Tabs defaultActiveKey="active" items={items} />
      </Card>

      <Modal
        title="课程评价"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleReview} layout="vertical">
          <Form.Item
            name="rating"
            label="课程评分"
            rules={[{ required: true }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="评价内容"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
