import { serializeDate } from './dateUtils';

/**
 * Maps form data from the create request form to the API's expected format
 * 
 * @param {Object} formData - Form data from the create request form
 * @returns {Object} Data formatted for the API
 */
export const mapFormToTaskApiFormat = (formData) => {
  return {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    location: formData.location || getFormattedLocation(formData),    deadline: typeof formData.deadlineDate === 'string' 
      ? formData.deadlineDate 
      : serializeDate(formData.deadlineDate),
    requirements: formData.requirements || '',
    urgency_level: getUrgencyLevel(formData.urgency),
    volunteer_number: formData.requiredPeople || 1,
    is_recurring: !!formData.isRecurring
  };
};

/**
 * Gets a formatted location string from address components
 * 
 * @param {Object} formData - Form data with address components
 * @returns {string} Formatted location string
 */
export const getFormattedLocation = (formData) => {
  const addressParts = [];
  
  if (formData.street) addressParts.push(formData.street);
  if (formData.buildingNo) addressParts.push(`Building ${formData.buildingNo}`);
  if (formData.doorNo) addressParts.push(`Door ${formData.doorNo}`);
  if (formData.neighborhood) addressParts.push(formData.neighborhood);
  if (formData.district) addressParts.push(formData.district);
  if (formData.city) addressParts.push(formData.city);
  
  return addressParts.join(', ');
};

/**
 * Maps urgency text to its numerical level
 * 
 * @param {string} urgencyText - Urgency text label (e.g., 'High', 'Medium')
 * @returns {number} Urgency level (1-5)
 */
export const getUrgencyLevel = (urgencyText) => {
  const urgencyMap = {
    'Critical': 5,
    'High': 4,
    'Medium': 3,
    'Low': 2,
    'Very Low': 1
  };
  
  return urgencyMap[urgencyText] || 3; // Default to Medium (3) if not found
};

/**
 * Maps numerical urgency level to text label
 * 
 * @param {number} level - Urgency level (1-5)
 * @returns {string} Urgency text label
 */
export const getUrgencyText = (level) => {
  const levelMap = {
    5: 'Critical',
    4: 'High',
    3: 'Medium',
    2: 'Low',
    1: 'Very Low'
  };
  
  return levelMap[level] || 'Medium';
};

export default {
  mapFormToTaskApiFormat,
  getFormattedLocation,
  getUrgencyLevel,
  getUrgencyText
};
