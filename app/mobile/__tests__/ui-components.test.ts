/**
 * Unit Tests for UI Component Utilities
 * Tests button states, input handling, modal logic, and component props
 */

describe('Button State Logic', () => {
    describe('Disabled State', () => {
        interface ButtonProps {
            loading?: boolean;
            disabled?: boolean;
            formValid?: boolean;
        }

        const isButtonDisabled = (props: ButtonProps): boolean => {
            if (props.loading) return true;
            if (props.disabled) return true;
            if (props.formValid === false) return true;
            return false;
        };

        test('disabled when loading', () => {
            expect(isButtonDisabled({ loading: true })).toBe(true);
        });

        test('disabled when explicitly disabled', () => {
            expect(isButtonDisabled({ disabled: true })).toBe(true);
        });

        test('disabled when form is invalid', () => {
            expect(isButtonDisabled({ formValid: false })).toBe(true);
        });

        test('enabled by default', () => {
            expect(isButtonDisabled({})).toBe(false);
        });

        test('enabled when form is valid', () => {
            expect(isButtonDisabled({ formValid: true })).toBe(false);
        });

        test('loading takes precedence over valid form', () => {
            expect(isButtonDisabled({ loading: true, formValid: true })).toBe(true);
        });
    });

    describe('Button Variants', () => {
        type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

        const getButtonStyles = (variant: ButtonVariant): { backgroundColor: string; textColor: string } => {
            const styles: Record<ButtonVariant, { backgroundColor: string; textColor: string }> = {
                primary: { backgroundColor: '#007AFF', textColor: '#FFFFFF' },
                secondary: { backgroundColor: '#E5E5EA', textColor: '#000000' },
                danger: { backgroundColor: '#FF3B30', textColor: '#FFFFFF' },
                ghost: { backgroundColor: 'transparent', textColor: '#007AFF' },
            };
            return styles[variant];
        };

        test('returns correct primary styles', () => {
            const styles = getButtonStyles('primary');
            expect(styles.backgroundColor).toBe('#007AFF');
            expect(styles.textColor).toBe('#FFFFFF');
        });

        test('returns correct danger styles', () => {
            const styles = getButtonStyles('danger');
            expect(styles.backgroundColor).toBe('#FF3B30');
        });

        test('returns correct ghost styles', () => {
            const styles = getButtonStyles('ghost');
            expect(styles.backgroundColor).toBe('transparent');
        });
    });
});

