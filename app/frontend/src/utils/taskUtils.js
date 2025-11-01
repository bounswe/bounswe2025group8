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
    urgency_level: formData.urgency,
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
  
  // Add region components in a specific order: country, state, city, neighborhood
  if (formData.country) addressParts.push(`Country: ${formData.country}`);
  if (formData.state) addressParts.push(`State: ${formData.state}`);
  if (formData.city) addressParts.push(`City: ${formData.city}`);
  if (formData.neighborhood) addressParts.push(`Neighborhood: ${formData.neighborhood}`);
  
  // Add detailed address components after the region information
  if (formData.street) addressParts.push(`Street: ${formData.street}`);
  if (formData.buildingNo) addressParts.push(`Building: ${formData.buildingNo}`);
  if (formData.doorNo) addressParts.push(`Door: ${formData.doorNo}`);
    // Add address description as a key-value pair like other components
  if (formData.addressDescription && formData.addressDescription.trim()) {
    addressParts.push(`Description: ${formData.addressDescription.trim()}`);
  }
  
  // Create main address string
  let locationString = addressParts.join(', ');
  
  return locationString;
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


/**
 * Extracts region information (country, state, city, neighborhood) from a formatted location string
 * 
 * @param {string} locationString - A location string from a request/task object
 * @returns {string} Region-only location information without key prefixes
 */
export const extractRegionFromLocation = (locationString) => {
  if (!locationString) return '';
  
  // Split the string into parts
  const parts = locationString.split(', ');
  
  // Check if we're dealing with the new formatted version (with "Country:", etc prefixes)
  const isFormattedVersion = parts.some(part => 
    part.startsWith('Country:') || 
    part.startsWith('State:') || 
    part.startsWith('City:') || 
    part.startsWith('Neighborhood:')
  );
  
  if (isFormattedVersion) {
    // Create an ordered array for the region information values (without the keys)
    let orderedRegion = [];
    
    // Extract parts in specific order: country, state, city, neighborhood
    // and remove the key prefixes
    const countryPart = parts.find(part => part.startsWith('Country:'));
    if (countryPart) orderedRegion.push(countryPart.replace('Country:', '').trim());
    
    const statePart = parts.find(part => part.startsWith('State:'));
    if (statePart) orderedRegion.push(statePart.replace('State:', '').trim());
    
    const cityPart = parts.find(part => part.startsWith('City:'));
    if (cityPart) orderedRegion.push(cityPart.replace('City:', '').trim());
    
    const neighborhoodPart = parts.find(part => part.startsWith('Neighborhood:'));
    if (neighborhoodPart) orderedRegion.push(neighborhoodPart.replace('Neighborhood:', '').trim());
    
    return orderedRegion.join(', ');
  } else {
    // For legacy or unformatted location strings
    // If there are more than 4 parts, only show the first 4 (assumed to be regions)
    // This is a best-effort approach for old-format locations
    const maxParts = Math.min(4, parts.length);
    return parts.slice(0, maxParts).join(', ');
  }
};

export default {
  mapFormToTaskApiFormat,
  getFormattedLocation,
  getUrgencyText,
  extractRegionFromLocation
};
