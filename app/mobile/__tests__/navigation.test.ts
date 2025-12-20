/**
 * Unit Tests for Navigation Logic
 * Tests route handling, deep linking, and navigation guards
 */

describe('Route Handling', () => {
    describe('Route Path Parsing', () => {
        const parseRoute = (route: string): { path: string; params: Record<string, string> } => {
            const [path, queryString] = route.split('?');
            const params: Record<string, string> = {};

            if (queryString) {
                queryString.split('&').forEach(pair => {
                    const [key, value] = pair.split('=');
                    params[key] = decodeURIComponent(value);
                });
            }

            return { path, params };
        };

        test('parses simple route', () => {
            const result = parseRoute('/feed');
            expect(result.path).toBe('/feed');
            expect(result.params).toEqual({});
        });

        test('parses route with query params', () => {
            const result = parseRoute('/search?query=groceries&page=1');
            expect(result.path).toBe('/search');
            expect(result.params.query).toBe('groceries');
            expect(result.params.page).toBe('1');
        });

        test('decodes URL-encoded params', () => {
            const result = parseRoute('/search?query=help%20me');
            expect(result.params.query).toBe('help me');
        });
    });

    describe('Route Matching', () => {
        const matchRoute = (pattern: string, path: string): { match: boolean; params: Record<string, string> } => {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');

            if (patternParts.length !== pathParts.length) {
                return { match: false, params: {} };
            }

            const params: Record<string, string> = {};

            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    params[patternParts[i].slice(1)] = pathParts[i];
                } else if (patternParts[i] !== pathParts[i]) {
                    return { match: false, params: {} };
                }
            }

            return { match: true, params };
        };

        test('matches exact route', () => {
            const result = matchRoute('/feed', '/feed');
            expect(result.match).toBe(true);
        });

        test('matches route with params', () => {
            const result = matchRoute('/task/:id', '/task/123');
            expect(result.match).toBe(true);
            expect(result.params.id).toBe('123');
        });

        test('matches route with multiple params', () => {
            const result = matchRoute('/user/:userId/task/:taskId', '/user/1/task/2');
            expect(result.match).toBe(true);
            expect(result.params.userId).toBe('1');
            expect(result.params.taskId).toBe('2');
        });

        test('rejects non-matching route', () => {
            const result = matchRoute('/feed', '/profile');
            expect(result.match).toBe(false);
        });

        test('rejects route with wrong segment count', () => {
            const result = matchRoute('/task/:id', '/task/123/details');
            expect(result.match).toBe(false);
        });
    });
});

describe('Navigation Guards', () => {
    describe('Authentication Guard', () => {
        const protectedRoutes = ['/feed', '/profile', '/create-request', '/notifications'];
        const publicRoutes = ['/', '/signin', '/signup', '/forgot-password'];

        const requiresAuth = (route: string): boolean => {
            return protectedRoutes.some(r => route.startsWith(r));
        };

        const isPublicRoute = (route: string): boolean => {
            return publicRoutes.includes(route);
        };

        test('feed requires authentication', () => {
            expect(requiresAuth('/feed')).toBe(true);
        });

        test('profile requires authentication', () => {
            expect(requiresAuth('/profile')).toBe(true);
        });

        test('create request requires authentication', () => {
            expect(requiresAuth('/create-request')).toBe(true);
        });

        test('signin is public', () => {
            expect(isPublicRoute('/signin')).toBe(true);
        });

        test('signup is public', () => {
            expect(isPublicRoute('/signup')).toBe(true);
        });

        test('landing page is public', () => {
            expect(isPublicRoute('/')).toBe(true);
        });
    });

    describe('Role-Based Guard', () => {
        type UserRole = 'user' | 'admin' | 'moderator';

        const routePermissions: Record<string, UserRole[]> = {
            '/admin': ['admin'],
            '/moderate': ['admin', 'moderator'],
            '/feed': ['user', 'admin', 'moderator'],
        };

        const canAccess = (route: string, userRole: UserRole): boolean => {
            const allowedRoles = routePermissions[route];
            if (!allowedRoles) return true; // No restrictions
            return allowedRoles.includes(userRole);
        };

        test('admin can access admin route', () => {
            expect(canAccess('/admin', 'admin')).toBe(true);
        });

        test('user cannot access admin route', () => {
            expect(canAccess('/admin', 'user')).toBe(false);
        });

        test('moderator cannot access admin route', () => {
            expect(canAccess('/admin', 'moderator')).toBe(false);
        });

        test('moderator can access moderate route', () => {
            expect(canAccess('/moderate', 'moderator')).toBe(true);
        });

        test('all roles can access feed', () => {
            expect(canAccess('/feed', 'user')).toBe(true);
            expect(canAccess('/feed', 'admin')).toBe(true);
            expect(canAccess('/feed', 'moderator')).toBe(true);
        });

        test('unknown routes are accessible', () => {
            expect(canAccess('/unknown', 'user')).toBe(true);
        });
    });
});

