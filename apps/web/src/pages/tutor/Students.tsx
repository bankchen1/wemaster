import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Typography,
  Avatar,
  Modal,
  Tabs,
  List,
  Timeline,
  Statistic,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  HistoryOutlined,
  LineChartOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './Students.module.scss';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Student {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  totalLessons: number;
  completedLessons: number;
  lastLesson: string;
  nextLesson: string;
  progress: number;
  status: 'active' | 'inactive';
}

interface LearningRecord {
  id: string;
  date: string;
  subject: string;
  content: string;
  homework: string;
  score: number;
}

interface PerformanceData {
  subject: string;
  scores: number[];
  dates: string[];
}

export const TutorStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tutor/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('获取学生列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId: string) => {
    try {
      const [recordsRes, performanceRes] = await Promise.all([
        fetch(`/api/tutor/students/${studentId}/records`),
        fetch(`/api/tutor/students/${studentId}/performance`),
      ]);
      const [recordsData, performanceData] = await Promise.all([
        recordsRes.json(),
        performanceRes.json(),
      ]);
      setLearningRecords(recordsData);
      setPerformanceData(performanceData);
    } catch (error) {
      console.error('获取学生详情失败:', error);
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentDetails(student.id);
    setModalVisible(true);
  };

  const columns: ColumnsType<Student> = [
    {
      title: '学生',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          {record.name}
        </Space>
      ),
    },
    {
      title: '学习科目',
      key: 'subjects',
      render: (_, record) => (
        <Space>
          {record.subjects.map(subject => (
            <Tag key={subject} color="blue">
              {subject}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '学习进度',
      key: 'progress',
      render: (_, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>
            {record.completedLessons}/{record.totalLessons}课时
          </span>
          <Progress percent={record.progress} size="small" />
        </Space>
      ),
    },
    {
      title: '上次上课',
      dataIndex: 'lastLesson',
      key: 'lastLesson',
    },
    {
      title: '下次上课',
      dataIndex: 'nextLesson',
      key: 'nextLesson',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'}>
          {record.status === 'active' ? '学习中' : '已暂停'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="发送消息">
            <Button
              icon={<MessageOutlined />}
              onClick={() => {/* 实现发送消息功能 */}}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.students}>
      <Card>
        <Title level={3}>学生管理</Title>
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="id"
        />

        <Modal
          title="学生详情"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={800}
          footer={null}
        >
          {selectedStudent && (
            <Tabs defaultActiveKey="overview">
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    基本信息
                  </span>
                }
                key="overview"
              >
                <Row gutter={[24, 24]}>
                  <Col span={8}>
                    <Statistic
                      title="总课时"
                      value={selectedStudent.totalLessons}
                      prefix={<BookOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="已完成"
                      value={selectedStudent.completedLessons}
                      prefix={<CheckOutlined />}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="完成率"
                      value={selectedStudent.progress}
                      suffix="%"
                      prefix={<PercentageOutlined />}
                    />
                  </Col>
                </Row>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    学习记录
                  </span>
                }
                key="records"
              >
                <Timeline>
                  {learningRecords.map(record => (
                    <Timeline.Item key={record.id}>
                      <p>
                        {record.date} - {record.subject}
                      </p>
                      <p>课程内容：{record.content}</p>
                      <p>课后作业：{record.homework}</p>
                      <p>
                        得分：
                        <Tag color={record.score >= 80 ? 'success' : 'warning'}>
                          {record.score}分
                        </Tag>
                      </p>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <LineChartOutlined />
                    学习表现
                  </span>
                }
                key="performance"
              >
                {/* 这里可以添加成绩趋势图表，使用Echarts或其他图表库 */}
              </TabPane>
            </Tabs>
          )}
        </Modal>
      </Card>
    </div>
  );
};
