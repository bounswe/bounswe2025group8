/**
 * Navigation and Routing Tests
 * Tests navigation helpers, route parameters, and deep linking
 */

describe('Navigation Utilities', () => {
    describe('Route Parameter Parsing', () => {
        const parseRouteParams = (route: string): Record<string, string> => {
            const params: Record<string, string> = {};
            const queryIndex = route.indexOf('?');

            if (queryIndex === -1) return params;

            const queryString = route.substring(queryIndex + 1);
            const pairs = queryString.split('&');

            for (const pair of pairs) {
                const [key, value] = pair.split('=');
                if (key) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
                }
            }

            return params;
        };

        test('parses single parameter', () => {
            const params = parseRouteParams('/task?id=123');
            expect(params.id).toBe('123');
        });

        test('parses multiple parameters', () => {
            const params = parseRouteParams('/search?query=help&category=grocery');
            expect(params.query).toBe('help');
            expect(params.category).toBe('grocery');
        });

        test('handles encoded values', () => {
            const params = parseRouteParams('/search?query=hello%20world');
            expect(params.query).toBe('hello world');
        });

        test('returns empty object for no params', () => {
            const params = parseRouteParams('/home');
            expect(Object.keys(params).length).toBe(0);
        });

        test('handles empty values', () => {
            const params = parseRouteParams('/page?empty=');
            expect(params.empty).toBe('');
        });
    });

    describe('Route Building', () => {
        const buildRoute = (basePath: string, params: Record<string, any>): string => {
            const queryParts: string[] = [];

            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== null) {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                }
            }

            return queryParts.length > 0 ? `${basePath}?${queryParts.join('&')}` : basePath;
        };

        test('builds route with params', () => {
            const route = buildRoute('/task', { id: 123 });
            expect(route).toBe('/task?id=123');
        });

        test('builds route with multiple params', () => {
            const route = buildRoute('/search', { query: 'help', page: 1 });
            expect(route).toContain('query=help');
            expect(route).toContain('page=1');
        });

        test('skips undefined values', () => {
            const route = buildRoute('/page', { a: 1, b: undefined });
            expect(route).toContain('a=1');
            expect(route).not.toContain('b=');
        });

        test('returns base path when no params', () => {
            const route = buildRoute('/home', {});
            expect(route).toBe('/home');
        });

        test('encodes special characters', () => {
            const route = buildRoute('/search', { query: 'hello world' });
            expect(route).toContain('hello%20world');
        });
    });

    describe('Tab Navigation Helpers', () => {
        type TabName = 'home' | 'categories' | 'create' | 'profile';

        const getTabIndex = (tabName: TabName): number => {
            const indices: Record<TabName, number> = {
                home: 0,
                categories: 1,
                create: 2,
                profile: 3,
            };
            return indices[tabName];
        };

        const getTabName = (index: number): TabName => {
            const tabs: TabName[] = ['home', 'categories', 'create', 'profile'];
            return tabs[index] || 'home';
        };

        const isValidTab = (tabName: string): tabName is TabName => {
            return ['home', 'categories', 'create', 'profile'].includes(tabName);
        };

        test('gets correct tab index', () => {
            expect(getTabIndex('home')).toBe(0);
            expect(getTabIndex('categories')).toBe(1);
            expect(getTabIndex('profile')).toBe(3);
        });

        test('gets correct tab name from index', () => {
            expect(getTabName(0)).toBe('home');
            expect(getTabName(2)).toBe('create');
        });

        test('defaults to home for invalid index', () => {
            expect(getTabName(99)).toBe('home');
        });

        test('validates tab names', () => {
            expect(isValidTab('home')).toBe(true);
            expect(isValidTab('invalid')).toBe(false);
        });
    });

    describe('Screen Stack Helpers', () => {
        interface ScreenState {
            name: string;
            params?: Record<string, any>;
        }

        const pushScreen = (stack: ScreenState[], screen: ScreenState): ScreenState[] => {
            return [...stack, screen];
        };

        const popScreen = (stack: ScreenState[]): ScreenState[] => {
            return stack.slice(0, -1);
        };

        const popToScreen = (stack: ScreenState[], screenName: string): ScreenState[] => {
            const index = stack.findIndex(s => s.name === screenName);
            if (index === -1) return stack;
            return stack.slice(0, index + 1);
        };

        const getCurrentScreen = (stack: ScreenState[]): ScreenState | null => {
            return stack.length > 0 ? stack[stack.length - 1] : null;
        };

        const canGoBack = (stack: ScreenState[]): boolean => {
            return stack.length > 1;
        };

        test('pushes screen to stack', () => {
            const stack = [{ name: 'Home' }];
            const newStack = pushScreen(stack, { name: 'Detail', params: { id: 1 } });

            expect(newStack.length).toBe(2);
            expect(newStack[1].name).toBe('Detail');
        });

        test('pops screen from stack', () => {
            const stack = [{ name: 'Home' }, { name: 'Detail' }];
            const newStack = popScreen(stack);

            expect(newStack.length).toBe(1);
            expect(newStack[0].name).toBe('Home');
        });

        test('pops to specific screen', () => {
            const stack = [
                { name: 'Home' },
                { name: 'List' },
                { name: 'Detail' },
                { name: 'Edit' },
            ];
            const newStack = popToScreen(stack, 'List');

            expect(newStack.length).toBe(2);
            expect(getCurrentScreen(newStack)?.name).toBe('List');
        });

        test('gets current screen', () => {
            const stack = [{ name: 'Home' }, { name: 'Detail' }];
            expect(getCurrentScreen(stack)?.name).toBe('Detail');
        });

        test('returns null for empty stack', () => {
            expect(getCurrentScreen([])).toBeNull();
        });

        test('can go back with multiple screens', () => {
            expect(canGoBack([{ name: 'Home' }, { name: 'Detail' }])).toBe(true);
        });

        test('cannot go back with single screen', () => {
            expect(canGoBack([{ name: 'Home' }])).toBe(false);
        });
    });
});

