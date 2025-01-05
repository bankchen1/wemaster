import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSubjects } from '@/lib/api/subjects';

interface Subject {
  id: string;
  name: string;
  parentId: string | null;
  count: number;
}

interface SubjectFilterProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
}

export function SubjectFilter({
  selectedSubjects,
  onSubjectsChange,
}: SubjectFilterProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  }

  const parentSubjects = subjects.filter(subject => !subject.parentId);
  const childSubjects = subjects.filter(subject => 
    subject.parentId === selectedParent
  );

  const handleParentClick = (subjectId: string) => {
    setSelectedParent(subjectId === selectedParent ? null : subjectId);
  };

  const handleSubjectToggle = (subjectId: string) => {
    const newSelected = selectedSubjects.includes(subjectId)
      ? selectedSubjects.filter(id => id !== subjectId)
      : [...selectedSubjects, subjectId];
    onSubjectsChange(newSelected);
  };

  const getSelectedCount = (parentId: string) => {
    const children = subjects.filter(subject => subject.parentId === parentId);
    return children.filter(child => 
      selectedSubjects.includes(child.id)
    ).length;
  };

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Parent Subjects */}
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {parentSubjects.map(subject => {
            const selectedCount = getSelectedCount(subject.id);
            return (
              <button
                key={subject.id}
                onClick={() => handleParentClick(subject.id)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors',
                  selectedParent === subject.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-100'
                )}
              >
                <span>{subject.name}</span>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCount}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {subject.count}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Child Subjects */}
      {selectedParent && (
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-2">
            {childSubjects.map(subject => {
              const isSelected = selectedSubjects.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectToggle(subject.id)}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-md text-sm transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <span>{subject.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Subjects Summary */}
      {selectedSubjects.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Selected Subjects</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              if (!subject) return null;
              return (
                <Badge
                  key={subjectId}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleSubjectToggle(subjectId)}
                >
                  {subject.name}
                  <span className="ml-1 text-gray-400">×</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
