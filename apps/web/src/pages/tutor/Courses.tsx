import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  message,
  Typography,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import styles from './Courses.module.scss';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Course {
  id: string;
  title: string;
  subject: string;
  studentName: string;
  schedule: string;
  startDate: string;
  endDate: string;
  totalLessons: number;
  completedLessons: number;
  status: 'active' | 'completed' | 'upcoming';
  nextLesson?: {
    id: string;
    time: string;
  };
}

export const TutorCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tutor/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setModalType('create');
    setSelectedCourse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCourse = (course: Course) => {
    setModalType('edit');
    setSelectedCourse(course);
    form.setFieldsValue({
      ...course,
      dateRange: [dayjs(course.startDate), dayjs(course.endDate)],
    });
    setModalVisible(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await fetch(`/api/tutor/courses/${courseId}`, {
        method: 'DELETE',
      });
      message.success('课程删除成功');
      fetchCourses();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const data = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };

      if (modalType === 'create') {
        await fetch('/api/tutor/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        message.success('课程创建成功');
      } else {
        await fetch(`/api/tutor/courses/${selectedCourse?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        message.success('课程更新成功');
      }

      setModalVisible(false);
      fetchCourses();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<Course> = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {text}
          <Tag color="blue">{record.subject}</Tag>
        </Space>
      ),
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '课程进度',
      key: 'progress',
      render: (_, record) => (
        <Space>
          <span>
            {record.completedLessons}/{record.totalLessons}课时
          </span>
          <Progress
            percent={(record.completedLessons / record.totalLessons) * 100}
            size="small"
            status={record.status === 'completed' ? 'success' : 'active'}
          />
        </Space>
      ),
    },
    {
      title: '上课时间',
      dataIndex: 'schedule',
      key: 'schedule',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          active: { text: '进行中', color: 'processing' },
          completed: { text: '已结束', color: 'success' },
          upcoming: { text: '未开始', color: 'default' },
        };
        const status = statusMap[record.status];
        return <Badge status={status.color as any} text={status.text} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.nextLesson && (
            <Tooltip title="进入教室">
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                href={`/live/${record.nextLesson.id}`}
              />
            </Tooltip>
          )}
          <Tooltip title="查看详情">
            <Button
              icon={<EyeOutlined />}
              href={`/tutor/courses/${record.id}`}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditCourse(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确定要删除这个课程吗？',
                  onOk: () => handleDeleteCourse(record.id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.courses}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>课程管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCourse}
          >
            创建课程
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
          loading={loading}
          rowKey="id"
        />

        <Modal
          title={modalType === 'create' ? '创建课程' : '编辑课程'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="课程名称"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="subject"
              label="科目"
              rules={[{ required: true }]}
            >
              <Select>
                {subjects.map(subject => (
                  <Option key={subject.value} value={subject.value}>
                    {subject.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="studentId"
              label="学生"
              rules={[{ required: true }]}
            >
              <Select>
                {students.map(student => (
                  <Option key={student.id} value={student.id}>
                    {student.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="课程时间"
              rules={[{ required: true }]}
            >
              <RangePicker />
            </Form.Item>

            <Form.Item
              name="schedule"
              label="上课时间"
              rules={[{ required: true }]}
            >
              <TimePicker.RangePicker format="HH:mm" />
            </Form.Item>

            <Form.Item
              name="totalLessons"
              label="总课时"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="description"
              label="课程说明"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {modalType === 'create' ? '创建' : '保存'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

// 模拟数据
const subjects = [
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  // ...其他科目
];

const students = [
  { id: '1', name: '张三' },
  { id: '2', name: '李四' },
  // ...其他学生
];
