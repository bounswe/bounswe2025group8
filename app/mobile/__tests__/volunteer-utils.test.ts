/**
 * Unit Tests for Volunteer and Task Assignment Utilities
 * Tests volunteer status, assignment logic, and applicant handling
 */

describe('Volunteer Status Utilities', () => {
    const VOLUNTEER_STATUS = {
        PENDING: 'PENDING',
        ACCEPTED: 'ACCEPTED',
        REJECTED: 'REJECTED',
        WITHDRAWN: 'WITHDRAWN',
    };

    describe('parseVolunteerStatus', () => {
        const parseVolunteerStatus = (status: string): {
            isPending: boolean;
            isAccepted: boolean;
            isRejected: boolean;
            isWithdrawn: boolean;
        } => {
            const normalized = status?.toUpperCase() || '';
            return {
                isPending: normalized === 'PENDING',
                isAccepted: normalized === 'ACCEPTED',
                isRejected: normalized === 'REJECTED',
                isWithdrawn: normalized === 'WITHDRAWN',
            };
        };

        test('parses pending status', () => {
            const result = parseVolunteerStatus('PENDING');
            expect(result.isPending).toBe(true);
            expect(result.isAccepted).toBe(false);
        });

        test('parses accepted status', () => {
            const result = parseVolunteerStatus('ACCEPTED');
            expect(result.isAccepted).toBe(true);
        });

        test('parses rejected status', () => {
            const result = parseVolunteerStatus('REJECTED');
            expect(result.isRejected).toBe(true);
        });

        test('handles case insensitivity', () => {
            expect(parseVolunteerStatus('pending').isPending).toBe(true);
            expect(parseVolunteerStatus('Accepted').isAccepted).toBe(true);
        });
    });

    describe('getVolunteerStatusColor', () => {
        const getVolunteerStatusColor = (status: string): string => {
            switch (status?.toUpperCase()) {
                case 'PENDING': return '#FFC107';   // yellow
                case 'ACCEPTED': return '#4CAF50';  // green
                case 'REJECTED': return '#F44336';  // red
                case 'WITHDRAWN': return '#9E9E9E'; // gray
                default: return '#757575';
            }
        };

        test('returns yellow for pending', () => {
            expect(getVolunteerStatusColor('PENDING')).toBe('#FFC107');
        });

        test('returns green for accepted', () => {
            expect(getVolunteerStatusColor('ACCEPTED')).toBe('#4CAF50');
        });

        test('returns red for rejected', () => {
            expect(getVolunteerStatusColor('REJECTED')).toBe('#F44336');
        });

        test('returns default for unknown', () => {
            expect(getVolunteerStatusColor('UNKNOWN')).toBe('#757575');
        });
    });

    describe('canWithdrawApplication', () => {
        const canWithdrawApplication = (status: string): boolean => {
            const normalized = status?.toUpperCase();
            return normalized === 'PENDING';
        };

        test('returns true for pending', () => {
            expect(canWithdrawApplication('PENDING')).toBe(true);
        });

        test('returns false for accepted', () => {
            expect(canWithdrawApplication('ACCEPTED')).toBe(false);
        });

        test('returns false for rejected', () => {
            expect(canWithdrawApplication('REJECTED')).toBe(false);
        });
    });
});

