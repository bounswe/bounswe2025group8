import React, { useState } from 'react';
import { 
  Box, 
  InputBase, 
  IconButton, 
  useTheme, 
  alpha,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * Searchbar component that matches the provided design
 * @param {Object} props
 * @param {Function} props.onSearch - Function called when search is submitted
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {boolean} props.autoFocus - Whether to autofocus the search input
 * @param {string} props.defaultValue - Default search query
 * @param {Object} props.sx - Additional MUI sx styles to apply
 */
const Searchbar = ({ 
  onSearch, 
  placeholder = "What do you need help with", 
  autoFocus = false,
  defaultValue = "",
  sx = {}
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: 280, // Add minimum width
        borderRadius: 28, // Very rounded corners
        overflow: 'hidden', // Ensure children don't overflow the rounded corners
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover': {
          backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        ...(focused && {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.common.white, 0.25),
        }),
        ...sx
      }}
      elevation={0}
    >
      <IconButton 
        sx={{ 
          p: '10px',
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 0, // Remove button border radius
          ml: 0, // No left margin
          height: '100%', // Make button match height of container
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
          }
        }}
        aria-label="search"
        onClick={handleSubmit}
        type="button"
      >
        <SearchIcon />
      </IconButton>
      
      <InputBase
        sx={{
          ml: 0.5,
          flex: 1,
          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
          '& .MuiInputBase-input': {
            py: 1.5,
            px: 1,
            width: '100%',
          },
        }}
        placeholder={placeholder}
        inputProps={{ 'aria-label': 'search' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
      />
      
      {query && (
        <IconButton
          sx={{ p: '10px', mr: 1 }}
          aria-label="clear"
          onClick={handleClear}
          type="button"
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

export default Searchbar;