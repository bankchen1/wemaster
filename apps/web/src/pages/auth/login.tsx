import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message, Divider } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { SocialLogin } from '@/components/auth/SocialLogin';

const { TabPane } = Tabs;

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('account');
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let response;
      if (loginType === 'account') {
        response = await authApi.login(values.username, values.password);
      } else {
        response = await authApi.loginWithPhone(values.phone, values.code);
      }
      
      await login(response.token);
      message.success('登录成功');
      
      // 如果有重定向URL，则跳转到该URL
      const redirect = router.query.redirect as string;
      router.push(redirect || '/');
    } catch (error) {
      message.error('登录失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        return message.error('请输入手机号');
      }
      await authApi.sendVerificationCode(phone);
      message.success('验证码已发送');
    } catch (error) {
      message.error('发送验证码失败：' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录账户
          </h2>
        </div>

        <Tabs activeKey={loginType} onChange={setLoginType} centered>
          <TabPane tab="账号密码登录" key="account">
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              className="mt-8 space-y-6"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名/邮箱' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名/邮箱"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>

              <div className="flex items-center justify-between">
                <Link href="/auth/register">
                  <a className="text-sm text-blue-600 hover:text-blue-500">
                    注册账号
                  </a>
                </Link>
                <Link href="/auth/forgot-password">
                  <a className="text-sm text-blue-600 hover:text-blue-500">
                    忘记密码？
                  </a>
                </Link>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form>
          </TabPane>

          <TabPane tab="手机验证码登录" key="phone">
            <Form
              form={form}
              name="phoneLogin"
              onFinish={handleSubmit}
              className="mt-8 space-y-6"
            >
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="手机号"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="code"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div className="flex space-x-4">
                  <Input
                    placeholder="验证码"
                    size="large"
                  />
                  <Button onClick={handleSendCode} size="large">
                    发送验证码
                  </Button>
                </div>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form>
          </TabPane>
        </Tabs>

        <Divider>其他登录方式</Divider>

        <SocialLogin />
      </div>
    </div>
  );
};

export default LoginPage;
