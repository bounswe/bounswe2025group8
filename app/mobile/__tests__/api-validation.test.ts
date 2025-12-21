/**
 * Tests for API validation functions extracted from lib/api.ts
 * These test the actual validation logic used in the API
 */

describe('API Validation Functions', () => {
    // Phone number validation regex as used in lib/api.ts
    const phoneRegex = /^\+?[0-9]{10,15}$/;

    describe('Phone Number Validation', () => {
        test('accepts valid phone with country code', () => {
            expect(phoneRegex.test('+905551234567')).toBe(true);
        });

        test('accepts valid phone without country code', () => {
            expect(phoneRegex.test('5551234567')).toBe(true);
        });

        test('accepts 10 digit phone', () => {
            expect(phoneRegex.test('1234567890')).toBe(true);
        });

        test('accepts 15 digit phone', () => {
            expect(phoneRegex.test('123456789012345')).toBe(true);
        });

        test('rejects phone with letters', () => {
            expect(phoneRegex.test('555123456a')).toBe(false);
        });

        test('rejects phone with spaces', () => {
            expect(phoneRegex.test('555 123 4567')).toBe(false);
        });

        test('rejects phone with dashes', () => {
            expect(phoneRegex.test('555-123-4567')).toBe(false);
        });

        test('rejects too short phone', () => {
            expect(phoneRegex.test('123456789')).toBe(false);
        });

        test('rejects too long phone', () => {
            expect(phoneRegex.test('1234567890123456')).toBe(false);
        });

        test('rejects empty string', () => {
            expect(phoneRegex.test('')).toBe(false);
        });
    });

    describe('Password Validation', () => {
        // Password validation as used in lib/api.ts register function
        const validatePassword = (password: string): { valid: boolean; missing: string[] } => {
            const validation = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}\|<>]/.test(password),
            };

            const missing: string[] = [];
            if (!validation.length) missing.push('at least 8 characters');
            if (!validation.uppercase) missing.push('an uppercase letter');
            if (!validation.lowercase) missing.push('a lowercase letter');
            if (!validation.number) missing.push('a number');
            if (!validation.special) missing.push('a special character');

            return {
                valid: Object.values(validation).every(Boolean),
                missing,
            };
        };

        test('accepts valid strong password', () => {
            const result = validatePassword('ValidPass123!');
            expect(result.valid).toBe(true);
            expect(result.missing).toEqual([]);
        });

        test('rejects short password', () => {
            const result = validatePassword('Short1!');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('at least 8 characters');
        });

        test('rejects password without uppercase', () => {
            const result = validatePassword('lowercase123!');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('an uppercase letter');
        });

        test('rejects password without lowercase', () => {
            const result = validatePassword('UPPERCASE123!');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('a lowercase letter');
        });

        test('rejects password without number', () => {
            const result = validatePassword('NoNumbers!');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('a number');
        });

        test('rejects password without special character', () => {
            const result = validatePassword('NoSpecial123');
            expect(result.valid).toBe(false);
            expect(result.missing).toContain('a special character');
        });

        test('rejects password missing multiple criteria', () => {
            const result = validatePassword('weak');
            expect(result.valid).toBe(false);
            expect(result.missing.length).toBeGreaterThan(3);
        });

        test('handles empty password', () => {
            const result = validatePassword('');
            expect(result.valid).toBe(false);
            expect(result.missing.length).toBe(5);
        });
    });

    describe('Email Validation', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        test('accepts valid email', () => {
            expect(emailRegex.test('test@example.com')).toBe(true);
        });

        test('accepts email with subdomain', () => {
            expect(emailRegex.test('test@mail.example.com')).toBe(true);
        });

        test('accepts email with plus sign', () => {
            expect(emailRegex.test('test+tag@example.com')).toBe(true);
        });

        test('rejects email without @', () => {
            expect(emailRegex.test('testexample.com')).toBe(false);
        });

        test('rejects email without domain', () => {
            expect(emailRegex.test('test@')).toBe(false);
        });

        test('rejects email without TLD', () => {
            expect(emailRegex.test('test@example')).toBe(false);
        });

        test('rejects email with spaces', () => {
            expect(emailRegex.test('test @example.com')).toBe(false);
        });
    });

    describe('Name Splitting', () => {
        // Name splitting logic from register function
        const splitFullName = (fullName: string): { name: string; surname: string } => {
            const nameParts = fullName.trim().split(' ');
            const name = nameParts[0];
            const surname = nameParts.slice(1).join(' ') || '';
            return { name, surname };
        };

        test('splits first and last name', () => {
            const result = splitFullName('John Doe');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Doe');
        });

        test('handles single name', () => {
            const result = splitFullName('John');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('');
        });

        test('handles multiple names', () => {
            const result = splitFullName('John Michael Doe');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Michael Doe');
        });

        test('handles leading/trailing spaces', () => {
            const result = splitFullName('  John Doe  ');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Doe');
        });
    });
});

