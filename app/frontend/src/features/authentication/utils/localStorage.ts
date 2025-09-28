import type { AuthUser } from '../types';

/**
 * LocalStorage Management Strategy
 * 
 * IMPORTANT: These keys must match those used in authAPI.ts
 * - 'token' is used by both authSlice and authAPI for consistency
 * - 'user' stores complete user object (includes id, name, email)
 * - 'role' stores user role separately for quick access
 * 
 * Deprecated keys (removed to prevent conflicts):
 * - 'auth_token' (old key, replaced with 'token')
 * - 'userId' (redundant, available in user.id)
 * - 'userName' (redundant, available in user.name)
 */
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  ROLE: 'role'
} as const;

/**
 * Centralized localStorage management for authentication
 * Provides consistent and atomic operations for auth data storage
 */
export const authStorage = {
  /**
   * Set complete authentication data (user, token, role)
   * @param user - User object containing id, name, email
   * @param token - Authentication token
   * @param role - User role (user, admin, etc.)
   */
  setAuthData: (user: AuthUser, token: string, role: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  },
  
  /**
   * Clear all authentication data from localStorage
   * Used during logout or authentication failures
   */
  clearAuthData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  },
  
  /**
   * Update only user data in localStorage
   * Used when user profile is updated
   * @param user - Updated user object
   */
  updateUser: (user: AuthUser): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  /**
   * Get user data from localStorage
   * @returns Parsed user object or null if not found
   */
  getUser: (): AuthUser | null => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },
  
  /**
   * Get authentication token from localStorage
   * @returns Token string or null if not found
   */
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  
  /**
   * Get user role from localStorage
   * @returns Role string or 'user' as default
   */
  getRole: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || 'user';
  },
  
  /**
   * Check if user is authenticated (has valid token and user data)
   * @returns Boolean indicating authentication status
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return !!(token && user);
  }
};