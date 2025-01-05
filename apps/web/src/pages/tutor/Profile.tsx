import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Row,
  Col,
  message,
  Tabs,
  List,
  Tag,
  Typography,
  Avatar,
  Rate,
  Select,
  TimePicker,
  Switch,
} from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  ScheduleOutlined,
  CommentOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import styles from './Profile.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TutorProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subjects: string[];
  education: string;
  experience: string;
  introduction: string;
  certificates: string[];
  hourlyRate: number;
}

interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
  subject: string;
}

export const TutorProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/tutor/profile');
      const data = await response.json();
      setProfile(data);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('获取个人信息失败:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/tutor/reviews');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('获取评价失败:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await fetch('/api/tutor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: 'basic',
      label: (
        <span>
          <UserOutlined />
          基本信息
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={profile}
        >
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
              <Upload
                name="avatar"
                showUploadList={false}
                action="/api/upload"
                onChange={info => {
                  if (info.file.status === 'done') {
                    message.success('头像上传成功');
                  }
                }}
              >
                <Avatar
                  size={100}
                  src={profile?.avatar}
                  icon={<UserOutlined />}
                />
                <Button icon={<UploadOutlined />}>更换头像</Button>
              </Upload>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subjects"
                label="教授科目"
                rules={[{ required: true }]}
              >
                <Select mode="multiple">
                  {subjects.map(subject => (
                    <Option key={subject.value} value={subject.value}>
                      {subject.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="education"
            label="教育背景"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="experience"
            label="教学经验"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="个人介绍"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="课时费（元/小时）"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="certificates"
            label="资质证书"
          >
            <Upload
              multiple
              action="/api/upload"
              listType="picture-card"
              onChange={info => {
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} 上传成功`);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>上传证书</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存更改
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'schedule',
      label: (
        <span>
          <ScheduleOutlined />
          授课时间
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical">
            {weekdays.map(day => (
              <Form.Item key={day.value} label={day.label}>
                <Row gutter={16} align="middle">
                  <Col span={4}>
                    <Switch defaultChecked />
                  </Col>
                  <Col span={20}>
                    <TimePicker.RangePicker />
                  </Col>
                </Row>
              </Form.Item>
            ))}
            <Button type="primary">保存排课时间</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'reviews',
      label: (
        <span>
          <CommentOutlined />
          学生评价
        </span>
      ),
      children: (
        <List
          dataSource={reviews}
          renderItem={review => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={review.studentAvatar} />}
                title={
                  <Space>
                    <span>{review.studentName}</span>
                    <Tag color="blue">{review.subject}</Tag>
                    <Rate disabled defaultValue={review.rating} />
                  </Space>
                }
                description={
                  <>
                    <div>{review.comment}</div>
                    <div className={styles.reviewDate}>{review.date}</div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <div className={styles.profile}>
      <Card>
        <Tabs defaultActiveKey="basic" items={items} />
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

const weekdays = [
  { value: 'monday', label: '周一' },
  { value: 'tuesday', label: '周二' },
  // ...其他工作日
];