describe('Deep Link Handling', () => {
    describe('Deep Link Parsing', () => {
        const parseDeepLink = (url: string): { route: string; params: Record<string, string> } | null => {
            const patterns = [
                { regex: /\/task\/(\d+)/, route: '/task/:id', param: 'id' },
                { regex: /\/profile\/(\d+)/, route: '/profile/:userId', param: 'userId' },
                { regex: /\/category\/(\w+)/, route: '/category/:slug', param: 'slug' },
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern.regex);
                if (match) {
                    return {
                        route: pattern.route,
                        params: { [pattern.param]: match[1] }
                    };
                }
            }

            return null;
        };

        test('parses task deep link', () => {
            const result = parseDeepLink('/task/123');
            expect(result?.route).toBe('/task/:id');
            expect(result?.params.id).toBe('123');
        });

        test('parses profile deep link', () => {
            const result = parseDeepLink('/profile/456');
            expect(result?.route).toBe('/profile/:userId');
            expect(result?.params.userId).toBe('456');
        });

        test('parses category deep link', () => {
            const result = parseDeepLink('/category/groceries');
            expect(result?.route).toBe('/category/:slug');
            expect(result?.params.slug).toBe('groceries');
        });

        test('returns null for unknown deep link', () => {
            expect(parseDeepLink('/unknown/path')).toBeNull();
        });
    });
});

describe('Navigation History', () => {
    describe('History Stack Management', () => {
        type HistoryEntry = { route: string; timestamp: number };

        class NavigationHistory {
            private stack: HistoryEntry[] = [];
            private maxSize: number;

            constructor(maxSize = 50) {
                this.maxSize = maxSize;
            }

            push(route: string): void {
                this.stack.push({ route, timestamp: Date.now() });
                if (this.stack.length > this.maxSize) {
                    this.stack.shift();
                }
            }

            pop(): HistoryEntry | undefined {
                return this.stack.pop();
            }

            canGoBack(): boolean {
                return this.stack.length > 1;
            }

            getCurrentRoute(): string | null {
                return this.stack[this.stack.length - 1]?.route || null;
            }

            clear(): void {
                this.stack = [];
            }

            getSize(): number {
                return this.stack.length;
            }
        }

        test('pushes routes to history', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            history.push('/profile');
            expect(history.getSize()).toBe(2);
        });

        test('returns current route', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            history.push('/profile');
            expect(history.getCurrentRoute()).toBe('/profile');
        });

        test('can go back when multiple routes', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            history.push('/profile');
            expect(history.canGoBack()).toBe(true);
        });

        test('cannot go back with single route', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            expect(history.canGoBack()).toBe(false);
        });

        test('pops route from history', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            history.push('/profile');
            const popped = history.pop();
            expect(popped?.route).toBe('/profile');
            expect(history.getCurrentRoute()).toBe('/feed');
        });

        test('respects max size limit', () => {
            const history = new NavigationHistory(3);
            history.push('/route1');
            history.push('/route2');
            history.push('/route3');
            history.push('/route4');
            expect(history.getSize()).toBe(3);
        });

        test('clears history', () => {
            const history = new NavigationHistory();
            history.push('/feed');
            history.push('/profile');
            history.clear();
            expect(history.getSize()).toBe(0);
            expect(history.getCurrentRoute()).toBeNull();
        });
    });
});

describe('Tab Navigation', () => {
    const tabs = [
        { name: 'feed', icon: 'home', label: 'Home' },
        { name: 'search', icon: 'search', label: 'Search' },
        { name: 'requests', icon: 'list', label: 'Requests' },
        { name: 'profile', icon: 'person', label: 'Profile' },
    ];

    const getTabIndex = (name: string): number => {
        return tabs.findIndex(t => t.name === name);
    };

    const getTabByIndex = (index: number): typeof tabs[0] | null => {
        return tabs[index] || null;
    };

    test('finds correct tab index', () => {
        expect(getTabIndex('feed')).toBe(0);
        expect(getTabIndex('profile')).toBe(3);
    });

    test('returns -1 for unknown tab', () => {
        expect(getTabIndex('unknown')).toBe(-1);
    });

    test('gets tab by index', () => {
        const tab = getTabByIndex(1);
        expect(tab?.name).toBe('search');
        expect(tab?.label).toBe('Search');
    });

    test('returns null for invalid index', () => {
        expect(getTabByIndex(10)).toBeNull();
    });
});
