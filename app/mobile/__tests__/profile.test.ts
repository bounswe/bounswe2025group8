/**
 * Unit Tests for Profile Page Functionality
 * Tests profile data processing, stats calculation, and preference handling
 */

describe('Profile Data Processing', () => {
    describe('User Display Name', () => {
        const getDisplayName = (user: { name?: string; surname?: string; username?: string }): string => {
            if (user.name && user.surname) {
                return `${user.name} ${user.surname}`;
            }
            if (user.name) {
                return user.name;
            }
            return user.username || 'Anonymous';
        };

        test('returns full name when both parts available', () => {
            expect(getDisplayName({ name: 'John', surname: 'Doe' })).toBe('John Doe');
        });

        test('returns first name only when surname missing', () => {
            expect(getDisplayName({ name: 'John', username: 'johnd' })).toBe('John');
        });

        test('returns username when name missing', () => {
            expect(getDisplayName({ username: 'johnd' })).toBe('johnd');
        });

        test('returns Anonymous when no info available', () => {
            expect(getDisplayName({})).toBe('Anonymous');
        });
    });

    describe('Profile Initials', () => {
        const getInitials = (name: string): string => {
            const parts = name.trim().split(' ').filter(Boolean);
            if (parts.length === 0) return '?';
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        test('returns two initials for full name', () => {
            expect(getInitials('John Doe')).toBe('JD');
        });

        test('returns one initial for single name', () => {
            expect(getInitials('John')).toBe('J');
        });

        test('handles multiple names', () => {
            expect(getInitials('John Michael Doe')).toBe('JD');
        });

        test('handles empty name', () => {
            expect(getInitials('')).toBe('?');
        });

        test('converts to uppercase', () => {
            expect(getInitials('john doe')).toBe('JD');
        });
    });
});

describe('Profile Statistics', () => {
    describe('Stats Calculation', () => {
        const calculateStats = (tasks: { status: string; role: 'creator' | 'volunteer' }[]) => {
            const createdTasks = tasks.filter(t => t.role === 'creator');
            const volunteeredTasks = tasks.filter(t => t.role === 'volunteer');

            return {
                totalCreated: createdTasks.length,
                completedCreated: createdTasks.filter(t => t.status === 'COMPLETED').length,
                totalVolunteered: volunteeredTasks.length,
                completedVolunteered: volunteeredTasks.filter(t => t.status === 'COMPLETED').length,
            };
        };

        const tasks = [
            { status: 'COMPLETED', role: 'creator' as const },
            { status: 'OPEN', role: 'creator' as const },
            { status: 'COMPLETED', role: 'volunteer' as const },
            { status: 'COMPLETED', role: 'volunteer' as const },
            { status: 'IN_PROGRESS', role: 'volunteer' as const },
        ];

        test('calculates total created tasks', () => {
            expect(calculateStats(tasks).totalCreated).toBe(2);
        });

        test('calculates completed created tasks', () => {
            expect(calculateStats(tasks).completedCreated).toBe(1);
        });

        test('calculates total volunteered tasks', () => {
            expect(calculateStats(tasks).totalVolunteered).toBe(3);
        });

        test('calculates completed volunteered tasks', () => {
            expect(calculateStats(tasks).completedVolunteered).toBe(2);
        });
    });

    describe('Rating Display', () => {
        const formatRating = (rating: number | null, totalReviews: number): string => {
            if (!rating || totalReviews === 0) return 'No ratings yet';
            return `${rating.toFixed(1)} (${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'})`;
        };

        test('formats rating with single review', () => {
            expect(formatRating(4.5, 1)).toBe('4.5 (1 review)');
        });

        test('formats rating with multiple reviews', () => {
            expect(formatRating(4.0, 15)).toBe('4.0 (15 reviews)');
        });

        test('handles no ratings', () => {
            expect(formatRating(null, 0)).toBe('No ratings yet');
            expect(formatRating(0, 0)).toBe('No ratings yet');
        });
    });

    describe('Completion Rate', () => {
        const getCompletionRate = (completed: number, total: number): number => {
            if (total === 0) return 0;
            return Math.round((completed / total) * 100);
        };

        test('calculates correct percentage', () => {
            expect(getCompletionRate(5, 10)).toBe(50);
            expect(getCompletionRate(3, 4)).toBe(75);
            expect(getCompletionRate(10, 10)).toBe(100);
        });

        test('handles zero total', () => {
            expect(getCompletionRate(0, 0)).toBe(0);
        });

        test('rounds to whole number', () => {
            expect(getCompletionRate(1, 3)).toBe(33);
        });
    });
});

describe('Profile Preferences', () => {
    describe('Notification Settings', () => {
        interface NotificationPrefs {
            taskUpdates: boolean;
            newVolunteers: boolean;
            comments: boolean;
            reminders: boolean;
        }

        const defaultPrefs: NotificationPrefs = {
            taskUpdates: true,
            newVolunteers: true,
            comments: true,
            reminders: true,
        };

        test('has all notification types enabled by default', () => {
            expect(defaultPrefs.taskUpdates).toBe(true);
            expect(defaultPrefs.newVolunteers).toBe(true);
            expect(defaultPrefs.comments).toBe(true);
            expect(defaultPrefs.reminders).toBe(true);
        });

        test('can toggle individual preferences', () => {
            const updated = { ...defaultPrefs, taskUpdates: false };
            expect(updated.taskUpdates).toBe(false);
            expect(updated.newVolunteers).toBe(true);
        });
    });

    describe('Privacy Settings', () => {
        interface PrivacySettings {
            showEmail: boolean;
            showPhone: boolean;
            showLocation: boolean;
        }

        const validatePrivacySettings = (settings: PrivacySettings): boolean => {
            // At least one contact method should be visible
            return settings.showEmail || settings.showPhone;
        };

        test('validates when email is shown', () => {
            expect(validatePrivacySettings({
                showEmail: true,
                showPhone: false,
                showLocation: false,
            })).toBe(true);
        });

        test('validates when phone is shown', () => {
            expect(validatePrivacySettings({
                showEmail: false,
                showPhone: true,
                showLocation: false,
            })).toBe(true);
        });

        test('fails when no contact is visible', () => {
            expect(validatePrivacySettings({
                showEmail: false,
                showPhone: false,
                showLocation: false,
            })).toBe(false);
        });
    });
});

describe('Profile Edit Validation', () => {
    const validateProfileUpdate = (update: {
        name?: string;
        phone?: string;
        bio?: string;
    }): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (update.name !== undefined && update.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (update.phone !== undefined) {
            const phoneRegex = /^\+?[0-9]{10,15}$/;
            if (!phoneRegex.test(update.phone.replace(/\D/g, ''))) {
                errors.push('Invalid phone number');
            }
        }

        if (update.bio !== undefined && update.bio.length > 500) {
            errors.push('Bio must be less than 500 characters');
        }

        return { valid: errors.length === 0, errors };
    };

    test('validates correct update', () => {
        const result = validateProfileUpdate({
            name: 'John Doe',
            phone: '5551234567',
            bio: 'Hello!',
        });
        expect(result.valid).toBe(true);
    });

    test('rejects short name', () => {
        const result = validateProfileUpdate({ name: 'A' });
        expect(result.errors).toContain('Name must be at least 2 characters');
    });

    test('rejects invalid phone', () => {
        const result = validateProfileUpdate({ phone: '123' });
        expect(result.errors).toContain('Invalid phone number');
    });

    test('rejects long bio', () => {
        const result = validateProfileUpdate({ bio: 'a'.repeat(501) });
        expect(result.errors).toContain('Bio must be less than 500 characters');
    });
});
