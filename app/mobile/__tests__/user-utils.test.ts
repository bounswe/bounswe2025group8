/**
 * Unit Tests for User and Profile Utilities
 * Tests user data validation, formatting, and helper functions
 */

describe('User Profile Utilities', () => {
    describe('formatUserName', () => {
        const formatUserName = (user: { name?: string; surname?: string; username?: string }): string => {
            const fullName = [user.name, user.surname].filter(Boolean).join(' ');
            return fullName || user.username || 'Anonymous';
        };

        test('formats full name correctly', () => {
            expect(formatUserName({ name: 'John', surname: 'Doe' })).toBe('John Doe');
        });

        test('returns only first name if no surname', () => {
            expect(formatUserName({ name: 'John' })).toBe('John');
        });

        test('falls back to username', () => {
            expect(formatUserName({ username: 'johndoe' })).toBe('johndoe');
        });

        test('returns Anonymous for empty user', () => {
            expect(formatUserName({})).toBe('Anonymous');
        });
    });

    describe('getInitials', () => {
        const getInitials = (name: string): string => {
            if (!name) return '?';
            const parts = name.trim().split(' ').filter(Boolean);
            if (parts.length === 0) return '?';
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        test('returns initials for full name', () => {
            expect(getInitials('John Doe')).toBe('JD');
        });

        test('returns single initial for single name', () => {
            expect(getInitials('John')).toBe('J');
        });

        test('handles multiple middle names', () => {
            expect(getInitials('John Michael James Doe')).toBe('JD');
        });

        test('returns ? for empty string', () => {
            expect(getInitials('')).toBe('?');
        });

        test('handles extra whitespace', () => {
            expect(getInitials('  John   Doe  ')).toBe('JD');
        });
    });

    describe('isValidUsername', () => {
        const isValidUsername = (username: string): { valid: boolean; error?: string } => {
            if (!username || username.length < 3) {
                return { valid: false, error: 'Username must be at least 3 characters' };
            }
            if (username.length > 30) {
                return { valid: false, error: 'Username must be at most 30 characters' };
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
            }
            if (/^[0-9]/.test(username)) {
                return { valid: false, error: 'Username cannot start with a number' };
            }
            return { valid: true };
        };

        test('accepts valid username', () => {
            expect(isValidUsername('john_doe123').valid).toBe(true);
        });

        test('rejects too short username', () => {
            const result = isValidUsername('ab');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at least 3');
        });

        test('rejects username with special characters', () => {
            const result = isValidUsername('john@doe');
            expect(result.valid).toBe(false);
        });

        test('rejects username starting with number', () => {
            const result = isValidUsername('123john');
            expect(result.valid).toBe(false);
        });

        test('accepts username with underscore', () => {
            expect(isValidUsername('john_doe').valid).toBe(true);
        });
    });

    describe('formatPhoneNumber', () => {
        const formatPhoneNumber = (phone: string): string => {
            if (!phone) return '';
            const cleaned = phone.replace(/\D/g, '');

            // Format: +XX XXX XXX XXXX
            if (cleaned.length >= 10) {
                const country = cleaned.length > 10 ? cleaned.slice(0, -10) : '';
                const main = cleaned.slice(-10);
                const area = main.slice(0, 3);
                const first = main.slice(3, 6);
                const last = main.slice(6);

                if (country) {
                    return `+${country} ${area} ${first} ${last}`;
                }
                return `${area} ${first} ${last}`;
            }
            return phone;
        };

        test('formats phone with country code', () => {
            expect(formatPhoneNumber('905551234567')).toBe('+90 555 123 4567');
        });

        test('formats phone without country code', () => {
            expect(formatPhoneNumber('5551234567')).toBe('555 123 4567');
        });

        test('handles empty string', () => {
            expect(formatPhoneNumber('')).toBe('');
        });

        test('cleans non-digit characters', () => {
            expect(formatPhoneNumber('+90 (555) 123-4567')).toBe('+90 555 123 4567');
        });
    });

    describe('calculateUserRating', () => {
        const calculateUserRating = (reviews: Array<{ score: number }>): { average: number; count: number } => {
            if (!reviews || reviews.length === 0) {
                return { average: 0, count: 0 };
            }
            const total = reviews.reduce((sum, r) => sum + (r.score || 0), 0);
            const average = Math.round((total / reviews.length) * 10) / 10;
            return { average, count: reviews.length };
        };

        test('calculates average rating correctly', () => {
            const reviews = [{ score: 4 }, { score: 5 }, { score: 3 }];
            const result = calculateUserRating(reviews);
            expect(result.average).toBe(4);
            expect(result.count).toBe(3);
        });

        test('returns 0 for empty reviews', () => {
            expect(calculateUserRating([]).average).toBe(0);
        });

        test('handles single review', () => {
            const result = calculateUserRating([{ score: 5 }]);
            expect(result.average).toBe(5);
            expect(result.count).toBe(1);
        });

        test('rounds to one decimal place', () => {
            const reviews = [{ score: 4 }, { score: 5 }];
            expect(calculateUserRating(reviews).average).toBe(4.5);
        });
    });

    describe('formatRating', () => {
        const formatRating = (rating: number): string => {
            if (rating === 0) return 'No ratings';
            return `${rating.toFixed(1)} ★`;
        };

        test('formats rating with star', () => {
            expect(formatRating(4.5)).toBe('4.5 ★');
        });

        test('returns "No ratings" for 0', () => {
            expect(formatRating(0)).toBe('No ratings');
        });

        test('always shows one decimal', () => {
            expect(formatRating(5)).toBe('5.0 ★');
        });
    });

    describe('isProfileComplete', () => {
        const isProfileComplete = (user: {
            name?: string;
            email?: string;
            phone_number?: string;
            location?: string;
        }): { complete: boolean; missing: string[] } => {
            const required = ['name', 'email', 'phone_number'];
            const missing = required.filter(field => !user[field as keyof typeof user]);
            return {
                complete: missing.length === 0,
                missing,
            };
        };

        test('returns complete for full profile', () => {
            const user = { name: 'John', email: 'john@test.com', phone_number: '555' };
            expect(isProfileComplete(user).complete).toBe(true);
        });

        test('returns incomplete with missing fields', () => {
            const user = { name: 'John', email: 'john@test.com' };
            const result = isProfileComplete(user);
            expect(result.complete).toBe(false);
            expect(result.missing).toContain('phone_number');
        });

        test('returns all missing for empty user', () => {
            const result = isProfileComplete({});
            expect(result.missing.length).toBe(3);
        });
    });
});

describe('Follow System Utilities', () => {
    describe('isFollowing', () => {
        const isFollowing = (followingList: Array<{ id: number }>, userId: number): boolean => {
            return followingList.some(user => user.id === userId);
        };

        test('returns true when following user', () => {
            const following = [{ id: 1 }, { id: 2 }, { id: 3 }];
            expect(isFollowing(following, 2)).toBe(true);
        });

        test('returns false when not following user', () => {
            const following = [{ id: 1 }, { id: 3 }];
            expect(isFollowing(following, 2)).toBe(false);
        });

        test('returns false for empty list', () => {
            expect(isFollowing([], 1)).toBe(false);
        });
    });

    describe('getFollowStats', () => {
        const getFollowStats = (followers: any[], following: any[]): {
            followersCount: number;
            followingCount: number;
            ratio: string;
        } => {
            const followersCount = followers?.length || 0;
            const followingCount = following?.length || 0;
            const ratio = followingCount > 0
                ? (followersCount / followingCount).toFixed(2)
                : '0.00';
            return { followersCount, followingCount, ratio };
        };

        test('calculates stats correctly', () => {
            const stats = getFollowStats([{}, {}, {}], [{}, {}]);
            expect(stats.followersCount).toBe(3);
            expect(stats.followingCount).toBe(2);
            expect(stats.ratio).toBe('1.50');
        });

        test('handles empty arrays', () => {
            const stats = getFollowStats([], []);
            expect(stats.followersCount).toBe(0);
            expect(stats.ratio).toBe('0.00');
        });
    });
});
