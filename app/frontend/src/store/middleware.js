import { isPlainObject } from '@reduxjs/toolkit';
import { isValidDate, serializeDate } from '../utils/dateUtils';

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
  
  // File objects are not serializable
  if (value instanceof File) return false;
  
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
    // Skip serialization check for specific actions
    if (action.type && (
      action.type.endsWith('/uploadPhotos/fulfilled') || 
      action.type.endsWith('/uploadPhotos/pending') ||
      action.type.endsWith('/uploadPhotos/rejected')
    )) {
      return next(action);
    }
    
    if (!isSerializable(action)) {
      console.warn('Non-serializable action detected:', action);
      
      // Try to fix Date objects and File objects in action payload
      if (action.payload) {
        const fixDatesInObject = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          const newObj = { ...obj };
          
          Object.entries(newObj).forEach(([key, value]) => {
            // Convert Date objects to ISO strings
            if (value instanceof Date) {
              newObj[key] = serializeDate(value);
            } 
            // Extract metadata from File objects
            else if (value instanceof File) {
              newObj[key] = {
                _isFileMeta: true,
                name: value.name,
                type: value.type,
                size: value.size,
                lastModified: value.lastModified,
              };
            }
            // Handle File objects in arrays
            else if (Array.isArray(value)) {
              newObj[key] = value.map(item => {
                if (item instanceof File) {
                  return {
                    _isFileMeta: true,
                    name: item.name,
                    type: item.type,
                    size: item.size,
                    lastModified: item.lastModified,
                  };
                }
                return fixDatesInObject(item);
              });
            }
            // Handle other objects recursively
            else if (value && typeof value === 'object') {
              newObj[key] = fixDatesInObject(value);
            }
          });
          
          return newObj;
        };
        
        // Create a fixed action with serialized dates
        const fixedAction = {
          ...action,
          payload: fixDatesInObject(action.payload)
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
