import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const resolveDefaultHost = () => {
  const extraHost = Constants.expoConfig?.extra?.apiHost;
  if (extraHost) {
    return extraHost;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const [host] = hostUri.split(':');
    if (host) {
      return host;
    }
  }

  return 'localhost';
};

const lanHost = resolveDefaultHost();

// Backend port is fixed at 8000
const port = Constants.expoConfig?.extra?.apiPort ?? '8000';

const API_HOST = Platform.select({
  web: 'localhost',  // Web uses localhost (faster, more reliable)
  default: lanHost,   // Mobile (ios/Android) uses LAN IP
});

export const API_BASE_URL = `http://${API_HOST}:${port}/api`;

interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user_id: number;
  };
}

interface RegisterResponse {
  status: string;
  message: string;
  data: {
    user_id: number;
    name: string;
    email: string;
  };
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
  data?: {
    token?: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  phone_number: string;
  location: string;
  rating: number;
  completed_task_count: number;
  is_active: boolean;
  photo?: string;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: UserProfile;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  location: string;
  status: string;
  status_display: string;
  category: string;
  category_display: string;
  created_at: string;
  updated_at: string;
  creator: UserProfile;
  assignee: UserProfile | null;
  photo?: string;
  urgency_level: number;
  volunteer_number: number;
  is_recurring: boolean;
  deadline: string;
  requirements: string;
}

export interface TasksResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  task_count: number;
}

export interface CategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface Review {
  id: number;
  score: number;
  comment: string;
  timestamp: string;
  reviewer: UserProfile;
  reviewee: UserProfile;
  task: number;
}

export interface UserReviewsResponse {
  status: string;
  data: {
    reviews: Review[];
    pagination: any;
  };
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}

// Add Notification Interface
export interface Notification {
  id: number;
  content: string;
  timestamp: string; // ISO date string
  type: string; // e.g., "TASK_APPLIED", "REVIEW_RECEIVED"
  type_display: string; // e.g., "Volunteer Applied", "New Review"
  is_read: boolean;
  // user: UserProfile; // The user field is for the recipient, usually the logged-in user, so often not needed in the list item itself if fetching "my" notifications.
  related_task: Task | null; // Task can be null if notification is not task-specific
}

export interface PaginationInfo {
  count: number;
  page: number;
  pages: number;
  limit: number;
  next: string | null;
  previous: string | null;
}

// Add NotificationsListResponse Interface
export interface NotificationsListResponse {
  status: string; // from format_response
  message?: string; // from format_response, optional
  data: {
    notifications: Notification[];
    pagination: PaginationInfo;
    unread_count: number;
  };
}

// Add MarkReadResponse (can be generic if backend sends consistent success/data structure)
export interface MarkReadResponse {
    status: string;
    message: string;
    data?: Notification; // mark_as_read returns the updated notification
}

export interface MarkAllReadResponse {
    status: string;
    message: string;
    // data is not typically returned for mark_all_as_read, just a success message
}

// Add Volunteer Interface
export interface Volunteer {
  id: number;
  user: UserProfile;
  task: Partial<Task>; // Task might not be fully populated here, or could be just task_id
  status: string;
  status_display: string;
  volunteered_at: string;
}

export interface GetTaskApplicantsResponse {
  status: string;
  message?: string;
  data: {
    volunteers: Volunteer[];
    pagination: PaginationInfo;
  };
}

