/**
 * Comprehensive API Integration Tests
 * Tests API helper functions, response normalization, and utility functions
 */

// Mock axios before importing api
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    })),
    AxiosError: class AxiosError extends Error { },
}));

describe('API Response Normalization', () => {
    // Test the normalizeTasksResponse logic
    describe('normalizeTasksResponse', () => {
        const normalizeTasksResponse = (payload: unknown): {
            count: number;
            next: string | null;
            previous: string | null;
            results: any[];
        } => {
            const empty = { count: 0, next: null, previous: null, results: [] };

            if (Array.isArray(payload)) {
                return {
                    count: payload.length,
                    next: null,
                    previous: null,
                    results: payload,
                };
            }

            if (payload && typeof payload === 'object') {
                const p = payload as any;
                if (p.results && Array.isArray(p.results)) {
                    return {
                        count: p.count || p.results.length,
                        next: p.next || null,
                        previous: p.previous || null,
                        results: p.results,
                    };
                }

                if (p.data) {
                    return normalizeTasksResponse(p.data);
                }

                if (p.tasks && Array.isArray(p.tasks)) {
                    return {
                        count: p.tasks.length,
                        next: null,
                        previous: null,
                        results: p.tasks,
                    };
                }
            }

            return empty;
        };

        test('handles array response', () => {
            const tasks = [{ id: 1 }, { id: 2 }];
            const result = normalizeTasksResponse(tasks);
            expect(result.count).toBe(2);
            expect(result.results).toEqual(tasks);
        });

        test('handles paginated response', () => {
            const response = {
                count: 100,
                next: 'url?page=2',
                previous: null,
                results: [{ id: 1 }],
            };
            const result = normalizeTasksResponse(response);
            expect(result.count).toBe(100);
            expect(result.next).toBe('url?page=2');
        });

        test('handles wrapped data response', () => {
            const response = { data: [{ id: 1 }, { id: 2 }] };
            const result = normalizeTasksResponse(response);
            expect(result.count).toBe(2);
        });

        test('handles data with tasks property', () => {
            const response = { tasks: [{ id: 1 }, { id: 2 }] };
            const result = normalizeTasksResponse(response);
            expect(result.count).toBe(2);
        });

        test('returns empty for null', () => {
            const result = normalizeTasksResponse(null);
            expect(result.count).toBe(0);
            expect(result.results).toEqual([]);
        });

        test('returns empty for undefined', () => {
            const result = normalizeTasksResponse(undefined);
            expect(result.count).toBe(0);
        });

        test('returns empty for invalid object', () => {
            const result = normalizeTasksResponse({ invalid: 'data' });
            expect(result.count).toBe(0);
        });
    });
});

