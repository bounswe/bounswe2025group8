/**
 * Utility functions for the Neighborhood Assistance Board application
 */

/**
 * Extract initials from a user's name
 * @param {Object} user - The user object
 * @returns {string} - The user's initials
 */
export const getInitials = (user) => {
  if (!user || (!user.name && !user.fullName)) {
    return 'U';
  }
  
  const name = user.name || user.fullName;
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Generate a consistent color based on a string
 * @param {string} string - The input string
 * @returns {string} - A hex color code
 */
export const stringToColor = (string) => {
  if (!string) {
    return '#6366f1'; // Default color
  }
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
};

/**
 * Format a date string in a user-friendly way
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Truncate a string and add ellipsis if it exceeds maxLength
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length before truncating
 * @returns {string} - Truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return str.substring(0, maxLength - 3) + '...';
};
