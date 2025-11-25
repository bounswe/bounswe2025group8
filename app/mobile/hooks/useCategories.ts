import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../lib/api';

export interface CategoryOption {
  value: string;
  label: string;
}

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { value: 'GROCERY_SHOPPING', label: 'Grocery Shopping' },
  { value: 'TUTORING', label: 'Tutoring' },
  { value: 'HOME_REPAIR', label: 'Home Repair' },
  { value: 'MOVING_HELP', label: 'Moving Help' },
  { value: 'HOUSE_CLEANING', label: 'House Cleaning' },
  { value: 'OTHER', label: 'Other' },
];

export function useCategories() {
  const [options, setOptions] = useState<CategoryOption[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategories();
      const mapped = response.results?.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      if (mapped?.length) {
        setOptions(mapped);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    options,
    loading,
    error,
    refresh: loadCategories,
  };
}
