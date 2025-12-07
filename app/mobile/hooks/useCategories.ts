import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../lib/api';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCategories();
      const mapped = response.results?.map((category) => ({
        value: category.id,
        label: t(`categories.${category.id}`, category.name),
      }));
      if (mapped?.length) {
        setOptions(mapped);
      } else {
        // Fallback if API returns empty
        setOptions(FALLBACK_CATEGORIES.map(c => ({
          ...c,
          label: t(`categories.${c.value}`, c.label)
        })));
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load categories');
      // Fallback on error
      setOptions(FALLBACK_CATEGORIES.map(c => ({
        ...c,
        label: t(`categories.${c.value}`, c.label)
      })));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
