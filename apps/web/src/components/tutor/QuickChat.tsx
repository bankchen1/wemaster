import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Radio,
  Space,
  Divider,
  Alert,
  message
} from 'antd';
import { messageApi } from '@/api/message';
import { useAuth } from '@/hooks/useAuth';

const { TextArea } = Input;

interface QuickChatProps {
  visible: boolean;
  onClose: () => void;
  tutor: any;
}

export const QuickChat: React.FC<QuickChatProps> = ({
  visible,
  onClose,
  tutor
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (values) => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    setLoading(true);
    try {
      await messageApi.sendQuickChat({
        tutorId: tutor.id,
        ...values,
      });
      message.success('消息已发送');
      onClose();
      form.resetFields();
    } catch (error) {
      message.error('发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="快速咨询"
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Alert
        message="温馨提示"
        description={
          <ul className="list-disc pl-4">
            <li>导师将在24小时内回复您的咨询</li>
            <li>建议详细描述您的学习需求和问题</li>
            <li>如需即时交流，可在导师空闲时间发起视频咨询</li>
          </ul>
        }
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="type"
          label="咨询类型"
          rules={[{ required: true, message: '请选择咨询类型' }]}
        >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="course">课程咨询</Radio>
              <Radio value="schedule">时间安排</Radio>
              <Radio value="price">价格咨询</Radio>
              <Radio value="other">其他问题</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="content"
          label="咨询内容"
          rules={[
            { required: true, message: '请输入咨询内容' },
            { min: 10, message: '请至少输入10个字符' }
          ]}
        >
          <TextArea
            placeholder="请详细描述您的问题，以便导师更好地为您解答"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label="联系方式"
          extra="选填，如果您希望导师通过其他方式联系您"
        >
          <Input placeholder="手机号/微信/邮箱" />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            发送咨询
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
