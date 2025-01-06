import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { tutorApi } from '@/api/tutor';
import { message } from 'antd';

export const useTutorSearch = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('rating_desc');
  const [filters, setFilters] = useState({
    keyword: '',
    subject: '',
    priceRange: '',
    rating: '',
    availability: [],
  });

  useEffect(() => {
    // 从URL同步状态
    const query = router.query;
    setFilters({
      keyword: query.keyword as string || '',
      subject: query.subject as string || '',
      priceRange: query.priceRange as string || '',
      rating: query.rating as string || '',
      availability: query.availability ? (query.availability as string).split(',') : [],
    });
    setPage(parseInt(query.page as string) || 1);
    setSort(query.sort as string || 'rating_desc');
  }, [router.query]);

  useEffect(() => {
    // 更新URL
    const query = {
      ...filters,
      page: page.toString(),
      sort,
    };

    // 移除空值
    Object.keys(query).forEach(key => {
      if (!query[key] || (Array.isArray(query[key]) && query[key].length === 0)) {
        delete query[key];
      }
    });

    router.push({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });

    searchTutors();
  }, [filters, page, sort]);

  const searchTutors = async () => {
    setLoading(true);
    try {
      const { data } = await tutorApi.search({
        ...filters,
        page,
        sort,
      });
      setTutors(data.tutors);
      setTotal(data.total);
    } catch (error) {
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    tutors,
    total,
    page,
    setPage,
    filters,
    setFilters,
    sort,
    setSort,
  };
};
