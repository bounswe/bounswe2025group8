import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Formats a date as a relative time (e.g., "3 days ago")
 * @param {string|Date} date - The date to format as ISO string or Date object
 * @param {Object} options - Options for formatDistanceToNow
 * @returns {string} The formatted relative time string
 */
export const formatRelativeTime = (date, options = { addSuffix: true }) => {
  if (!date) return 'Unknown time';
  
  try {
    // If it's an ISO string, parse it to a Date
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a date in a standardized format
 * @param {string|Date} date - The date to format as ISO string or Date object
 * @param {string} formatStr - The format string to use
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return 'Unknown date';
  
  try {
    // If it's an ISO string, parse it to a Date
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Ensures a date is in a Redux-serializable format (ISO string)
 * @param {string|Date} date - Either a Date object or an ISO string
 * @returns {string} The date as an ISO string
 */
export const serializableDate = (date) => {
  if (!date) return new Date().toISOString();
  
  try {
    return typeof date === 'string' ? date : date.toISOString();
  } catch (error) {
    console.error('Error serializing date:', error);
    return new Date().toISOString();
  }
};

/**
 * Converts a serialized date string to a Date object for UI components
 * @param {string} dateString - ISO date string
 * @returns {Date} JavaScript Date object
 */
export const deserializeDate = (dateString) => {
  if (!dateString) return new Date();
  
  try {
    return typeof dateString === 'string' ? new Date(dateString) : dateString;
  } catch (error) {
    console.error('Error deserializing date:', error);
    return new Date();
  }
};

export default {
  formatRelativeTime,
  formatDate,
  serializableDate,
  deserializeDate
};
