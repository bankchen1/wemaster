import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  List,
  Tag,
  Statistic,
  Calendar,
  Badge,
} from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Dashboard.module.scss';

const { Title, Paragraph } = Typography;

interface UpcomingLesson {
  id: string;
  subject: string;
  tutorName: string;
  tutorAvatar: string;
  startTime: string;
  duration: number;
}

interface LearningProgress {
  subject: string;
  completedLessons: number;
  totalLessons: number;
  progress: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [lessonSchedule, setLessonSchedule] = useState<any[]>([]);

  useEffect(() => {
    // 获取即将开始的课程
    fetchUpcomingLessons();
    // 获取学习进度
    fetchLearningProgress();
    // 获取课程安排
    fetchLessonSchedule();
  }, []);

  const fetchUpcomingLessons = async () => {
    try {
      const response = await fetch('/api/student/upcoming-lessons');
      const data = await response.json();
      setUpcomingLessons(data);
    } catch (error) {
      console.error('获取课程失败:', error);
    }
  };

  const fetchLearningProgress = async () => {
    try {
      const response = await fetch('/api/student/learning-progress');
      const data = await response.json();
      setLearningProgress(data);
    } catch (error) {
      console.error('获取学习进度失败:', error);
    }
  };

  const fetchLessonSchedule = async () => {
    try {
      const response = await fetch('/api/student/lesson-schedule');
      const data = await response.json();
      setLessonSchedule(data);
    } catch (error) {
      console.error('获取课程安排失败:', error);
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* 欢迎区域 */}
      <section className={styles.welcome}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar size={64} src={user?.avatar} />
          </Col>
          <Col>
            <Title level={3}>欢迎回来，{user?.name}</Title>
            <Paragraph>今天是继续进步的好日子！</Paragraph>
          </Col>
        </Row>
      </section>

      {/* 数据概览 */}
      <section className={styles.statistics}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成课时"
                value={93}
                prefix={<BookOutlined />}
                suffix="课时"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="学习时长"
                value={186}
                prefix={<ClockCircleOutlined />}
                suffix="小时"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="获得勋章"
                value={12}
                prefix={<TrophyOutlined />}
                suffix="枚"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本周课程"
                value={5}
                prefix={<VideoCameraOutlined />}
                suffix="节"
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 即将开始的课程 */}
      <section className={styles.upcomingLessons}>
        <Card title="即将开始的课程">
          <List
            dataSource={upcomingLessons}
            renderItem={lesson => (
              <List.Item
                actions={[
                  <Button type="primary">
                    <Link to={`/live/${lesson.id}`}>进入教室</Link>
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={lesson.tutorAvatar} />}
                  title={lesson.subject}
                  description={
                    <>
                      <div>导师：{lesson.tutorName}</div>
                      <div>
                        开始时间：{lesson.startTime} ({lesson.duration}分钟)
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </section>

      <Row gutter={24}>
        {/* 学习进度 */}
        <Col span={12}>
          <Card title="学习进度" className={styles.progress}>
            <List
              dataSource={learningProgress}
              renderItem={progress => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className={styles.progressTitle}>
                        <span>{progress.subject}</span>
                        <Tag color="blue">
                          {progress.completedLessons}/{progress.totalLessons}课时
                        </Tag>
                      </div>
                    }
                    description={
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 课程日历 */}
        <Col span={12}>
          <Card title="课程安排" className={styles.calendar}>
            <Calendar
              fullscreen={false}
              dateCellRender={date => {
                const lessons = lessonSchedule.filter(
                  lesson =>
                    new Date(lesson.date).toDateString() ===
                    date.toDate().toDateString()
                );
                return lessons.length ? (
                  <Badge
                    count={lessons.length}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                ) : null;
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 推荐课程 */}
      <section className={styles.recommendations}>
        <Card title="为你推荐">
          <Row gutter={16}>
            {recommendedCourses.map(course => (
              <Col span={8} key={course.id}>
                <Card hoverable className={styles.courseCard}>
                  <img
                    src={course.cover}
                    alt={course.title}
                    className={styles.courseCover}
                  />
                  <Title level={4}>{course.title}</Title>
                  <Paragraph>{course.description}</Paragraph>
                  <Button type="primary" block>
                    了解详情
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </section>
    </div>
  );
};

// 模拟数据
const recommendedCourses = [
  {
    id: 1,
    title: '高中数学提高班',
    description: '针对性提升数学解题能力',
    cover: '/images/math-course.jpg',
  },
  // ...其他推荐课程
];
