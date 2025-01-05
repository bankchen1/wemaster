import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  List,
  Button,
  Tag,
  Calendar,
  Badge,
  Avatar,
  Timeline,
  Progress,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './Dashboard.module.scss';

const { Title, Paragraph } = Typography;

interface Student {
  id: string;
  name: string;
  avatar: string;
  subject: string;
  progress: number;
  nextLesson: string;
}

interface UpcomingLesson {
  id: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  startTime: string;
  duration: number;
}

export const TutorDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [studentsRes, lessonsRes, scheduleRes] = await Promise.all([
        fetch('/api/tutor/students'),
        fetch('/api/tutor/upcoming-lessons'),
        fetch('/api/tutor/schedule'),
      ]);

      const [studentsData, lessonsData, scheduleData] = await Promise.all([
        studentsRes.json(),
        lessonsRes.json(),
        scheduleRes.json(),
      ]);

      setStudents(studentsData);
      setUpcomingLessons(lessonsData);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* 数据概览 */}
      <Row gutter={16} className={styles.statistics}>
        <Col span={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={students.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总课时"
              value={248}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={12580}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={4.8}
              prefix={<StarOutlined />}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* 即将开始的课程 */}
        <Col span={16}>
          <Card title="即将开始的课程" className={styles.upcomingLessons}>
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
                    avatar={<Avatar src={lesson.studentAvatar} />}
                    title={
                      <Space>
                        {lesson.subject}
                        <Tag color="blue">{lesson.studentName}</Tag>
                      </Space>
                    }
                    description={`开始时间：${lesson.startTime} (${lesson.duration}分钟)`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 今日日程 */}
        <Col span={8}>
          <Card title="今日日程" className={styles.todaySchedule}>
            <Timeline
              items={schedule.map(item => ({
                color: item.status === 'completed' ? 'green' : 'blue',
                children: (
                  <>
                    <div>{item.time}</div>
                    <div>{item.subject} - {item.studentName}</div>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* 学生进度 */}
        <Col span={16}>
          <Card title="学生学习进度" className={styles.studentProgress}>
            <List
              dataSource={students}
              renderItem={student => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={student.avatar} />}
                    title={
                      <Space>
                        {student.name}
                        <Tag color="blue">{student.subject}</Tag>
                      </Space>
                    }
                    description={
                      <div className={styles.progressWrapper}>
                        <Progress
                          percent={student.progress}
                          size="small"
                          status="active"
                        />
                        <div>下一课：{student.nextLesson}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 课程日历 */}
        <Col span={8}>
          <Card title="课程安排" className={styles.calendar}>
            <Calendar
              fullscreen={false}
              dateCellRender={date => {
                const lessons = schedule.filter(
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

      {/* 收入趋势 */}
      <Card title="收入趋势" className={styles.incomeChart}>
        {/* 这里可以添加收入趋势图表，使用Echarts或其他图表库 */}
      </Card>
    </div>
  );
};
