import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { Tutor, SearchFilters, SortOption } from '@/types';

interface UseSearchProps {
  initialFilters?: SearchFilters;
  initialSort?: SortOption;
}

export const useSearch = ({ initialFilters = {}, initialSort = { field: 'rating', order: 'desc' } }: UseSearchProps = {}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Tutor[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debouncedQuery = useDebounce(query, 300);

  const searchTutors = useCallback(async () => {
    if (!debouncedQuery && Object.keys(filters).length === 0) return;

    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch('/api/tutors/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: debouncedQuery,
          filters,
          sort,
          page,
        }),
      });

      const data = await response.json();
      
      if (page === 1) {
        setResults(data.items);
      } else {
        setResults(prev => [...prev, ...data.items]);
      }
      
      setTotalResults(data.total);
      setHasMore(data.hasMore);
      
      // Update suggestions based on search results
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters, sort, page]);

  useEffect(() => {
    setPage(1);
    searchTutors();
  }, [debouncedQuery, filters, sort]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const updateSort = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  return {
    query,
    setQuery,
    filters,
    updateFilters,
    clearFilters,
    sort,
    updateSort,
    results,
    loading,
    totalResults,
    hasMore,
    loadMore,
    suggestions,
  };
};
