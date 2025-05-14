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
      
      // Try to fix Date objects in action payload
      if (action.payload) {
        const fixDatesInObject = (obj) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          const newObj = { ...obj };
          
          Object.entries(newObj).forEach(([key, value]) => {
            // Convert Date objects to ISO strings
            if (value instanceof Date) {
              newObj[key] = serializeDate(value);
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
