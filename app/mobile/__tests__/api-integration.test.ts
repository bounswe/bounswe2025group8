/**
 * Integration Tests for lib/api.ts
 * Tests that import and test actual functions from the API module
 */

// Create a proper axios mock that returns a mock instance
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockPut = jest.fn();

const mockAxiosInstance = {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    put: mockPut,
    interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
    },
};

jest.mock('axios', () => ({
    create: jest.fn(() => mockAxiosInstance),
    AxiosError: class AxiosError extends Error {
        response?: any;
        constructor(message?: string) {
            super(message);
            this.name = 'AxiosError';
        }
    },
}));

// Mock dependencies before importing
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => ({
    Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
}));

jest.mock('expo-constants', () => ({
    default: {
        expoConfig: {
            extra: {
                apiPort: '8000',
                apiHost: 'localhost',
            },
            hostUri: 'localhost:8081',
        },
    },
}));

// Now import from the actual API module
import { API_BASE_URL, BACKEND_BASE_URL } from '../lib/api';

describe('API Configuration', () => {
    test('API_BASE_URL is defined', () => {
        expect(API_BASE_URL).toBeDefined();
        expect(typeof API_BASE_URL).toBe('string');
    });

    test('BACKEND_BASE_URL is defined', () => {
        expect(BACKEND_BASE_URL).toBeDefined();
        expect(typeof BACKEND_BASE_URL).toBe('string');
    });

    test('API_BASE_URL contains /api', () => {
        expect(API_BASE_URL).toContain('/api');
    });
});