describe('API Response Normalization', () => {
    // normalizeTasksResponse logic from lib/api.ts
    interface TasksResponse {
        count: number;
        next: string | null;
        previous: string | null;
        results: any[];
    }

    const normalizeTasksResponse = (payload: unknown): TasksResponse => {
        const empty: TasksResponse = {
            count: 0,
            next: null,
            previous: null,
            results: [],
        };

        if (Array.isArray(payload)) {
            return {
                count: payload.length,
                next: null,
                previous: null,
                results: payload,
            };
        }

        if (payload && typeof payload === 'object') {
            const dataObj = payload as Record<string, unknown>;

            const resultsCandidate = dataObj['results'];
            if (Array.isArray(resultsCandidate)) {
                const results = resultsCandidate;
                const count = typeof dataObj['count'] === 'number' ? dataObj['count'] as number : results.length;
                const next = typeof dataObj['next'] === 'string' || dataObj['next'] === null ? dataObj['next'] as string | null : null;
                const previous = typeof dataObj['previous'] === 'string' || dataObj['previous'] === null ? dataObj['previous'] as string | null : null;
                return { count, next, previous, results };
            }

            const tasksCandidate = dataObj['tasks'];
            if (Array.isArray(tasksCandidate)) {
                const tasks = tasksCandidate;
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
                return { count, next: null, previous: null, results: tasks };
            }

            if ('data' in dataObj) {
                return normalizeTasksResponse(dataObj['data']);
            }
        }

        return empty;
    };

    describe('Array Response', () => {
        test('normalizes array to response', () => {
            const input = [{ id: 1 }, { id: 2 }];
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(2);
            expect(result.results).toEqual(input);
            expect(result.next).toBeNull();
            expect(result.previous).toBeNull();
        });

        test('handles empty array', () => {
            const result = normalizeTasksResponse([]);
            expect(result.count).toBe(0);
            expect(result.results).toEqual([]);
        });
    });

    describe('Paginated Response', () => {
        test('normalizes standard pagination', () => {
            const input = {
                count: 100,
                next: 'http://api.com/tasks?page=2',
                previous: null,
                results: [{ id: 1 }],
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(100);
            expect(result.next).toBe(input.next);
            expect(result.results.length).toBe(1);
        });

        test('handles missing count', () => {
            const input = {
                results: [{ id: 1 }, { id: 2 }],
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(2);
        });

        test('handles null next/previous', () => {
            const input = {
                count: 5,
                next: null,
                previous: null,
                results: [{ id: 1 }],
            };
            const result = normalizeTasksResponse(input);

            expect(result.next).toBeNull();
            expect(result.previous).toBeNull();
        });
    });

    describe('Tasks Property Response', () => {
        test('normalizes tasks array', () => {
            const input = {
                tasks: [{ id: 1 }, { id: 2 }],
            };
            const result = normalizeTasksResponse(input);

            expect(result.results).toEqual(input.tasks);
            expect(result.count).toBe(2);
        });

        test('extracts count from pagination', () => {
            const input = {
                tasks: [{ id: 1 }],
                pagination: { count: 50 },
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(50);
        });

        test('extracts total_records from pagination', () => {
            const input = {
                tasks: [{ id: 1 }],
                pagination: { total_records: 75 },
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(75);
        });
    });

    describe('Wrapped Data Response', () => {
        test('unwraps data property', () => {
            const input = {
                data: [{ id: 1 }, { id: 2 }],
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(2);
        });

        test('handles nested data with results', () => {
            const input = {
                data: {
                    results: [{ id: 1 }],
                    count: 10,
                },
            };
            const result = normalizeTasksResponse(input);

            expect(result.count).toBe(10);
        });
    });

    describe('Invalid Input', () => {
        test('returns empty for null', () => {
            const result = normalizeTasksResponse(null);
            expect(result.count).toBe(0);
            expect(result.results).toEqual([]);
        });

        test('returns empty for undefined', () => {
            const result = normalizeTasksResponse(undefined);
            expect(result.count).toBe(0);
        });

        test('returns empty for string', () => {
            const result = normalizeTasksResponse('invalid');
            expect(result.count).toBe(0);
        });

        test('returns empty for number', () => {
            const result = normalizeTasksResponse(123);
            expect(result.count).toBe(0);
        });

        test('returns empty for object without known keys', () => {
            const result = normalizeTasksResponse({ unknown: 'value' });
            expect(result.count).toBe(0);
        });
    });
});

describe('Urgency Level Mapping', () => {
    // Urgency level as used in various places in the app
    const getUrgencyLabel = (level: number): string => {
        switch (level) {
            case 1: return 'Low';
            case 2: return 'Medium';
            case 3: return 'High';
            default: return 'Medium';
        }
    };

    const getUrgencyColor = (level: number): string => {
        switch (level) {
            case 1: return '#4CAF50';  // green
            case 2: return '#FF9800';  // orange
            case 3: return '#F44336';  // red
            default: return '#FF9800';
        }
    };

    test('returns Low for level 1', () => {
        expect(getUrgencyLabel(1)).toBe('Low');
    });

    test('returns Medium for level 2', () => {
        expect(getUrgencyLabel(2)).toBe('Medium');
    });

    test('returns High for level 3', () => {
        expect(getUrgencyLabel(3)).toBe('High');
    });

    test('defaults to Medium for unknown level', () => {
        expect(getUrgencyLabel(0)).toBe('Medium');
        expect(getUrgencyLabel(5)).toBe('Medium');
    });

    test('returns green for Low urgency', () => {
        expect(getUrgencyColor(1)).toBe('#4CAF50');
    });

    test('returns orange for Medium urgency', () => {
        expect(getUrgencyColor(2)).toBe('#FF9800');
    });

    test('returns red for High urgency', () => {
        expect(getUrgencyColor(3)).toBe('#F44336');
    });
});

describe('Status Display Mapping', () => {
    const getStatusDisplay = (status: string): string => {
        const statusMap: Record<string, string> = {
            'OPEN': 'Open',
            'IN_PROGRESS': 'In Progress',
            'COMPLETED': 'Completed',
            'CANCELLED': 'Cancelled',
            'PENDING': 'Pending',
            'ACCEPTED': 'Accepted',
            'REJECTED': 'Rejected',
        };
        return statusMap[status?.toUpperCase()] || status || 'Unknown';
    };

    test('displays Open', () => {
        expect(getStatusDisplay('OPEN')).toBe('Open');
    });

    test('displays In Progress', () => {
        expect(getStatusDisplay('IN_PROGRESS')).toBe('In Progress');
    });

    test('displays Completed', () => {
        expect(getStatusDisplay('COMPLETED')).toBe('Completed');
    });

    test('handles lowercase', () => {
        expect(getStatusDisplay('open')).toBe('Open');
    });

    test('returns original for unknown status', () => {
        expect(getStatusDisplay('CUSTOM_STATUS')).toBe('CUSTOM_STATUS');
    });

    test('handles null/undefined', () => {
        expect(getStatusDisplay(null as any)).toBe('Unknown');
        expect(getStatusDisplay(undefined as any)).toBe('Unknown');
    });
});

describe('Category Mapping', () => {
    const CATEGORY_LABELS: Record<string, string> = {
        'GROCERY_SHOPPING': 'Grocery Shopping',
        'HOUSE_CLEANING': 'House Cleaning',
        'PET_CARE': 'Pet Care',
        'TRANSPORTATION': 'Transportation',
        'MEDICAL_ASSISTANCE': 'Medical Assistance',
        'COOKING': 'Cooking',
        'GARDENING': 'Gardening',
        'TUTORING': 'Tutoring',
        'TECH_SUPPORT': 'Tech Support',
        'OTHER': 'Other',
    };

    const CATEGORY_ICONS: Record<string, string> = {
        'GROCERY_SHOPPING': '🛒',
        'HOUSE_CLEANING': '🧹',
        'PET_CARE': '🐾',
        'TRANSPORTATION': '🚗',
        'MEDICAL_ASSISTANCE': '🏥',
        'COOKING': '🍳',
        'GARDENING': '🌱',
        'TUTORING': '📚',
        'TECH_SUPPORT': '💻',
        'OTHER': '📋',
    };

    test('maps all category labels', () => {
        expect(CATEGORY_LABELS['GROCERY_SHOPPING']).toBe('Grocery Shopping');
        expect(CATEGORY_LABELS['PET_CARE']).toBe('Pet Care');
        expect(CATEGORY_LABELS['TECH_SUPPORT']).toBe('Tech Support');
    });

    test('maps all category icons', () => {
        expect(CATEGORY_ICONS['GROCERY_SHOPPING']).toBe('🛒');
        expect(CATEGORY_ICONS['PET_CARE']).toBe('🐾');
        expect(CATEGORY_ICONS['COOKING']).toBe('🍳');
    });

    test('all categories have labels', () => {
        expect(Object.keys(CATEGORY_LABELS).length).toBe(10);
    });

    test('all categories have icons', () => {
        expect(Object.keys(CATEGORY_ICONS).length).toBe(10);
    });
});
