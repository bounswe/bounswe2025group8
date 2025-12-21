/**
 * State Management and Data Flow Tests
 * Tests state transitions, data caching, and app state management
 */

describe('State Management Utilities', () => {
    describe('Task State Machine', () => {
        type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

        const getNextValidStatuses = (currentStatus: TaskStatus): TaskStatus[] => {
            const transitions: Record<TaskStatus, TaskStatus[]> = {
                'open': ['in_progress', 'cancelled'],
                'in_progress': ['completed', 'cancelled'],
                'completed': [],
                'cancelled': [],
            };
            return transitions[currentStatus] || [];
        };

        const canTransitionTo = (currentStatus: TaskStatus, targetStatus: TaskStatus): boolean => {
            return getNextValidStatuses(currentStatus).includes(targetStatus);
        };

        test('open can transition to in_progress', () => {
            expect(canTransitionTo('open', 'in_progress')).toBe(true);
        });

        test('open can transition to cancelled', () => {
            expect(canTransitionTo('open', 'cancelled')).toBe(true);
        });

        test('open cannot transition directly to completed', () => {
            expect(canTransitionTo('open', 'completed')).toBe(false);
        });

        test('in_progress can transition to completed', () => {
            expect(canTransitionTo('in_progress', 'completed')).toBe(true);
        });

        test('completed cannot transition to anything', () => {
            expect(getNextValidStatuses('completed')).toEqual([]);
        });

        test('cancelled cannot transition to anything', () => {
            expect(getNextValidStatuses('cancelled')).toEqual([]);
        });
    });

    describe('Volunteer Status Machine', () => {
        type VolunteerStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

        const getVolunteerNextStatuses = (
            currentStatus: VolunteerStatus,
            isTaskOwner: boolean
        ): VolunteerStatus[] => {
            if (isTaskOwner) {
                if (currentStatus === 'pending') return ['accepted', 'rejected'];
                return [];
            } else {
                if (currentStatus === 'pending') return ['withdrawn'];
                return [];
            }
        };

        test('task owner can accept pending volunteer', () => {
            const statuses = getVolunteerNextStatuses('pending', true);
            expect(statuses).toContain('accepted');
        });

        test('task owner can reject pending volunteer', () => {
            const statuses = getVolunteerNextStatuses('pending', true);
            expect(statuses).toContain('rejected');
        });

        test('volunteer can withdraw pending application', () => {
            const statuses = getVolunteerNextStatuses('pending', false);
            expect(statuses).toContain('withdrawn');
        });

        test('accepted status has no transitions', () => {
            expect(getVolunteerNextStatuses('accepted', true)).toEqual([]);
            expect(getVolunteerNextStatuses('accepted', false)).toEqual([]);
        });
    });

    describe('Notification State', () => {
        interface NotificationState {
            items: Array<{ id: number; is_read: boolean }>;
            unreadCount: number;
        }

        const markAsRead = (state: NotificationState, notificationId: number): NotificationState => {
            const items = state.items.map(item =>
                item.id === notificationId ? { ...item, is_read: true } : item
            );
            const unreadCount = items.filter(i => !i.is_read).length;
            return { items, unreadCount };
        };

        const markAllAsRead = (state: NotificationState): NotificationState => {
            return {
                items: state.items.map(item => ({ ...item, is_read: true })),
                unreadCount: 0,
            };
        };

        const addNotification = (
            state: NotificationState,
            notification: { id: number; is_read: boolean }
        ): NotificationState => {
            const items = [notification, ...state.items];
            const unreadCount = items.filter(i => !i.is_read).length;
            return { items, unreadCount };
        };

        test('marks single notification as read', () => {
            const state: NotificationState = {
                items: [
                    { id: 1, is_read: false },
                    { id: 2, is_read: false },
                ],
                unreadCount: 2,
            };
            const newState = markAsRead(state, 1);

            expect(newState.items[0].is_read).toBe(true);
            expect(newState.unreadCount).toBe(1);
        });

        test('marks all as read', () => {
            const state: NotificationState = {
                items: [
                    { id: 1, is_read: false },
                    { id: 2, is_read: false },
                ],
                unreadCount: 2,
            };
            const newState = markAllAsRead(state);

            expect(newState.unreadCount).toBe(0);
            expect(newState.items.every(i => i.is_read)).toBe(true);
        });

        test('adds new notification', () => {
            const state: NotificationState = {
                items: [{ id: 1, is_read: true }],
                unreadCount: 0,
            };
            const newState = addNotification(state, { id: 2, is_read: false });

            expect(newState.items.length).toBe(2);
            expect(newState.items[0].id).toBe(2); // New one is first
            expect(newState.unreadCount).toBe(1);
        });
    });
});