describe('Input Handling', () => {
    describe('Input Validation on Change', () => {
        type ValidationResult = { valid: boolean; error?: string };

        const validateOnChange = (
            value: string,
            type: 'email' | 'phone' | 'password' | 'text'
        ): ValidationResult => {
            if (type === 'email' && value.length > 0) {
                if (!value.includes('@')) {
                    return { valid: false, error: 'Invalid email format' };
                }
            }
            if (type === 'phone' && value.length > 0) {
                if (!/^\d*$/.test(value)) {
                    return { valid: false, error: 'Only numbers allowed' };
                }
            }
            return { valid: true };
        };

        test('validates email with @ symbol', () => {
            expect(validateOnChange('test@', 'email').valid).toBe(true);
            expect(validateOnChange('test', 'email').valid).toBe(false);
        });

        test('validates phone with only numbers', () => {
            expect(validateOnChange('123456', 'phone').valid).toBe(true);
            expect(validateOnChange('123abc', 'phone').valid).toBe(false);
        });

        test('text validation always passes', () => {
            expect(validateOnChange('anything', 'text').valid).toBe(true);
        });

        test('empty values are valid', () => {
            expect(validateOnChange('', 'email').valid).toBe(true);
            expect(validateOnChange('', 'phone').valid).toBe(true);
        });
    });

    describe('Input Character Limits', () => {
        const enforceMaxLength = (value: string, maxLength: number): string => {
            return value.slice(0, maxLength);
        };

        const getRemainingChars = (value: string, maxLength: number): number => {
            return Math.max(0, maxLength - value.length);
        };

        test('enforces max length', () => {
            expect(enforceMaxLength('Hello World', 5)).toBe('Hello');
        });

        test('does not modify short strings', () => {
            expect(enforceMaxLength('Hi', 10)).toBe('Hi');
        });

        test('calculates remaining characters', () => {
            expect(getRemainingChars('Hello', 10)).toBe(5);
            expect(getRemainingChars('Hello World!', 10)).toBe(0);
        });
    });

    describe('Input Focus State', () => {
        interface FocusState {
            isFocused: boolean;
            hasBeenFocused: boolean;
        }

        const handleFocus = (state: FocusState): FocusState => ({
            isFocused: true,
            hasBeenFocused: true,
        });

        const handleBlur = (state: FocusState): FocusState => ({
            ...state,
            isFocused: false,
        });

        const shouldShowError = (state: FocusState, hasError: boolean): boolean => {
            return hasError && state.hasBeenFocused && !state.isFocused;
        };

        test('focus updates state correctly', () => {
            const state = handleFocus({ isFocused: false, hasBeenFocused: false });
            expect(state.isFocused).toBe(true);
            expect(state.hasBeenFocused).toBe(true);
        });

        test('blur updates state correctly', () => {
            const state = handleBlur({ isFocused: true, hasBeenFocused: true });
            expect(state.isFocused).toBe(false);
            expect(state.hasBeenFocused).toBe(true);
        });

        test('shows error only after blur', () => {
            // Never focused - no error shown
            expect(shouldShowError({ isFocused: false, hasBeenFocused: false }, true)).toBe(false);
            // Currently focused - no error shown
            expect(shouldShowError({ isFocused: true, hasBeenFocused: true }, true)).toBe(false);
            // Was focused, now blurred - show error
            expect(shouldShowError({ isFocused: false, hasBeenFocused: true }, true)).toBe(true);
        });
    });
});

describe('Modal Logic', () => {
    describe('Modal Visibility', () => {
        interface ModalState {
            isVisible: boolean;
            modalType: string | null;
            data: unknown;
        }

        const openModal = (type: string, data?: unknown): ModalState => ({
            isVisible: true,
            modalType: type,
            data: data ?? null,
        });

        const closeModal = (): ModalState => ({
            isVisible: false,
            modalType: null,
            data: null,
        });

        test('opens modal with type and data', () => {
            const state = openModal('confirm', { id: 123 });
            expect(state.isVisible).toBe(true);
            expect(state.modalType).toBe('confirm');
            expect(state.data).toEqual({ id: 123 });
        });

        test('opens modal without data', () => {
            const state = openModal('alert');
            expect(state.isVisible).toBe(true);
            expect(state.data).toBeNull();
        });

        test('closes modal and clears data', () => {
            const state = closeModal();
            expect(state.isVisible).toBe(false);
            expect(state.modalType).toBeNull();
            expect(state.data).toBeNull();
        });
    });

    describe('Confirmation Modal', () => {
        interface ConfirmOptions {
            title: string;
            message: string;
            confirmText?: string;
            cancelText?: string;
            destructive?: boolean;
        }

        const getConfirmButtonStyle = (destructive: boolean): string => {
            return destructive ? 'danger' : 'primary';
        };

        const getDefaultConfirmText = (destructive: boolean): string => {
            return destructive ? 'Delete' : 'Confirm';
        };

        test('returns danger style for destructive actions', () => {
            expect(getConfirmButtonStyle(true)).toBe('danger');
        });

        test('returns primary style for normal actions', () => {
            expect(getConfirmButtonStyle(false)).toBe('primary');
        });

        test('returns Delete text for destructive actions', () => {
            expect(getDefaultConfirmText(true)).toBe('Delete');
        });

        test('returns Confirm text for normal actions', () => {
            expect(getDefaultConfirmText(false)).toBe('Confirm');
        });
    });
});

