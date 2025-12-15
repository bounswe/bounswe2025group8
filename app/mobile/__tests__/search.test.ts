/**
 * Unit Tests for Search Functionality
 * Tests search filtering, query processing, and result handling
 */

describe('Search Query Processing', () => {
    describe('Query Sanitization', () => {
        const sanitizeQuery = (query: string): string => {
            return query
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' '); // Normalize whitespace
        };

        test('trims leading and trailing whitespace', () => {
            expect(sanitizeQuery('  search term  ')).toBe('search term');
        });

        test('converts to lowercase', () => {
            expect(sanitizeQuery('Search TERM')).toBe('search term');
        });

        test('normalizes multiple spaces', () => {
            expect(sanitizeQuery('search    term')).toBe('search term');
        });

        test('handles empty query', () => {
            expect(sanitizeQuery('')).toBe('');
            expect(sanitizeQuery('   ')).toBe('');
        });
    });

    describe('Search Query Validation', () => {
        const isValidSearchQuery = (query: string): boolean => {
            const trimmed = query.trim();
            return trimmed.length >= 2;
        };

        test('accepts queries with 2+ characters', () => {
            expect(isValidSearchQuery('ab')).toBe(true);
            expect(isValidSearchQuery('search')).toBe(true);
        });

        test('rejects queries with less than 2 characters', () => {
            expect(isValidSearchQuery('')).toBe(false);
            expect(isValidSearchQuery('a')).toBe(false);
            expect(isValidSearchQuery(' ')).toBe(false);
        });
    });

    describe('Task Filtering', () => {
        const tasks = [
            { id: 1, title: 'Help with groceries', description: 'Need help carrying bags' },
            { id: 2, title: 'Dog walking', description: 'Walk my dog in the park' },
            { id: 3, title: 'Garden work', description: 'Help with planting groceries' },
        ];

        const filterTasks = (taskList: typeof tasks, query: string): typeof tasks => {
            const searchTerm = query.toLowerCase().trim();
            if (!searchTerm) return taskList;

            return taskList.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        };

        test('filters by title match', () => {
            const results = filterTasks(tasks, 'groceries');
            expect(results).toHaveLength(2);
            expect(results[0].id).toBe(1);
        });

        test('filters by description match', () => {
            const results = filterTasks(tasks, 'park');
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe(2);
        });

        test('is case insensitive', () => {
            const results = filterTasks(tasks, 'DOG');
            expect(results).toHaveLength(1);
        });

        test('returns all tasks for empty query', () => {
            const results = filterTasks(tasks, '');
            expect(results).toHaveLength(3);
        });

        test('returns empty array for no matches', () => {
            const results = filterTasks(tasks, 'xyz123');
            expect(results).toHaveLength(0);
        });
    });
});

describe('Search Result Sorting', () => {
    const tasks = [
        { id: 1, title: 'A Task', created_at: '2024-01-01', urgency_level: 2 },
        { id: 2, title: 'B Task', created_at: '2024-01-03', urgency_level: 3 },
        { id: 3, title: 'C Task', created_at: '2024-01-02', urgency_level: 1 },
    ];

    test('sorts by date descending (newest first)', () => {
        const sorted = [...tasks].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(3);
        expect(sorted[2].id).toBe(1);
    });

    test('sorts by urgency descending (highest first)', () => {
        const sorted = [...tasks].sort((a, b) => b.urgency_level - a.urgency_level);
        expect(sorted[0].id).toBe(2);
        expect(sorted[1].id).toBe(1);
        expect(sorted[2].id).toBe(3);
    });

    test('sorts by title alphabetically', () => {
        const sorted = [...tasks].sort((a, b) => a.title.localeCompare(b.title));
        expect(sorted[0].title).toBe('A Task');
        expect(sorted[1].title).toBe('B Task');
        expect(sorted[2].title).toBe('C Task');
    });
});

describe('Search Debouncing Logic', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('debounce delays function execution', () => {
        const callback = jest.fn();

        const debounce = (fn: () => void, delay: number) => {
            let timeoutId: NodeJS.Timeout;
            return () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn, delay);
            };
        };

        const debouncedCallback = debounce(callback, 300);

        // Call multiple times rapidly
        debouncedCallback();
        debouncedCallback();
        debouncedCallback();

        // Callback should not have been called yet
        expect(callback).not.toHaveBeenCalled();

        // Fast forward past debounce delay
        jest.advanceTimersByTime(300);

        // Now callback should be called once
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
