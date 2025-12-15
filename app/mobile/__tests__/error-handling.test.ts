/**
 * Unit Tests for Error Handling
 * Tests API error processing, user-facing messages, and error state management
 */

describe('API Error Processing', () => {
    describe('Error Type Detection', () => {
        const getErrorType = (error: { response?: { status?: number }; code?: string; message?: string }): string => {
            // Network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
                return 'network';
            }
            if (error.message?.includes('timeout')) {
                return 'timeout';
            }

            // HTTP errors
            const status = error.response?.status;
            if (!status) return 'unknown';

            if (status === 400) return 'validation';
            if (status === 401) return 'unauthorized';
            if (status === 403) return 'forbidden';
            if (status === 404) return 'notFound';
            if (status === 409) return 'conflict';
            if (status >= 500) return 'server';

            return 'unknown';
        };

        test('identifies network errors', () => {
            expect(getErrorType({ code: 'ECONNREFUSED' })).toBe('network');
            expect(getErrorType({ code: 'NETWORK_ERROR' })).toBe('network');
        });

        test('identifies timeout errors', () => {
            expect(getErrorType({ message: 'timeout of 10000ms exceeded' })).toBe('timeout');
        });

        test('identifies validation errors (400)', () => {
            expect(getErrorType({ response: { status: 400 } })).toBe('validation');
        });

        test('identifies unauthorized errors (401)', () => {
            expect(getErrorType({ response: { status: 401 } })).toBe('unauthorized');
        });

        test('identifies forbidden errors (403)', () => {
            expect(getErrorType({ response: { status: 403 } })).toBe('forbidden');
        });

        test('identifies not found errors (404)', () => {
            expect(getErrorType({ response: { status: 404 } })).toBe('notFound');
        });

        test('identifies conflict errors (409)', () => {
            expect(getErrorType({ response: { status: 409 } })).toBe('conflict');
        });

        test('identifies server errors (5xx)', () => {
            expect(getErrorType({ response: { status: 500 } })).toBe('server');
            expect(getErrorType({ response: { status: 503 } })).toBe('server');
        });

        test('returns unknown for unrecognized errors', () => {
            expect(getErrorType({})).toBe('unknown');
            expect(getErrorType({ response: { status: 418 } })).toBe('unknown');
        });
    });

    describe('User-Friendly Error Messages', () => {
        const getErrorMessage = (errorType: string, context?: string): string => {
            const messages: Record<string, string> = {
                network: 'Unable to connect. Please check your internet connection.',
                timeout: 'Request timed out. Please try again.',
                unauthorized: 'Your session has expired. Please sign in again.',
                forbidden: 'You do not have permission to perform this action.',
                notFound: context ? `${context} not found.` : 'The requested item was not found.',
                validation: 'Please check your input and try again.',
                conflict: 'This action conflicts with existing data.',
                server: 'Something went wrong on our end. Please try again later.',
                unknown: 'An unexpected error occurred. Please try again.',
            };
            return messages[errorType] || messages.unknown;
        };

        test('returns network error message', () => {
            expect(getErrorMessage('network')).toBe('Unable to connect. Please check your internet connection.');
        });

        test('returns timeout error message', () => {
            expect(getErrorMessage('timeout')).toBe('Request timed out. Please try again.');
        });

        test('returns unauthorized message', () => {
            expect(getErrorMessage('unauthorized')).toBe('Your session has expired. Please sign in again.');
        });

        test('returns not found message with context', () => {
            expect(getErrorMessage('notFound', 'Task')).toBe('Task not found.');
        });

        test('returns default not found message', () => {
            expect(getErrorMessage('notFound')).toBe('The requested item was not found.');
        });

        test('returns unknown error message for undefined types', () => {
            expect(getErrorMessage('undefined_type')).toBe('An unexpected error occurred. Please try again.');
        });
    });

    describe('Error Response Extraction', () => {
        const extractErrorMessage = (error: any): string => {
            // Try to extract from various response formats
            if (error.response?.data?.message) {
                return error.response.data.message;
            }
            if (error.response?.data?.error) {
                return error.response.data.error;
            }
            if (error.response?.data?.detail) {
                return error.response.data.detail;
            }
            if (Array.isArray(error.response?.data?.errors)) {
                return error.response.data.errors.join(', ');
            }
            if (error.message) {
                return error.message;
            }
            return 'An error occurred';
        };

        test('extracts message from response.data.message', () => {
            const error = { response: { data: { message: 'Invalid email format' } } };
            expect(extractErrorMessage(error)).toBe('Invalid email format');
        });

        test('extracts error from response.data.error', () => {
            const error = { response: { data: { error: 'Email already exists' } } };
            expect(extractErrorMessage(error)).toBe('Email already exists');
        });

        test('extracts detail from response.data.detail', () => {
            const error = { response: { data: { detail: 'Authentication failed' } } };
            expect(extractErrorMessage(error)).toBe('Authentication failed');
        });

        test('joins array of errors', () => {
            const error = { response: { data: { errors: ['Invalid email', 'Password too short'] } } };
            expect(extractErrorMessage(error)).toBe('Invalid email, Password too short');
        });

        test('falls back to error.message', () => {
            const error = { message: 'Network error' };
            expect(extractErrorMessage(error)).toBe('Network error');
        });

        test('returns default message when no info available', () => {
            expect(extractErrorMessage({})).toBe('An error occurred');
        });
    });
});

