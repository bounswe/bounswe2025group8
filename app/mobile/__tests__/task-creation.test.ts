/**
 * Unit Tests for Task Creation Functionality
 * Tests form validation, data transformation, and submission logic
 */

describe('Task Creation Form Validation', () => {
    describe('Title Validation', () => {
        const validateTitle = (title: string): { valid: boolean; error?: string } => {
            if (!title || title.trim() === '') {
                return { valid: false, error: 'Title is required' };
            }
            if (title.trim().length < 5) {
                return { valid: false, error: 'Title must be at least 5 characters' };
            }
            if (title.trim().length > 100) {
                return { valid: false, error: 'Title must be less than 100 characters' };
            }
            return { valid: true };
        };

        test('accepts valid title', () => {
            expect(validateTitle('Help with groceries').valid).toBe(true);
        });

        test('rejects empty title', () => {
            expect(validateTitle('').error).toBe('Title is required');
        });

        test('rejects title that is too short', () => {
            expect(validateTitle('Help').error).toBe('Title must be at least 5 characters');
        });

        test('rejects title that is too long', () => {
            const longTitle = 'a'.repeat(101);
            expect(validateTitle(longTitle).error).toBe('Title must be less than 100 characters');
        });
    });

    describe('Description Validation', () => {
        const validateDescription = (description: string): { valid: boolean; error?: string } => {
            if (!description || description.trim() === '') {
                return { valid: false, error: 'Description is required' };
            }
            if (description.trim().length < 10) {
                return { valid: false, error: 'Description must be at least 10 characters' };
            }
            if (description.trim().length > 1000) {
                return { valid: false, error: 'Description must be less than 1000 characters' };
            }
            return { valid: true };
        };

        test('accepts valid description', () => {
            expect(validateDescription('I need help with carrying grocery bags from the store to my apartment on the 5th floor.').valid).toBe(true);
        });

        test('rejects empty description', () => {
            expect(validateDescription('').error).toBe('Description is required');
        });

        test('rejects description that is too short', () => {
            expect(validateDescription('Help me').error).toBe('Description must be at least 10 characters');
        });
    });

    describe('Volunteer Count Validation', () => {
        const validateVolunteerCount = (count: number): { valid: boolean; error?: string } => {
            if (count < 1) {
                return { valid: false, error: 'At least 1 volunteer is required' };
            }
            if (count > 50) {
                return { valid: false, error: 'Maximum 50 volunteers allowed' };
            }
            return { valid: true };
        };

        test('accepts valid volunteer count', () => {
            expect(validateVolunteerCount(1).valid).toBe(true);
            expect(validateVolunteerCount(5).valid).toBe(true);
            expect(validateVolunteerCount(50).valid).toBe(true);
        });

        test('rejects zero volunteers', () => {
            expect(validateVolunteerCount(0).error).toBe('At least 1 volunteer is required');
        });

        test('rejects too many volunteers', () => {
            expect(validateVolunteerCount(51).error).toBe('Maximum 50 volunteers allowed');
        });
    });

    describe('Deadline Validation', () => {
        const validateDeadline = (deadline: Date | null): { valid: boolean; error?: string } => {
            if (!deadline) {
                return { valid: true }; // Deadline is optional
            }

            const now = new Date();
            const minDeadline = new Date(now.getTime() + 60 * 60 * 1000); // At least 1 hour from now

            if (deadline < minDeadline) {
                return { valid: false, error: 'Deadline must be at least 1 hour from now' };
            }
            return { valid: true };
        };

        test('accepts null deadline (optional)', () => {
            expect(validateDeadline(null).valid).toBe(true);
        });

        test('accepts future deadline', () => {
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            expect(validateDeadline(tomorrow).valid).toBe(true);
        });

        test('rejects deadline too soon', () => {
            const inTenMinutes = new Date(Date.now() + 10 * 60 * 1000);
            expect(validateDeadline(inTenMinutes).error).toBe('Deadline must be at least 1 hour from now');
        });
    });
});