describe('Badge and Counter Display', () => {
    const formatBadgeCount = (count: number, max = 99): string => {
        if (count <= 0) return '';
        if (count > max) return `${max}+`;
        return count.toString();
    };

    const shouldShowBadge = (count: number): boolean => {
        return count > 0;
    };

    test('formats count within limit', () => {
        expect(formatBadgeCount(5)).toBe('5');
        expect(formatBadgeCount(99)).toBe('99');
    });

    test('formats count above limit with plus', () => {
        expect(formatBadgeCount(100)).toBe('99+');
        expect(formatBadgeCount(500)).toBe('99+');
    });

    test('returns empty for zero or negative', () => {
        expect(formatBadgeCount(0)).toBe('');
        expect(formatBadgeCount(-1)).toBe('');
    });

    test('respects custom max', () => {
        expect(formatBadgeCount(15, 10)).toBe('10+');
    });

    test('shows badge for positive count', () => {
        expect(shouldShowBadge(1)).toBe(true);
        expect(shouldShowBadge(0)).toBe(false);
    });
});

describe('Avatar and Image Display', () => {
    const getAvatarSource = (
        imageUrl: string | null | undefined,
        fallbackUrl: string
    ): string => {
        if (imageUrl && imageUrl.startsWith('http')) {
            return imageUrl;
        }
        return fallbackUrl;
    };

    const getImageDimensions = (
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } => {
        const aspectRatio = originalWidth / originalHeight;

        let width = Math.min(originalWidth, maxWidth);
        let height = width / aspectRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        return { width: Math.round(width), height: Math.round(height) };
    };

    test('returns image URL when valid', () => {
        expect(getAvatarSource('https://example.com/avatar.jpg', '/default.png')).toBe('https://example.com/avatar.jpg');
    });

    test('returns fallback when URL is null', () => {
        expect(getAvatarSource(null, '/default.png')).toBe('/default.png');
    });

    test('returns fallback when URL is invalid', () => {
        expect(getAvatarSource('not-a-url', '/default.png')).toBe('/default.png');
    });

    test('calculates scaled dimensions maintaining aspect ratio', () => {
        const dims = getImageDimensions(1000, 500, 300, 200);
        expect(dims.width).toBe(300);
        expect(dims.height).toBe(150);
    });

    test('respects max height constraint', () => {
        const dims = getImageDimensions(500, 1000, 300, 200);
        expect(dims.height).toBe(200);
        expect(dims.width).toBe(100);
    });
});

describe('Toast/Snackbar Display', () => {
    type ToastType = 'success' | 'error' | 'warning' | 'info';

    interface Toast {
        id: string;
        message: string;
        type: ToastType;
        duration: number;
    }

    const createToast = (message: string, type: ToastType, duration = 3000): Toast => ({
        id: Date.now().toString(),
        message,
        type,
        duration,
    });

    const getToastColor = (type: ToastType): string => {
        const colors: Record<ToastType, string> = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3',
        };
        return colors[type];
    };

    const getToastIcon = (type: ToastType): string => {
        const icons: Record<ToastType, string> = {
            success: 'checkmark-circle',
            error: 'close-circle',
            warning: 'warning',
            info: 'information-circle',
        };
        return icons[type];
    };

    test('creates toast with correct properties', () => {
        const toast = createToast('Success!', 'success');
        expect(toast.message).toBe('Success!');
        expect(toast.type).toBe('success');
        expect(toast.duration).toBe(3000);
    });

    test('allows custom duration', () => {
        const toast = createToast('Error', 'error', 5000);
        expect(toast.duration).toBe(5000);
    });

    test('returns correct colors', () => {
        expect(getToastColor('success')).toBe('#4CAF50');
        expect(getToastColor('error')).toBe('#F44336');
    });

    test('returns correct icons', () => {
        expect(getToastIcon('success')).toBe('checkmark-circle');
        expect(getToastIcon('error')).toBe('close-circle');
    });
});
