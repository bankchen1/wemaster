import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Typography
} from 'antd';
import { courseApi } from '@/api/course';
import { formatPrice, formatDateTime } from '@/utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BookingFormProps {
  tutor: any;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ tutor, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // 处理日期选择
  const handleDateChange = async (date) => {
    if (!date) {
      setSelectedDate(null);
      setAvailableSlots([]);
      return;
    }

    setSelectedDate(date.format('YYYY-MM-DD'));
    try {
      const { data } = await courseApi.getAvailableSlots(tutor.id, date.format('YYYY-MM-DD'));
      setAvailableSlots(data);
    } catch (error) {
      message.error('获取可用时段失败');
    }
  };

  // 提交预约
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await courseApi.createBooking({
        tutorId: tutor.id,
        ...values,
      });
      onSuccess();
    } catch (error) {
      message.error('预约失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <Row gutter={24}>
        <Col span={16}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* 科目选择 */}
            <Form.Item
              name="subjectId"
              label="选择科目"
              rules={[{ required: true, message: '请选择科目' }]}
            >
              <Select placeholder="选择要学习的科目">
                {tutor.subjects.map(subject => (
                  <Select.Option key={subject.id} value={subject.id}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 上课方式 */}
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

            {/* 上课时间 */}
            <Form.Item label="上课时间" required>
              <Space direction="vertical" style={{ width: '100%' }}>
                <DatePicker
                  onChange={handleDateChange}
                  disabledDate={current => {
                    // 禁用过去的日期
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

            {/* 课时数量 */}
            <Form.Item
              name="lessonCount"
              label="购买课时"
              rules={[{ required: true, message: '请选择课时数量' }]}
            >
              <Select>
                <Select.Option value={1}>1课时</Select.Option>
                <Select.Option value={5}>5课时 (95折)</Select.Option>
                <Select.Option value={10}>10课时 (9折)</Select.Option>
                <Select.Option value={20}>20课时 (85折)</Select.Option>
              </Select>
            </Form.Item>

            {/* 备注信息 */}
            <Form.Item
              name="remark"
              label="备注信息"
            >
              <TextArea
                placeholder="请填写您想要学习的具体内容、难点等信息"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                确认预约
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col span={8}>
          <div className="bg-gray-50 p-4 rounded">
            <Title level={5}>费用说明</Title>
            <div className="mb-4">
              <Text>课时单价：</Text>
              <Text strong>{formatPrice(tutor.price)}/小时</Text>
            </div>
            
            <Alert
              message="购买说明"
              description={
                <ul className="list-disc pl-4 mt-2">
                  <li>购买课程后24小时内可申请退款</li>
                  <li>课程有效期为购买后3个月</li>
                  <li>可提前24小时申请改期</li>
                  <li>成功上课后可对导师进行评价</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};
