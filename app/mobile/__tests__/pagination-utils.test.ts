/**
 * Unit Tests for Pagination Utilities
 * Tests pagination calculations, cursor handling, and list management
 */

describe('Pagination Utilities', () => {
    describe('calculatePaginationInfo', () => {
        const calculatePaginationInfo = (
            totalItems: number,
            currentPage: number,
            pageSize: number
        ): {
            totalPages: number;
            hasNext: boolean;
            hasPrevious: boolean;
            startItem: number;
            endItem: number;
        } => {
            const totalPages = Math.ceil(totalItems / pageSize);
            const startItem = (currentPage - 1) * pageSize + 1;
            const endItem = Math.min(currentPage * pageSize, totalItems);

            return {
                totalPages,
                hasNext: currentPage < totalPages,
                hasPrevious: currentPage > 1,
                startItem: totalItems > 0 ? startItem : 0,
                endItem: totalItems > 0 ? endItem : 0,
            };
        };

        test('calculates for first page', () => {
            const info = calculatePaginationInfo(100, 1, 10);
            expect(info.totalPages).toBe(10);
            expect(info.hasNext).toBe(true);
            expect(info.hasPrevious).toBe(false);
            expect(info.startItem).toBe(1);
            expect(info.endItem).toBe(10);
        });

        test('calculates for middle page', () => {
            const info = calculatePaginationInfo(100, 5, 10);
            expect(info.hasNext).toBe(true);
            expect(info.hasPrevious).toBe(true);
            expect(info.startItem).toBe(41);
            expect(info.endItem).toBe(50);
        });

        test('calculates for last page', () => {
            const info = calculatePaginationInfo(100, 10, 10);
            expect(info.hasNext).toBe(false);
            expect(info.hasPrevious).toBe(true);
        });

        test('handles partial last page', () => {
            const info = calculatePaginationInfo(95, 10, 10);
            expect(info.startItem).toBe(91);
            expect(info.endItem).toBe(95);
        });

        test('handles empty list', () => {
            const info = calculatePaginationInfo(0, 1, 10);
            expect(info.totalPages).toBe(0);
            expect(info.hasNext).toBe(false);
            expect(info.hasPrevious).toBe(false);
            expect(info.startItem).toBe(0);
            expect(info.endItem).toBe(0);
        });
    });

    describe('getPageNumbers', () => {
        const getPageNumbers = (
            currentPage: number,
            totalPages: number,
            maxVisible: number = 5
        ): number[] => {
            if (totalPages <= maxVisible) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            const half = Math.floor(maxVisible / 2);
            let start = Math.max(1, currentPage - half);
            let end = Math.min(totalPages, start + maxVisible - 1);

            // Adjust if we're at the end
            if (end - start < maxVisible - 1) {
                start = Math.max(1, end - maxVisible + 1);
            }

            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        };

        test('returns all pages when total is less than max', () => {
            expect(getPageNumbers(1, 3, 5)).toEqual([1, 2, 3]);
        });

        test('shows pages around current page', () => {
            const pages = getPageNumbers(5, 10, 5);
            expect(pages).toContain(5);
            expect(pages.length).toBe(5);
        });

        test('handles first page', () => {
            const pages = getPageNumbers(1, 10, 5);
            expect(pages).toEqual([1, 2, 3, 4, 5]);
        });

        test('handles last page', () => {
            const pages = getPageNumbers(10, 10, 5);
            expect(pages).toEqual([6, 7, 8, 9, 10]);
        });
    });

    describe('sliceForPage', () => {
        const sliceForPage = <T>(items: T[], page: number, pageSize: number): T[] => {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return items.slice(start, end);
        };

        const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        test('returns first page', () => {
            expect(sliceForPage(items, 1, 3)).toEqual([1, 2, 3]);
        });

        test('returns middle page', () => {
            expect(sliceForPage(items, 2, 3)).toEqual([4, 5, 6]);
        });

        test('returns partial last page', () => {
            expect(sliceForPage(items, 4, 3)).toEqual([10]);
        });

        test('returns empty for out of range', () => {
            expect(sliceForPage(items, 5, 3)).toEqual([]);
        });
    });
});

