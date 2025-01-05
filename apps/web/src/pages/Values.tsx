import React from 'react';
import { Typography, Row, Col, Card, Button, List } from 'antd';
import { Link } from 'react-router-dom';
import styles from './Values.module.scss';

const { Title, Paragraph } = Typography;

export const Values: React.FC = () => {
  return (
    <div className={styles.values}>
      {/* 价值主张 */}
      <section className={styles.hero}>
        <Row align="middle" justify="center">
          <Col span={24} md={12}>
            <Title level={1}>我们的价值主张</Title>
            <Paragraph className={styles.subtitle}>
              通过科技赋能教育，为每一位学习者提供个性化的成长路径
            </Paragraph>
          </Col>
          <Col span={24} md={12}>
            <img
              src="/images/values-hero.png"
              alt="价值主张"
              className={styles.heroImage}
            />
          </Col>
        </Row>
      </section>

      {/* 核心价值 */}
      <section className={styles.coreValues}>
        <Title level={2} className={styles.sectionTitle}>
          核心价值
        </Title>
        <Row gutter={[32, 32]}>
          {coreValues.map(value => (
            <Col span={24} md={8} key={value.id}>
              <Card className={styles.valueCard}>
                <img src={value.icon} alt={value.title} />
                <Title level={3}>{value.title}</Title>
                <Paragraph>{value.description}</Paragraph>
                <List
                  dataSource={value.points}
                  renderItem={item => (
                    <List.Item>
                      <Typography.Text>{item}</Typography.Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 学习者价值 */}
      <section className={styles.learnerValue}>
        <Title level={2} className={styles.sectionTitle}>
          为学习者创造的价值
        </Title>
        <Row gutter={[48, 48]}>
          <Col span={24} md={12}>
            <Card className={styles.benefitCard}>
              <Title level={3}>个性化学习体验</Title>
              <List
                dataSource={learnerBenefits.personalized}
                renderItem={item => (
                  <List.Item>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card className={styles.benefitCard}>
              <Title level={3}>高效学习成果</Title>
              <List
                dataSource={learnerBenefits.efficient}
                renderItem={item => (
                  <List.Item>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 导师价值 */}
      <section className={styles.tutorValue}>
        <Title level={2} className={styles.sectionTitle}>
          为导师创造的价值
        </Title>
        <Row gutter={[48, 48]}>
          <Col span={24} md={12}>
            <Card className={styles.benefitCard}>
              <Title level={3}>职业发展</Title>
              <List
                dataSource={tutorBenefits.career}
                renderItem={item => (
                  <List.Item>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card className={styles.benefitCard}>
              <Title level={3}>收入保障</Title>
              <List
                dataSource={tutorBenefits.income}
                renderItem={item => (
                  <List.Item>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* 社会价值 */}
      <section className={styles.socialValue}>
        <Title level={2} className={styles.sectionTitle}>
          社会价值
        </Title>
        <Row gutter={[32, 32]}>
          {socialValues.map(value => (
            <Col span={24} md={8} key={value.id}>
              <Card className={styles.socialCard}>
                <img src={value.icon} alt={value.title} />
                <Title level={3}>{value.title}</Title>
                <Paragraph>{value.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* 加入我们 */}
      <section className={styles.join}>
        <Card className={styles.joinCard}>
          <Title level={2}>一起创造教育的未来</Title>
          <Paragraph>
            无论你是学习者还是教育工作者，都欢迎加入我们的平台
          </Paragraph>
          <Row gutter={16} justify="center">
            <Col>
              <Button type="primary" size="large">
                <Link to="/register">注册学习</Link>
              </Button>
            </Col>
            <Col>
              <Button size="large">
                <Link to="/become-tutor">成为导师</Link>
              </Button>
            </Col>
          </Row>
        </Card>
      </section>
    </div>
  );
};

// 模拟数据
const coreValues = [
  {
    id: 1,
    title: '优质教育',
    icon: '/icons/quality.svg',
    description: '提供高质量的一对一在线辅导服务',
    points: [
      '严选优秀导师',
      '个性化教学方案',
      '全程质量监控',
    ],
  },
  // ...其他核心价值
];

const learnerBenefits = {
  personalized: [
    '根据学习水平定制教学计划',
    '灵活的学习时间安排',
    '实时互动的学习体验',
  ],
  efficient: [
    '快速提升学习成绩',
    '建立良好学习习惯',
    '培养自主学习能力',
  ],
};

const tutorBenefits = {
  career: [
    '专业成长机会',
    '教学能力提升',
    '优质教学资源',
  ],
  income: [
    '具有竞争力的课时费',
    '多样化的收入来源',
    '准时的收入结算',
  ],
};

const socialValues = [
  {
    id: 1,
    title: '教育公平',
    icon: '/icons/equality.svg',
    description: '让优质教育资源突破地域限制，惠及更多学习者',
  },
  // ...其他社会价值
];
