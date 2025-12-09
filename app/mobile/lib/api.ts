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

// LOCAL DEVELOPMENT: Use your computer's LAN IP for iOS simulator and physical devices
// Replace '172.20.10.3' with your actual LAN IP if different
// Find your LAN IP with: ipconfig getifaddr en0
// use the first one returned by the command
// Can be set via Constants.expoConfig?.extra?.localLanIp from .env file
const LOCAL_LAN_IP = Constants.expoConfig?.extra?.localLanIp ?? '192.168.4.23'; // Default fallback if not set

const API_HOST = Platform.select({
  web: 'localhost',           // Web uses localhost
  android: '10.0.2.2',        // Android emulator uses special IP to access host machine
  ios: LOCAL_LAN_IP,          // iOS simulator: use LAN IP instead of localhost
  default: LOCAL_LAN_IP,      // Physical devices: use LAN IP
});

// Use environment variable if present (from .env via Constants.expoConfig?.extra?.backendBaseUrl), otherwise fallback to dynamic host
const ENV_BACKEND_URL = Constants.expoConfig?.extra?.backendBaseUrl;

export const BACKEND_BASE_URL = ENV_BACKEND_URL ? ENV_BACKEND_URL : `http://${API_HOST}:${port}`;

export const API_BASE_URL = `${BACKEND_BASE_URL}/api`;


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
  profile_photo?: string;
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
  // Volunteer -> Requester ratings
  accuracy_of_request?: number;
  communication_volunteer_to_requester?: number;
  safety_and_preparedness?: number;
  // Requester -> Volunteer ratings
  reliability?: number;
  task_completion?: number;
  communication_requester_to_volunteer?: number;
  safety_and_respect?: number;
  // Helper fields
  is_volunteer_to_requester: boolean;
  is_requester_to_volunteer: boolean;
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

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  deadline?: string;            // ISO string
  requirements?: string;
  urgency_level?: number;
  volunteer_number?: number;
  is_recurring?: boolean;
}

export interface UpdateTaskResponse {
  status: 'success' | 'error';
  message: string;
  data: Task;
}


