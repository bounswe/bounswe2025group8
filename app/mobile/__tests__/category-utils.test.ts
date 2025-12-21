/**
 * Unit Tests for Category Utilities
 * Tests category parsing, mapping, and filtering logic
 */

describe('Category Utilities', () => {
    // Category constants (matching backend)
    const CATEGORIES = {
        GROCERY_SHOPPING: 'GROCERY_SHOPPING',
        HOUSE_CLEANING: 'HOUSE_CLEANING',
        PET_CARE: 'PET_CARE',
        TRANSPORTATION: 'TRANSPORTATION',
        MEDICAL_ASSISTANCE: 'MEDICAL_ASSISTANCE',
        COOKING: 'COOKING',
        GARDENING: 'GARDENING',
        TUTORING: 'TUTORING',
        TECH_SUPPORT: 'TECH_SUPPORT',
        OTHER: 'OTHER',
    };

    describe('getCategoryDisplayName', () => {
        const getCategoryDisplayName = (category: string): string => {
            const displayNames: Record<string, string> = {
                'GROCERY_SHOPPING': 'Grocery Shopping',
                'HOUSE_CLEANING': 'House Cleaning',
                'PET_CARE': 'Pet Care',
                'TRANSPORTATION': 'Transportation',
                'MEDICAL_ASSISTANCE': 'Medical Assistance',
                'COOKING': 'Cooking',
                'GARDENING': 'Gardening',
                'TUTORING': 'Tutoring',
                'TECH_SUPPORT': 'Tech Support',
                'OTHER': 'Other',
            };
            return displayNames[category?.toUpperCase()] || category || 'Unknown';
        };

        test('converts GROCERY_SHOPPING to display name', () => {
            expect(getCategoryDisplayName('GROCERY_SHOPPING')).toBe('Grocery Shopping');
        });

        test('converts HOUSE_CLEANING to display name', () => {
            expect(getCategoryDisplayName('HOUSE_CLEANING')).toBe('House Cleaning');
        });

        test('converts MEDICAL_ASSISTANCE to display name', () => {
            expect(getCategoryDisplayName('MEDICAL_ASSISTANCE')).toBe('Medical Assistance');
        });

        test('handles case insensitivity', () => {
            expect(getCategoryDisplayName('grocery_shopping')).toBe('Grocery Shopping');
        });

        test('returns original for unknown category', () => {
            expect(getCategoryDisplayName('CUSTOM_CATEGORY')).toBe('CUSTOM_CATEGORY');
        });

        test('returns Unknown for empty/null', () => {
            expect(getCategoryDisplayName('')).toBe('Unknown');
        });
    });

    describe('getCategoryIcon', () => {
        const getCategoryIcon = (category: string): string => {
            const icons: Record<string, string> = {
                'GROCERY_SHOPPING': '🛒',
                'HOUSE_CLEANING': '🏠',
                'PET_CARE': '🐾',
                'TRANSPORTATION': '🚗',
                'MEDICAL_ASSISTANCE': '⚕️',
                'COOKING': '🍳',
                'GARDENING': '🌱',
                'TUTORING': '📚',
                'TECH_SUPPORT': '💻',
                'OTHER': '📋',
            };
            return icons[category?.toUpperCase()] || '📋';
        };

        test('returns shopping cart for grocery shopping', () => {
            expect(getCategoryIcon('GROCERY_SHOPPING')).toBe('🛒');
        });

        test('returns house for cleaning', () => {
            expect(getCategoryIcon('HOUSE_CLEANING')).toBe('🏠');
        });

        test('returns paw for pet care', () => {
            expect(getCategoryIcon('PET_CARE')).toBe('🐾');
        });

        test('returns default icon for unknown category', () => {
            expect(getCategoryIcon('UNKNOWN')).toBe('📋');
        });
    });

    describe('getCategoryColor', () => {
        const getCategoryColor = (category: string): string => {
            const colors: Record<string, string> = {
                'GROCERY_SHOPPING': '#4CAF50',
                'HOUSE_CLEANING': '#2196F3',
                'PET_CARE': '#FF9800',
                'TRANSPORTATION': '#9C27B0',
                'MEDICAL_ASSISTANCE': '#F44336',
                'COOKING': '#FF5722',
                'GARDENING': '#8BC34A',
                'TUTORING': '#3F51B5',
                'TECH_SUPPORT': '#607D8B',
                'OTHER': '#9E9E9E',
            };
            return colors[category?.toUpperCase()] || '#9E9E9E';
        };

        test('returns green for grocery shopping', () => {
            expect(getCategoryColor('GROCERY_SHOPPING')).toBe('#4CAF50');
        });

        test('returns red for medical assistance', () => {
            expect(getCategoryColor('MEDICAL_ASSISTANCE')).toBe('#F44336');
        });

        test('returns gray for unknown', () => {
            expect(getCategoryColor('UNKNOWN')).toBe('#9E9E9E');
        });
    });

    describe('filterTasksByCategory', () => {
        const filterTasksByCategory = (tasks: Array<{ category: string }>, category: string): Array<{ category: string }> => {
            return tasks.filter(task => task.category?.toUpperCase() === category.toUpperCase());
        };

        const mockTasks = [
            { category: 'GROCERY_SHOPPING' },
            { category: 'PET_CARE' },
            { category: 'GROCERY_SHOPPING' },
            { category: 'COOKING' },
        ];

        test('filters by grocery shopping', () => {
            const result = filterTasksByCategory(mockTasks, 'GROCERY_SHOPPING');
            expect(result.length).toBe(2);
        });

        test('filters by pet care', () => {
            const result = filterTasksByCategory(mockTasks, 'PET_CARE');
            expect(result.length).toBe(1);
        });

        test('returns empty for non-existent category', () => {
            const result = filterTasksByCategory(mockTasks, 'TRANSPORTATION');
            expect(result.length).toBe(0);
        });

        test('handles case insensitivity', () => {
            const result = filterTasksByCategory(mockTasks, 'grocery_shopping');
            expect(result.length).toBe(2);
        });
    });

    describe('groupTasksByCategory', () => {
        const groupTasksByCategory = (tasks: Array<{ id: number; category: string }>): Record<string, Array<{ id: number; category: string }>> => {
            return tasks.reduce((groups, task) => {
                const category = task.category?.toUpperCase() || 'OTHER';
                if (!groups[category]) {
                    groups[category] = [];
                }
                groups[category].push(task);
                return groups;
            }, {} as Record<string, Array<{ id: number; category: string }>>);
        };

        test('groups tasks correctly', () => {
            const tasks = [
                { id: 1, category: 'GROCERY_SHOPPING' },
                { id: 2, category: 'PET_CARE' },
                { id: 3, category: 'GROCERY_SHOPPING' },
            ];
            const grouped = groupTasksByCategory(tasks);

            expect(Object.keys(grouped).length).toBe(2);
            expect(grouped['GROCERY_SHOPPING'].length).toBe(2);
            expect(grouped['PET_CARE'].length).toBe(1);
        });

        test('handles empty array', () => {
            expect(groupTasksByCategory([])).toEqual({});
        });

        test('groups tasks without category as OTHER', () => {
            const tasks = [
                { id: 1, category: '' },
            ];
            const grouped = groupTasksByCategory(tasks);
            expect(grouped['OTHER']).toBeDefined();
        });
    });

    describe('getCategoriesWithCount', () => {
        const getCategoriesWithCount = (tasks: Array<{ category: string }>): Array<{ category: string; count: number }> => {
            const counts = tasks.reduce((acc, task) => {
                const cat = task.category || 'OTHER';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return Object.entries(counts)
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count);
        };

        test('counts tasks per category', () => {
            const tasks = [
                { category: 'GROCERY_SHOPPING' },
                { category: 'PET_CARE' },
                { category: 'GROCERY_SHOPPING' },
            ];
            const result = getCategoriesWithCount(tasks);

            expect(result[0]).toEqual({ category: 'GROCERY_SHOPPING', count: 2 });
            expect(result[1]).toEqual({ category: 'PET_CARE', count: 1 });
        });

        test('sorts by count descending', () => {
            const tasks = [
                { category: 'A' },
                { category: 'B' },
                { category: 'B' },
                { category: 'C' },
                { category: 'C' },
                { category: 'C' },
            ];
            const result = getCategoriesWithCount(tasks);

            expect(result[0].category).toBe('C');
            expect(result[1].category).toBe('B');
            expect(result[2].category).toBe('A');
        });
    });

    describe('isValidCategory', () => {
        const validCategories = Object.values(CATEGORIES);

        const isValidCategory = (category: string): boolean => {
            return validCategories.includes(category?.toUpperCase());
        };

        test('returns true for valid category', () => {
            expect(isValidCategory('GROCERY_SHOPPING')).toBe(true);
            expect(isValidCategory('PET_CARE')).toBe(true);
        });

        test('returns false for invalid category', () => {
            expect(isValidCategory('INVALID')).toBe(false);
        });

        test('handles case insensitivity', () => {
            expect(isValidCategory('grocery_shopping')).toBe(true);
        });

        test('returns false for empty string', () => {
            expect(isValidCategory('')).toBe(false);
        });
    });
});
