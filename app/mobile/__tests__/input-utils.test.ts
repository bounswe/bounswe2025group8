/**
 * Unit Tests for Input Sanitization and Validation Utilities
 * Tests text sanitization, XSS prevention, and input cleaning
 */

describe('Input Sanitization', () => {
    describe('sanitizeTextInput', () => {
        const sanitizeTextInput = (input: string): string => {
            if (!input) return '';
            return input
                .trim()
                .replace(/\s+/g, ' ')           // Collapse whitespace
                .replace(/[<>]/g, '')           // Remove angle brackets
                .substring(0, 1000);            // Limit length
        };

        test('trims whitespace', () => {
            expect(sanitizeTextInput('  hello  ')).toBe('hello');
        });

        test('collapses multiple spaces', () => {
            expect(sanitizeTextInput('hello    world')).toBe('hello world');
        });

        test('removes angle brackets', () => {
            expect(sanitizeTextInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
        });

        test('limits length', () => {
            const longInput = 'a'.repeat(2000);
            expect(sanitizeTextInput(longInput).length).toBe(1000);
        });

        test('handles empty input', () => {
            expect(sanitizeTextInput('')).toBe('');
        });

        test('handles null-like input', () => {
            expect(sanitizeTextInput(null as any)).toBe('');
        });
    });

    describe('sanitizeHtml', () => {
        const sanitizeHtml = (html: string): string => {
            if (!html) return '';
            return html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/on\w+='[^']*'/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        };

        test('removes script tags', () => {
            const input = 'Hello <script>evil()</script> World';
            expect(sanitizeHtml(input)).toBe('Hello  World');
        });

        test('removes style tags', () => {
            const input = 'Hello <style>body{display:none}</style> World';
            expect(sanitizeHtml(input)).toBe('Hello  World');
        });

        test('removes event handlers', () => {
            const input = '<div onclick="evil()">Click me</div>';
            expect(sanitizeHtml(input)).not.toContain('onclick');
        });

        test('removes iframes', () => {
            const input = '<iframe src="evil.com"></iframe>';
            expect(sanitizeHtml(input)).toBe('');
        });

        test('preserves safe content', () => {
            const input = 'Hello <b>World</b>';
            expect(sanitizeHtml(input)).toBe('Hello <b>World</b>');
        });
    });

    describe('escapeForDisplay', () => {
        const escapeForDisplay = (text: string): string => {
            if (!text) return '';
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        };

        test('escapes HTML entities', () => {
            expect(escapeForDisplay('<div>')).toBe('&lt;div&gt;');
        });

        test('escapes ampersand', () => {
            expect(escapeForDisplay('A & B')).toBe('A &amp; B');
        });

        test('escapes quotes', () => {
            expect(escapeForDisplay('"hello"')).toBe('&quot;hello&quot;');
        });

        test('handles normal text', () => {
            expect(escapeForDisplay('Hello World')).toBe('Hello World');
        });
    });
});

describe('URL Validation', () => {
    describe('isValidUrl', () => {
        const isValidUrl = (url: string): boolean => {
            try {
                const parsed = new URL(url);
                return ['http:', 'https:'].includes(parsed.protocol);
            } catch {
                return false;
            }
        };

        test('accepts valid https URL', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
        });

        test('accepts valid http URL', () => {
            expect(isValidUrl('http://example.com')).toBe(true);
        });

        test('accepts URL with path', () => {
            expect(isValidUrl('https://example.com/path/to/page')).toBe(true);
        });

        test('accepts URL with query', () => {
            expect(isValidUrl('https://example.com?query=1')).toBe(true);
        });

        test('rejects invalid URL', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
        });

        test('rejects javascript protocol', () => {
            expect(isValidUrl('javascript:alert(1)')).toBe(false);
        });

        test('rejects file protocol', () => {
            expect(isValidUrl('file:///etc/passwd')).toBe(false);
        });
    });

    describe('sanitizeUrl', () => {
        const sanitizeUrl = (url: string): string => {
            try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    return '';
                }
                return parsed.toString();
            } catch {
                return '';
            }
        };

        test('returns valid URL unchanged', () => {
            const url = 'https://example.com/path';
            expect(sanitizeUrl(url)).toBe(url);
        });

        test('returns empty for invalid URL', () => {
            expect(sanitizeUrl('not-a-url')).toBe('');
        });

        test('returns empty for javascript URL', () => {
            expect(sanitizeUrl('javascript:void(0)')).toBe('');
        });
    });
});

