import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TutorSortProps {
  value: string;
  onChange: (value: string) => void;
}

export function TutorSort({ value, onChange }: TutorSortProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort by</SelectLabel>
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="rating-desc">Highest Rated</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="experience-desc">Most Experienced</SelectItem>
          <SelectItem value="students-desc">Most Students</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
