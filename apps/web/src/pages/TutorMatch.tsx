import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Steps,
  Card,
  Row,
  Col,
  Typography,
  Radio,
  Checkbox,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './TutorMatch.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface MatchForm {
  subject: string;
  grade: string;
  goal: string;
  schedule: string[];
  preferredGender: string;
  teachingStyle: string[];
  budget: string;
  otherRequirements: string;
}

export const TutorMatch: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (values: MatchForm) => {
    try {
      const response = await fetch('/api/tutor-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('匹配成功！正在为您跳转到推荐导师页面');
        navigate('/tutor-match/results');
      }
    } catch (error) {
      message.error('提交失败，请重试');
    }
  };

  const steps = [
    {
      title: '基本信息',
      content: (
        <div className={styles.step}>
          <Form.Item
            name="subject"
            label="学习科目"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择科目">
              {subjects.map(subject => (
                <Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="grade"
            label="年级"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择年级">
              {grades.map(grade => (
                <Option key={grade.value} value={grade.value}>
                  {grade.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="goal"
            label="学习目标"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              placeholder="请描述您的学习目标，如：提高数学考试成绩、准备英语考试等"
              rows={4}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: '时间安排',
      content: (
        <div className={styles.step}>
          <Form.Item
            name="schedule"
            label="可上课时间"
            rules={[{ required: true }]}
          >
            <Checkbox.Group>
              <Row gutter={[16, 16]}>
                {scheduleOptions.map(option => (
                  <Col span={8} key={option.value}>
                    <Checkbox value={option.value}>{option.label}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </div>
      ),
    },
    {
      title: '偏好设置',
      content: (
        <div className={styles.step}>
          <Form.Item
            name="preferredGender"
            label="导师性别偏好"
          >
            <Radio.Group>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
              <Radio value="any">无要求</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="teachingStyle"
            label="教学风格偏好"
          >
            <Checkbox.Group>
              <Row gutter={[16, 16]}>
                {teachingStyles.map(style => (
                  <Col span={8} key={style.value}>
                    <Checkbox value={style.value}>{style.label}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item
            name="budget"
            label="课时预算"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择课时预算">
              {budgetOptions.map(budget => (
                <Option key={budget.value} value={budget.value}>
                  {budget.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="otherRequirements"
            label="其他要求"
          >
            <Input.TextArea
              placeholder="请描述您的其他具体要求"
              rows={4}
            />
          </Form.Item>
        </div>
      ),
    },
  ];

  const next = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className={styles.tutorMatch}>
      <Card className={styles.matchCard}>
        <Title level={2}>找到最适合你的导师</Title>
        <Paragraph>
          请填写以下信息，我们将为您匹配最合适的导师
        </Paragraph>

        <Steps
          current={currentStep}
          items={steps.map(item => ({ title: item.title }))}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.form}
        >
          {steps[currentStep].content}

          <div className={styles.buttons}>
            {currentStep > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={prev}>
                上一步
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                下一步
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit">
                开始匹配
              </Button>
            )}
          </div>
        </Form>
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

const grades = [
  { value: 'junior1', label: '初一' },
  { value: 'junior2', label: '初二' },
  // ...其他年级
];

const scheduleOptions = [
  { value: 'weekday_morning', label: '工作日上午' },
  { value: 'weekday_afternoon', label: '工作日下午' },
  // ...其他时间段
];

const teachingStyles = [
  { value: 'patient', label: '耐心细致' },
  { value: 'strict', label: '严格要求' },
  // ...其他风格
];

const budgetOptions = [
  { value: '100-150', label: '100-150元/课时' },
  { value: '150-200', label: '150-200元/课时' },
  // ...其他预算
];
