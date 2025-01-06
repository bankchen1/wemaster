import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  Typography,
  useTheme,
  styled,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: '30px',
    padding: '8px 16px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const SuggestionBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

interface SearchInputProps {
  placeholder?: string;
  suggestions?: string[];
  popularSearches?: string[];
  onSearch: (value: string) => void;
  onSuggestionClick?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search for tutors, subjects, or skills...',
  suggestions = [],
  popularSearches = [],
  onSearch,
  onSuggestionClick,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      // Filter suggestions based on input
      const filtered = suggestions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setOptions(filtered);
    } else {
      // Show popular searches when input is empty
      setOptions(popularSearches);
    }
  }, [value, suggestions, popularSearches]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    onSuggestionClick?.(suggestion);
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledAutocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        inputValue={value}
        onInputChange={(_, newValue) => setValue(newValue)}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
            onChange={handleInputChange}
          />
        )}
        renderOption={(props, option) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <li {...props}>
              <SuggestionBox onClick={() => handleSuggestionClick(option)}>
                <SearchIcon color="action" fontSize="small" />
                <Typography variant="body2">{option}</Typography>
              </SuggestionBox>
            </li>
          </motion.div>
        )}
        PaperComponent={({ children }) => (
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: '20px',
                    mt: 1,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  {value === '' && (
                    <Box p={2}>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Popular Searches
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {popularSearches.map((search) => (
                          <Chip
                            key={search}
                            label={search}
                            onClick={() => handleSuggestionClick(search)}
                            sx={{
                              backgroundColor: theme.palette.primary.light,
                              color: theme.palette.primary.contrastText,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {children}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      />
    </form>
  );
};
