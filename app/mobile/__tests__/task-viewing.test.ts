/**
 * Unit Tests for Task Viewing Functionality
 * Tests task details display, status transitions, and interactions
 */

describe('Task Details Processing', () => {
    describe('Task Status Transitions', () => {
        const VALID_TRANSITIONS: Record<string, string[]> = {
            'OPEN': ['IN_PROGRESS', 'CANCELLED'],
            'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': [],
        };

        const canTransition = (currentStatus: string, newStatus: string): boolean => {
            return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
        };

        test('allows transition from OPEN to IN_PROGRESS', () => {
            expect(canTransition('OPEN', 'IN_PROGRESS')).toBe(true);
        });

        test('allows transition from IN_PROGRESS to COMPLETED', () => {
            expect(canTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
        });

        test('prevents transition from OPEN to COMPLETED directly', () => {
            expect(canTransition('OPEN', 'COMPLETED')).toBe(false);
        });

        test('prevents any transition from COMPLETED', () => {
            expect(canTransition('COMPLETED', 'OPEN')).toBe(false);
            expect(canTransition('COMPLETED', 'CANCELLED')).toBe(false);
        });

        test('allows cancellation from OPEN and IN_PROGRESS', () => {
            expect(canTransition('OPEN', 'CANCELLED')).toBe(true);
            expect(canTransition('IN_PROGRESS', 'CANCELLED')).toBe(true);
        });
    });

    describe('Deadline Formatting', () => {
        const formatDeadline = (deadline: string | null): string => {
            if (!deadline) return 'No deadline';

            const date = new Date(deadline);
            const now = new Date();
            const diffMs = date.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMs < 0) return 'Overdue';
            if (diffHours < 24) return 'Due today';
            if (diffHours < 48) return 'Due tomorrow';
            if (diffDays <= 7) return `${diffDays} days left`;
            return date.toLocaleDateString();
        };

        test('handles no deadline', () => {
            expect(formatDeadline(null)).toBe('No deadline');
        });

        test('identifies overdue tasks', () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            expect(formatDeadline(yesterday)).toBe('Overdue');
        });

        test('identifies tasks due today', () => {
            const inFiveHours = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
            expect(formatDeadline(inFiveHours)).toBe('Due today');
        });

        test('identifies tasks due tomorrow', () => {
            const inThirtyHours = new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString();
            expect(formatDeadline(inThirtyHours)).toBe('Due tomorrow');
        });

        test('shows days left for nearby deadlines', () => {
            const fiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
            expect(formatDeadline(fiveDays)).toBe('5 days left');
        });
    });

    describe('Volunteer Progress', () => {
        const getVolunteerProgress = (assigned: number, needed: number): {
            percentage: number;
            label: string;
            isFull: boolean;
        } => {
            const percentage = Math.min((assigned / needed) * 100, 100);
            const isFull = assigned >= needed;
            const label = `${assigned}/${needed} volunteers`;

            return { percentage, label, isFull };
        };

        test('calculates correct percentage', () => {
            expect(getVolunteerProgress(2, 4).percentage).toBe(50);
            expect(getVolunteerProgress(3, 3).percentage).toBe(100);
        });

        test('caps percentage at 100', () => {
            expect(getVolunteerProgress(5, 3).percentage).toBe(100);
        });

        test('generates correct label', () => {
            expect(getVolunteerProgress(2, 4).label).toBe('2/4 volunteers');
        });

        test('indicates when full', () => {
            expect(getVolunteerProgress(3, 3).isFull).toBe(true);
            expect(getVolunteerProgress(2, 4).isFull).toBe(false);
        });
    });
});

