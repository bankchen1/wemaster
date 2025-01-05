import React from 'react';
import { Typography, Row, Col, Card, Timeline, Statistic } from 'antd';
import { TeamOutlined, BookOutlined, GlobalOutlined } from '@ant-design/icons';
import styles from './About.module.scss';

const { Title, Paragraph } = Typography;

export const About: React.FC = () => {
  return (
    <div className={styles.about}>
      {/* 公司简介 */}
      <section className={styles.intro}>
        <Row align="middle" justify="center" gutter={[48, 48]}>
          <Col span={24} md={12}>
            <Title level={1}>关于我们</Title>
            <Paragraph className={styles.mission}>
              我们致力于通过科技创新，为每一位学习者提供个性化的在线教育服务，
              让优质教育资源触手可及。
            </Paragraph>
          </Col>
          <Col span={24} md={12}>
            <img
              src="/images/about-hero.png"
              alt="关于我们"
              className={styles.heroImage}
            />
          </Col>
        </Row>
      </section>

      {/* 数据统计 */}
      <section className={styles.statistics}>
        <Row gutter={[32, 32]}>
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="累计服务学员"
                value={10000}
                prefix={<TeamOutlined />}
                suffix="+"
              />
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="优质导师"
                value={500}
                prefix={<BookOutlined />}
                suffix="+"
              />
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="覆盖城市"
                value={50}
                prefix={<GlobalOutlined />}
                suffix="+"
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 发展历程 */}
      <section className={styles.history}>
        <Title level={2} className={styles.sectionTitle}>
          发展历程
        </Title>
        <Timeline
          mode="alternate"
          items={[
            {
              children: (
                <Card className={styles.timelineCard}>
                  <Title level={4}>2024年</Title>
                  <Paragraph>
                    推出实时互动课堂系统，支持多媒体教学
                  </Paragraph>
                </Card>
              ),
            },
            {
              children: (
                <Card className={styles.timelineCard}>
                  <Title level={4}>2023年</Title>
                  <Paragraph>
                    获得A轮融资，服务学员突破10000+
                  </Paragraph>
                </Card>
              ),
            },
            {
              children: (
                <Card className={styles.timelineCard}>
                  <Title level={4}>2022年</Title>
                  <Paragraph>
                    平台正式上线，开启在线一对一辅导服务
                  </Paragraph>
                </Card>
              ),
            },
          ]}
        />
      </section>

      {/* 团队介绍 */}
      <section className={styles.team}>
        <Title level={2} className={styles.sectionTitle}>
          核心团队
        </Title>
        <Row gutter={[24, 24]}>
          {teamMembers.map(member => (
            <Col span={24} md={8} key={member.id}>
              <Card className={styles.teamCard}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className={styles.avatar}
                />
                <Title level={4}>{member.name}</Title>
                <div className={styles.position}>{member.position}</div>
                <Paragraph>{member.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 企业文化 */}
      <section className={styles.culture}>
        <Title level={2} className={styles.sectionTitle}>
          企业文化
        </Title>
        <Row gutter={[32, 32]}>
          {cultureItems.map(item => (
            <Col span={24} md={12} key={item.id}>
              <Card className={styles.cultureCard}>
                <img src={item.icon} alt={item.title} />
                <Title level={3}>{item.title}</Title>
                <Paragraph>{item.content}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 联系我们 */}
      <section className={styles.contact}>
        <Title level={2} className={styles.sectionTitle}>
          联系我们
        </Title>
        <Row gutter={[48, 48]}>
          <Col span={24} md={12}>
            <Card className={styles.contactCard}>
              <Title level={3}>商务合作</Title>
              <Paragraph>
                邮箱：business@wepal.com
                <br />
                电话：400-888-8888
              </Paragraph>
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card className={styles.contactCard}>
              <Title level={3}>媒体垂询</Title>
              <Paragraph>
                邮箱：media@wepal.com
                <br />
                电话：400-999-9999
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>
    </div>
  );
};

// 模拟数据
const teamMembers = [
  {
    id: 1,
    name: '张三',
    position: 'CEO',
    avatar: '/avatars/ceo.jpg',
    description: '前某知名教育科技公司技术副总裁，拥有15年教育行业经验',
  },
  // ...其他团队成员
];

const cultureItems = [
  {
    id: 1,
    title: '创新',
    icon: '/icons/innovation.svg',
    content: '持续创新，推动教育科技发展',
  },
  // ...其他文化项
];