describe('Task Data Transformation', () => {
    interface TaskFormData {
        title: string;
        description: string;
        urgencyLevel: number;
        volunteerCount: number;
        deadline?: Date;
        address?: { country: string; state: string; city: string };
    }

    const transformTaskForAPI = (formData: TaskFormData) => {
        return {
            title: formData.title.trim(),
            description: formData.description.trim(),
            urgency_level: formData.urgencyLevel,
            volunteer_number: formData.volunteerCount,
            deadline: formData.deadline?.toISOString() || null,
            location: formData.address ? {
                country: formData.address.country,
                state: formData.address.state,
                city: formData.address.city,
            } : null,
        };
    };

    test('transforms form data to API format', () => {
        const formData: TaskFormData = {
            title: '  Help with groceries  ',
            description: '  Need help carrying bags  ',
            urgencyLevel: 2,
            volunteerCount: 3,
        };

        const result = transformTaskForAPI(formData);

        expect(result.title).toBe('Help with groceries');
        expect(result.description).toBe('Need help carrying bags');
        expect(result.urgency_level).toBe(2);
        expect(result.volunteer_number).toBe(3);
        expect(result.deadline).toBeNull();
    });

    test('includes deadline when provided', () => {
        const deadline = new Date('2024-12-25T15:00:00Z');
        const formData: TaskFormData = {
            title: 'Test Task',
            description: 'Test description',
            urgencyLevel: 1,
            volunteerCount: 1,
            deadline,
        };

        const result = transformTaskForAPI(formData);

        expect(result.deadline).toBe('2024-12-25T15:00:00.000Z');
    });

    test('includes address when provided', () => {
        const formData: TaskFormData = {
            title: 'Test Task',
            description: 'Test description',
            urgencyLevel: 1,
            volunteerCount: 1,
            address: { country: 'Turkey', state: 'Istanbul', city: 'Besiktas' },
        };

        const result = transformTaskForAPI(formData);

        expect(result.location).toEqual({
            country: 'Turkey',
            state: 'Istanbul',
            city: 'Besiktas',
        });
    });
});

describe('Urgency Level Handling', () => {
    const URGENCY_LEVELS = [
        { value: 1, label: 'Low', color: '#4CAF50' },
        { value: 2, label: 'Medium', color: '#FF9800' },
        { value: 3, label: 'High', color: '#F44336' },
    ];

    const getUrgencyLabel = (level: number): string => {
        return URGENCY_LEVELS.find(u => u.value === level)?.label || 'Unknown';
    };

    const getUrgencyColor = (level: number): string => {
        return URGENCY_LEVELS.find(u => u.value === level)?.color || '#9E9E9E';
    };

    test('returns correct labels for all urgency levels', () => {
        expect(getUrgencyLabel(1)).toBe('Low');
        expect(getUrgencyLabel(2)).toBe('Medium');
        expect(getUrgencyLabel(3)).toBe('High');
    });

    test('returns correct colors for all urgency levels', () => {
        expect(getUrgencyColor(1)).toBe('#4CAF50');
        expect(getUrgencyColor(2)).toBe('#FF9800');
        expect(getUrgencyColor(3)).toBe('#F44336');
    });

    test('handles unknown urgency level', () => {
        expect(getUrgencyLabel(99)).toBe('Unknown');
        expect(getUrgencyColor(99)).toBe('#9E9E9E');
    });
});

describe('Form Step Navigation', () => {
    const STEPS = ['general', 'photo', 'deadline', 'address'];

    const canProceed = (currentStep: number, formData: { title: string; description: string }): boolean => {
        if (currentStep === 0) {
            return formData.title.trim().length >= 5 && formData.description.trim().length >= 10;
        }
        return true; // Other steps are optional
    };

    test('allows proceeding from step 1 when form is valid', () => {
        const formData = {
            title: 'Valid title',
            description: 'This is a valid description for the task',
        };
        expect(canProceed(0, formData)).toBe(true);
    });

    test('prevents proceeding from step 1 when form is invalid', () => {
        const formData = {
            title: 'Hi',
            description: 'Short',
        };
        expect(canProceed(0, formData)).toBe(false);
    });

    test('always allows proceeding from optional steps', () => {
        const formData = { title: '', description: '' };
        expect(canProceed(1, formData)).toBe(true);
        expect(canProceed(2, formData)).toBe(true);
        expect(canProceed(3, formData)).toBe(true);
    });
});
