import React from 'react';
import { Button, Row, Col, Typography, Space, Card } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Home.module.scss';

const { Title, Paragraph } = Typography;

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.home}>
      {/* Hero部分 */}
      <section className={styles.hero}>
        <Row align="middle" justify="center">
          <Col span={24} md={12}>
            <Title level={1}>在线一对一辅导，让学习更高效</Title>
            <Paragraph>
              连接优秀导师，定制专属学习计划，随时随地开始学习
            </Paragraph>
            <Space size="large">
              {!isAuthenticated ? (
                <>
                  <Button type="primary" size="large">
                    <Link to="/register">立即开始</Link>
                  </Button>
                  <Button size="large">
                    <Link to="/become-tutor">成为导师</Link>
                  </Button>
                </>
              ) : (
                <Button type="primary" size="large">
                  <Link to="/student/dashboard">进入学习</Link>
                </Button>
              )}
            </Space>
          </Col>
          <Col span={24} md={12}>
            <img
              src="/images/hero-image.png"
              alt="在线学习"
              className={styles.heroImage}
            />
          </Col>
        </Row>
      </section>

      {/* 特色功能 */}
      <section className={styles.features}>
        <Title level={2} className={styles.sectionTitle}>
          为什么选择我们
        </Title>
        <Row gutter={[32, 32]}>
          <Col span={24} md={8}>
            <Card className={styles.featureCard}>
              <img src="/icons/tutor.svg" alt="优秀导师" />
              <Title level={3}>优秀导师</Title>
              <Paragraph>
                严格筛选的资深导师，丰富的教学经验，确保教学质量
              </Paragraph>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card className={styles.featureCard}>
              <img src="/icons/personalized.svg" alt="个性化学习" />
              <Title level={3}>个性化学习</Title>
              <Paragraph>
                根据学习目标和水平，定制专属学习计划，因材施教
              </Paragraph>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card className={styles.featureCard}>
              <img src="/icons/flexible.svg" alt="灵活时间" />
              <Title level={3}>灵活时间</Title>
              <Paragraph>
                自由选择上课时间，线上一对一辅导，随时随地学习
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* 学科领域 */}
      <section className={styles.subjects}>
        <Title level={2} className={styles.sectionTitle}>
          覆盖多个学科领域
        </Title>
        <Row gutter={[24, 24]}>
          {subjects.map(subject => (
            <Col span={12} md={6} key={subject.id}>
              <Link to={`/search?subject=${subject.id}`}>
                <Card hoverable className={styles.subjectCard}>
                  <img src={subject.icon} alt={subject.name} />
                  <Title level={4}>{subject.name}</Title>
                  <Paragraph>{subject.description}</Paragraph>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </section>

      {/* 成功案例 */}
      <section className={styles.testimonials}>
        <Title level={2} className={styles.sectionTitle}>
          学员反馈
        </Title>
        <Row gutter={[32, 32]}>
          {testimonials.map(testimonial => (
            <Col span={24} md={8} key={testimonial.id}>
              <Card className={styles.testimonialCard}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className={styles.avatar}
                />
                <Title level={4}>{testimonial.name}</Title>
                <Paragraph>{testimonial.content}</Paragraph>
                <div className={styles.subject}>{testimonial.subject}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 开始学习 */}
      <section className={styles.cta}>
        <Title level={2}>准备好开始学习了吗？</Title>
        <Paragraph>
          立即注册，找到最适合你的导师，开启学习之旅
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large">
            <Link to="/register">免费注册</Link>
          </Button>
          <Button size="large">
            <Link to="/tutor-match">寻找导师</Link>
          </Button>
        </Space>
      </section>
    </div>
  );
};

// 模拟数据
const subjects = [
  {
    id: 'math',
    name: '数学',
    icon: '/icons/math.svg',
    description: '包括初高中数学、高等数学等',
  },
  {
    id: 'english',
    name: '英语',
    icon: '/icons/english.svg',
    description: '涵盖听说读写全方位训练',
  },
  // ...其他学科
];

const testimonials = [
  {
    id: 1,
    name: '张同学',
    avatar: '/avatars/student1.jpg',
    content: '通过一对一辅导，数学成绩提升显著，现在很有信心！',
    subject: '高中数学',
  },
  // ...其他反馈
];