// Log the API configuration on module load
console.log('=== API Configuration ===');
console.log('Platform:', Platform.OS);
console.log('API_HOST:', API_HOST);
console.log('Port:', port);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('========================');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  validateStatus: (status) => {
    // Accept all 2xx and 204 status codes as successful
    return (status >= 200 && status < 300) || status === 204;
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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle network errors
api.interceptors.response.use(
  (response) => {
    // Handle 204 No Content responses gracefully
    if (response.status === 204) {
      // Ensure we return a consistent structure even for 204
      if (!response.data) {
        response.data = { status: 'success', message: 'Operation completed successfully.' };
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 204 responses that might be treated as errors
    if (error.response?.status === 204) {
      // Convert to successful response
      return Promise.resolve({
        ...error.response,
        data: error.response.data || { status: 'success', message: 'Operation completed successfully.' }
      });
    }
    
    // React Native iOS specific: ERR_NETWORK with no response often means 204 No Content
    // This happens when a DELETE request returns 204 with no body
    if (error.code === 'ERR_NETWORK' && !error.response && error.config?.method?.toLowerCase() === 'delete') {
      console.log('[API] Treating ERR_NETWORK on DELETE as successful 204 response');
      return Promise.resolve({
        status: 204,
        statusText: 'No Content',
        data: { status: 'success', message: 'Operation completed successfully.' },
        headers: {},
        config: error.config,
      } as any);
    }
    
    // Enhanced error logging for network issues
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
      console.error('[API Network Error]', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        platform: Platform.OS,
        suggestion: Platform.OS === 'android'
          ? 'Make sure backend is running and use 10.0.2.2 for Android emulator'
          : Platform.OS === 'ios'
            ? 'Try using your LAN IP address instead of localhost for iOS simulator'
            : 'Check if backend is accessible from your device'
      });
    }
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
    const surname = nameParts.slice(1).join(' ') || ''; // Use first name as surname if no surname provided

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
      // Enhanced error logging for network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('Network Error')) {
        console.error('Login failed - Network Error:', {
          message: error.message,
          code: error.code,
          attemptedURL: `${API_BASE_URL}/auth/login/`,
          platform: Platform.OS,
          suggestion: Platform.OS === 'android'
            ? 'Android emulator needs 10.0.2.2 instead of localhost'
            : Platform.OS === 'ios'
              ? 'iOS simulator may need your LAN IP instead of localhost'
              : 'Check if backend is running and accessible'
        });
      } else {
        console.error('Login error details:', {
          error: error.message,
          code: error.code,
          request: error.config,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
      }

      // Provide more helpful error messages
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        const helpfulMessage = Platform.OS === 'android'
          ? 'Cannot connect to backend. Make sure backend is running and try using 10.0.2.2 if on Android emulator.'
          : Platform.OS === 'ios'
            ? 'Cannot connect to backend. Try using your computer\'s LAN IP address instead of localhost.'
            : 'Cannot connect to backend. Check if backend is running and accessible.';
        throw new Error(helpfulMessage);
      }
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


export const updateTask = async (taskId: number, payload: UpdateTaskPayload): Promise<Task> => {
  try {
    const response = await api.patch<UpdateTaskResponse>(`/tasks/${taskId}/`, payload);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to update task.');
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMsg = error.response?.data?.message ?? error.response?.data?.detail;
      throw new Error(serverMsg || 'Failed to update task.');
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

export const getPopularTasks = async (limit: number = 6): Promise<Task[]> => {
  try {
    console.log(`Fetching popular tasks with limit: ${limit}`);
    const response = await api.get('/tasks/popular/', {
      params: { limit },
    });
    console.log('Popular tasks response:', response.data);

    // Handle different response formats
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data as Task[];
    }
    if (Array.isArray(response.data)) {
      return response.data as Task[];
    }
    return [];
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get popular tasks error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    return [];
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
    const response = await api.post('/tasks/', taskData);
    console.log('Create task response:', response.data);

    // Backend returns { status, message, data: Task }
    // Extract the actual task from the nested structure
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as any).data as Task;
    }

    // Fallback: if response is directly a Task
    return response.data as Task;
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
      // Don't throw 401/403 errors - they indicate we're already logged out on the backend
      // or the token is invalid. Either way, we should proceed with local logout.
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Already logged out on backend or token invalid - proceeding with local logout');
        return; // Continue with local logout
      }
      console.error('Logout error details:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    // For any other errors, just log but don't throw - we still want to logout locally
    console.warn('Backend logout failed, but proceeding with local logout');
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

export interface TaskReviewsResponse {
  status: string;
  data: {
    reviews: Review[];
    pagination: PaginationInfo;
  };
}

export const getTaskReviews = async (taskId: number, page = 1, limit = 20): Promise<TaskReviewsResponse> => {
  try {
    const response = await api.get<TaskReviewsResponse>(`/tasks/${taskId}/reviews/`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get task reviews error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
};

export interface CreateReviewRequest {
  comment: string;
  reviewee_id: number;
  task_id: number;

  // Volunteer -> Requester ratings
  accuracy_of_request?: number;
  communication_volunteer_to_requester?: number;
  safety_and_preparedness?: number;

  // Requester -> Volunteer ratings
  reliability?: number;
  task_completion?: number;
  communication_requester_to_volunteer?: number;
  safety_and_respect?: number;
}

export interface CreateReviewResponse {
  status: string;
  message: string;
  data: Review;
}

export const createReview = async (data: CreateReviewRequest): Promise<CreateReviewResponse> => {
  try {
    const response = await api.post<CreateReviewResponse>('/reviews/', data);
    console.log('Create review response:', response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to create review.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create review error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      // Extract detailed error message from backend
      const errorData = error.response?.data;
      let errMessage = 'Failed to create review.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errMessage = errorData;
      } else if (errorData) {
        // Try to extract validation errors
        const validationErrors = Object.values(errorData).flat();
        if (validationErrors.length > 0) {
          errMessage = Array.isArray(validationErrors[0])
            ? validationErrors[0][0]
            : String(validationErrors[0]);
        }
      }

      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while trying to create review.';
    throw new Error(errMessage);
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

export interface BatchAssignVolunteersResponse {
  status: string;
  message: string;
  data: {
    assigned_volunteers: Volunteer[];
    task_status: string;
    total_assigned: number;
  };
}

export const batchAssignVolunteers = async (taskId: number, volunteerIds: number[]): Promise<BatchAssignVolunteersResponse> => {
  try {
    const response = await api.post<BatchAssignVolunteersResponse>(`/tasks/${taskId}/volunteers/`, {
      volunteer_ids: volunteerIds,
    });
    console.log(`Batch assign volunteers to task ${taskId} response:`, response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to assign volunteers.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Batch assign volunteers to task ${taskId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || 'Failed to assign volunteers.';
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while trying to assign volunteers.';
    throw new Error(errMessage);
  }
};

export interface CompleteTaskResponse {
  status: string;
  message: string;
  data: {
    task_id: number;
    status: string;
    completed_at: string;
  };
}

export const completeTask = async (taskId: number): Promise<CompleteTaskResponse> => {
  try {
    const response = await api.post<CompleteTaskResponse>(`/tasks/${taskId}/complete/`);
    console.log(`Complete task ${taskId} response:`, response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to complete task.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Complete task ${taskId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || 'Failed to complete task.';
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while trying to complete task.';
    throw new Error(errMessage);
  }
};

export interface CancelTaskResponse {
  status: string;
  message: string;
  data: {
    task_id: number;
    title: string;
    status: string;
    cancelled_at: string;
  };
}

export const cancelTask = async (taskId: number): Promise<CancelTaskResponse> => {
  try {
    const response = await api.delete<CancelTaskResponse>(`/tasks/${taskId}/`);
    console.log(`Cancel task ${taskId} response:`, response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to cancel task.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Cancel task ${taskId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || 'Failed to cancel task.';
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while trying to cancel task.';
    throw new Error(errMessage);
  }
};

// Photo API interfaces
export interface Photo {
  id: number;
  url: string;
  photo_url: string;
  image: string;
  uploaded_at: string;
  alt_text: string;
  task?: Partial<Task>;
}

export interface TaskPhotosResponse {
  status: string;
  data: {
    photos: Photo[];
  };
}

export interface UploadPhotoResponse {
  status: string;
  message: string;
  data: {
    task_id: number;
    photo_id: number;
    photo_url: string;
    uploaded_at: string;
  };
}

// Photo API functions
export const getTaskPhotos = async (taskId: number): Promise<TaskPhotosResponse> => {
  try {
    const response = await api.get<TaskPhotosResponse>(`/tasks/${taskId}/photo/`);
    console.log(`Get task photos ${taskId} response:`, response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Get task photos ${taskId} error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      // If 404, it likely means no photos exist for this task yet - return empty array
      if (error.response?.status === 404) {
        console.log(`No photos found for task ${taskId}, returning empty array`);
        return {
          status: 'success',
          data: {
            photos: []
          }
        };
      }
    }
    throw error;
  }
};

export const uploadTaskPhoto = async (
  taskId: number,
  photoUri: string,
  fileName: string
): Promise<UploadPhotoResponse> => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Extract file extension from fileName or URI
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';

    // Determine MIME type based on file extension
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'gif') {
      mimeType = 'image/gif';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
    }

    // Append the photo file to FormData
    // On React Native, we need to use a specific format for file uploads
    formData.append('photo', {
      uri: photoUri,
      type: mimeType,
      name: fileName,
    } as any);

    console.log(`Uploading photo for task ${taskId}:`, { fileName, mimeType });

    // Make the request with FormData - use singular 'photo' endpoint
    const response = await api.post<UploadPhotoResponse>(
      `/tasks/${taskId}/photo/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(`Upload photo response:`, response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Upload photo error:`, {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const errMessage = error.response?.data?.message || 'Failed to upload photo.';
      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while uploading photo.';
    throw new Error(errMessage);
  }
};

// Profile photo functions
export const uploadProfilePhoto = async (
  userId: number,
  photoUri: string,
  fileName: string
): Promise<{ status: string; message: string; data: { profile_photo: string } }> => {
  try {
    const formData = new FormData();

    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    let mimeType = 'image/jpeg';
    if (fileExtension === 'png') {
      mimeType = 'image/png';
    } else if (fileExtension === 'gif') {
      mimeType = 'image/gif';
    } else if (fileExtension === 'webp') {
      mimeType = 'image/webp';
    }

    formData.append('photo', {
      uri: photoUri,
      type: mimeType,
      name: fileName,
    } as any);

    console.log(`Uploading profile photo for user ${userId}:`, { fileName, mimeType });

    const response = await api.post(
      `/users/${userId}/upload-photo/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(`Upload profile photo response:`, response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Upload profile photo error:`, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to upload profile photo.');
    }
    throw error;
  }
};

export const deleteProfilePhoto = async (userId: number): Promise<{ status: string; message: string }> => {
  try {
    console.log(`Deleting profile photo for user ${userId}`);
    const response = await api.delete(`/users/${userId}/delete-photo/`);
    console.log(`Delete profile photo response:`, response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(`Delete profile photo error:`, error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to delete profile photo.');
    }
    throw error;
  }
};

// Comment interfaces
export interface Comment {
  id: number;
  content: string;
  timestamp: string; // ISO date string
  user: UserProfile;
  task: number; // task ID
}

export interface TaskCommentsResponse {
  status: string;
  message?: string;
  data: {
    comments: Comment[];
    pagination: PaginationInfo;
  };
}

export interface CreateCommentResponse {
  status: string;
  message: string;
  data: Comment;
}

// Comment API functions
export const getTaskComments = async (taskId: number, page = 1, limit = 20): Promise<TaskCommentsResponse> => {
  try {
    const response = await api.get<TaskCommentsResponse>(`/tasks/${taskId}/comments/`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Get task comments error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    throw error;
  }
};

export const createTaskComment = async (taskId: number, content: string): Promise<CreateCommentResponse> => {
  try {
    const response = await api.post<CreateCommentResponse>(`/tasks/${taskId}/comments/`, {
      content: content.trim()
    });
    console.log('Create comment response:', response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to create comment.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Create comment error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      // Extract detailed error message from backend
      const errorData = error.response?.data;
      let errMessage = 'Failed to create comment.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errMessage = errorData;
      } else if (errorData) {
        // Try to extract validation errors
        const validationErrors = Object.values(errorData).flat();
        if (validationErrors.length > 0) {
          errMessage = Array.isArray(validationErrors[0])
            ? validationErrors[0][0]
            : String(validationErrors[0]);
        }
      }

      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while trying to create comment.';
    throw new Error(errMessage);
  }
};

export const updateComment = async (commentId: number, content: string): Promise<CreateCommentResponse> => {
  try {
    const response = await api.patch<CreateCommentResponse>(`/comments/${commentId}/`, {
      content: content.trim()
    });
    console.log('Update comment response:', response.data);
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to update comment.');
    }
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Update comment error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorData = error.response?.data;
      let errMessage = 'Failed to update comment.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errMessage = errorData;
      } else if (errorData) {
        const validationErrors = Object.values(errorData).flat();
        if (validationErrors.length > 0) {
          errMessage = Array.isArray(validationErrors[0])
            ? validationErrors[0][0]
            : String(validationErrors[0]);
        }
      }

      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while updating comment.';
    throw new Error(errMessage);
  }
};

export const deleteComment = async (commentId: number): Promise<{ status: string; message: string }> => {
  try {
    const response = await api.delete(`/comments/${commentId}/`);
    console.log('Delete comment response:', response.data);
    
    // Handle 204 No Content response (may have empty body)
    if (response.status === 204) {
      return { status: 'success', message: 'Comment deleted successfully.' };
    }
    
    return response.data || { status: 'success', message: 'Comment deleted successfully.' };
  } catch (error) {
    if (error instanceof AxiosError) {
      // Handle 204 response that might be treated as error by some axios configurations
      if (error.response?.status === 204) {
        return { status: 'success', message: 'Comment deleted successfully.' };
      }
      
      console.error('Delete comment error:', {
        error: error.message,
        request: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorData = error.response?.data;
      let errMessage = 'Failed to delete comment.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errMessage = errorData;
      }

      throw new Error(errMessage);
    }
    const errMessage = (error as Error).message || 'An unexpected error occurred while deleting comment.';
    throw new Error(errMessage);
  }
};

// Report Types
export enum ReportType {
  SPAM = 'SPAM',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  HARASSMENT = 'HARASSMENT',
  FRAUD = 'FRAUD',
  FAKE_REQUEST = 'FAKE_REQUEST',
  NO_SHOW = 'NO_SHOW',
  SAFETY_CONCERN = 'SAFETY_CONCERN',
  OTHER = 'OTHER',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.SPAM]: 'Spam',
  [ReportType.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
  [ReportType.HARASSMENT]: 'Harassment',
  [ReportType.FRAUD]: 'Fraud',
  [ReportType.FAKE_REQUEST]: 'Fake Request',
  [ReportType.NO_SHOW]: 'No Show',
  [ReportType.SAFETY_CONCERN]: 'Safety Concern',
  [ReportType.OTHER]: 'Other',
};

export interface ReportResponse {
  status: string;
  message: string;
  data?: any;
}

/**
 * Submit a report for a task
 * @param taskId - ID of the task to report
 * @param reportType - Type of report
 * @param description - Description/details of the report
 */
export const submitReport = async (
  taskId: number,
  reportType: ReportType | string,
  description: string
): Promise<ReportResponse> => {
  try {
    const response = await api.post<ReportResponse>('/task-reports/', {
      task_id: taskId,
      report_type: reportType,
      description,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data;
      let errMessage = 'Failed to submit report.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (errorData?.errors) {
        errMessage = Object.values(errorData.errors).flat().join(', ');
      }

      throw new Error(errMessage);
    }
    throw error;
  }
};

/**
 * Submit a report for a user
 * @param userId - ID of the user to report
 * @param reportType - Type of report
 * @param description - Description/details of the report
 */
export const submitUserReport = async (
  userId: number,
  reportType: ReportType | string,
  description: string
): Promise<ReportResponse> => {
  try {
    const response = await api.post<ReportResponse>('/user-reports/', {
      reported_user_id: userId,
      report_type: reportType,
      description,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data;
      let errMessage = 'Failed to submit user report.';

      if (errorData?.message) {
        errMessage = errorData.message;
      } else if (errorData?.error) {
        errMessage = errorData.error;
      } else if (errorData?.errors) {
        errMessage = Object.values(errorData.errors).flat().join(', ');
      }

      throw new Error(errMessage);
    }
    throw error;
  }
};

export default api;