describe('Data Caching Utilities', () => {
    describe('Cache Manager', () => {
        interface CacheEntry<T> {
            data: T;
            timestamp: number;
            expiresAt: number;
        }

        const createCacheEntry = <T>(data: T, ttlMs: number): CacheEntry<T> => {
            const now = Date.now();
            return {
                data,
                timestamp: now,
                expiresAt: now + ttlMs,
            };
        };

        const isCacheValid = <T>(entry: CacheEntry<T> | null): boolean => {
            if (!entry) return false;
            return Date.now() < entry.expiresAt;
        };

        const getCacheAge = <T>(entry: CacheEntry<T>): number => {
            return Date.now() - entry.timestamp;
        };

        test('creates cache entry with correct expiry', () => {
            const entry = createCacheEntry({ id: 1 }, 60000);
            expect(entry.expiresAt).toBeGreaterThan(entry.timestamp);
            expect(entry.expiresAt - entry.timestamp).toBe(60000);
        });

        test('validates fresh cache', () => {
            const entry = createCacheEntry({ id: 1 }, 60000);
            expect(isCacheValid(entry)).toBe(true);
        });

        test('invalidates expired cache', () => {
            const entry = createCacheEntry({ id: 1 }, -1000); // Already expired
            expect(isCacheValid(entry)).toBe(false);
        });

        test('returns false for null cache', () => {
            expect(isCacheValid(null)).toBe(false);
        });

        test('calculates cache age', () => {
            const entry = createCacheEntry({ id: 1 }, 60000);
            const age = getCacheAge(entry);
            expect(age).toBeGreaterThanOrEqual(0);
            expect(age).toBeLessThan(1000); // Should be very recent
        });
    });

    describe('List Cache Operations', () => {
        interface ListState<T> {
            items: T[];
            isLoading: boolean;
            hasMore: boolean;
            page: number;
        }

        const appendItems = <T>(state: ListState<T>, newItems: T[]): ListState<T> => {
            return {
                ...state,
                items: [...state.items, ...newItems],
                page: state.page + 1,
            };
        };

        const prependItem = <T>(state: ListState<T>, item: T): ListState<T> => {
            return {
                ...state,
                items: [item, ...state.items],
            };
        };

        const updateItem = <T extends { id: number }>(
            state: ListState<T>,
            id: number,
            updates: Partial<T>
        ): ListState<T> => {
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === id ? { ...item, ...updates } : item
                ),
            };
        };

        const removeItem = <T extends { id: number }>(
            state: ListState<T>,
            id: number
        ): ListState<T> => {
            return {
                ...state,
                items: state.items.filter(item => item.id !== id),
            };
        };

        test('appends items and increments page', () => {
            const state: ListState<{ id: number }> = { items: [{ id: 1 }], isLoading: false, hasMore: true, page: 1 };
            const newState = appendItems(state, [{ id: 2 }, { id: 3 }]);

            expect(newState.items.length).toBe(3);
            expect(newState.page).toBe(2);
        });

        test('prepends item to front', () => {
            const state: ListState<{ id: number }> = { items: [{ id: 1 }], isLoading: false, hasMore: true, page: 1 };
            const newState = prependItem(state, { id: 0 });

            expect(newState.items[0].id).toBe(0);
        });

        test('updates existing item', () => {
            const state: ListState<{ id: number; name: string }> = {
                items: [{ id: 1, name: 'Old' }, { id: 2, name: 'Other' }],
                isLoading: false,
                hasMore: true,
                page: 1,
            };
            const newState = updateItem(state, 1, { name: 'New' });

            expect(newState.items[0].name).toBe('New');
            expect(newState.items[1].name).toBe('Other');
        });

        test('removes item by id', () => {
            const state: ListState<{ id: number }> = {
                items: [{ id: 1 }, { id: 2 }, { id: 3 }],
                isLoading: false,
                hasMore: true,
                page: 1,
            };
            const newState = removeItem(state, 2);

            expect(newState.items.length).toBe(2);
            expect(newState.items.find(i => i.id === 2)).toBeUndefined();
        });
    });
});

