import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Card,
  Row,
  Col,
  Tag,
  Rate,
  Button,
  Pagination,
  Empty,
  Spin,
  Space,
  Typography,
  Drawer,
  Calendar,
  Badge,
  Tooltip,
  Modal
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  StarOutlined,
  DollarOutlined,
  ClockOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useSubjects } from '@/hooks/useSubjects';
import { useTutorSearch } from '@/hooks/useTutorSearch';
import { tutorApi } from '@/api/tutor';
import { formatPrice, formatDateTime } from '@/utils/format';
import styles from './Search.module.scss';

const { Title, Paragraph } = Typography;
const { Option, OptGroup } = Select;

export const Search: React.FC = () => {
  const router = useRouter();
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // 使用自定义Hook获取科目树
  const { subjects, loading: subjectsLoading } = useSubjects();
  
  // 使用自定义Hook处理搜索
  const {
    tutors,
    total,
    loading,
    filters,
    setFilters,
    page,
    setPage,
    sort,
    setSort
  } = useTutorSearch();

  // 处理科目选择
  const renderSubjectOptions = (subjects) => {
    return subjects.map(subject => {
      if (subject.children?.length > 0) {
        return (
          <OptGroup key={subject.id} label={subject.name}>
            {renderSubjectOptions(subject.children)}
          </OptGroup>
        );
      }
      return (
        <Option key={subject.id} value={subject.id}>
          {subject.name}
        </Option>
      );
    });
  };

  // 处理排序
  const sortOptions = [
    { value: 'rating_desc', label: '评分从高到低' },
    { value: 'price_asc', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' },
    { value: 'students_desc', label: '学生人数最多' }
  ];

  // 查看导师日程
  const handleViewSchedule = async (tutorId) => {
    try {
      const schedule = await tutorApi.getTutorSchedule(tutorId);
      setSelectedTutor({ ...selectedTutor, schedule });
      setScheduleVisible(true);
    } catch (error) {
      message.error('获取导师日程失败');
    }
  };

  // 处理预约
  const handleBooking = (tutor) => {
    setSelectedTutor(tutor);
    setBookingModalVisible(true);
  };

  return (
    <div className={styles.search}>
      {/* 搜索栏 */}
      <section className={styles.searchBar}>
        <Row gutter={16} align="middle" className="mb-4">
          <Col flex="auto">
            <Input.Search
              placeholder="搜索导师姓名、科目或特长"
              size="large"
              enterButton={<SearchOutlined />}
              onSearch={(value) => setFilters({ ...filters, keyword: value })}
              allowClear
            />
          </Col>
          <Col>
            <Select
              style={{ width: 150 }}
              placeholder="排序方式"
              value={sort}
              onChange={setSort}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </section>

      {/* 筛选器 */}
      <section className={styles.filters}>
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col span={24} md={6}>
              <Select
                placeholder="选择科目"
                style={{ width: '100%' }}
                value={filters.subject}
                onChange={value => setFilters({ ...filters, subject: value })}
                loading={subjectsLoading}
                showSearch
                allowClear
              >
                {renderSubjectOptions(subjects)}
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="价格区间"
                style={{ width: '100%' }}
                value={filters.priceRange}
                onChange={value => setFilters({ ...filters, priceRange: value })}
                allowClear
              >
                <Option value="0-100">¥0-100/小时</Option>
                <Option value="100-200">¥100-200/小时</Option>
                <Option value="200-300">¥200-300/小时</Option>
                <Option value="300+">¥300以上/小时</Option>
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="评分要求"
                style={{ width: '100%' }}
                value={filters.rating}
                onChange={value => setFilters({ ...filters, rating: value })}
                allowClear
              >
                <Option value="4.5">4.5分以上</Option>
                <Option value="4.0">4.0分以上</Option>
                <Option value="3.5">3.5分以上</Option>
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="授课时间"
                style={{ width: '100%' }}
                value={filters.availability}
                onChange={value => setFilters({ ...filters, availability: value })}
                allowClear
                mode="multiple"
                maxTagCount={2}
              >
                <Option value="weekday">工作日</Option>
                <Option value="weekend">周末</Option>
                <Option value="morning">上午</Option>
                <Option value="afternoon">下午</Option>
                <Option value="evening">晚上</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      </section>

      {/* 搜索结果 */}
      <section className={styles.results}>
        <Spin spinning={loading}>
          {tutors.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {tutors.map(tutor => (
                  <Col span={24} key={tutor.id}>
                    <Card hoverable className={styles.tutorCard}>
                      <Row gutter={24}>
                        <Col span={6} md={4}>
                          <div className={styles.avatarWrapper}>
                            <img
                              src={tutor.avatar}
                              alt={tutor.name}
                              className={styles.avatar}
                            />
                            {tutor.isOnline && (
                              <Badge status="success" text="在线" className={styles.onlineBadge} />
                            )}
                          </div>
                        </Col>
                        <Col span={18} md={20}>
                          <Row justify="space-between" align="top">
                            <Col>
                              <div className="flex items-center mb-2">
                                <Title level={4} className="mb-0 mr-2">
                                  {tutor.name}
                                </Title>
                                {tutor.isVerified && (
                                  <Tooltip title="认证导师">
                                    <Badge status="success" />
                                  </Tooltip>
                                )}
                              </div>
                              <Space size={[0, 8]} wrap className="mb-2">
                                {tutor.subjects.map(subject => (
                                  <Tag key={subject.id} color="blue">
                                    {subject.name}
                                  </Tag>
                                ))}
                              </Space>
                              <div className="text-gray-500 mb-2">
                                {tutor.title} · {tutor.experience}年教龄
                              </div>
                              <Paragraph ellipsis={{ rows: 2 }} className="mb-2">
                                {tutor.introduction}
                              </Paragraph>
                              <Space size={16}>
                                <span>
                                  <StarOutlined className="mr-1" />
                                  {tutor.rating}分 ({tutor.reviewCount}条评价)
                                </span>
                                <span>
                                  <DollarOutlined className="mr-1" />
                                  {formatPrice(tutor.price)}/小时
                                </span>
                                <span>
                                  <ClockOutlined className="mr-1" />
                                  已授课{tutor.teachingHours}小时
                                </span>
                              </Space>
                            </Col>
                          </Row>
                          <Row justify="end" className="mt-4">
                            <Space>
                              <Button
                                icon={<CalendarOutlined />}
                                onClick={() => handleViewSchedule(tutor.id)}
                              >
                                查看日程
                              </Button>
                              <Button type="primary" onClick={() => handleBooking(tutor)}>
                                立即预约
                              </Button>
                            </Space>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="flex justify-center mt-6">
                <Pagination
                  current={page}
                  total={total}
                  onChange={setPage}
                  showTotal={total => `共 ${total} 位导师`}
                />
              </div>
            </>
          ) : (
            <Empty description="暂无符合条件的导师" />
          )}
        </Spin>
      </section>

      {/* 日程抽屉 */}
      <Drawer
        title="导师课程安排"
        placement="right"
        width={640}
        visible={scheduleVisible}
        onClose={() => setScheduleVisible(false)}
      >
        {selectedTutor && (
          <Calendar
            fullscreen={false}
            dateCellRender={(date) => {
              const schedules = selectedTutor.schedule.filter(
                s => formatDateTime(s.startTime).startsWith(date.format('YYYY-MM-DD'))
              );
              return schedules.length > 0 ? (
                <ul className="events">
                  {schedules.map(s => (
                    <li key={s.id}>
                      <Badge
                        status={s.isBooked ? 'error' : 'success'}
                        text={s.isBooked ? '已约' : '可约'}
                      />
                      {formatDateTime(s.startTime, 'HH:mm')}
                    </li>
                  ))}
                </ul>
              ) : null;
            }}
          />
        )}
      </Drawer>

      {/* 预约模态框 */}
      <Modal
        title="预约课程"
        visible={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTutor && (
          <BookingForm
            tutor={selectedTutor}
            onSuccess={() => {
              setBookingModalVisible(false);
              message.success('预约成功');
            }}
          />
        )}
      </Modal>
    </div>
  );
};