describe('Task Assignment Utilities', () => {
    describe('canUserVolunteer', () => {
        interface Task {
            status: string;
            creator_id: number;
            volunteer_number: number;
        }

        interface Volunteer {
            user_id: number;
            status: string;
        }

        const canUserVolunteer = (
            task: Task,
            userId: number,
            existingVolunteers: Volunteer[]
        ): { canVolunteer: boolean; reason?: string } => {
            // Can't volunteer for own task
            if (task.creator_id === userId) {
                return { canVolunteer: false, reason: 'Cannot volunteer for your own task' };
            }

            // Task must be open
            if (task.status?.toLowerCase() !== 'open') {
                return { canVolunteer: false, reason: 'Task is not open for volunteers' };
            }

            // Check if already volunteered
            const existingApplication = existingVolunteers.find(v => v.user_id === userId);
            if (existingApplication) {
                return { canVolunteer: false, reason: 'You have already applied' };
            }

            // Check volunteer limit
            const acceptedCount = existingVolunteers.filter(v => v.status === 'ACCEPTED').length;
            if (acceptedCount >= task.volunteer_number) {
                return { canVolunteer: false, reason: 'Volunteer slots are full' };
            }

            return { canVolunteer: true };
        };

        test('allows volunteering for open task', () => {
            const task = { status: 'open', creator_id: 1, volunteer_number: 5 };
            const result = canUserVolunteer(task, 2, []);
            expect(result.canVolunteer).toBe(true);
        });

        test('prevents volunteering for own task', () => {
            const task = { status: 'open', creator_id: 1, volunteer_number: 5 };
            const result = canUserVolunteer(task, 1, []);
            expect(result.canVolunteer).toBe(false);
            expect(result.reason).toContain('own task');
        });

        test('prevents volunteering for closed task', () => {
            const task = { status: 'completed', creator_id: 1, volunteer_number: 5 };
            const result = canUserVolunteer(task, 2, []);
            expect(result.canVolunteer).toBe(false);
        });

        test('prevents double application', () => {
            const task = { status: 'open', creator_id: 1, volunteer_number: 5 };
            const volunteers = [{ user_id: 2, status: 'PENDING' }];
            const result = canUserVolunteer(task, 2, volunteers);
            expect(result.canVolunteer).toBe(false);
            expect(result.reason).toContain('already applied');
        });

        test('prevents when slots are full', () => {
            const task = { status: 'open', creator_id: 1, volunteer_number: 1 };
            const volunteers = [{ user_id: 3, status: 'ACCEPTED' }];
            const result = canUserVolunteer(task, 2, volunteers);
            expect(result.canVolunteer).toBe(false);
            expect(result.reason).toContain('full');
        });
    });

    describe('getAvailableSlots', () => {
        const getAvailableSlots = (
            totalSlots: number,
            volunteers: Array<{ status: string }>
        ): number => {
            const acceptedCount = volunteers.filter(v => v.status === 'ACCEPTED').length;
            return Math.max(0, totalSlots - acceptedCount);
        };

        test('calculates available slots', () => {
            const volunteers = [
                { status: 'ACCEPTED' },
                { status: 'PENDING' },
                { status: 'REJECTED' },
            ];
            expect(getAvailableSlots(3, volunteers)).toBe(2);
        });

        test('returns 0 when all slots filled', () => {
            const volunteers = [
                { status: 'ACCEPTED' },
                { status: 'ACCEPTED' },
            ];
            expect(getAvailableSlots(2, volunteers)).toBe(0);
        });

        test('handles empty volunteers', () => {
            expect(getAvailableSlots(5, [])).toBe(5);
        });
    });

    describe('sortVolunteersByDate', () => {
        const sortVolunteersByDate = (
            volunteers: Array<{ volunteered_at: string }>,
            order: 'asc' | 'desc' = 'desc'
        ): Array<{ volunteered_at: string }> => {
            return [...volunteers].sort((a, b) => {
                const dateA = new Date(a.volunteered_at).getTime();
                const dateB = new Date(b.volunteered_at).getTime();
                return order === 'desc' ? dateB - dateA : dateA - dateB;
            });
        };

        test('sorts newest first by default', () => {
            const volunteers = [
                { volunteered_at: '2024-01-01' },
                { volunteered_at: '2024-01-03' },
                { volunteered_at: '2024-01-02' },
            ];
            const sorted = sortVolunteersByDate(volunteers);
            expect(sorted[0].volunteered_at).toBe('2024-01-03');
        });

        test('sorts oldest first when ascending', () => {
            const volunteers = [
                { volunteered_at: '2024-01-03' },
                { volunteered_at: '2024-01-01' },
            ];
            const sorted = sortVolunteersByDate(volunteers, 'asc');
            expect(sorted[0].volunteered_at).toBe('2024-01-01');
        });
    });

    describe('groupVolunteersByStatus', () => {
        const groupVolunteersByStatus = (
            volunteers: Array<{ id: number; status: string }>
        ): Record<string, Array<{ id: number; status: string }>> => {
            return volunteers.reduce((groups, volunteer) => {
                const status = volunteer.status || 'UNKNOWN';
                if (!groups[status]) {
                    groups[status] = [];
                }
                groups[status].push(volunteer);
                return groups;
            }, {} as Record<string, Array<{ id: number; status: string }>>);
        };

        test('groups volunteers by status', () => {
            const volunteers = [
                { id: 1, status: 'PENDING' },
                { id: 2, status: 'ACCEPTED' },
                { id: 3, status: 'PENDING' },
            ];
            const grouped = groupVolunteersByStatus(volunteers);

            expect(grouped['PENDING'].length).toBe(2);
            expect(grouped['ACCEPTED'].length).toBe(1);
        });

        test('handles empty array', () => {
            expect(groupVolunteersByStatus([])).toEqual({});
        });
    });
});

describe('Applicant Statistics', () => {
    describe('getApplicationStats', () => {
        const getApplicationStats = (
            volunteers: Array<{ status: string }>
        ): { total: number; pending: number; accepted: number; rejected: number } => {
            return {
                total: volunteers.length,
                pending: volunteers.filter(v => v.status === 'PENDING').length,
                accepted: volunteers.filter(v => v.status === 'ACCEPTED').length,
                rejected: volunteers.filter(v => v.status === 'REJECTED').length,
            };
        };

        test('calculates stats correctly', () => {
            const volunteers = [
                { status: 'PENDING' },
                { status: 'PENDING' },
                { status: 'ACCEPTED' },
                { status: 'REJECTED' },
            ];
            const stats = getApplicationStats(volunteers);

            expect(stats.total).toBe(4);
            expect(stats.pending).toBe(2);
            expect(stats.accepted).toBe(1);
            expect(stats.rejected).toBe(1);
        });

        test('handles empty array', () => {
            const stats = getApplicationStats([]);
            expect(stats.total).toBe(0);
            expect(stats.pending).toBe(0);
        });
    });

    describe('getAcceptanceRate', () => {
        const getAcceptanceRate = (
            volunteers: Array<{ status: string }>
        ): number => {
            const decided = volunteers.filter(v =>
                v.status === 'ACCEPTED' || v.status === 'REJECTED'
            );
            if (decided.length === 0) return 0;

            const accepted = volunteers.filter(v => v.status === 'ACCEPTED').length;
            return Math.round((accepted / decided.length) * 100);
        };

        test('calculates acceptance rate', () => {
            const volunteers = [
                { status: 'ACCEPTED' },
                { status: 'REJECTED' },
                { status: 'REJECTED' },
                { status: 'PENDING' },
            ];
            expect(getAcceptanceRate(volunteers)).toBe(33); // 1/3
        });

        test('returns 0 for no decisions', () => {
            const volunteers = [{ status: 'PENDING' }];
            expect(getAcceptanceRate(volunteers)).toBe(0);
        });

        test('returns 100 for all accepted', () => {
            const volunteers = [
                { status: 'ACCEPTED' },
                { status: 'ACCEPTED' },
            ];
            expect(getAcceptanceRate(volunteers)).toBe(100);
        });
    });
});