describe('Deep Link Handling', () => {
    describe('Deep Link Parsing', () => {
        interface DeepLinkResult {
            screen: string;
            params: Record<string, any>;
        }

        const parseDeepLink = (url: string): DeepLinkResult | null => {
            try {
                // Expected format: myapp://screen/path?params
                const patterns: Array<{
                    regex: RegExp;
                    screen: string;
                    paramExtractor: (match: RegExpMatchArray) => Record<string, any>;
                }> = [
                        {
                            regex: /myapp:\/\/task\/(\d+)/,
                            screen: 'TaskDetail',
                            paramExtractor: (match) => ({ taskId: parseInt(match[1]) }),
                        },
                        {
                            regex: /myapp:\/\/profile\/(\d+)/,
                            screen: 'Profile',
                            paramExtractor: (match) => ({ userId: parseInt(match[1]) }),
                        },
                        {
                            regex: /myapp:\/\/category\/([^?]+)/,
                            screen: 'Category',
                            paramExtractor: (match) => ({ categoryId: match[1] }),
                        },
                        {
                            regex: /myapp:\/\/home/,
                            screen: 'Home',
                            paramExtractor: () => ({}),
                        },
                    ];

                for (const pattern of patterns) {
                    const match = url.match(pattern.regex);
                    if (match) {
                        return {
                            screen: pattern.screen,
                            params: pattern.paramExtractor(match),
                        };
                    }
                }

                return null;
            } catch {
                return null;
            }
        };

        test('parses task deep link', () => {
            const result = parseDeepLink('myapp://task/123');
            expect(result?.screen).toBe('TaskDetail');
            expect(result?.params.taskId).toBe(123);
        });

        test('parses profile deep link', () => {
            const result = parseDeepLink('myapp://profile/456');
            expect(result?.screen).toBe('Profile');
            expect(result?.params.userId).toBe(456);
        });

        test('parses category deep link', () => {
            const result = parseDeepLink('myapp://category/GROCERY_SHOPPING');
            expect(result?.screen).toBe('Category');
            expect(result?.params.categoryId).toBe('GROCERY_SHOPPING');
        });

        test('parses home deep link', () => {
            const result = parseDeepLink('myapp://home');
            expect(result?.screen).toBe('Home');
        });

        test('returns null for invalid deep link', () => {
            expect(parseDeepLink('invalid://url')).toBeNull();
        });

        test('returns null for empty string', () => {
            expect(parseDeepLink('')).toBeNull();
        });
    });

    describe('Deep Link Generation', () => {
        const generateDeepLink = (screen: string, params: Record<string, any>): string => {
            const baseUrl = 'myapp://';

            switch (screen) {
                case 'TaskDetail':
                    return `${baseUrl}task/${params.taskId}`;
                case 'Profile':
                    return `${baseUrl}profile/${params.userId}`;
                case 'Category':
                    return `${baseUrl}category/${params.categoryId}`;
                case 'Home':
                    return `${baseUrl}home`;
                default:
                    return `${baseUrl}home`;
            }
        };

        test('generates task deep link', () => {
            const link = generateDeepLink('TaskDetail', { taskId: 123 });
            expect(link).toBe('myapp://task/123');
        });

        test('generates profile deep link', () => {
            const link = generateDeepLink('Profile', { userId: 456 });
            expect(link).toBe('myapp://profile/456');
        });

        test('defaults to home for unknown screen', () => {
            const link = generateDeepLink('Unknown', {});
            expect(link).toBe('myapp://home');
        });
    });
});

