import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {string} formatString - Format to use (default: 'dd/MM/yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, formatString = 'dd/MM/yyyy') => {
  try {
    if (!dateString) return 'N/A';
    
    // Parse the ISO string to a Date object
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    // Format the date
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string to a relative time format (e.g., "2 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time
 */
export const formatRelativeTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    
    // Parse the ISO string to a Date object
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    // Format as relative time
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
};

/**
 * Safely serialize a date for Redux storage
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} ISO date string
 */
export const serializeDate = (date) => {
  try {
    if (!date) return null;
    
    // If it's already a string, return it
    if (typeof date === 'string') {
      return date;
    }
    
    // If it's a Date object, convert to ISO string
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    return null;
  } catch (error) {
    console.error('Error serializing date:', error);
    return null;
  }
};

/**
 * Deserialize a date string back to a Date object
 * @param {string} dateString - ISO date string from Redux store
 * @returns {Date} Date object or null if invalid
 */
export const deserializeDate = (dateString) => {
  try {
    if (!dateString) return new Date();
    
    // If it's already a Date object, return it
    if (dateString instanceof Date) {
      return dateString;
    }
    
    // Parse the ISO string to a Date object
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error deserializing date:', error);
    return new Date();
  }
};

/**
 * Check if a value is a valid date
 * @param {any} value - Value to check
 * @returns {boolean} True if valid date
 */
export const isValidDate = (value) => {
  if (!value) return false;
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      const date = parseISO(value);
      return isValid(date);
    } catch (error) {
      return false;
    }
  }
  
  // If it's a Date object, check its validity
  if (value instanceof Date) {
    return isValid(value);
  }
  
  return false;
};