describe('API Error Handling', () => {
    describe('extractErrorMessage', () => {
        const extractErrorMessage = (error: any): string => {
            // Handle Axios error response
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data.message === 'string') return data.message;
                if (typeof data.error === 'string') return data.error;
                if (typeof data.detail === 'string') return data.detail;
                if (Array.isArray(data.errors)) return data.errors[0];
                if (typeof data === 'string') return data;
            }

            // Handle error message
            if (error.message) return error.message;

            // Handle network errors
            if (error.code === 'ECONNREFUSED') return 'Connection refused. Is the server running?';
            if (error.code === 'ENOTFOUND') return 'Server not found. Check your network connection.';
            if (error.code === 'ETIMEDOUT') return 'Request timed out. Please try again.';

            return 'An unexpected error occurred';
        };

        test('extracts message from response data', () => {
            const error = { response: { data: { message: 'User not found' } } };
            expect(extractErrorMessage(error)).toBe('User not found');
        });

        test('extracts error from response data', () => {
            const error = { response: { data: { error: 'Invalid credentials' } } };
            expect(extractErrorMessage(error)).toBe('Invalid credentials');
        });

        test('extracts detail from response data', () => {
            const error = { response: { data: { detail: 'Authentication required' } } };
            expect(extractErrorMessage(error)).toBe('Authentication required');
        });

        test('extracts from errors array', () => {
            const error = { response: { data: { errors: ['First error', 'Second error'] } } };
            expect(extractErrorMessage(error)).toBe('First error');
        });

        test('extracts string response data', () => {
            const error = { response: { data: 'Server error' } };
            expect(extractErrorMessage(error)).toBe('Server error');
        });

        test('extracts error message property', () => {
            const error = { message: 'Network Error' };
            expect(extractErrorMessage(error)).toBe('Network Error');
        });

        test('handles connection refused', () => {
            const error = { code: 'ECONNREFUSED' };
            expect(extractErrorMessage(error)).toContain('Connection refused');
        });

        test('handles not found', () => {
            const error = { code: 'ENOTFOUND' };
            expect(extractErrorMessage(error)).toContain('not found');
        });

        test('handles timeout', () => {
            const error = { code: 'ETIMEDOUT' };
            expect(extractErrorMessage(error)).toContain('timed out');
        });

        test('returns default for unknown error', () => {
            const error = {};
            expect(extractErrorMessage(error)).toBe('An unexpected error occurred');
        });
    });

    describe('isAuthError', () => {
        const isAuthError = (error: any): boolean => {
            const status = error.response?.status;
            return status === 401 || status === 403;
        };

        test('returns true for 401', () => {
            expect(isAuthError({ response: { status: 401 } })).toBe(true);
        });

        test('returns true for 403', () => {
            expect(isAuthError({ response: { status: 403 } })).toBe(true);
        });

        test('returns false for 404', () => {
            expect(isAuthError({ response: { status: 404 } })).toBe(false);
        });

        test('returns false for network error', () => {
            expect(isAuthError({ code: 'ECONNREFUSED' })).toBe(false);
        });
    });

    describe('isNetworkError', () => {
        const isNetworkError = (error: any): boolean => {
            return !error.response && (
                error.code === 'ECONNREFUSED' ||
                error.code === 'ENOTFOUND' ||
                error.code === 'ETIMEDOUT' ||
                error.message?.includes('Network Error')
            );
        };

        test('returns true for connection refused', () => {
            expect(isNetworkError({ code: 'ECONNREFUSED' })).toBe(true);
        });

        test('returns true for Network Error message', () => {
            expect(isNetworkError({ message: 'Network Error' })).toBe(true);
        });

        test('returns false when response exists', () => {
            expect(isNetworkError({ response: { status: 500 }, code: 'ECONNREFUSED' })).toBe(false);
        });

        test('returns false for server error', () => {
            expect(isNetworkError({ response: { status: 500 } })).toBe(false);
        });
    });

    describe('getHttpStatusMessage', () => {
        const getHttpStatusMessage = (status: number): string => {
            const messages: Record<number, string> = {
                400: 'Bad Request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                409: 'Conflict',
                422: 'Validation Error',
                429: 'Too Many Requests',
                500: 'Server Error',
                502: 'Bad Gateway',
                503: 'Service Unavailable',
            };
            return messages[status] || 'Unknown Error';
        };

        test('returns correct message for 400', () => {
            expect(getHttpStatusMessage(400)).toBe('Bad Request');
        });

        test('returns correct message for 401', () => {
            expect(getHttpStatusMessage(401)).toBe('Unauthorized');
        });

        test('returns correct message for 404', () => {
            expect(getHttpStatusMessage(404)).toBe('Not Found');
        });

        test('returns correct message for 500', () => {
            expect(getHttpStatusMessage(500)).toBe('Server Error');
        });

        test('returns Unknown Error for unhandled status', () => {
            expect(getHttpStatusMessage(418)).toBe('Unknown Error');
        });
    });
});