describe('Task Actions', () => {
    describe('Action Visibility', () => {
        interface Task {
            creator_id: number;
            status: string;
            assigned_volunteers?: number[];
        }

        const getAvailableActions = (userId: number, task: Task): string[] => {
            const actions: string[] = [];
            const isCreator = task.creator_id === userId;
            const isVolunteer = task.assigned_volunteers?.includes(userId) ?? false;

            if (isCreator) {
                if (task.status === 'OPEN' || task.status === 'IN_PROGRESS') {
                    actions.push('edit', 'cancel');
                }
                if (task.status === 'IN_PROGRESS') {
                    actions.push('complete');
                }
                if (task.status === 'OPEN') {
                    actions.push('selectVolunteers');
                }
            }

            if (isVolunteer && task.status === 'IN_PROGRESS') {
                actions.push('markProgress');
            }

            if (!isCreator && !isVolunteer && task.status === 'OPEN') {
                actions.push('apply');
            }

            return actions;
        };

        test('shows creator actions for open task', () => {
            const actions = getAvailableActions(1, { creator_id: 1, status: 'OPEN' });
            expect(actions).toContain('edit');
            expect(actions).toContain('cancel');
            expect(actions).toContain('selectVolunteers');
        });

        test('shows complete action for in-progress task creator', () => {
            const actions = getAvailableActions(1, { creator_id: 1, status: 'IN_PROGRESS' });
            expect(actions).toContain('complete');
        });

        test('shows apply action for non-creator on open task', () => {
            const actions = getAvailableActions(2, { creator_id: 1, status: 'OPEN' });
            expect(actions).toContain('apply');
        });

        test('shows markProgress for assigned volunteer', () => {
            const actions = getAvailableActions(2, {
                creator_id: 1,
                status: 'IN_PROGRESS',
                assigned_volunteers: [2, 3]
            });
            expect(actions).toContain('markProgress');
        });

        test('shows no actions for completed task', () => {
            const actions = getAvailableActions(1, { creator_id: 1, status: 'COMPLETED' });
            expect(actions).toHaveLength(0);
        });
    });

    describe('Report Validation', () => {
        const validateReport = (reason: string, description: string): {
            valid: boolean;
            error?: string
        } => {
            if (!reason) {
                return { valid: false, error: 'Please select a reason' };
            }
            if (description.trim().length < 10) {
                return { valid: false, error: 'Description must be at least 10 characters' };
            }
            if (description.length > 1000) {
                return { valid: false, error: 'Description must be less than 1000 characters' };
            }
            return { valid: true };
        };

        test('accepts valid report', () => {
            expect(validateReport('spam', 'This task is spam content that violates guidelines').valid).toBe(true);
        });

        test('rejects report without reason', () => {
            expect(validateReport('', 'Some description here').error).toBe('Please select a reason');
        });

        test('rejects report with short description', () => {
            expect(validateReport('spam', 'Short').error).toBe('Description must be at least 10 characters');
        });
    });
});

describe('Comment System', () => {
    describe('Comment Validation', () => {
        const validateComment = (text: string): { valid: boolean; error?: string } => {
            const trimmed = text.trim();
            if (!trimmed) {
                return { valid: false, error: 'Comment cannot be empty' };
            }
            if (trimmed.length > 500) {
                return { valid: false, error: 'Comment too long (max 500 characters)' };
            }
            return { valid: true };
        };

        test('accepts valid comment', () => {
            expect(validateComment('This is a helpful comment!').valid).toBe(true);
        });

        test('rejects empty comment', () => {
            expect(validateComment('').error).toBe('Comment cannot be empty');
            expect(validateComment('   ').error).toBe('Comment cannot be empty');
        });

        test('rejects too long comment', () => {
            expect(validateComment('a'.repeat(501)).error).toBe('Comment too long (max 500 characters)');
        });
    });

    describe('Comment Sorting', () => {
        const comments = [
            { id: 1, created_at: '2024-01-01T10:00:00Z', author_id: 1 },
            { id: 2, created_at: '2024-01-01T12:00:00Z', author_id: 2 },
            { id: 3, created_at: '2024-01-01T09:00:00Z', author_id: 1 },
        ];

        test('sorts by date descending (newest first)', () => {
            const sorted = [...comments].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            expect(sorted[0].id).toBe(2);
            expect(sorted[1].id).toBe(1);
            expect(sorted[2].id).toBe(3);
        });

        test('sorts by date ascending (oldest first)', () => {
            const sorted = [...comments].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            expect(sorted[0].id).toBe(3);
        });
    });
});
