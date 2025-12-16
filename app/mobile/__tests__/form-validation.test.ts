/**
 * Unit Tests for Form Validation Utilities
 * Tests input validation for registration and login forms
 */

describe('Form Field Validation', () => {
    describe('Email Validation', () => {
        const validateEmail = (email: string): { valid: boolean; error?: string } => {
            if (!email) {
                return { valid: false, error: 'Email is required' };
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { valid: false, error: 'Please enter a valid email address' };
            }
            return { valid: true };
        };

        test('accepts valid email addresses', () => {
            expect(validateEmail('user@example.com').valid).toBe(true);
            expect(validateEmail('firstname.lastname@domain.com').valid).toBe(true);
            expect(validateEmail('user123@subdomain.domain.org').valid).toBe(true);
        });

        test('rejects empty email', () => {
            const result = validateEmail('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Email is required');
        });

        test('rejects invalid email formats', () => {
            expect(validateEmail('invalid').valid).toBe(false);
            expect(validateEmail('user@').valid).toBe(false);
            expect(validateEmail('@domain.com').valid).toBe(false);
            expect(validateEmail('user domain.com').valid).toBe(false);
        });
    });

    describe('Password Strength Validation', () => {
        const validatePassword = (password: string): {
            valid: boolean;
            errors: string[];
            strength: 'weak' | 'medium' | 'strong';
        } => {
            const errors: string[] = [];
            let score = 0;

            if (password.length < 8) {
                errors.push('Password must be at least 8 characters');
            } else {
                score++;
            }

            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain an uppercase letter');
            } else {
                score++;
            }

            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain a lowercase letter');
            } else {
                score++;
            }

            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain a number');
            } else {
                score++;
            }

            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.push('Password must contain a special character');
            } else {
                score++;
            }

            const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

            return {
                valid: errors.length === 0,
                errors,
                strength
            };
        };

        test('validates strong password', () => {
            const result = validatePassword('SecurePass123!');
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.strength).toBe('strong');
        });

        test('rejects weak password (too short)', () => {
            const result = validatePassword('Abc1!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters');
        });

        test('rejects password without uppercase', () => {
            const result = validatePassword('lowercase123!');
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Password must contain an uppercase letter');
        });

        test('calculates correct strength', () => {
            expect(validatePassword('weak').strength).toBe('weak');
            expect(validatePassword('Medium12').strength).toBe('medium');
            expect(validatePassword('Strong123!').strength).toBe('strong');
        });
    });

    describe('Username Validation', () => {
        const validateUsername = (username: string): { valid: boolean; error?: string } => {
            if (!username) {
                return { valid: false, error: 'Username is required' };
            }
            if (username.length < 3) {
                return { valid: false, error: 'Username must be at least 3 characters' };
            }
            if (username.length > 30) {
                return { valid: false, error: 'Username must be less than 30 characters' };
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
            }
            return { valid: true };
        };

        test('accepts valid usernames', () => {
            expect(validateUsername('validuser').valid).toBe(true);
            expect(validateUsername('user_123').valid).toBe(true);
            expect(validateUsername('TestUser').valid).toBe(true);
        });

        test('rejects empty username', () => {
            expect(validateUsername('').error).toBe('Username is required');
        });

        test('rejects short username', () => {
            expect(validateUsername('ab').error).toBe('Username must be at least 3 characters');
        });

        test('rejects username with special characters', () => {
            expect(validateUsername('user@name').error).toBe('Username can only contain letters, numbers, and underscores');
        });
    });

    describe('Phone Number Validation', () => {
        const validatePhone = (phone: string): { valid: boolean; formatted?: string; error?: string } => {
            const cleaned = phone.replace(/\D/g, '');

            if (!cleaned) {
                return { valid: false, error: 'Phone number is required' };
            }

            if (cleaned.length < 10 || cleaned.length > 15) {
                return { valid: false, error: 'Phone number must be 10-15 digits' };
            }

            return { valid: true, formatted: cleaned };
        };

        test('accepts valid phone numbers', () => {
            expect(validatePhone('5551234567').valid).toBe(true);
            expect(validatePhone('+1-555-123-4567').valid).toBe(true);
            expect(validatePhone('(555) 123-4567').valid).toBe(true);
        });

        test('strips formatting and returns cleaned number', () => {
            expect(validatePhone('+1-555-123-4567').formatted).toBe('15551234567');
        });

        test('rejects empty phone', () => {
            expect(validatePhone('').error).toBe('Phone number is required');
        });

        test('rejects invalid length', () => {
            expect(validatePhone('123').error).toBe('Phone number must be 10-15 digits');
        });
    });
});

describe('Required Fields Check', () => {
    const validateRequiredFields = (fields: Record<string, string>): {
        valid: boolean;
        missingFields: string[]
    } => {
        const missingFields = Object.entries(fields)
            .filter(([_, value]) => !value || value.trim() === '')
            .map(([key]) => key);

        return {
            valid: missingFields.length === 0,
            missingFields
        };
    };

    test('passes when all fields are filled', () => {
        const result = validateRequiredFields({
            email: 'test@example.com',
            password: 'password123',
            username: 'testuser'
        });
        expect(result.valid).toBe(true);
        expect(result.missingFields).toHaveLength(0);
    });

    test('fails and lists missing fields', () => {
        const result = validateRequiredFields({
            email: 'test@example.com',
            password: '',
            username: '   '
        });
        expect(result.valid).toBe(false);
        expect(result.missingFields).toContain('password');
        expect(result.missingFields).toContain('username');
    });
});

describe('Form Data Sanitization', () => {
    const sanitizeInput = (input: string): string => {
        return input
            .trim()
            .replace(/\s+/g, ' '); // Replace multiple spaces with single
    };

    test('trims whitespace', () => {
        expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    test('normalizes internal whitespace', () => {
        expect(sanitizeInput('hello    world')).toBe('hello world');
    });

    test('handles empty input', () => {
        expect(sanitizeInput('')).toBe('');
        expect(sanitizeInput('   ')).toBe('');
    });
});
