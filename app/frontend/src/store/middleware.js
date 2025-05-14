import { isPlainObject } from '@reduxjs/toolkit';
import { serializeDate } from '../utils/dateUtils';

/**
 * Check if a value is serializable
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value is serializable
 */
const isSerializable = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string') return true;
  if (Array.isArray(value)) return value.every(isSerializable);
  
  // Handle Date objects specially
  if (value instanceof Date) return true;
  
  // Skip File objects - they're not serializable but we'll handle them separately
  if (typeof File !== 'undefined' && value instanceof File) return true;
  
  if (isPlainObject(value)) {
    return Object.values(value).every(isSerializable);
  }
  
  return false;
};

/**
 * Create a serializable check middleware 
 * that will catch and handle non-serializable values
 */
export const createSerializableCheckMiddleware = () => {
  return () => (next) => (action) => {
    if (!isSerializable(action)) {
      console.warn('Non-serializable action detected:', action);
      
      // Try to fix non-serializable values in action payload
      if (action.payload) {
        const fixNonSerializableValues = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          const newObj = { ...obj };
          
          Object.entries(newObj).forEach(([key, value]) => {
            // Convert Date objects to ISO strings
            if (value instanceof Date) {
              newObj[key] = serializeDate(value);
            } 
            // Handle File objects by extracting metadata
            else if (typeof File !== 'undefined' && value instanceof File) {
              newObj[key] = {
                _type: 'File',
                name: value.name,
                lastModified: value.lastModified,
                size: value.size,
                type: value.type
              };
            }
            // Handle arrays containing File objects
            else if (Array.isArray(value)) {
              newObj[key] = value.map(item => {
                if (typeof File !== 'undefined' && item instanceof File) {
                  return {
                    _type: 'File',
                    name: item.name,
                    lastModified: item.lastModified,
                    size: item.size,
                    type: item.type
                  };
                }
                return item;
              });
            }
            // Handle other objects recursively
            else if (value && typeof value === 'object') {
              newObj[key] = fixNonSerializableValues(value);
            }
          });
          
          return newObj;
        };
        
        // Create a fixed action with serialized dates and file metadata
        const fixedAction = {
          ...action,
          payload: fixNonSerializableValues(action.payload)
        };
        
        return next(fixedAction);
      }
    }
    
    return next(action);
  };
};

export default {
  createSerializableCheckMiddleware
};