describe('Form State Management', () => {
    describe('Form Validation State', () => {
        interface FormField {
            value: string;
            error: string | null;
            touched: boolean;
            isValid: boolean;
        }

        const createFormField = (initialValue: string = ''): FormField => ({
            value: initialValue,
            error: null,
            touched: false,
            isValid: true,
        });

        const validateField = (
            field: FormField,
            validator: (value: string) => string | null
        ): FormField => {
            const error = validator(field.value);
            return {
                ...field,
                error,
                isValid: error === null,
            };
        };

        const touchField = (field: FormField): FormField => ({
            ...field,
            touched: true,
        });

        const setFieldValue = (field: FormField, value: string): FormField => ({
            ...field,
            value,
            error: null, // Clear error on change
        });

        test('creates empty form field', () => {
            const field = createFormField();
            expect(field.value).toBe('');
            expect(field.error).toBeNull();
            expect(field.touched).toBe(false);
            expect(field.isValid).toBe(true);
        });

        test('creates form field with initial value', () => {
            const field = createFormField('initial');
            expect(field.value).toBe('initial');
        });

        test('validates field with error', () => {
            const field = createFormField('');
            const validated = validateField(field, v => v ? null : 'Required');

            expect(validated.error).toBe('Required');
            expect(validated.isValid).toBe(false);
        });

        test('validates field without error', () => {
            const field = createFormField('value');
            const validated = validateField(field, v => v ? null : 'Required');

            expect(validated.error).toBeNull();
            expect(validated.isValid).toBe(true);
        });

        test('sets touched flag', () => {
            const field = createFormField();
            const touched = touchField(field);
            expect(touched.touched).toBe(true);
        });

        test('updates value and clears error', () => {
            const field = { ...createFormField(), error: 'Some error' };
            const updated = setFieldValue(field, 'new value');

            expect(updated.value).toBe('new value');
            expect(updated.error).toBeNull();
        });
    });

    describe('Form Submit State', () => {
        interface FormSubmitState {
            isSubmitting: boolean;
            isSuccess: boolean;
            isError: boolean;
            errorMessage: string | null;
        }

        const initialSubmitState: FormSubmitState = {
            isSubmitting: false,
            isSuccess: false,
            isError: false,
            errorMessage: null,
        };

        const startSubmit = (): FormSubmitState => ({
            isSubmitting: true,
            isSuccess: false,
            isError: false,
            errorMessage: null,
        });

        const submitSuccess = (): FormSubmitState => ({
            isSubmitting: false,
            isSuccess: true,
            isError: false,
            errorMessage: null,
        });

        const submitError = (message: string): FormSubmitState => ({
            isSubmitting: false,
            isSuccess: false,
            isError: true,
            errorMessage: message,
        });

        const resetSubmitState = (): FormSubmitState => initialSubmitState;

        test('starts in idle state', () => {
            expect(initialSubmitState.isSubmitting).toBe(false);
            expect(initialSubmitState.isSuccess).toBe(false);
            expect(initialSubmitState.isError).toBe(false);
        });

        test('transitions to submitting', () => {
            const state = startSubmit();
            expect(state.isSubmitting).toBe(true);
        });

        test('transitions to success', () => {
            const state = submitSuccess();
            expect(state.isSuccess).toBe(true);
            expect(state.isSubmitting).toBe(false);
        });

        test('transitions to error', () => {
            const state = submitError('Failed to submit');
            expect(state.isError).toBe(true);
            expect(state.errorMessage).toBe('Failed to submit');
        });

        test('resets to initial state', () => {
            const state = resetSubmitState();
            expect(state).toEqual(initialSubmitState);
        });
    });
});

describe('Deep Comparison Utilities', () => {
    describe('isEqual', () => {
        const isEqual = (a: any, b: any): boolean => {
            if (a === b) return true;
            if (a === null || b === null) return false;
            if (typeof a !== typeof b) return false;

            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) return false;
                return a.every((item, index) => isEqual(item, b[index]));
            }

            if (typeof a === 'object' && typeof b === 'object') {
                const keysA = Object.keys(a);
                const keysB = Object.keys(b);
                if (keysA.length !== keysB.length) return false;
                return keysA.every(key => isEqual(a[key], b[key]));
            }

            return false;
        };

        test('compares primitives', () => {
            expect(isEqual(1, 1)).toBe(true);
            expect(isEqual('a', 'a')).toBe(true);
            expect(isEqual(1, 2)).toBe(false);
        });

        test('compares arrays', () => {
            expect(isEqual([1, 2], [1, 2])).toBe(true);
            expect(isEqual([1, 2], [1, 3])).toBe(false);
            expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
        });

        test('compares objects', () => {
            expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
            expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
            expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        });

        test('compares nested structures', () => {
            const a = { x: [1, 2], y: { z: 3 } };
            const b = { x: [1, 2], y: { z: 3 } };
            const c = { x: [1, 2], y: { z: 4 } };

            expect(isEqual(a, b)).toBe(true);
            expect(isEqual(a, c)).toBe(false);
        });

        test('handles null', () => {
            expect(isEqual(null, null)).toBe(true);
            expect(isEqual(null, {})).toBe(false);
        });
    });

    describe('hasChanged', () => {
        const hasChanged = (prev: any, curr: any, keys: string[]): boolean => {
            for (const key of keys) {
                if (prev[key] !== curr[key]) return true;
            }
            return false;
        };

        test('detects change in specified keys', () => {
            const prev = { a: 1, b: 2, c: 3 };
            const curr = { a: 1, b: 5, c: 3 };

            expect(hasChanged(prev, curr, ['a'])).toBe(false);
            expect(hasChanged(prev, curr, ['b'])).toBe(true);
        });

        test('detects no change', () => {
            const prev = { a: 1, b: 2 };
            const curr = { a: 1, b: 2 };

            expect(hasChanged(prev, curr, ['a', 'b'])).toBe(false);
        });
    });
});