describe('Navigation History', () => {
    describe('History Management', () => {
        interface HistoryEntry {
            screen: string;
            timestamp: number;
        }

        const addToHistory = (history: HistoryEntry[], screen: string): HistoryEntry[] => {
            const entry: HistoryEntry = { screen, timestamp: Date.now() };
            // Keep last 50 entries
            const newHistory = [...history, entry];
            return newHistory.slice(-50);
        };

        const getRecentScreens = (history: HistoryEntry[], limit: number = 5): string[] => {
            return history
                .slice(-limit)
                .reverse()
                .map(entry => entry.screen);
        };

        const getMostVisitedScreens = (history: HistoryEntry[]): Array<{ screen: string; count: number }> => {
            const counts: Record<string, number> = {};
            for (const entry of history) {
                counts[entry.screen] = (counts[entry.screen] || 0) + 1;
            }

            return Object.entries(counts)
                .map(([screen, count]) => ({ screen, count }))
                .sort((a, b) => b.count - a.count);
        };

        const clearHistory = (): HistoryEntry[] => [];

        test('adds entry to history', () => {
            const history: HistoryEntry[] = [];
            const newHistory = addToHistory(history, 'Home');

            expect(newHistory.length).toBe(1);
            expect(newHistory[0].screen).toBe('Home');
        });

        test('limits history to 50 entries', () => {
            let history: HistoryEntry[] = [];
            for (let i = 0; i < 60; i++) {
                history = addToHistory(history, `Screen${i}`);
            }

            expect(history.length).toBe(50);
        });

        test('gets recent screens', () => {
            const history: HistoryEntry[] = [
                { screen: 'Home', timestamp: 1 },
                { screen: 'List', timestamp: 2 },
                { screen: 'Detail', timestamp: 3 },
            ];
            const recent = getRecentScreens(history, 2);

            expect(recent).toEqual(['Detail', 'List']);
        });

        test('gets most visited screens', () => {
            const history: HistoryEntry[] = [
                { screen: 'Home', timestamp: 1 },
                { screen: 'Detail', timestamp: 2 },
                { screen: 'Home', timestamp: 3 },
                { screen: 'Home', timestamp: 4 },
                { screen: 'Detail', timestamp: 5 },
            ];
            const mostVisited = getMostVisitedScreens(history);

            expect(mostVisited[0].screen).toBe('Home');
            expect(mostVisited[0].count).toBe(3);
        });

        test('clears history', () => {
            expect(clearHistory()).toEqual([]);
        });
    });
});