describe('Infinite Scroll Utilities', () => {
    describe('shouldLoadMore', () => {
        const shouldLoadMore = (
            scrollPosition: number,
            contentHeight: number,
            viewportHeight: number,
            threshold: number = 0.8
        ): boolean => {
            if (contentHeight === 0) return false;
            const scrollPercentage = (scrollPosition + viewportHeight) / contentHeight;
            return scrollPercentage >= threshold;
        };

        test('returns true when near bottom', () => {
            // 900 scrolled, 100 viewport, 1000 content = 100% scrolled
            expect(shouldLoadMore(900, 1000, 100, 0.8)).toBe(true);
        });

        test('returns false when at top', () => {
            expect(shouldLoadMore(0, 1000, 100, 0.8)).toBe(false);
        });

        test('returns true at threshold', () => {
            // 700 scrolled, 100 viewport = 80% of 1000
            expect(shouldLoadMore(700, 1000, 100, 0.8)).toBe(true);
        });

        test('returns false when no content', () => {
            expect(shouldLoadMore(0, 0, 100, 0.8)).toBe(false);
        });
    });

    describe('mergePagedResults', () => {
        interface Item {
            id: number;
            value: string;
        }

        const mergePagedResults = (
            existing: Item[],
            newItems: Item[],
            idKey: keyof Item = 'id'
        ): Item[] => {
            const existingIds = new Set(existing.map(item => item[idKey]));
            const uniqueNew = newItems.filter(item => !existingIds.has(item[idKey]));
            return [...existing, ...uniqueNew];
        };

        test('merges without duplicates', () => {
            const existing = [{ id: 1, value: 'a' }, { id: 2, value: 'b' }];
            const newItems = [{ id: 2, value: 'b' }, { id: 3, value: 'c' }];
            const merged = mergePagedResults(existing, newItems);

            expect(merged.length).toBe(3);
            expect(merged.map(i => i.id)).toEqual([1, 2, 3]);
        });

        test('handles empty existing', () => {
            const newItems = [{ id: 1, value: 'a' }];
            const merged = mergePagedResults([], newItems);
            expect(merged.length).toBe(1);
        });

        test('handles empty new items', () => {
            const existing = [{ id: 1, value: 'a' }];
            const merged = mergePagedResults(existing, []);
            expect(merged.length).toBe(1);
        });
    });

    describe('resetToFirstPage', () => {
        interface PaginationState {
            items: any[];
            page: number;
            hasMore: boolean;
            isLoading: boolean;
        }

        const resetToFirstPage = (state: PaginationState): PaginationState => {
            return {
                items: [],
                page: 1,
                hasMore: true,
                isLoading: false,
            };
        };

        test('resets pagination state', () => {
            const currentState = {
                items: [1, 2, 3],
                page: 5,
                hasMore: false,
                isLoading: true,
            };
            const reset = resetToFirstPage(currentState);

            expect(reset.items).toEqual([]);
            expect(reset.page).toBe(1);
            expect(reset.hasMore).toBe(true);
            expect(reset.isLoading).toBe(false);
        });
    });
});

describe('Cursor-Based Pagination', () => {
    describe('extractCursor', () => {
        const extractCursor = (url: string | null): string | null => {
            if (!url) return null;
            try {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('cursor');
            } catch {
                // Handle relative URLs
                const match = url.match(/cursor=([^&]+)/);
                return match ? match[1] : null;
            }
        };

        test('extracts cursor from full URL', () => {
            const url = 'https://api.example.com/tasks?cursor=abc123';
            expect(extractCursor(url)).toBe('abc123');
        });

        test('extracts cursor from relative URL', () => {
            const url = '/api/tasks?cursor=xyz789&page=2';
            expect(extractCursor(url)).toBe('xyz789');
        });

        test('returns null when no cursor', () => {
            expect(extractCursor('https://api.example.com/tasks')).toBeNull();
        });

        test('returns null for null URL', () => {
            expect(extractCursor(null)).toBeNull();
        });
    });

    describe('buildPaginatedUrl', () => {
        const buildPaginatedUrl = (
            baseUrl: string,
            params: { page?: number; limit?: number; cursor?: string }
        ): string => {
            const queryParts: string[] = [];

            if (params.cursor) {
                queryParts.push(`cursor=${encodeURIComponent(params.cursor)}`);
            } else if (params.page) {
                queryParts.push(`page=${params.page}`);
            }

            if (params.limit) {
                queryParts.push(`limit=${params.limit}`);
            }

            return queryParts.length > 0
                ? `${baseUrl}?${queryParts.join('&')}`
                : baseUrl;
        };

        test('builds URL with page', () => {
            const url = buildPaginatedUrl('/api/tasks', { page: 2, limit: 10 });
            expect(url).toBe('/api/tasks?page=2&limit=10');
        });

        test('builds URL with cursor', () => {
            const url = buildPaginatedUrl('/api/tasks', { cursor: 'abc', limit: 10 });
            expect(url).toBe('/api/tasks?cursor=abc&limit=10');
        });

        test('builds URL without params', () => {
            const url = buildPaginatedUrl('/api/tasks', {});
            expect(url).toBe('/api/tasks');
        });

        test('cursor takes precedence over page', () => {
            const url = buildPaginatedUrl('/api/tasks', { page: 2, cursor: 'abc' });
            expect(url).toContain('cursor=abc');
            expect(url).not.toContain('page=');
        });
    });
});
