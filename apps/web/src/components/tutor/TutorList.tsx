import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TutorCard } from './TutorCard';
import { TutorSort } from './TutorSort';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SubjectFilter } from './filters/SubjectFilter';
import { PriceFilter } from './filters/PriceFilter';
import { AvailabilityFilter } from './filters/AvailabilityFilter';
import { LanguageFilter } from './filters/LanguageFilter';
import { RatingFilter } from './filters/RatingFilter';
import { useTutorFilters } from '@/hooks/useTutorFilters';
import { getTutors } from '@/lib/api/tutors';
import { Tutor } from '@/types/tutor';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';

export function TutorList() {
  const {
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
  } = useTutorFilters();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [totalTutors, setTotalTutors] = useState(0);

  useEffect(() => {
    loadTutors();
  }, [filters]);

  async function loadTutors(append = false) {
    try {
      setLoading(true);
      const response = await getTutors({
        ...filters,
        page: append ? filters.page : 1,
      });

      setTutors(prev => 
        append ? [...prev, ...response.tutors] : response.tutors
      );
      setTotalTutors(response.total);
      setHasMore(response.tutors.length === 20); // Assuming page size is 20
    } catch (error) {
      console.error('Failed to load tutors:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLoadMore = () => {
    setPage(filters.page + 1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.subjects.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200) count++;
    if (filters.availability.days.length > 0 || filters.availability.timeSlots.length > 0) count++;
    if (filters.rating !== null) count++;
    return count;
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {totalTutors} Tutors Available
        </h1>
        <div className="flex items-center gap-4">
          <TutorSort
            value={filters.sortBy}
            onChange={setSortBy}
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-500"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <Tabs defaultValue="subjects" className="h-[calc(100vh-120px)]">
                <TabsList className="mb-4">
                  <TabsTrigger value="subjects">Subjects</TabsTrigger>
                  <TabsTrigger value="price">Price</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="languages">Languages</TabsTrigger>
                  <TabsTrigger value="rating">Rating</TabsTrigger>
                </TabsList>

                <TabsContent value="subjects">
                  <SubjectFilter
                    selectedSubjects={filters.subjects}
                    onSubjectsChange={setSubjects}
                  />
                </TabsContent>

                <TabsContent value="price">
                  <PriceFilter
                    min={0}
                    max={200}
                    value={filters.priceRange}
                    onChange={setPriceRange}
                  />
                </TabsContent>

                <TabsContent value="availability">
                  <AvailabilityFilter
                    value={filters.availability}
                    onChange={setAvailability}
                  />
                </TabsContent>

                <TabsContent value="languages">
                  <LanguageFilter
                    selectedLanguages={filters.languages}
                    onLanguagesChange={setLanguages}
                  />
                </TabsContent>

                <TabsContent value="rating">
                  <RatingFilter
                    value={filters.rating}
                    onChange={setRating}
                  />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.subjects.length > 0 && (
            <Badge variant="secondary" className="gap-2">
              Subjects ({filters.subjects.length})
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSubjects([])}
              />
            </Badge>
          )}
          {filters.languages.length > 0 && (
            <Badge variant="secondary" className="gap-2">
              Languages ({filters.languages.length})
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setLanguages([])}
              />
            </Badge>
          )}
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200) && (
            <Badge variant="secondary" className="gap-2">
              Price (${filters.priceRange[0]} - ${filters.priceRange[1]})
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setPriceRange([0, 200])}
              />
            </Badge>
          )}
          {(filters.availability.days.length > 0 || filters.availability.timeSlots.length > 0) && (
            <Badge variant="secondary" className="gap-2">
              Availability
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setAvailability({ days: [], timeSlots: [] })}
              />
            </Badge>
          )}
          {filters.rating !== null && (
            <Badge variant="secondary" className="gap-2">
              {filters.rating}+ Stars
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setRating(null)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Tutor Grid */}
      {loading && filters.page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No tutors found</h3>
          <p className="text-gray-500">
            Try adjusting your filters to find more tutors
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {tutors.map((tutor, index) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <TutorCard tutor={tutor} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Tutors'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
