import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Radio,
  Input,
  Button,
  Alert,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import { courseApi } from '@/api/course';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/format';

const { Text } = Typography;
const { TextArea } = Input;

interface TrialBookingProps {
  visible: boolean;
  onClose: () => void;
  tutor: any;
}

export const TrialBooking: React.FC<TrialBookingProps> = ({
  visible,
  onClose,
  tutor
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const { user } = useAuth();

  // 处理日期选择
  const handleDateChange = async (date) => {
    if (!date) {
      setSelectedDate(null);
      setAvailableSlots([]);
      return;
    }

    setSelectedDate(date.format('YYYY-MM-DD'));
    try {
      const { data } = await courseApi.getTrialSlots(tutor.id, date.format('YYYY-MM-DD'));
      setAvailableSlots(data);
    } catch (error) {
      message.error('获取可用时段失败');
    }
  };

  const handleSubmit = async (values) => {
    if (!user) {
      message.error('请先登录');
      return;
    }

    setLoading(true);
    try {
      await courseApi.bookTrial({
        tutorId: tutor.id,
        ...values,
      });
      message.success('试听课预约成功');
      onClose();
      form.resetFields();
    } catch (error) {
      message.error('预约失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="预约试听课"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Alert
        message="试听课说明"
        description={
          <ul className="list-disc pl-4">
            <li>试听课时长为30分钟</li>
            <li>费用为正常课时的50%</li>
            <li>每位导师仅可预约一次试听</li>
            <li>试听结束后可享受首次购课优惠</li>
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
          name="subjectId"
          label="试听科目"
          rules={[{ required: true, message: '请选择试听科目' }]}
        >
          <Select placeholder="选择要试听的科目">
            {tutor.subjects.map(subject => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="lessonType"
          label="上课方式"
          rules={[{ required: true, message: '请选择上课方式' }]}
        >
          <Radio.Group>
            <Radio value="online">在线上课</Radio>
            <Radio value="offline" disabled={!tutor.supportsOffline}>
              线下上课
              {!tutor.supportsOffline && <Text type="secondary"> (导师暂不支持)</Text>}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="试听时间" required>
          <Space direction="vertical" style={{ width: '100%' }}>
            <DatePicker
              onChange={handleDateChange}
              disabledDate={current => {
                return current && current.valueOf() < Date.now();
              }}
              style={{ width: '100%' }}
            />
            {selectedDate && (
              <Form.Item
                name="timeSlotId"
                rules={[{ required: true, message: '请选择上课时段' }]}
                style={{ marginBottom: 0 }}
              >
                <Radio.Group>
                  <Space wrap>
                    {availableSlots.map(slot => (
                      <Radio.Button key={slot.id} value={slot.id}>
                        {formatDateTime(slot.startTime, 'HH:mm')} - {formatDateTime(slot.endTime, 'HH:mm')}
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Form.Item
          name="requirements"
          label="学习需求"
          rules={[
            { required: true, message: '请填写学习需求' },
            { min: 10, message: '请至少输入10个字符' }
          ]}
        >
          <TextArea
            placeholder="请描述您目前的学习情况和希望解决的问题"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="contact"
          label="联系方式"
          rules={[{ required: true, message: '请填写联系方式' }]}
        >
          <Input placeholder="请填写您的手机号，方便老师与您联系" />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            确认预约
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
