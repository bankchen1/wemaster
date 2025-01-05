import React, { useState } from 'react';
import { CourseCard } from './CourseCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tutorName: string;
  tutorAvatar: string;
  rating: number;
  totalStudents: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  totalLessons: number;
  completedLessons?: number;
  price: number;
  tags: string[];
  isEnrolled?: boolean;
}

interface CourseListProps {
  initialCourses: Course[];
}

export const CourseList: React.FC<CourseListProps> = ({ initialCourses }) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // 从所有课程中提取唯一的标签
  const allTags = Array.from(
    new Set(initialCourses.flatMap((course) => course.tags))
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterCourses(query, selectedLevel, selectedTags, priceRange);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    filterCourses(searchQuery, level, selectedTags, priceRange);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    filterCourses(searchQuery, selectedLevel, newTags, priceRange);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    filterCourses(searchQuery, selectedLevel, selectedTags, range);
  };

  const handleSort = (sort: string) => {
    setSelectedSort(sort);
    let sortedCourses = [...courses];
    switch (sort) {
      case 'price-low':
        sortedCourses.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedCourses.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedCourses.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        sortedCourses.sort((a, b) => b.totalStudents - a.totalStudents);
        break;
      default:
        break;
    }
    setCourses(sortedCourses);
  };

  const filterCourses = (
    query: string,
    level: string,
    tags: string[],
    price: [number, number]
  ) => {
    let filtered = initialCourses.filter((course) => {
      const matchesQuery =
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = !level || course.level === level;
      const matchesTags =
        tags.length === 0 ||
        tags.every((tag) => course.tags.includes(tag));
      const matchesPrice =
        course.price >= price[0] && course.price <= price[1];
      return matchesQuery && matchesLevel && matchesTags && matchesPrice;
    });

    setCourses(filtered);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedSort} onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Courses</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Level</h4>
                  <Select
                    value={selectedLevel}
                    onValueChange={handleLevelChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">
                        Intermediate
                      </SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 1000]}
                      max={1000}
                      step={10}
                      value={priceRange}
                      onValueChange={(value) =>
                        handlePriceRangeChange(value as [number, number])
                      }
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {selectedTags.includes(tag) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTags([]);
              filterCourses(searchQuery, selectedLevel, [], priceRange);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};
