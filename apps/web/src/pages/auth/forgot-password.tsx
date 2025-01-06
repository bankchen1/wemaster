import React, { useState } from 'react';
import { Form, Input, Button, Steps, message } from 'antd';
import { useRouter } from 'next/router';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';

const { Step } = Steps;

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [verificationData, setVerificationData] = useState<{
    email?: string;
    phone?: string;
    code?: string;
  }>({});

  const steps = [
    {
      title: '验证身份',
      content: (
        <Form
          form={form}
          onFinish={async (values) => {
            setLoading(true);
            try {
              if (values.email) {
                await authApi.sendPasswordResetEmail(values.email);
                setVerificationData({ email: values.email });
              } else {
                await authApi.sendPasswordResetSMS(values.phone);
                setVerificationData({ phone: values.phone });
              }
              message.success('验证码已发送');
              setCurrentStep(1);
            } catch (error) {
              message.error('发送验证码失败：' + error.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' },
              { required: true, message: '请输入邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱地址"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            获取验证码
          </Button>
        </Form>
      ),
    },
    {
      title: '验证码验证',
      content: (
        <Form
          form={form}
          onFinish={async (values) => {
            setLoading(true);
            try {
              await authApi.verifyResetCode(
                verificationData.email || verificationData.phone,
                values.code
              );
              setVerificationData({ ...verificationData, code: values.code });
              setCurrentStep(2);
            } catch (error) {
              message.error('验证码验证失败：' + error.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="验证码"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            验证
          </Button>
        </Form>
      ),
    },
    {
      title: '重置密码',
      content: (
        <Form
          form={form}
          onFinish={async (values) => {
            setLoading(true);
            try {
              await authApi.resetPassword(
                verificationData.email || verificationData.phone,
                verificationData.code,
                values.password
              );
              message.success('密码重置成功');
              router.push('/auth/login');
            } catch (error) {
              message.error('密码重置失败：' + error.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码长度不能小于8位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认新密码"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            重置密码
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            找回密码
          </h2>
        </div>

        <Steps current={currentStep}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div className="mt-8">{steps[currentStep].content}</div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
