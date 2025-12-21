/**
 * Unit Tests for Search and Filtering Utilities
 * Tests search query processing, result filtering, and sorting
 */

describe('Search Query Processing', () => {
    describe('normalizeSearchQuery', () => {
        const normalizeSearchQuery = (query: string): string => {
            return query
                .trim()
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\s-]/g, '');
        };

        test('trims whitespace', () => {
            expect(normalizeSearchQuery('  hello world  ')).toBe('hello world');
        });

        test('lowercases query', () => {
            expect(normalizeSearchQuery('Hello World')).toBe('hello world');
        });

        test('removes extra spaces', () => {
            expect(normalizeSearchQuery('hello    world')).toBe('hello world');
        });

        test('removes special characters', () => {
            expect(normalizeSearchQuery('hello@world!')).toBe('helloworld');
        });

        test('keeps hyphens', () => {
            expect(normalizeSearchQuery('pet-care')).toBe('pet-care');
        });
    });

    describe('tokenizeQuery', () => {
        const tokenizeQuery = (query: string): string[] => {
            return query
                .toLowerCase()
                .split(/\s+/)
                .filter(token => token.length >= 2);
        };

        test('splits query into tokens', () => {
            expect(tokenizeQuery('hello world')).toEqual(['hello', 'world']);
        });

        test('filters out short tokens', () => {
            expect(tokenizeQuery('a hello b world')).toEqual(['hello', 'world']);
        });

        test('handles empty query', () => {
            expect(tokenizeQuery('')).toEqual([]);
        });

        test('handles single word', () => {
            expect(tokenizeQuery('hello')).toEqual(['hello']);
        });
    });

    describe('matchesSearchQuery', () => {
        const matchesSearchQuery = (item: { title: string; description?: string }, query: string): boolean => {
            const normalizedQuery = query.toLowerCase();
            const title = item.title?.toLowerCase() || '';
            const description = item.description?.toLowerCase() || '';

            return title.includes(normalizedQuery) || description.includes(normalizedQuery);
        };

        test('matches title', () => {
            const item = { title: 'Grocery Shopping', description: 'Need help' };
            expect(matchesSearchQuery(item, 'grocery')).toBe(true);
        });

        test('matches description', () => {
            const item = { title: 'Help Needed', description: 'Grocery shopping assistance' };
            expect(matchesSearchQuery(item, 'grocery')).toBe(true);
        });

        test('returns false for no match', () => {
            const item = { title: 'Pet Care', description: 'Dog walking' };
            expect(matchesSearchQuery(item, 'grocery')).toBe(false);
        });

        test('case insensitive', () => {
            const item = { title: 'GROCERY', description: '' };
            expect(matchesSearchQuery(item, 'grocery')).toBe(true);
        });
    });

    describe('rankSearchResults', () => {
        const rankSearchResults = (items: Array<{ title: string; description?: string }>, query: string): Array<{ title: string; description?: string; score: number }> => {
            const normalizedQuery = query.toLowerCase();

            return items.map(item => {
                let score = 0;
                const title = item.title?.toLowerCase() || '';
                const description = item.description?.toLowerCase() || '';

                // Title match is worth more
                if (title.includes(normalizedQuery)) score += 10;
                if (title.startsWith(normalizedQuery)) score += 5;
                if (description.includes(normalizedQuery)) score += 3;

                return { ...item, score };
            }).sort((a, b) => b.score - a.score);
        };

        test('ranks title matches higher', () => {
            const items = [
                { title: 'Other Task', description: 'grocery help' },
                { title: 'Grocery Shopping', description: 'need help' },
            ];
            const ranked = rankSearchResults(items, 'grocery');
            expect(ranked[0].title).toBe('Grocery Shopping');
        });

        test('ranks title-start matches highest', () => {
            const items = [
                { title: 'Need Grocery Help', description: '' },
                { title: 'Grocery Help Needed', description: '' },
            ];
            const ranked = rankSearchResults(items, 'grocery');
            expect(ranked[0].title).toBe('Grocery Help Needed');
        });
    });
});