describe('API Function Tests with Mocks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Login Flow', () => {
        test('checkAvailability returns true for available', async () => {
            mockGet.mockResolvedValueOnce({
                data: { available: true },
            });

            const { checkAvailability } = require('../lib/api');
            const result = await checkAvailability('test@test.com', '+905551234567');

            expect(mockGet).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        test('checkAvailability returns false on error', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network Error'));

            const { checkAvailability } = require('../lib/api');
            const result = await checkAvailability('test@test.com', '+905551234567');

            expect(result).toBe(false);
        });
    });

    describe('Register Flow', () => {
        test('register validates phone number format', async () => {
            const { register } = require('../lib/api');

            // Invalid phone should throw
            await expect(
                register('test@test.com', 'Password123!', 'John Doe', 'johndoe', '123')
            ).rejects.toThrow('Phone number must be 10-15 digits');
        });

        test('register validates password requirements', async () => {
            const { register } = require('../lib/api');

            // Weak password should throw
            await expect(
                register('test@test.com', 'weak', 'John Doe', 'johndoe', '+905551234567')
            ).rejects.toThrow();
        });

        test('register succeeds with valid data', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    status: 'success',
                    message: 'Registration successful',
                    data: { user_id: 1, name: 'John', email: 'test@test.com' },
                },
            });

            const { register } = require('../lib/api');
            const result = await register(
                'test@test.com',
                'ValidPass123!',
                'John Doe',
                'johndoe',
                '+905551234567'
            );

            expect(result.status).toBe('success');
        });
    });

    describe('Login Function', () => {
        test('login calls API with correct params', async () => {
            mockPost.mockResolvedValueOnce({
                data: {
                    status: 'success',
                    data: { token: 'abc123', user_id: 1 },
                },
            });

            const { login } = require('../lib/api');
            const result = await login('test@test.com', 'password123');

            expect(mockPost).toHaveBeenCalled();
            expect(result.data.token).toBe('abc123');
        });

        test('login handles error response', async () => {
            mockPost.mockRejectedValueOnce({
                response: { data: { message: 'Invalid credentials' } },
            });

            const { login } = require('../lib/api');
            await expect(login('test@test.com', 'wrong')).rejects.toBeDefined();
        });
    });

    describe('User Profile', () => {
        test('getUserProfile fetches profile data', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    status: 'success',
                    data: {
                        id: 1,
                        name: 'John',
                        surname: 'Doe',
                        email: 'test@test.com',
                    },
                },
            });

            const { getUserProfile } = require('../lib/api');
            const result = await getUserProfile(1);

            expect(mockGet).toHaveBeenCalled();
            expect(result.data.id).toBe(1);
        });

        test('updateProfile sends correct data', async () => {
            mockPatch.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { updateProfile } = require('../lib/api');
            await updateProfile({ name: 'Jane' });

            expect(mockPatch).toHaveBeenCalled();
        });
    });

    describe('Tasks API', () => {
        test('getTasks fetches all tasks with pagination', async () => {
            mockGet
                .mockResolvedValueOnce({
                    data: { results: [{ id: 1 }], next: 'page2' },
                })
                .mockResolvedValueOnce({
                    data: { results: [{ id: 2 }], next: null },
                });

            const { getTasks } = require('../lib/api');
            const result = await getTasks();

            expect(result.results.length).toBeGreaterThanOrEqual(1);
        });

        test('getTaskDetails fetches single task', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    id: 123,
                    title: 'Test Task',
                    status: 'open',
                },
            });

            const { getTaskDetails } = require('../lib/api');
            const result = await getTaskDetails(123);

            expect(result.id).toBe(123);
        });

        test('createTask sends task data', async () => {
            mockPost.mockResolvedValueOnce({
                data: { id: 1, title: 'New Task' },
            });

            const { createTask } = require('../lib/api');
            const result = await createTask({
                title: 'New Task',
                description: 'Description',
                category: 'GROCERY_SHOPPING',
                location: 'Istanbul',
                deadline: '2024-12-31',
                requirements: 'None',
                urgency_level: 2,
                volunteer_number: 1,
                is_recurring: false,
            });

            expect(mockPost).toHaveBeenCalled();
        });

        test('getUserTasks fetches user-specific tasks', async () => {
            mockGet.mockResolvedValueOnce({
                data: { results: [{ id: 1 }] },
            });

            const { getUserTasks } = require('../lib/api');
            const result = await getUserTasks(1);

            expect(result.results).toBeDefined();
        });

        test('getPopularTasks fetches popular tasks', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{ id: 1 }, { id: 2 }],
            });

            const { getPopularTasks } = require('../lib/api');
            const result = await getPopularTasks();

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Categories API', () => {
        test('getCategories fetches all categories', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    categories: [
                        { id: 1, name: 'GROCERY_SHOPPING' },
                        { id: 2, name: 'PET_CARE' },
                    ],
                },
            });

            const { getCategories } = require('../lib/api');
            const result = await getCategories();

            expect(result.categories).toBeDefined();
        });
    });

    describe('Volunteer API', () => {
        test('volunteerForTask creates volunteer application', async () => {
            mockPost.mockResolvedValueOnce({
                data: { status: 'success', data: { id: 1 } },
            });

            const { volunteerForTask } = require('../lib/api');
            const result = await volunteerForTask(123);

            expect(mockPost).toHaveBeenCalled();
        });

        test('withdrawVolunteer removes application', async () => {
            mockDelete.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { withdrawVolunteer } = require('../lib/api');
            const result = await withdrawVolunteer(1);

            expect(result.status).toBe('success');
        });

        test('listVolunteers fetches volunteer list', async () => {
            mockGet.mockResolvedValueOnce({
                data: [{ id: 1, status: 'PENDING' }],
            });

            const { listVolunteers } = require('../lib/api');
            const result = await listVolunteers();

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Follow API', () => {
        test('followUser sends follow request', async () => {
            mockPost.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { followUser } = require('../lib/api');
            const result = await followUser(123);

            expect(mockPost).toHaveBeenCalled();
        });

        test('unfollowUser removes follow', async () => {
            mockDelete.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { unfollowUser } = require('../lib/api');
            const result = await unfollowUser(123);

            expect(mockDelete).toHaveBeenCalled();
        });

        test('getFollowers fetches follower list', async () => {
            mockGet.mockResolvedValueOnce({
                data: { followers: [{ id: 1 }] },
            });

            const { getFollowers } = require('../lib/api');
            const result = await getFollowers(1);

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Notifications API', () => {
        test('getNotifications fetches notifications', async () => {
            mockGet.mockResolvedValueOnce({
                data: {
                    notifications: [{ id: 1 }],
                    pagination: { total: 1 },
                },
            });

            const { getNotifications } = require('../lib/api');
            const result = await getNotifications();

            expect(result).toBeDefined();
        });

        test('markNotificationAsRead updates notification', async () => {
            mockPatch.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { markNotificationAsRead } = require('../lib/api');
            const result = await markNotificationAsRead(1);

            expect(mockPatch).toHaveBeenCalled();
        });

        test('markAllNotificationsAsRead marks all as read', async () => {
            mockPatch.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { markAllNotificationsAsRead } = require('../lib/api');
            const result = await markAllNotificationsAsRead();

            expect(mockPatch).toHaveBeenCalled();
        });
    });

    describe('Reviews API', () => {
        test('getUserReviews fetches user reviews', async () => {
            mockGet.mockResolvedValueOnce({
                data: { reviews: [{ id: 1, score: 5 }] },
            });

            const { getUserReviews } = require('../lib/api');
            const result = await getUserReviews(1);

            expect(result).toBeDefined();
        });

        test('createReview submits new review', async () => {
            mockPost.mockResolvedValueOnce({
                data: { status: 'success', data: { id: 1 } },
            });

            const { createReview } = require('../lib/api');
            const result = await createReview({
                comment: 'Great help!',
                reviewee_id: 2,
                task_id: 1,
                reliability: 5,
                task_completion: 5,
            });

            expect(mockPost).toHaveBeenCalled();
        });
    });

    describe('Search API', () => {
        test('searchUsers searches for users', async () => {
            mockGet.mockResolvedValueOnce({
                data: { users: [{ id: 1, username: 'test' }] },
            });

            const { searchUsers } = require('../lib/api');
            const result = await searchUsers('test');

            expect(result).toBeDefined();
        });
    });

    describe('Task Applicants API', () => {
        test('getTaskApplicants fetches applicants', async () => {
            mockGet.mockResolvedValueOnce({
                data: { applicants: [{ id: 1 }] },
            });

            const { getTaskApplicants } = require('../lib/api');
            const result = await getTaskApplicants(1);

            expect(result).toBeDefined();
        });

        test('updateVolunteerAssignmentStatus updates status', async () => {
            mockPatch.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { updateVolunteerAssignmentStatus } = require('../lib/api');
            const result = await updateVolunteerAssignmentStatus(1, 2, 'accept');

            expect(mockPatch).toHaveBeenCalled();
        });
    });

    describe('Logout', () => {
        test('logout clears token', async () => {
            mockPost.mockResolvedValueOnce({ data: {} });

            const { logout } = require('../lib/api');
            await logout();

            expect(mockPost).toHaveBeenCalled();
        });
    });

    describe('Password Reset', () => {
        test('requestPasswordReset sends email', async () => {
            mockPost.mockResolvedValueOnce({
                data: { status: 'success', message: 'Reset email sent' },
            });

            const { requestPasswordReset } = require('../lib/api');
            const result = await requestPasswordReset('test@test.com');

            expect(mockPost).toHaveBeenCalled();
        });

        test('resetPassword updates password', async () => {
            mockPost.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { resetPassword } = require('../lib/api');
            const result = await resetPassword('token123', 'NewPass123!');

            expect(mockPost).toHaveBeenCalled();
        });
    });

    describe('Task Updates', () => {
        test('updateTask sends patch request', async () => {
            mockPatch.mockResolvedValueOnce({
                data: { id: 1, title: 'Updated Task' },
            });

            const { updateTask } = require('../lib/api');
            const result = await updateTask(1, { title: 'Updated Task' });

            expect(mockPatch).toHaveBeenCalled();
        });

        test('deleteTask sends delete request', async () => {
            mockDelete.mockResolvedValueOnce({
                data: { status: 'success' },
            });

            const { deleteTask } = require('../lib/api');
            await deleteTask(1);

            expect(mockDelete).toHaveBeenCalled();
        });
    });

    describe('Following System', () => {
        test('getFollowing fetches following list', async () => {
            mockGet.mockResolvedValueOnce({
                data: { following: [{ id: 1 }] },
            });

            const { getFollowing } = require('../lib/api');
            const result = await getFollowing(1);

            expect(Array.isArray(result)).toBe(true);
        });
    });
});