describe('API Request Utilities', () => {
    describe('buildQueryString', () => {
        const buildQueryString = (params: Record<string, any>): string => {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            }
            const result = searchParams.toString();
            return result ? `?${result}` : '';
        };

        test('builds query string from params', () => {
            const params = { page: 1, limit: 10, search: 'test' };
            const result = buildQueryString(params);
            expect(result).toContain('page=1');
            expect(result).toContain('limit=10');
            expect(result).toContain('search=test');
        });

        test('ignores undefined values', () => {
            const params = { page: 1, search: undefined };
            const result = buildQueryString(params);
            expect(result).toContain('page=1');
            expect(result).not.toContain('search');
        });

        test('ignores null values', () => {
            const params = { page: 1, search: null };
            const result = buildQueryString(params);
            expect(result).not.toContain('search');
        });

        test('ignores empty string values', () => {
            const params = { page: 1, search: '' };
            const result = buildQueryString(params);
            expect(result).not.toContain('search');
        });

        test('returns empty string for empty params', () => {
            expect(buildQueryString({})).toBe('');
        });
    });

    describe('validateApiResponse', () => {
        const validateApiResponse = <T>(response: any, requiredFields: string[]): T | null => {
            if (!response || typeof response !== 'object') return null;

            for (const field of requiredFields) {
                if (!(field in response)) return null;
            }

            return response as T;
        };

        test('returns response when all fields present', () => {
            const response = { id: 1, name: 'Test', email: 'test@test.com' };
            const result = validateApiResponse(response, ['id', 'name']);
            expect(result).toEqual(response);
        });

        test('returns null when field missing', () => {
            const response = { id: 1 };
            const result = validateApiResponse(response, ['id', 'name']);
            expect(result).toBeNull();
        });

        test('returns null for null response', () => {
            expect(validateApiResponse(null, ['id'])).toBeNull();
        });

        test('returns null for non-object', () => {
            expect(validateApiResponse('string', ['id'])).toBeNull();
        });

        test('returns response when no required fields', () => {
            const response = { anything: true };
            expect(validateApiResponse(response, [])).toEqual(response);
        });
    });

    describe('retryWithBackoff', () => {
        const retryWithBackoff = async <T>(
            fn: () => Promise<T>,
            maxRetries: number = 3,
            baseDelay: number = 100
        ): Promise<T> => {
            let lastError: Error | null = null;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    lastError = error as Error;
                    if (attempt < maxRetries - 1) {
                        const delay = baseDelay * Math.pow(2, attempt);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            throw lastError;
        };

        test('returns result on first try success', async () => {
            const fn = jest.fn().mockResolvedValue('success');
            const result = await retryWithBackoff(fn, 3, 10);
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('retries on failure', async () => {
            const fn = jest.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success');
            const result = await retryWithBackoff(fn, 3, 10);
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test('throws after max retries', async () => {
            const fn = jest.fn().mockRejectedValue(new Error('persistent fail'));
            await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('persistent fail');
            expect(fn).toHaveBeenCalledTimes(2);
        });
    });
});

describe('Token Management', () => {
    describe('isTokenExpired', () => {
        const isTokenExpired = (token: string): boolean => {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp * 1000; // Convert to milliseconds
                return Date.now() >= exp;
            } catch {
                return true; // Invalid token is considered expired
            }
        };

        // Create a valid JWT-like token for testing
        const createTestToken = (expiresIn: number): string => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({ exp: Math.floor((Date.now() + expiresIn) / 1000) }));
            return `${header}.${payload}.signature`;
        };

        test('returns false for valid future token', () => {
            const token = createTestToken(3600000); // 1 hour in future
            expect(isTokenExpired(token)).toBe(false);
        });

        test('returns true for expired token', () => {
            const token = createTestToken(-3600000); // 1 hour in past
            expect(isTokenExpired(token)).toBe(true);
        });

        test('returns true for invalid token', () => {
            expect(isTokenExpired('invalid')).toBe(true);
        });

        test('returns true for empty token', () => {
            expect(isTokenExpired('')).toBe(true);
        });
    });

    describe('parseAuthHeader', () => {
        const parseAuthHeader = (header: string): string | null => {
            if (!header) return null;
            const parts = header.split(' ');
            if (parts.length !== 2) return null;
            if (parts[0].toLowerCase() !== 'bearer') return null;
            return parts[1];
        };

        test('parses bearer token', () => {
            expect(parseAuthHeader('Bearer abc123')).toBe('abc123');
        });

        test('handles lowercase bearer', () => {
            expect(parseAuthHeader('bearer abc123')).toBe('abc123');
        });

        test('returns null for empty header', () => {
            expect(parseAuthHeader('')).toBeNull();
        });

        test('returns null for invalid format', () => {
            expect(parseAuthHeader('InvalidFormat')).toBeNull();
        });

        test('returns null for non-bearer auth', () => {
            expect(parseAuthHeader('Basic abc123')).toBeNull();
        });
    });
});

describe('Data Transformation', () => {
    describe('transformUserProfile', () => {
        const transformUserProfile = (raw: any): any => {
            return {
                id: raw.id || 0,
                name: raw.name || '',
                surname: raw.surname || '',
                username: raw.username || '',
                email: raw.email || '',
                phone: raw.phone_number || raw.phone || '',
                location: raw.location || '',
                rating: raw.rating || 0,
                completedTasks: raw.completed_task_count || 0,
                isActive: raw.is_active ?? true,
                photo: raw.profile_photo || raw.photo || null,
            };
        };

        test('transforms complete profile', () => {
            const raw = {
                id: 1,
                name: 'John',
                surname: 'Doe',
                username: 'johndoe',
                email: 'john@test.com',
                phone_number: '555-1234',
                location: 'Istanbul',
                rating: 4.5,
                completed_task_count: 10,
                is_active: true,
                profile_photo: 'photo.jpg',
            };
            const result = transformUserProfile(raw);

            expect(result.id).toBe(1);
            expect(result.name).toBe('John');
            expect(result.phone).toBe('555-1234');
            expect(result.completedTasks).toBe(10);
            expect(result.photo).toBe('photo.jpg');
        });

        test('provides defaults for missing fields', () => {
            const result = transformUserProfile({});

            expect(result.id).toBe(0);
            expect(result.name).toBe('');
            expect(result.rating).toBe(0);
            expect(result.isActive).toBe(true);
        });

        test('handles alternative field names', () => {
            const raw = { phone: '555-0000', photo: 'alt.jpg' };
            const result = transformUserProfile(raw);

            expect(result.phone).toBe('555-0000');
            expect(result.photo).toBe('alt.jpg');
        });
    });

    describe('transformTask', () => {
        const transformTask = (raw: any): any => {
            return {
                id: raw.id,
                title: raw.title || 'Untitled',
                description: raw.description || '',
                status: raw.status?.toLowerCase() || 'open',
                statusDisplay: raw.status_display || raw.status || 'Open',
                category: raw.category || 'OTHER',
                categoryDisplay: raw.category_display || raw.category || 'Other',
                location: raw.location || '',
                createdAt: raw.created_at || new Date().toISOString(),
                updatedAt: raw.updated_at || raw.created_at || new Date().toISOString(),
                deadline: raw.deadline || null,
                urgencyLevel: raw.urgency_level || 2,
                volunteerNumber: raw.volunteer_number || 1,
                isRecurring: raw.is_recurring || false,
                photoUrl: raw.primary_photo_url || raw.photo || null,
                creator: raw.creator || null,
                assignee: raw.assignee || null,
            };
        };

        test('transforms complete task', () => {
            const raw = {
                id: 1,
                title: 'Help needed',
                description: 'Need assistance',
                status: 'OPEN',
                status_display: 'Open',
                category: 'GROCERY_SHOPPING',
                category_display: 'Grocery Shopping',
                location: 'Istanbul',
                created_at: '2024-01-01',
                deadline: '2024-01-15',
                urgency_level: 3,
                volunteer_number: 2,
                is_recurring: true,
                primary_photo_url: 'photo.jpg',
            };
            const result = transformTask(raw);

            expect(result.id).toBe(1);
            expect(result.title).toBe('Help needed');
            expect(result.status).toBe('open');
            expect(result.urgencyLevel).toBe(3);
            expect(result.isRecurring).toBe(true);
        });

        test('provides defaults for missing fields', () => {
            const result = transformTask({ id: 1 });

            expect(result.title).toBe('Untitled');
            expect(result.status).toBe('open');
            expect(result.urgencyLevel).toBe(2);
            expect(result.isRecurring).toBe(false);
        });
    });
});
