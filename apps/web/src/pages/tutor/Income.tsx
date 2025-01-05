import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Table,
  DatePicker,
  Select,
  Space,
  Button,
  Tag,
  Tooltip,
  Modal,
} from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  DownloadOutlined,
  CalendarOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import styles from './Income.module.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface IncomeRecord {
  id: string;
  date: string;
  studentName: string;
  subject: string;
  lessonCount: number;
  amount: number;
  status: 'paid' | 'pending' | 'withdrawn';
  paymentMethod?: string;
  transactionId?: string;
}

interface IncomeStats {
  totalIncome: number;
  monthlyIncome: number;
  pendingIncome: number;
  lessonCount: number;
}

export const TutorIncome: React.FC = () => {
  const [records, setRecords] = useState<IncomeRecord[]>([]);
  const [stats, setStats] = useState<IncomeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [status, setStatus] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);

  useEffect(() => {
    fetchIncomeData();
  }, [dateRange, status]);

  const fetchIncomeData = async () => {
    setLoading(true);
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch('/api/tutor/income/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            status,
          }),
        }),
        fetch('/api/tutor/income/stats'),
      ]);

      const [recordsData, statsData] = await Promise.all([
        recordsRes.json(),
        statsRes.json(),
      ]);

      setRecords(recordsData);
      setStats(statsData);
    } catch (error) {
      console.error('获取收入数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/tutor/income/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
          status,
        }),
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '收入明细.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const columns: ColumnsType<IncomeRecord> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '课时数',
      dataIndex: 'lessonCount',
      key: 'lessonCount',
      sorter: (a, b) => a.lessonCount - b.lessonCount,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `¥${amount.toFixed(2)}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          paid: { text: '已到账', color: 'success' },
          pending: { text: '待结算', color: 'warning' },
          withdrawn: { text: '已提现', color: 'default' },
        };
        const status = statusMap[record.status];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              onClick={() => {
                setSelectedRecord(record);
                setDetailModalVisible(true);
              }}
            >
              详情
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.income}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats?.totalIncome}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={stats?.monthlyIncome}
              prefix={<RiseOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待结算"
              value={stats?.pendingIncome}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总课时"
              value={stats?.lessonCount}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className={styles.recordsCard}>
        <div className={styles.header}>
          <Title level={3}>收入明细</Title>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!, dates[1]!]);
                }
              }}
            />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 120 }}
            >
              <Option value="all">全部状态</Option>
              <Option value="paid">已到账</Option>
              <Option value="pending">待结算</Option>
              <Option value="withdrawn">已提现</Option>
            </Select>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出明细
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={records}
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="收入详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
      >
        {selectedRecord && (
          <div>
            <p>交易流水号：{selectedRecord.transactionId}</p>
            <p>支付方式：{selectedRecord.paymentMethod}</p>
            <p>结算时间：{selectedRecord.date}</p>
            <p>课程信息：{selectedRecord.subject}</p>
            <p>学生姓名：{selectedRecord.studentName}</p>
            <p>课时数量：{selectedRecord.lessonCount}</p>
            <p>结算金额：¥{selectedRecord.amount.toFixed(2)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
