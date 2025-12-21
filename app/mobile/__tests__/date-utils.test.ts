/**
 * Unit Tests for Date and Time Utilities
 * Tests date formatting, relative time, and deadline calculations
 */

describe('Date Formatting Utilities', () => {
    describe('formatDate', () => {
        const formatDate = (dateString: string): string => {
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return 'Invalid date';
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            } catch {
                return 'Invalid date';
            }
        };

        test('formats ISO date correctly', () => {
            const result = formatDate('2024-12-20T10:30:00Z');
            expect(result).toContain('Dec');
            expect(result).toContain('20');
            expect(result).toContain('2024');
        });

        test('handles invalid date string', () => {
            expect(formatDate('invalid')).toBe('Invalid date');
        });

        test('handles empty string', () => {
            expect(formatDate('')).toBe('Invalid date');
        });

        test('formats date without time', () => {
            const result = formatDate('2024-06-15');
            expect(result).toContain('Jun');
            expect(result).toContain('15');
        });
    });

    describe('getRelativeTime', () => {
        const getRelativeTime = (dateString: string): string => {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();

            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            if (days < 30) return `${Math.floor(days / 7)}w ago`;
            return `${Math.floor(days / 30)}mo ago`;
        };

        test('returns "Just now" for recent times', () => {
            const now = new Date().toISOString();
            expect(getRelativeTime(now)).toBe('Just now');
        });

        test('returns minutes ago for times within an hour', () => {
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60000).toISOString();
            expect(getRelativeTime(thirtyMinsAgo)).toBe('30m ago');
        });

        test('returns hours ago for times within a day', () => {
            const fiveHoursAgo = new Date(Date.now() - 5 * 3600000).toISOString();
            expect(getRelativeTime(fiveHoursAgo)).toBe('5h ago');
        });

        test('returns days ago for times within a week', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
            expect(getRelativeTime(threeDaysAgo)).toBe('3d ago');
        });
    });

    describe('isDeadlinePassed', () => {
        const isDeadlinePassed = (deadlineString: string): boolean => {
            const deadline = new Date(deadlineString);
            const now = new Date();
            return now > deadline;
        };

        test('returns true for past deadlines', () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString();
            expect(isDeadlinePassed(yesterday)).toBe(true);
        });

        test('returns false for future deadlines', () => {
            const tomorrow = new Date(Date.now() + 86400000).toISOString();
            expect(isDeadlinePassed(tomorrow)).toBe(false);
        });
    });

    describe('getDeadlineStatus', () => {
        const getDeadlineStatus = (deadlineString: string): 'urgent' | 'soon' | 'normal' | 'passed' => {
            const deadline = new Date(deadlineString);
            const now = new Date();
            const diff = deadline.getTime() - now.getTime();
            const hours = diff / 3600000;

            if (diff < 0) return 'passed';
            if (hours < 24) return 'urgent';
            if (hours < 72) return 'soon';
            return 'normal';
        };

        test('returns "passed" for expired deadlines', () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString();
            expect(getDeadlineStatus(yesterday)).toBe('passed');
        });

        test('returns "urgent" for deadlines within 24 hours', () => {
            const in12Hours = new Date(Date.now() + 12 * 3600000).toISOString();
            expect(getDeadlineStatus(in12Hours)).toBe('urgent');
        });

        test('returns "soon" for deadlines within 72 hours', () => {
            const in48Hours = new Date(Date.now() + 48 * 3600000).toISOString();
            expect(getDeadlineStatus(in48Hours)).toBe('soon');
        });

        test('returns "normal" for deadlines more than 72 hours away', () => {
            const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
            expect(getDeadlineStatus(nextWeek)).toBe('normal');
        });
    });
});

describe('Time Duration Formatting', () => {
    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    };

    test('formats seconds', () => {
        expect(formatDuration(30)).toBe('30s');
    });

    test('formats minutes', () => {
        expect(formatDuration(120)).toBe('2m');
    });

    test('formats hours', () => {
        expect(formatDuration(7200)).toBe('2h');
    });

    test('formats days', () => {
        expect(formatDuration(172800)).toBe('2d');
    });
});

describe('Date Range Checking', () => {
    const isWithinDateRange = (date: string, start: string, end: string): boolean => {
        const d = new Date(date);
        const s = new Date(start);
        const e = new Date(end);
        return d >= s && d <= e;
    };

    test('returns true for date within range', () => {
        expect(isWithinDateRange('2024-06-15', '2024-06-01', '2024-06-30')).toBe(true);
    });

    test('returns false for date before range', () => {
        expect(isWithinDateRange('2024-05-15', '2024-06-01', '2024-06-30')).toBe(false);
    });

    test('returns false for date after range', () => {
        expect(isWithinDateRange('2024-07-15', '2024-06-01', '2024-06-30')).toBe(false);
    });

    test('returns true for date on range boundary', () => {
        expect(isWithinDateRange('2024-06-01', '2024-06-01', '2024-06-30')).toBe(true);
    });
});
