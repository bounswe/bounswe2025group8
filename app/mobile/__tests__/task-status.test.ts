/**
 * Unit Tests for Task Status Utilities
 * Tests task status parsing, filtering, and display logic
 */

describe('Task Status Utilities', () => {
    describe('parseTaskStatus', () => {
        const parseTaskStatus = (status: string): {
            isOpen: boolean;
            isPending: boolean;
            isCompleted: boolean;
            isCancelled: boolean;
        } => {
            const normalized = status?.toLowerCase().trim() || '';
            return {
                isOpen: normalized === 'open' || normalized === 'pending',
                isPending: normalized === 'in_progress' || normalized === 'assigned',
                isCompleted: normalized === 'completed' || normalized === 'done',
                isCancelled: normalized === 'cancelled' || normalized === 'canceled',
            };
        };

        test('parses open status correctly', () => {
            const result = parseTaskStatus('open');
            expect(result.isOpen).toBe(true);
            expect(result.isPending).toBe(false);
            expect(result.isCompleted).toBe(false);
        });

        test('parses pending status correctly', () => {
            const result = parseTaskStatus('pending');
            expect(result.isOpen).toBe(true);
        });

        test('parses in_progress status correctly', () => {
            const result = parseTaskStatus('in_progress');
            expect(result.isPending).toBe(true);
        });

        test('parses completed status correctly', () => {
            const result = parseTaskStatus('completed');
            expect(result.isCompleted).toBe(true);
        });

        test('parses cancelled status correctly', () => {
            expect(parseTaskStatus('cancelled').isCancelled).toBe(true);
            expect(parseTaskStatus('canceled').isCancelled).toBe(true);
        });

        test('handles empty/null status', () => {
            const result = parseTaskStatus('');
            expect(result.isOpen).toBe(false);
            expect(result.isPending).toBe(false);
        });

        test('handles case insensitivity', () => {
            expect(parseTaskStatus('OPEN').isOpen).toBe(true);
            expect(parseTaskStatus('Completed').isCompleted).toBe(true);
        });
    });

    describe('getStatusColor', () => {
        const getStatusColor = (status: string): string => {
            const normalized = status?.toLowerCase() || '';
            switch (normalized) {
                case 'open':
                case 'pending':
                    return '#4CAF50'; // green
                case 'in_progress':
                case 'assigned':
                    return '#2196F3'; // blue
                case 'completed':
                case 'done':
                    return '#9E9E9E'; // gray
                case 'cancelled':
                case 'canceled':
                    return '#F44336'; // red
                default:
                    return '#757575'; // default gray
            }
        };

        test('returns green for open status', () => {
            expect(getStatusColor('open')).toBe('#4CAF50');
        });

        test('returns blue for in_progress status', () => {
            expect(getStatusColor('in_progress')).toBe('#2196F3');
        });

        test('returns gray for completed status', () => {
            expect(getStatusColor('completed')).toBe('#9E9E9E');
        });

        test('returns red for cancelled status', () => {
            expect(getStatusColor('cancelled')).toBe('#F44336');
        });

        test('returns default gray for unknown status', () => {
            expect(getStatusColor('unknown')).toBe('#757575');
        });
    });

    describe('getStatusDisplayText', () => {
        const getStatusDisplayText = (status: string): string => {
            const displayMap: Record<string, string> = {
                'open': 'Open',
                'pending': 'Pending',
                'in_progress': 'In Progress',
                'assigned': 'Assigned',
                'completed': 'Completed',
                'done': 'Done',
                'cancelled': 'Cancelled',
                'canceled': 'Cancelled',
            };
            return displayMap[status?.toLowerCase()] || 'Unknown';
        };

        test('converts open to display text', () => {
            expect(getStatusDisplayText('open')).toBe('Open');
        });

        test('converts in_progress to readable text', () => {
            expect(getStatusDisplayText('in_progress')).toBe('In Progress');
        });

        test('handles unknown status', () => {
            expect(getStatusDisplayText('random')).toBe('Unknown');
        });
    });

    describe('canUserModifyTask', () => {
        const canUserModifyTask = (task: { creator_id: number; status: string }, userId: number): boolean => {
            if (task.creator_id !== userId) return false;
            const status = task.status?.toLowerCase();
            return status === 'open' || status === 'pending';
        };

        test('returns true when user is creator and status is open', () => {
            expect(canUserModifyTask({ creator_id: 1, status: 'open' }, 1)).toBe(true);
        });

        test('returns false when user is not creator', () => {
            expect(canUserModifyTask({ creator_id: 2, status: 'open' }, 1)).toBe(false);
        });

        test('returns false when status is completed', () => {
            expect(canUserModifyTask({ creator_id: 1, status: 'completed' }, 1)).toBe(false);
        });
    });

    describe('filterTasksByStatus', () => {
        const filterTasksByStatus = (tasks: Array<{ status: string }>, status: string): Array<{ status: string }> => {
            return tasks.filter(task => task.status?.toLowerCase() === status.toLowerCase());
        };

        const mockTasks = [
            { status: 'open' },
            { status: 'completed' },
            { status: 'open' },
            { status: 'in_progress' },
        ];

        test('filters tasks by open status', () => {
            const result = filterTasksByStatus(mockTasks, 'open');
            expect(result.length).toBe(2);
        });

        test('filters tasks by completed status', () => {
            const result = filterTasksByStatus(mockTasks, 'completed');
            expect(result.length).toBe(1);
        });

        test('returns empty array for non-matching status', () => {
            const result = filterTasksByStatus(mockTasks, 'cancelled');
            expect(result.length).toBe(0);
        });
    });
});

describe('Task Priority/Urgency Utilities', () => {
    describe('getUrgencyLabel', () => {
        const getUrgencyLabel = (level: number): string => {
            switch (level) {
                case 1: return 'Low';
                case 2: return 'Medium';
                case 3: return 'High';
                default: return 'Medium';
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

        test('defaults to Medium for invalid level', () => {
            expect(getUrgencyLabel(0)).toBe('Medium');
            expect(getUrgencyLabel(99)).toBe('Medium');
        });
    });

    describe('getUrgencyColor', () => {
        const getUrgencyColor = (level: number): string => {
            switch (level) {
                case 1: return '#4CAF50'; // green
                case 2: return '#FF9800'; // orange
                case 3: return '#F44336'; // red
                default: return '#FF9800';
            }
        };

        test('returns green for low urgency', () => {
            expect(getUrgencyColor(1)).toBe('#4CAF50');
        });

        test('returns orange for medium urgency', () => {
            expect(getUrgencyColor(2)).toBe('#FF9800');
        });

        test('returns red for high urgency', () => {
            expect(getUrgencyColor(3)).toBe('#F44336');
        });
    });

    describe('sortTasksByUrgency', () => {
        const sortTasksByUrgency = (tasks: Array<{ urgency_level: number }>): Array<{ urgency_level: number }> => {
            return [...tasks].sort((a, b) => b.urgency_level - a.urgency_level);
        };

        test('sorts tasks with highest urgency first', () => {
            const tasks = [
                { urgency_level: 1 },
                { urgency_level: 3 },
                { urgency_level: 2 },
            ];
            const sorted = sortTasksByUrgency(tasks);
            expect(sorted[0].urgency_level).toBe(3);
            expect(sorted[1].urgency_level).toBe(2);
            expect(sorted[2].urgency_level).toBe(1);
        });

        test('handles empty array', () => {
            expect(sortTasksByUrgency([])).toEqual([]);
        });
    });
});