describe('Error State Management', () => {
    interface ErrorState {
        hasError: boolean;
        message: string | null;
        type: string | null;
        retryable: boolean;
    }

    const createErrorState = (message: string, type: string): ErrorState => ({
        hasError: true,
        message,
        type,
        retryable: ['network', 'timeout', 'server'].includes(type),
    });

    const clearErrorState = (): ErrorState => ({
        hasError: false,
        message: null,
        type: null,
        retryable: false,
    });

    test('creates error state with message and type', () => {
        const state = createErrorState('Connection failed', 'network');
        expect(state.hasError).toBe(true);
        expect(state.message).toBe('Connection failed');
        expect(state.type).toBe('network');
    });

    test('marks network errors as retryable', () => {
        expect(createErrorState('', 'network').retryable).toBe(true);
    });

    test('marks timeout errors as retryable', () => {
        expect(createErrorState('', 'timeout').retryable).toBe(true);
    });

    test('marks server errors as retryable', () => {
        expect(createErrorState('', 'server').retryable).toBe(true);
    });

    test('marks validation errors as not retryable', () => {
        expect(createErrorState('', 'validation').retryable).toBe(false);
    });

    test('marks unauthorized errors as not retryable', () => {
        expect(createErrorState('', 'unauthorized').retryable).toBe(false);
    });

    test('clears error state', () => {
        const clearedState = clearErrorState();
        expect(clearedState.hasError).toBe(false);
        expect(clearedState.message).toBeNull();
        expect(clearedState.type).toBeNull();
        expect(clearedState.retryable).toBe(false);
    });
});

describe('Form Validation Errors', () => {
    interface FieldError {
        field: string;
        message: string;
    }

    const parseValidationErrors = (errors: Record<string, string[]>): FieldError[] => {
        return Object.entries(errors).flatMap(([field, messages]) =>
            messages.map(message => ({ field, message }))
        );
    };

    const getFirstError = (errors: FieldError[]): string | null => {
        return errors[0]?.message || null;
    };

    const getErrorForField = (errors: FieldError[], field: string): string | null => {
        return errors.find(e => e.field === field)?.message || null;
    };

    const validationErrors = {
        email: ['Invalid email format', 'Email already registered'],
        password: ['Password too short'],
    };

    test('parses validation errors into flat list', () => {
        const parsed = parseValidationErrors(validationErrors);
        expect(parsed).toHaveLength(3);
    });

    test('gets first error message', () => {
        const parsed = parseValidationErrors(validationErrors);
        expect(getFirstError(parsed)).toBe('Invalid email format');
    });

    test('gets error for specific field', () => {
        const parsed = parseValidationErrors(validationErrors);
        expect(getErrorForField(parsed, 'password')).toBe('Password too short');
    });

    test('returns null for field without errors', () => {
        const parsed = parseValidationErrors(validationErrors);
        expect(getErrorForField(parsed, 'username')).toBeNull();
    });

    test('returns null for empty errors', () => {
        expect(getFirstError([])).toBeNull();
    });
});
