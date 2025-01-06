import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Subject, TeachingLevel } from '@wemaster/shared/types/subject';
import { useSubjectStore } from '../../stores/subjectStore';

interface SubjectSelectorProps {
  value: string[];
  onChange: (subjects: string[]) => void;
  multiple?: boolean;
  level?: TeachingLevel;
  maxSelections?: number;
  disabled?: boolean;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  value,
  onChange,
  multiple = true,
  level,
  maxSelections = 5,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { fetchSubjects } = useSubjectStore();

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await fetchSubjects(level);
        setSubjects(data);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [fetchSubjects, level]);

  const handleChange = (event: any, newValue: any) => {
    if (multiple) {
      const selectedIds = newValue.map((subject: Subject) => subject.id);
      onChange(selectedIds);
    } else {
      onChange([newValue?.id || '']);
    }
  };

  const selectedSubjects = subjects.filter(subject => 
    value.includes(subject.id)
  );

  if (loading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Box>
      <Autocomplete
        multiple={multiple}
        options={subjects}
        value={multiple ? selectedSubjects : selectedSubjects[0] || null}
        onChange={handleChange}
        disabled={disabled}
        getOptionLabel={(option: Subject) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="选择科目"
            placeholder={multiple ? '可选择多个科目' : '选择科目'}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={option.name}
              {...getTagProps({ index })}
              key={option.id}
            />
          ))
        }
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              <Typography variant="body1">{option.name}</Typography>
              {option.description && (
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              )}
            </Box>
          </li>
        )}
        limitTags={3}
        disableCloseOnSelect={multiple}
        filterSelectedOptions
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
      {multiple && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          最多可选择 {maxSelections} 个科目
        </Typography>
      )}
    </Box>
  );
};
