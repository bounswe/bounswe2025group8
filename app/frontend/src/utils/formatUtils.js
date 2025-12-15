/**
 * Format utilities for displaying data in the UI
 */

/**
 * Format a date as a readable string with time
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
};

/**
 * Format a date as a readable string without time
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format a timestamp as a time ago string (e.g. "2 hours ago")
 * @param {Date|string} date - Date object or string
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const diffHours = Math.floor(diffMin / 60);
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // Convert to weeks
  const diffWeeks = Math.floor(diffDays / 7);
  
  if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Convert to months
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  // Convert to years
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format a number as a rating (e.g. "4.5/5")
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum possible rating
 * @returns {string} Formatted rating
 */
export const formatRating = (rating, maxRating = 5) => {
  if (rating === undefined || rating === null) return 'No rating';
  
  // Round to one decimal place
  const roundedRating = Math.round(rating * 10) / 10;
  return `${roundedRating}/${maxRating}`;
};

/**
 * Get text for task status with proper formatting
 * @param {string} status - Task status code
 * @param {Function} t - Optional i18n translation function
 * @returns {Object} Status text and color
 */
export const getTaskStatusInfo = (status, t = null) => {
  const statusMap = {
    POSTED: { text: t ? t('taskStatuses.POSTED') : 'Posted', color: '#3498db' }, // Blue
    ASSIGNED: { text: t ? t('taskStatuses.ASSIGNED') : 'Assigned', color: '#f39c12' }, // Orange
    IN_PROGRESS: { text: t ? t('taskStatuses.IN_PROGRESS') : 'In Progress', color: '#8e44ad' }, // Purple
    COMPLETED: { text: t ? t('taskStatuses.COMPLETED') : 'Completed', color: '#27ae60' }, // Green
    CANCELLED: { text: t ? t('taskStatuses.CANCELLED') : 'Cancelled', color: '#e74c3c' }, // Red
    EXPIRED: { text: t ? t('taskStatuses.EXPIRED') : 'Expired', color: '#7f8c8d' }, // Gray
  };
  
  return statusMap[status] || { text: status, color: '#000000' }; // Default black
};

/**
 * Get text for volunteer status with proper formatting
 * @param {string} status - Volunteer status code
 * @param {Function} t - Optional i18n translation function
 * @returns {Object} Status text and color
 */
export const getVolunteerStatusInfo = (status, t = null) => {
  const statusMap = {
    PENDING: { text: t ? t('volunteerStatuses.PENDING') : 'Pending', color: '#3498db' }, // Blue
    ACCEPTED: { text: t ? t('volunteerStatuses.ACCEPTED') : 'Accepted', color: '#27ae60' }, // Green
    REJECTED: { text: t ? t('volunteerStatuses.REJECTED') : 'Rejected', color: '#e74c3c' }, // Red
    WITHDRAWN: { text: t ? t('volunteerStatuses.WITHDRAWN') : 'Withdrawn', color: '#7f8c8d' }, // Gray
  };
  
  return statusMap[status] || { text: status, color: '#000000' }; // Default black
};

/**
 * Format a category code to display name
 * @param {string} categoryCode - Category code
 * @param {Function} t - Optional i18n translation function
 * @returns {string} Display name
 */
export const formatCategory = (categoryCode, t = null) => {
  if (!categoryCode) return categoryCode;
  
  // If translation function is provided, use it
  if (t) {
    return t(`categories.${categoryCode}`, { defaultValue: categoryCode });
  }
  
  // Fallback to English if no translation function
  const categoryMap = {
    GROCERY_SHOPPING: 'Grocery Shopping',
    TUTORING: 'Tutoring',
    HOME_REPAIR: 'Home Repair',
    MOVING_HELP: 'Moving Help',
    HOUSE_CLEANING: 'House Cleaning',
    HOME_CLEANING: 'Home Cleaning',
    TECHNICAL_SUPPORT: 'Technical Support',
    PROFESSIONAL_ADVICE: 'Professional Advice',
    ELDERLY_CARE: 'Elderly Care',
    EDUCATION: 'Education',
    HEALTHCARE: 'Healthcare',
    HOME_MAINTENANCE: 'Home Maintenance',
    OTHER: 'Other',
  };
  
  return categoryMap[categoryCode] || categoryCode;
};

/**
 * Format urgency level as text
 * @param {number} level - Urgency level (1-3)
 * @param {Function} t - Optional i18n translation function
 * @returns {Object} Urgency text and color
 */
export const formatUrgency = (level, t = null) => {
  const urgencyMap = {
    1: { text: t ? t('urgencyLevels.low') : 'Low Urgency', color: '#27ae60' }, // Green
    2: { text: t ? t('urgencyLevels.medium') : 'Medium Urgency', color: '#f39c12' }, // Orange
    3: { text: t ? t('urgencyLevels.high') : 'High Urgency', color: '#e74c3c' }, // Red
  };
  
  return urgencyMap[level] || { text: t ? t('urgencyLevels.unknown') : 'Unknown', color: '#7f8c8d' }; // Default gray
};

/**
 * Truncate text to specified length and add ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if US format
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
    // Return original if format is unknown
  return phoneNumber;
};

/**
 * Get color for status display
 * @param {string} status - Status code
 * @returns {string} Color for the status
 */
export const getStatusColor = (status) => {
  // Normalize status to uppercase for case-insensitive comparison
  const normalizedStatus = status ? status.toUpperCase() : '';
  
  const colorMap = {
    'OPEN': '#4caf50', // green
    'PENDING': '#ff9800', // orange
    'IN_PROGRESS': '#2196f3', // blue
    'COMPLETED': '#4caf50', // green
    'CANCELLED': '#f44336', // red
    'EXPIRED': '#9e9e9e', // grey
    'ACCEPTED': '#4caf50', // green
    'REJECTED': '#f44336', // red
  };
  
  return colorMap[normalizedStatus] || '#9e9e9e'; // Default to grey
};

/**
 * Get human-readable text for status
 * @param {string} status - Status code
 * @returns {string} Human-readable status text
 */
export const getStatusText = (status) => {
  if (!status) return 'Unknown';
  
  // Normalize status to uppercase for case-insensitive comparison
  const normalizedStatus = status.toUpperCase();
  
  const textMap = {
    'OPEN': 'Open',
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'CANCELLED': 'Cancelled',
    'EXPIRED': 'Expired',
    'ACCEPTED': 'Accepted',
    'REJECTED': 'Rejected',
  };
  
  return textMap[normalizedStatus] || status;
};

export default {
  formatDateTime,
  formatDate,
  formatTimeAgo,
  formatRating,
  getTaskStatusInfo,
  getVolunteerStatusInfo,
  formatCategory,
  formatUrgency,
  truncateText,
  formatPhoneNumber,
  getStatusColor,
  getStatusText
};