describe('Result Filtering', () => {
    describe('filterByMultipleCriteria', () => {
        interface Task {
            id: number;
            status: string;
            category: string;
            urgency_level: number;
        }

        const filterByMultipleCriteria = (
            tasks: Task[],
            filters: { status?: string; category?: string; urgency?: number }
        ): Task[] => {
            return tasks.filter(task => {
                if (filters.status && task.status !== filters.status) return false;
                if (filters.category && task.category !== filters.category) return false;
                if (filters.urgency && task.urgency_level !== filters.urgency) return false;
                return true;
            });
        };

        const tasks: Task[] = [
            { id: 1, status: 'open', category: 'GROCERY', urgency_level: 1 },
            { id: 2, status: 'open', category: 'PET_CARE', urgency_level: 2 },
            { id: 3, status: 'completed', category: 'GROCERY', urgency_level: 3 },
        ];

        test('filters by single criterion', () => {
            const result = filterByMultipleCriteria(tasks, { status: 'open' });
            expect(result.length).toBe(2);
        });

        test('filters by multiple criteria', () => {
            const result = filterByMultipleCriteria(tasks, { status: 'open', category: 'GROCERY' });
            expect(result.length).toBe(1);
            expect(result[0].id).toBe(1);
        });

        test('returns all when no filters', () => {
            const result = filterByMultipleCriteria(tasks, {});
            expect(result.length).toBe(3);
        });

        test('returns empty for no matches', () => {
            const result = filterByMultipleCriteria(tasks, { status: 'cancelled' });
            expect(result.length).toBe(0);
        });
    });

    describe('filterByDateRange', () => {
        interface Task {
            id: number;
            created_at: string;
        }

        const filterByDateRange = (
            tasks: Task[],
            startDate?: string,
            endDate?: string
        ): Task[] => {
            return tasks.filter(task => {
                const date = new Date(task.created_at);
                if (startDate && date < new Date(startDate)) return false;
                if (endDate && date > new Date(endDate)) return false;
                return true;
            });
        };

        const tasks: Task[] = [
            { id: 1, created_at: '2024-06-01' },
            { id: 2, created_at: '2024-06-15' },
            { id: 3, created_at: '2024-06-30' },
        ];

        test('filters by start date', () => {
            const result = filterByDateRange(tasks, '2024-06-10');
            expect(result.length).toBe(2);
        });

        test('filters by end date', () => {
            const result = filterByDateRange(tasks, undefined, '2024-06-20');
            expect(result.length).toBe(2);
        });

        test('filters by date range', () => {
            const result = filterByDateRange(tasks, '2024-06-10', '2024-06-20');
            expect(result.length).toBe(1);
            expect(result[0].id).toBe(2);
        });
    });
});

describe('Sorting Utilities', () => {
    describe('sortByField', () => {
        const sortByField = <T>(items: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
            return [...items].sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];

                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        };

        const items = [
            { id: 3, name: 'Charlie' },
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];

        test('sorts ascending by id', () => {
            const sorted = sortByField(items, 'id', 'asc');
            expect(sorted[0].id).toBe(1);
            expect(sorted[2].id).toBe(3);
        });

        test('sorts descending by id', () => {
            const sorted = sortByField(items, 'id', 'desc');
            expect(sorted[0].id).toBe(3);
            expect(sorted[2].id).toBe(1);
        });

        test('sorts by string field', () => {
            const sorted = sortByField(items, 'name', 'asc');
            expect(sorted[0].name).toBe('Alice');
            expect(sorted[2].name).toBe('Charlie');
        });
    });

    describe('sortByMultipleFields', () => {
        interface Item {
            category: string;
            urgency: number;
            created_at: string;
        }

        const sortByMultipleFields = (
            items: Item[],
            fields: Array<{ field: keyof Item; order: 'asc' | 'desc' }>
        ): Item[] => {
            return [...items].sort((a, b) => {
                for (const { field, order } of fields) {
                    if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
                    if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
                }
                return 0;
            });
        };

        const items: Item[] = [
            { category: 'A', urgency: 2, created_at: '2024-01-01' },
            { category: 'B', urgency: 1, created_at: '2024-01-02' },
            { category: 'A', urgency: 1, created_at: '2024-01-03' },
        ];

        test('sorts by multiple fields', () => {
            const sorted = sortByMultipleFields(items, [
                { field: 'category', order: 'asc' },
                { field: 'urgency', order: 'desc' },
            ]);

            expect(sorted[0].category).toBe('A');
            expect(sorted[0].urgency).toBe(2);
            expect(sorted[1].category).toBe('A');
            expect(sorted[1].urgency).toBe(1);
        });
    });
});
