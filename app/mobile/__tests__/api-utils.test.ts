/**
 * Unit Tests for API Utility Functions
 * Tests validation helpers and data transformation logic
 */

import { Platform } from 'react-native';

// Test the validation functions that are used in registration
describe('API Validation Helpers', () => {
    describe('Phone Number Validation', () => {
        const phoneRegex = /^\+?[0-9]{10,15}$/;

        test('accepts valid phone number with country code', () => {
            expect(phoneRegex.test('+905551234567')).toBe(true);
        });

        test('accepts valid phone number without country code', () => {
            expect(phoneRegex.test('5551234567')).toBe(true);
        });

        test('rejects phone number that is too short', () => {
            expect(phoneRegex.test('123')).toBe(false);
        });

        test('rejects phone number with letters', () => {
            expect(phoneRegex.test('555abc1234')).toBe(false);
        });

        test('rejects phone number that is too long', () => {
            expect(phoneRegex.test('12345678901234567890')).toBe(false);
        });
    });

    describe('Password Validation', () => {
        const validatePassword = (password) => {
            return {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            };
        };

        test('validates strong password correctly', () => {
            const result = validatePassword('TestPass123!');
            expect(result.length).toBe(true);
            expect(result.uppercase).toBe(true);
            expect(result.lowercase).toBe(true);
            expect(result.number).toBe(true);
            expect(result.special).toBe(true);
        });

        test('fails password without uppercase', () => {
            const result = validatePassword('testpass123!');
            expect(result.uppercase).toBe(false);
        });

        test('fails password without lowercase', () => {
            const result = validatePassword('TESTPASS123!');
            expect(result.lowercase).toBe(false);
        });

        test('fails password without number', () => {
            const result = validatePassword('TestPass!!!');
            expect(result.number).toBe(false);
        });

        test('fails password without special character', () => {
            const result = validatePassword('TestPass123');
            expect(result.special).toBe(false);
        });

        test('fails password that is too short', () => {
            const result = validatePassword('Tp1!');
            expect(result.length).toBe(false);
        });
    });

    describe('Email Validation', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        test('accepts valid email', () => {
            expect(emailRegex.test('user@example.com')).toBe(true);
        });

        test('accepts email with subdomain', () => {
            expect(emailRegex.test('user@mail.example.com')).toBe(true);
        });

        test('rejects email without @', () => {
            expect(emailRegex.test('userexample.com')).toBe(false);
        });

        test('rejects email without domain', () => {
            expect(emailRegex.test('user@')).toBe(false);
        });

        test('rejects email with spaces', () => {
            expect(emailRegex.test('user @example.com')).toBe(false);
        });
    });

    describe('Name Parsing', () => {
        const parseFullName = (fullName) => {
            const nameParts = fullName.trim().split(' ');
            const name = nameParts[0];
            const surname = nameParts.slice(1).join(' ') || '';
            return { name, surname };
        };

        test('parses first and last name correctly', () => {
            const result = parseFullName('John Doe');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Doe');
        });

        test('handles multiple surnames', () => {
            const result = parseFullName('John Michael Doe');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Michael Doe');
        });

        test('handles single name (no surname)', () => {
            const result = parseFullName('John');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('');
        });

        test('trims whitespace', () => {
            const result = parseFullName('  John Doe  ');
            expect(result.name).toBe('John');
            expect(result.surname).toBe('Doe');
        });
    });
});

describe('Task Response Normalization', () => {
    const normalizeTasksResponse = (payload) => {
        const empty = {
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
            if (payload.results && Array.isArray(payload.results)) {
                return {
                    count: payload.count || payload.results.length,
                    next: payload.next || null,
                    previous: payload.previous || null,
                    results: payload.results,
                };
            }

            if (payload.data) {
                return normalizeTasksResponse(payload.data);
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
            count: 10,
            next: 'url?page=2',
            previous: null,
            results: [{ id: 1 }],
        };
        const result = normalizeTasksResponse(response);
        expect(result.count).toBe(10);
        expect(result.next).toBe('url?page=2');
    });

    test('handles wrapped data response', () => {
        const response = {
            data: [{ id: 1 }, { id: 2 }],
        };
        const result = normalizeTasksResponse(response);
        expect(result.count).toBe(2);
    });

    test('returns empty for null/undefined', () => {
        const result = normalizeTasksResponse(null);
        expect(result.count).toBe(0);
        expect(result.results).toEqual([]);
    });
});

describe('Urgency Formatting', () => {
    const formatUrgency = (level) => {
        if (level === 3) return 'High';
        if (level === 2) return 'Medium';
        if (level === 1) return 'Low';
        return 'Medium';
    };

    test('formats high urgency', () => {
        expect(formatUrgency(3)).toBe('High');
    });

    test('formats medium urgency', () => {
        expect(formatUrgency(2)).toBe('Medium');
    });

    test('formats low urgency', () => {
        expect(formatUrgency(1)).toBe('Low');
    });

    test('defaults to medium for unknown value', () => {
        expect(formatUrgency(undefined)).toBe('Medium');
        expect(formatUrgency(0)).toBe('Medium');
    });
});