// Add UpdateVolunteerStatusResponse Interface
export interface UpdateVolunteerStatusResponse {
  status: string;
  message: string;
  data: Volunteer; 
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      // Django Rest Framework expects "Token" prefix, not "Bearer"
      config.headers.Authorization = `Token ${token}`;
    } else if (config.headers && 'Authorization' in config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const checkAvailability = async (email: string, phone: string): Promise<boolean> => {
  try {
    const response = await api.get('/auth/check-availability/', {
      params: {
        email,
        phone_number: phone
      }
    });
    return response.data.available;
  } catch (error) {
    console.error('Availability check error:', error);
    return false;
  }
};

export const register = async (
  email: string,
  password: string,
  fullName: string,
  username: string,
  phone: string
): Promise<RegisterResponse> => {
  try {
    console.log('Sending registration request to:', `${API_BASE_URL}/auth/register/`);
    
    // Split full name into name and surname
    const nameParts = fullName.trim().split(' ');
    const name = nameParts[0];
    const surname = nameParts.slice(1).join(' ') || name; // Use first name as surname if no surname provided
    
    // Validate phone number format (10-15 digits, optional + prefix)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Phone number must be 10-15 digits with an optional + prefix');
    }
    
    // Validate password requirements
    const passwordValidation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    if (!Object.values(passwordValidation).every(Boolean)) {
      const missing = [];
      if (!passwordValidation.length) missing.push('at least 8 characters');
      if (!passwordValidation.uppercase) missing.push('an uppercase letter');
      if (!passwordValidation.lowercase) missing.push('a lowercase letter');
      if (!passwordValidation.number) missing.push('a number');
      if (!passwordValidation.special) missing.push('a special character');
      throw new Error(`Password must contain ${missing.join(', ')}`);
    }
    
    // Match backend's expected field order exactly
    const requestData = {
      name,
      surname,
      username,
      email,
      phone_number: phone,
      password,
      confirm_password: password
    };
    
    console.log('Registration request data:', requestData);
    const response = await api.post<RegisterResponse>('/auth/register/', requestData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Registration error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Check for specific validation errors from backend
      if (error.response?.data?.data) {
        const errors = error.response.data.data;
        
        // Password validation errors
        if (errors.password) {
          const passwordErrors = errors.password;
          if (Array.isArray(passwordErrors)) {
            throw new Error(passwordErrors[0]);
          } else {
            throw new Error(passwordErrors);
          }
        }
        
        // Phone number validation errors
        if (errors.phone_number) {
          const phoneErrors = errors.phone_number;
          if (Array.isArray(phoneErrors)) {
            throw new Error(phoneErrors[0]);
          } else {
            throw new Error(phoneErrors);
          }
        }
        
        // Username validation errors
        if (errors.username) {
          const usernameErrors = errors.username;
          if (Array.isArray(usernameErrors)) {
            throw new Error(usernameErrors[0]);
          } else {
            throw new Error(usernameErrors);
          }
        }
        
        // Email validation errors
        if (errors.email) {
          const emailErrors = errors.email;
          if (Array.isArray(emailErrors)) {
            throw new Error(emailErrors[0]);
          } else {
            throw new Error(emailErrors);
          }
        }
        
        // Name validation errors
        if (errors.name) {
          const nameErrors = errors.name;
          if (Array.isArray(nameErrors)) {
            throw new Error(nameErrors[0]);
          } else {
            throw new Error(nameErrors);
          }
        }
        
        // Surname validation errors
        if (errors.surname) {
          const surnameErrors = errors.surname;
          if (Array.isArray(surnameErrors)) {
            throw new Error(surnameErrors[0]);
          } else {
            throw new Error(surnameErrors);
          }
        }
      }
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Sending login request to:', `${API_BASE_URL}/auth/login/`);
    console.log('Request payload:', { email, password });
    const response = await api.post<LoginResponse>('/auth/login/', {
      email,
      password
    });
    console.log('Response data:', response.data);
    
    // Store the token from the response data
    if (response.data.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      
      // Fetch and store user profile
      if (response.data.data?.user_id) {
        const profileFromApi = await getUserProfile(response.data.data.user_id);
        if (profileFromApi && profileFromApi.id) {
          await AsyncStorage.setItem('userProfile', JSON.stringify(profileFromApi));
        } else {
          await AsyncStorage.removeItem('userProfile');
        }
      }
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Login error details:', {
        error,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    console.log('Sending forgot password request to:', `${API_BASE_URL}/auth/request-reset/`);
    const response = await api.post<ForgotPasswordResponse>('/auth/request-reset/', { email });
    console.log('Forgot password response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Forgot password error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    console.log('Fetching user profile for (expecting direct object):', userId);
    // Expect UserProfile directly as response.data
    const response = await api.get<UserProfile>(`/users/${userId}/`); 
    console.log('User profile response (direct object expected):', response.data);
    return response.data; // response.data should now be UserProfile
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get user profile error details (direct object expected):', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

const normalizeTasksResponse = (payload: unknown): TasksResponse => {
  const empty: TasksResponse = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };

  if (Array.isArray(payload)) {
    const tasks = payload as Task[];
    return {
      count: tasks.length,
      next: null,
      previous: null,
      results: tasks,
    };
  }

  if (payload && typeof payload === 'object') {
    const dataObj = payload as Record<string, unknown>;

    const resultsCandidate = dataObj['results'];
    if (Array.isArray(resultsCandidate)) {
      const results = resultsCandidate as Task[];
      const count = typeof dataObj['count'] === 'number' ? dataObj['count'] as number : results.length;
      const next = typeof dataObj['next'] === 'string' || dataObj['next'] === null ? dataObj['next'] as string | null : null;
      const previous = typeof dataObj['previous'] === 'string' || dataObj['previous'] === null ? dataObj['previous'] as string | null : null;
      return {
        count,
        next,
        previous,
        results,
      };
    }

    const tasksCandidate = dataObj['tasks'];
    if (Array.isArray(tasksCandidate)) {
      const tasks = tasksCandidate as Task[];
      const pagination = dataObj['pagination'];
      let count = tasks.length;
      if (pagination && typeof pagination === 'object' && pagination !== null) {
        const paginationRecord = pagination as Record<string, unknown>;
        if (typeof paginationRecord['count'] === 'number') {
          count = paginationRecord['count'] as number;
        } else if (typeof paginationRecord['total_records'] === 'number') {
          count = paginationRecord['total_records'] as number;
        }
      }
      return {
        count,
        next: null,
        previous: null,
        results: tasks,
      };
    }

    if ('data' in dataObj) {
      return normalizeTasksResponse(dataObj['data']);
    }
  }

  return empty;
};

export const getTasks = async (): Promise<TasksResponse> => {
  try {
    console.log('Fetching tasks');
    const response = await api.get('/tasks/');
    const normalized = normalizeTasksResponse(response.data);
    console.log('Tasks response (normalized):', normalized);
    return normalized;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get tasks error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get<CategoriesResponse>('/tasks/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export interface VolunteerApplicationResponse {
  status: string;
  message: string;
  data: Volunteer;
}

export interface WithdrawVolunteerResponse {
  status: string;
  message?: string;
}

export const listVolunteers = async (params?: Record<string, unknown>): Promise<Volunteer[]> => {
  try {
    const response = await api.get('/volunteers/', { params });
    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload as Volunteer[];
    }
    if (payload?.results && Array.isArray(payload.results)) {
      return payload.results as Volunteer[];
    }
    if (payload?.data?.volunteers && Array.isArray(payload.data.volunteers)) {
      return payload.data.volunteers as Volunteer[];
    }
    return [];
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('List volunteers error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
    return [];
  }
};

export const volunteerForTask = async (taskId: number): Promise<VolunteerApplicationResponse> => {
  try {
    const response = await api.post<VolunteerApplicationResponse>('/volunteers/', { task_id: taskId });
    return response.data;
  } catch (error) {
    console.error(`Error volunteering for task ${taskId}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      // Re-throw with more specific error information if available
      throw new Error(error.response.data.message || 'Failed to volunteer for task.');
    }
    throw new Error('Failed to volunteer for task. An unexpected error occurred.');
  }
};

export const withdrawVolunteer = async (volunteerId: number): Promise<WithdrawVolunteerResponse> => {
  try {
    const response = await api.delete<WithdrawVolunteerResponse>(`/volunteers/${volunteerId}/`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Withdraw volunteer ${volunteerId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || 'Failed to withdraw volunteer request.';
      throw new Error(errMessage);
    }
    throw new Error('Failed to withdraw volunteer request. An unexpected error occurred.');
  }
};

export const createTask = async (taskData: {
  title: string;
  description: string;
  category: string;
  location: string;
  deadline: string;
  requirements: string;
  urgency_level: number;
  volunteer_number: number;
  is_recurring: boolean;
}): Promise<Task> => {
  try {
    console.log('Creating task:', taskData);
    const response = await api.post<Task>('/tasks/', taskData);
    console.log('Create task response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create task error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout/');
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Logout error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const getUserReviews = async (userId: number, page = 1, limit = 10): Promise<UserReviewsResponse> => {
  try {
    const response = await api.get<UserReviewsResponse>(`/users/${userId}/reviews/`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get user reviews error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
};

export const searchUsers = async (query?: string): Promise<UsersResponse> => {
  try {
    const params = query ? { search: query } : {};
    const response = await api.get<UsersResponse>('/users/', { params });
    return response.data;
  } catch (error) {
    console.error(`Error searching users with query "${query}":`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to search users.');
    }
    throw new Error('Failed to search users. An unexpected error occurred.');
  }
};

export const getNotifications = async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationsListResponse> => {
  try {
    const response = await api.get<NotificationsListResponse>('/notifications/', {
      params: {
        page,
        limit,
        unread: unreadOnly,
      },
    });
    console.log('Get notifications response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get notifications error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<MarkReadResponse> => {
  try {
    const response = await api.post<MarkReadResponse>(`/notifications/${notificationId}/mark-read/`);
    console.log(`Mark notification ${notificationId} as read response:`, response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Mark notification ${notificationId} as read error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<MarkAllReadResponse> => {
  try {
    const response = await api.post<MarkAllReadResponse>('/notifications/mark-all-read/');
    console.log('Mark all notifications as read response:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Mark all notifications as read error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
    throw error;
  }
};

export const getTaskDetails = async (taskId: number): Promise<Task> => {
  try {
    console.log(`Fetching task details for ID: ${taskId}`);
    const response = await api.get<Task>(`/tasks/${taskId}/`);
    console.log('Task details response:', response.data);
    return response.data; // Expect Task object directly
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Get task details for ID ${taskId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch task details.';
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while fetching task details.';
    throw new Error(errMessage);
  }
};

export const getTaskApplicants = async (taskId: number, status: string = 'PENDING', page: number = 1, limit: number = 20): Promise<GetTaskApplicantsResponse> => {
  try {
    const response = await api.get<GetTaskApplicantsResponse>(`/tasks/${taskId}/volunteers/`, {
      params: {
        status,
        page,
        limit,
      }
    });
    console.log(`Get task applicants for ${taskId} (status: ${status}) response:`, response.data);
    return response.data; 
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Get task ${taskId} applicants error details:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
    }
    const errMessage = (error as any)?.response?.data?.message || (error as Error).message || 'Failed to fetch task applicants.';
    throw new Error(errMessage);
  }
};

export const updateVolunteerAssignmentStatus = async (taskId: number, volunteerId: number, action: 'accept' | 'reject'): Promise<UpdateVolunteerStatusResponse> => {
  try {
    const response = await api.post<UpdateVolunteerStatusResponse>(`/tasks/${taskId}/volunteers/`, {
      volunteer_id: volunteerId,
      action: action,
    });
    console.log(`Update volunteer ${volunteerId} for task ${taskId} to ${action} response:`, response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || `Failed to ${action} volunteer.`);
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Update volunteer ${volunteerId} for task ${taskId} to ${action} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || `Failed to ${action} volunteer.`;
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || `An unexpected error occurred while trying to ${action} volunteer.`;
    throw new Error(errMessage);
  }
};

export default api;
