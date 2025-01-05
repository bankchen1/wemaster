import React from 'react';
import { Button, Row, Col, Typography, Steps, Card, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './BecomeTutor.module.scss';

const { Title, Paragraph } = Typography;

export const BecomeTutor: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      // 提交申请
      await fetch('/api/tutor/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      message.success('申请提交成功！我们会尽快审核');
    } catch (error) {
      message.error('申请提交失败，请重试');
    }
  };

  return (
    <div className={styles.becomeTutor}>
      {/* 头部banner */}
      <section className={styles.banner}>
        <Row align="middle" justify="center">
          <Col span={24} md={12}>
            <Title level={1}>成为优秀导师</Title>
            <Paragraph>
              加入我们的导师团队，分享你的知识，帮助更多学生成长
            </Paragraph>
            <Button type="primary" size="large" href="#apply">
              立即申请
            </Button>
          </Col>
          <Col span={24} md={12}>
            <img
              src="/images/tutor-banner.png"
              alt="成为导师"
              className={styles.bannerImage}
            />
          </Col>
        </Row>
      </section>

      {/* 为什么选择我们 */}
      <section className={styles.whyUs}>
        <Title level={2} className={styles.sectionTitle}>
          为什么选择我们的平台
        </Title>
        <Row gutter={[32, 32]}>
          <Col span={24} md={8}>
            <Card className={styles.benefitCard}>
              <img src="/icons/income.svg" alt="灵活收入" />
              <Title level={3}>灵活收入</Title>
              <Paragraph>
                自由安排教学时间，获得有竞争力的课时收入
              </Paragraph>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card className={styles.benefitCard}>
              <img src="/icons/growth.svg" alt="职业发展" />
              <Title level={3}>职业发展</Title>
              <Paragraph>
                提供专业培训和发展机会，助力教学能力提升
              </Paragraph>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card className={styles.benefitCard}>
              <img src="/icons/support.svg" alt="全面支持" />
              <Title level={3}>全面支持</Title>
              <Paragraph>
                提供教学资源和技术支持，专注于教学质量
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 申请流程 */}
      <section className={styles.process}>
        <Title level={2} className={styles.sectionTitle}>
          申请流程
        </Title>
        <Steps
          items={[
            {
              title: '提交申请',
              description: '填写基本信息和教学经验',
            },
            {
              title: '资质审核',
              description: '审核学历和教学资质',
            },
            {
              title: '能力测评',
              description: '参加线上教学能力测评',
            },
            {
              title: '开始授课',
              description: '通过审核后即可开始授课',
            },
          ]}
        />
      </section>

      {/* 申请表单 */}
      <section id="apply" className={styles.applicationForm}>
        <Title level={2} className={styles.sectionTitle}>
          导师申请
        </Title>
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark="optional"
          >
            <Row gutter={24}>
              <Col span={24} md={12}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true },
                    { type: 'email' },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24} md={12}>
                <Form.Item
                  name="phone"
                  label="手机号"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} md={12}>
                <Form.Item
                  name="subject"
                  label="教授科目"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="experience"
              label="教学经验"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="education"
              label="学历信息"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="resume"
              label="简历"
              rules={[{ required: true }]}
            >
              <Upload>
                <Button icon={<UploadOutlined />}>上传简历</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="certificates"
              label="教学资质证书"
            >
              <Upload multiple>
                <Button icon={<UploadOutlined />}>上传证书</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </section>

      {/* FAQ部分 */}
      <section className={styles.faq}>
        <Title level={2} className={styles.sectionTitle}>
          常见问题
        </Title>
        <Row gutter={[24, 24]}>
          {faqs.map(faq => (
            <Col span={24} md={12} key={faq.id}>
              <Card>
                <Title level={4}>{faq.question}</Title>
                <Paragraph>{faq.answer}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

// 模拟数据
const faqs = [
  {
    id: 1,
    question: '成为导师需要什么条件？',
    answer: '需要具备相关学科的本科及以上学历，有教学经验优先。',
  },
  {
    id: 2,
    question: '如何安排教学时间？',
    answer: '导师可以灵活设置自己的可用时间，与学生协商具体上课时间。',
  },
  // ...其他FAQ
];
