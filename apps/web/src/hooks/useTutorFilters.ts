import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

interface TimeSlot {
  start: string;
  end: string;
}

interface FilterState {
  subjects: string[];
  languages: string[];
  priceRange: [number, number];
  availability: {
    days: number[];
    timeSlots: TimeSlot[];
  };
  rating: number | null;
  sortBy: string;
  page: number;
}

const DEFAULT_FILTERS: FilterState = {
  subjects: [],
  languages: [],
  priceRange: [0, 200],
  availability: {
    days: [],
    timeSlots: [],
  },
  rating: null,
  sortBy: 'recommended',
  page: 1,
};

export function useTutorFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    if (!isInitialized && searchParams) {
      const subjects = searchParams.get('subjects')?.split(',') || [];
      const languages = searchParams.get('languages')?.split(',') || [];
      const priceMin = parseInt(searchParams.get('priceMin') || '0');
      const priceMax = parseInt(searchParams.get('priceMax') || '200');
      const days = searchParams.get('days')?.split(',').map(Number) || [];
      const timeSlots = searchParams.get('timeSlots')?.split(',').map(slot => {
        const [start, end] = slot.split('-');
        return { start, end };
      }) || [];
      const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null;
      const sortBy = searchParams.get('sortBy') || 'recommended';
      const page = parseInt(searchParams.get('page') || '1');

      setFilters({
        subjects,
        languages,
        priceRange: [priceMin, priceMax],
        availability: { days, timeSlots },
        rating,
        sortBy,
        page,
      });

      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.subjects.length > 0) {
      params.set('subjects', newFilters.subjects.join(','));
    }
    if (newFilters.languages.length > 0) {
      params.set('languages', newFilters.languages.join(','));
    }
    if (newFilters.priceRange[0] !== 0) {
      params.set('priceMin', newFilters.priceRange[0].toString());
    }
    if (newFilters.priceRange[1] !== 200) {
      params.set('priceMax', newFilters.priceRange[1].toString());
    }
    if (newFilters.availability.days.length > 0) {
      params.set('days', newFilters.availability.days.join(','));
    }
    if (newFilters.availability.timeSlots.length > 0) {
      params.set('timeSlots', newFilters.availability.timeSlots.map(slot => 
        `${slot.start}-${slot.end}`
      ).join(','));
    }
    if (newFilters.rating !== null) {
      params.set('rating', newFilters.rating.toString());
    }
    if (newFilters.sortBy !== 'recommended') {
      params.set('sortBy', newFilters.sortBy);
    }
    if (newFilters.page !== 1) {
      params.set('page', newFilters.page.toString());
    }

    router.push({
      pathname: router.pathname,
      query: params.toString(),
    }, undefined, { shallow: true });
  }, [router]);

  const setSubjects = useCallback((subjects: string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, subjects, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setLanguages = useCallback((languages: string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, languages, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setPriceRange = useCallback((priceRange: [number, number]) => {
    setFilters(prev => {
      const newFilters = { ...prev, priceRange, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setAvailability = useCallback((availability: { days: number[]; timeSlots: TimeSlot[] }) => {
    setFilters(prev => {
      const newFilters = { ...prev, availability, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setRating = useCallback((rating: number | null) => {
    setFilters(prev => {
      const newFilters = { ...prev, rating, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setSortBy = useCallback((sortBy: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, sortBy, page: 1 };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const setPage = useCallback((page: number) => {
    setFilters(prev => {
      const newFilters = { ...prev, page };
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    updateUrl(DEFAULT_FILTERS);
  }, [updateUrl]);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.subjects.length > 0 ||
      filters.languages.length > 0 ||
      filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1] ||
      filters.availability.days.length > 0 ||
      filters.availability.timeSlots.length > 0 ||
      filters.rating !== null ||
      filters.sortBy !== DEFAULT_FILTERS.sortBy
    );
  }, [filters]);

  return {
    filters,
    setSubjects,
    setLanguages,
    setPriceRange,
    setAvailability,
    setRating,
    setSortBy,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
