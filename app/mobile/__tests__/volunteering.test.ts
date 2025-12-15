/**
 * Unit Tests for Volunteering Functionality
 * Tests volunteer application, status management, and assignment logic
 */

describe('Volunteer Application', () => {
    describe('Application Validation', () => {
        const canApplyForTask = (userId: number, task: {
            creator_id: number;
            status: string;
            volunteer_number: number;
            assigned_volunteers?: number[];
        }): { canApply: boolean; reason?: string } => {
            // Cannot apply to own task
            if (task.creator_id === userId) {
                return { canApply: false, reason: 'Cannot volunteer for your own task' };
            }

            // Cannot apply to completed/cancelled tasks
            if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
                return { canApply: false, reason: 'Task is no longer accepting volunteers' };
            }

            // Cannot apply if already assigned
            if (task.assigned_volunteers?.includes(userId)) {
                return { canApply: false, reason: 'Already assigned to this task' };
            }

            // Check if task still needs volunteers
            const currentVolunteers = task.assigned_volunteers?.length || 0;
            if (currentVolunteers >= task.volunteer_number) {
                return { canApply: false, reason: 'Task has enough volunteers' };
            }

            return { canApply: true };
        };

        test('allows application to eligible task', () => {
            const task = {
                creator_id: 1,
                status: 'OPEN',
                volunteer_number: 3,
                assigned_volunteers: [],
            };
            expect(canApplyForTask(2, task)).toEqual({ canApply: true });
        });

        test('prevents applying to own task', () => {
            const task = {
                creator_id: 1,
                status: 'OPEN',
                volunteer_number: 3,
            };
            expect(canApplyForTask(1, task).reason).toBe('Cannot volunteer for your own task');
        });

        test('prevents applying to completed task', () => {
            const task = {
                creator_id: 1,
                status: 'COMPLETED',
                volunteer_number: 3,
            };
            expect(canApplyForTask(2, task).reason).toBe('Task is no longer accepting volunteers');
        });

        test('prevents applying if already assigned', () => {
            const task = {
                creator_id: 1,
                status: 'OPEN',
                volunteer_number: 3,
                assigned_volunteers: [2, 3],
            };
            expect(canApplyForTask(2, task).reason).toBe('Already assigned to this task');
        });

        test('prevents applying when task is full', () => {
            const task = {
                creator_id: 1,
                status: 'OPEN',
                volunteer_number: 2,
                assigned_volunteers: [3, 4],
            };
            expect(canApplyForTask(2, task).reason).toBe('Task has enough volunteers');
        });
    });

    describe('Application Status', () => {
        type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

        const APPLICATION_STATUSES: Record<ApplicationStatus, { label: string; color: string }> = {
            pending: { label: 'Pending', color: '#FF9800' },
            accepted: { label: 'Accepted', color: '#4CAF50' },
            rejected: { label: 'Rejected', color: '#F44336' },
        };

        test('has correct labels for all statuses', () => {
            expect(APPLICATION_STATUSES.pending.label).toBe('Pending');
            expect(APPLICATION_STATUSES.accepted.label).toBe('Accepted');
            expect(APPLICATION_STATUSES.rejected.label).toBe('Rejected');
        });

        test('has correct colors for all statuses', () => {
            expect(APPLICATION_STATUSES.pending.color).toBe('#FF9800');
            expect(APPLICATION_STATUSES.accepted.color).toBe('#4CAF50');
            expect(APPLICATION_STATUSES.rejected.color).toBe('#F44336');
        });
    });
});

describe('Volunteer Assignment', () => {
    interface Volunteer {
        id: number;
        user: { id: number; name: string; rating?: number };
        status: 'pending' | 'accepted' | 'rejected';
    }

    describe('Volunteer Filtering', () => {
        const volunteers: Volunteer[] = [
            { id: 1, user: { id: 10, name: 'Alice', rating: 4.5 }, status: 'pending' },
            { id: 2, user: { id: 11, name: 'Bob', rating: 3.8 }, status: 'accepted' },
            { id: 3, user: { id: 12, name: 'Charlie', rating: 4.9 }, status: 'rejected' },
            { id: 4, user: { id: 13, name: 'Diana', rating: 4.2 }, status: 'pending' },
        ];

        test('filters pending volunteers', () => {
            const pending = volunteers.filter(v => v.status === 'pending');
            expect(pending).toHaveLength(2);
        });

        test('filters accepted volunteers', () => {
            const accepted = volunteers.filter(v => v.status === 'accepted');
            expect(accepted).toHaveLength(1);
            expect(accepted[0].user.name).toBe('Bob');
        });

        test('filters rejected volunteers', () => {
            const rejected = volunteers.filter(v => v.status === 'rejected');
            expect(rejected).toHaveLength(1);
        });
    });

    describe('Volunteer Sorting', () => {
        const volunteers = [
            { id: 1, user: { name: 'Alice', rating: 4.5 }, applied_at: '2024-01-02' },
            { id: 2, user: { name: 'Bob', rating: 3.8 }, applied_at: '2024-01-01' },
            { id: 3, user: { name: 'Charlie', rating: 4.9 }, applied_at: '2024-01-03' },
        ];

        test('sorts by rating descending', () => {
            const sorted = [...volunteers].sort((a, b) =>
                (b.user.rating || 0) - (a.user.rating || 0)
            );
            expect(sorted[0].user.name).toBe('Charlie');
            expect(sorted[1].user.name).toBe('Alice');
            expect(sorted[2].user.name).toBe('Bob');
        });

        test('sorts by application date (oldest first)', () => {
            const sorted = [...volunteers].sort((a, b) =>
                new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
            );
            expect(sorted[0].user.name).toBe('Bob');
        });
    });

    describe('Assignment Limits', () => {
        const canAssignMore = (assignedCount: number, maxVolunteers: number): boolean => {
            return assignedCount < maxVolunteers;
        };

        test('allows assignment when under limit', () => {
            expect(canAssignMore(2, 5)).toBe(true);
        });

        test('prevents assignment when at limit', () => {
            expect(canAssignMore(5, 5)).toBe(false);
        });

        test('prevents assignment when over limit', () => {
            expect(canAssignMore(6, 5)).toBe(false);
        });
    });
});

describe('Volunteer Rating Display', () => {
    const formatRating = (rating: number | undefined | null): string => {
        if (rating === undefined || rating === null) return 'No rating';
        return rating.toFixed(1);
    };

    const getRatingStars = (rating: number): number => {
        return Math.round(rating);
    };

    test('formats rating to one decimal place', () => {
        expect(formatRating(4.5)).toBe('4.5');
        expect(formatRating(3.123)).toBe('3.1');
        expect(formatRating(5)).toBe('5.0');
    });

    test('handles missing rating', () => {
        expect(formatRating(undefined)).toBe('No rating');
        expect(formatRating(null)).toBe('No rating');
    });

    test('rounds to correct star count', () => {
        expect(getRatingStars(4.4)).toBe(4);
        expect(getRatingStars(4.5)).toBe(5);
        expect(getRatingStars(3.2)).toBe(3);
    });
});