describe('Number Validation and Formatting', () => {
    describe('parseIntSafe', () => {
        const parseIntSafe = (value: string | number, defaultValue: number = 0): number => {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? Math.floor(value) : defaultValue;
            }
            const parsed = parseInt(value, 10);
            return Number.isNaN(parsed) ? defaultValue : parsed;
        };

        test('parses string number', () => {
            expect(parseIntSafe('123')).toBe(123);
        });

        test('parses number', () => {
            expect(parseIntSafe(456)).toBe(456);
        });

        test('floors decimal numbers', () => {
            expect(parseIntSafe(3.7)).toBe(3);
        });

        test('returns default for invalid string', () => {
            expect(parseIntSafe('abc', 0)).toBe(0);
        });

        test('returns default for NaN', () => {
            expect(parseIntSafe(NaN, 10)).toBe(10);
        });

        test('returns default for Infinity', () => {
            expect(parseIntSafe(Infinity, 5)).toBe(5);
        });
    });

    describe('clampNumber', () => {
        const clampNumber = (value: number, min: number, max: number): number => {
            return Math.min(Math.max(value, min), max);
        };

        test('returns value within range', () => {
            expect(clampNumber(5, 1, 10)).toBe(5);
        });

        test('clamps to min', () => {
            expect(clampNumber(-5, 0, 10)).toBe(0);
        });

        test('clamps to max', () => {
            expect(clampNumber(15, 0, 10)).toBe(10);
        });

        test('handles equal min/max', () => {
            expect(clampNumber(5, 3, 3)).toBe(3);
        });
    });

    describe('formatNumber', () => {
        const formatNumber = (num: number): string => {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        };

        test('formats millions', () => {
            expect(formatNumber(1500000)).toBe('1.5M');
        });

        test('formats thousands', () => {
            expect(formatNumber(5500)).toBe('5.5K');
        });

        test('keeps small numbers', () => {
            expect(formatNumber(500)).toBe('500');
        });
    });
});

describe('Array Utilities', () => {
    describe('removeDuplicates', () => {
        const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
            if (!key) {
                return [...new Set(array)];
            }
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        };

        test('removes primitive duplicates', () => {
            expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
        });

        test('removes object duplicates by key', () => {
            const items = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
                { id: 1, name: 'c' },
            ];
            const unique = removeDuplicates(items, 'id');
            expect(unique.length).toBe(2);
        });

        test('handles empty array', () => {
            expect(removeDuplicates([])).toEqual([]);
        });
    });

    describe('chunkArray', () => {
        const chunkArray = <T>(array: T[], size: number): T[][] => {
            const chunks: T[][] = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        };

        test('splits array into chunks', () => {
            expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        });

        test('handles array smaller than chunk size', () => {
            expect(chunkArray([1, 2], 5)).toEqual([[1, 2]]);
        });

        test('handles empty array', () => {
            expect(chunkArray([], 5)).toEqual([]);
        });
    });

    describe('shuffleArray', () => {
        const shuffleArray = <T>(array: T[]): T[] => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        test('returns same length', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(original);
            expect(shuffled.length).toBe(original.length);
        });

        test('contains same elements', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = shuffleArray(original);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        test('does not modify original', () => {
            const original = [1, 2, 3];
            shuffleArray(original);
            expect(original).toEqual([1, 2, 3]);
        });
    });
});
