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
  Space,
} from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  BookOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import styles from './Profile.module.scss';

const { Title, Paragraph } = Typography;

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  school: string;
  grade: string;
  subjects: string[];
  introduction: string;
}

interface LearningRecord {
  id: string;
  subject: string;
  tutorName: string;
  date: string;
  duration: number;
  notes: string;
}

interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  image: string;
}

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchLearningRecords();
    fetchCertificates();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      const data = await response.json();
      setProfile(data);
      form.setFieldsValue(data);
    } catch (error) {
      console.error('获取个人信息失败:', error);
    }
  };

  const fetchLearningRecords = async () => {
    try {
      const response = await fetch('/api/student/learning-records');
      const data = await response.json();
      setLearningRecords(data);
    } catch (error) {
      console.error('获取学习记录失败:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/student/certificates');
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('获取证书失败:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await fetch('/api/student/profile', {
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
              <Form.Item name="school" label="学校">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="introduction" label="个人简介">
            <Input.TextArea rows={4} />
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
      key: 'learning',
      label: (
        <span>
          <BookOutlined />
          学习记录
        </span>
      ),
      children: (
        <List
          dataSource={learningRecords}
          renderItem={record => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <span>{record.subject}</span>
                    <Tag color="blue">{record.tutorName}</Tag>
                  </Space>
                }
                description={
                  <>
                    <div>上课时间：{record.date}</div>
                    <div>课程时长：{record.duration}分钟</div>
                    <div>课程笔记：{record.notes}</div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'certificates',
      label: (
        <span>
          <SafetyCertificateOutlined />
          我的证书
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {certificates.map(certificate => (
            <Col span={8} key={certificate.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={certificate.name}
                    src={certificate.image}
                  />
                }
              >
                <Card.Meta
                  title={certificate.name}
                  description={`颁发日期：${certificate.issueDate}`}
                />
              </Card>
            </Col>
          ))}
        </Row>
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
