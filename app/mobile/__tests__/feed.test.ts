/**
 * Unit Tests for Feed Page Functionality
 * Tests task list processing, filtering, pagination, and refresh logic
 */

describe('Feed Task List Processing', () => {
    const mockTasks = [
        { id: 1, title: 'Task 1', status: 'OPEN', urgency_level: 3, created_at: '2024-01-01' },
        { id: 2, title: 'Task 2', status: 'IN_PROGRESS', urgency_level: 2, created_at: '2024-01-02' },
        { id: 3, title: 'Task 3', status: 'COMPLETED', urgency_level: 1, created_at: '2024-01-03' },
        { id: 4, title: 'Task 4', status: 'OPEN', urgency_level: 3, created_at: '2024-01-04' },
    ];

    describe('Status Filtering', () => {
        const filterByStatus = (tasks: typeof mockTasks, status: string): typeof mockTasks => {
            if (!status || status === 'ALL') return tasks;
            return tasks.filter(t => t.status === status);
        };

        test('filters by OPEN status', () => {
            const result = filterByStatus(mockTasks, 'OPEN');
            expect(result).toHaveLength(2);
            expect(result.every(t => t.status === 'OPEN')).toBe(true);
        });

        test('filters by IN_PROGRESS status', () => {
            const result = filterByStatus(mockTasks, 'IN_PROGRESS');
            expect(result).toHaveLength(1);
        });

        test('filters by COMPLETED status', () => {
            const result = filterByStatus(mockTasks, 'COMPLETED');
            expect(result).toHaveLength(1);
        });

        test('returns all tasks when status is ALL', () => {
            const result = filterByStatus(mockTasks, 'ALL');
            expect(result).toHaveLength(4);
        });

        test('returns all tasks when status is empty', () => {
            const result = filterByStatus(mockTasks, '');
            expect(result).toHaveLength(4);
        });
    });

    describe('Urgency Filtering', () => {
        const filterByUrgency = (tasks: typeof mockTasks, level: number): typeof mockTasks => {
            if (!level) return tasks;
            return tasks.filter(t => t.urgency_level === level);
        };

        test('filters by high urgency (3)', () => {
            const result = filterByUrgency(mockTasks, 3);
            expect(result).toHaveLength(2);
        });

        test('filters by medium urgency (2)', () => {
            const result = filterByUrgency(mockTasks, 2);
            expect(result).toHaveLength(1);
        });

        test('filters by low urgency (1)', () => {
            const result = filterByUrgency(mockTasks, 1);
            expect(result).toHaveLength(1);
        });
    });

    describe('Combined Filtering', () => {
        const filterTasks = (tasks: typeof mockTasks, status: string, urgency: number): typeof mockTasks => {
            return tasks.filter(t => {
                const statusMatch = !status || status === 'ALL' || t.status === status;
                const urgencyMatch = !urgency || t.urgency_level === urgency;
                return statusMatch && urgencyMatch;
            });
        };

        test('filters by both status and urgency', () => {
            const result = filterTasks(mockTasks, 'OPEN', 3);
            expect(result).toHaveLength(2);
        });

        test('handles no matching results', () => {
            const result = filterTasks(mockTasks, 'COMPLETED', 3);
            expect(result).toHaveLength(0);
        });
    });
});

describe('Feed Pagination', () => {
    const allTasks = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
    }));

    const paginateTasks = (tasks: typeof allTasks, page: number, pageSize: number) => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return {
            data: tasks.slice(startIndex, endIndex),
            hasMore: endIndex < tasks.length,
            totalPages: Math.ceil(tasks.length / pageSize),
        };
    };

    test('returns first page correctly', () => {
        const result = paginateTasks(allTasks, 1, 10);
        expect(result.data).toHaveLength(10);
        expect(result.data[0].id).toBe(1);
        expect(result.hasMore).toBe(true);
    });

    test('returns second page correctly', () => {
        const result = paginateTasks(allTasks, 2, 10);
        expect(result.data).toHaveLength(10);
        expect(result.data[0].id).toBe(11);
        expect(result.hasMore).toBe(true);
    });

    test('returns last page with remaining items', () => {
        const result = paginateTasks(allTasks, 3, 10);
        expect(result.data).toHaveLength(5);
        expect(result.hasMore).toBe(false);
    });

    test('calculates total pages correctly', () => {
        const result = paginateTasks(allTasks, 1, 10);
        expect(result.totalPages).toBe(3);
    });
});

describe('Feed Sorting', () => {
    const tasks = [
        { id: 1, urgency_level: 2, created_at: '2024-01-01', distance: 5 },
        { id: 2, urgency_level: 3, created_at: '2024-01-03', distance: 10 },
        { id: 3, urgency_level: 1, created_at: '2024-01-02', distance: 2 },
    ];

    type SortOption = 'newest' | 'urgency' | 'distance';

    const sortTasks = (taskList: typeof tasks, sortBy: SortOption) => {
        return [...taskList].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'urgency':
                    return b.urgency_level - a.urgency_level;
                case 'distance':
                    return a.distance - b.distance;
                default:
                    return 0;
            }
        });
    };

    test('sorts by newest first', () => {
        const sorted = sortTasks(tasks, 'newest');
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(3);
        expect(sorted[2].id).toBe(1);
    });

    test('sorts by highest urgency first', () => {
        const sorted = sortTasks(tasks, 'urgency');
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(1);
        expect(sorted[2].id).toBe(3);
    });

    test('sorts by nearest distance first', () => {
        const sorted = sortTasks(tasks, 'distance');
        expect(sorted[0].id).toBe(3);
        expect(sorted[1].id).toBe(1);
        expect(sorted[2].id).toBe(2);
    });
});

describe('Task Status Display', () => {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'OPEN':
                return '#4CAF50'; // Green
            case 'IN_PROGRESS':
                return '#FF9800'; // Orange
            case 'COMPLETED':
                return '#2196F3'; // Blue
            case 'CANCELLED':
                return '#F44336'; // Red
            default:
                return '#9E9E9E'; // Gray
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'OPEN':
                return 'Open';
            case 'IN_PROGRESS':
                return 'In Progress';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    test('returns correct color for each status', () => {
        expect(getStatusColor('OPEN')).toBe('#4CAF50');
        expect(getStatusColor('IN_PROGRESS')).toBe('#FF9800');
        expect(getStatusColor('COMPLETED')).toBe('#2196F3');
        expect(getStatusColor('CANCELLED')).toBe('#F44336');
    });

    test('returns gray for unknown status', () => {
        expect(getStatusColor('UNKNOWN')).toBe('#9E9E9E');
    });

    test('returns correct label for each status', () => {
        expect(getStatusLabel('OPEN')).toBe('Open');
        expect(getStatusLabel('IN_PROGRESS')).toBe('In Progress');
        expect(getStatusLabel('COMPLETED')).toBe('Completed');
    });
});
