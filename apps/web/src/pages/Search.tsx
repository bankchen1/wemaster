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
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import styles from './Search.module.scss';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  price: number;
  experience: string;
  introduction: string;
  tags: string[];
}

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    priceRange: '',
    rating: '',
    availability: '',
  });

  useEffect(() => {
    searchTutors();
  }, [searchParams]);

  const searchTutors = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tutors/search?${searchParams.toString()}`
      );
      const data = await response.json();
      setTutors(data.tutors);
      setTotal(data.total);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    searchParams.set('keyword', value);
    setSearchParams(searchParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };

  const handlePageChange = (page: number) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className={styles.search}>
      {/* 搜索栏 */}
      <section className={styles.searchBar}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="搜索导师姓名或科目"
              size="large"
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
        </Row>
      </section>

      {/* 筛选器 */}
      <section className={styles.filters}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24} md={6}>
              <Select
                placeholder="选择科目"
                style={{ width: '100%' }}
                value={filters.subject}
                onChange={value => handleFilterChange('subject', value)}
              >
                {subjects.map(subject => (
                  <Option key={subject.value} value={subject.value}>
                    {subject.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="价格区间"
                style={{ width: '100%' }}
                value={filters.priceRange}
                onChange={value => handleFilterChange('priceRange', value)}
              >
                {priceRanges.map(range => (
                  <Option key={range.value} value={range.value}>
                    {range.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="评分"
                style={{ width: '100%' }}
                value={filters.rating}
                onChange={value => handleFilterChange('rating', value)}
              >
                {ratings.map(rating => (
                  <Option key={rating.value} value={rating.value}>
                    {rating.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={24} md={6}>
              <Select
                placeholder="可用时间"
                style={{ width: '100%' }}
                value={filters.availability}
                onChange={value => handleFilterChange('availability', value)}
              >
                {availabilities.map(time => (
                  <Option key={time.value} value={time.value}>
                    {time.label}
                  </Option>
                ))}
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
                          <img
                            src={tutor.avatar}
                            alt={tutor.name}
                            className={styles.avatar}
                          />
                        </Col>
                        <Col span={18} md={20}>
                          <Row justify="space-between" align="top">
                            <Col>
                              <Title level={4}>{tutor.name}</Title>
                              <Space size={[0, 8]} wrap>
                                {tutor.subjects.map(subject => (
                                  <Tag key={subject}>{subject}</Tag>
                                ))}
                              </Space>
                            </Col>
                            <Col>
                              <div className={styles.price}>
                                ¥{tutor.price}/课时
                              </div>
                              <Rate
                                disabled
                                defaultValue={tutor.rating}
                                className={styles.rating}
                              />
                            </Col>
                          </Row>
                          <Paragraph className={styles.experience}>
                            教龄：{tutor.experience}
                          </Paragraph>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            className={styles.introduction}
                          >
                            {tutor.introduction}
                          </Paragraph>
                          <Space size={[8, 8]} wrap className={styles.tags}>
                            {tutor.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>
                          <Button type="primary">预约课程</Button>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className={styles.pagination}>
                <Pagination
                  total={total}
                  pageSize={10}
                  onChange={handlePageChange}
                  showTotal={total => `共 ${total} 位导师`}
                />
              </div>
            </>
          ) : (
            <Empty description="暂无符合条件的导师" />
          )}
        </Spin>
      </section>
    </div>
  );
};

// 模拟数据
const subjects = [
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
  // ...其他科目
];

const priceRanges = [
  { value: '0-100', label: '100元以下' },
  { value: '100-200', label: '100-200元' },
  // ...其他价格区间
];

const ratings = [
  { value: '4.5', label: '4.5分以上' },
  { value: '4.0', label: '4.0分以上' },
  // ...其他评分
];

const availabilities = [
  { value: 'weekday', label: '工作日' },
  { value: 'weekend', label: '周末' },
  // ...其他时间
];
