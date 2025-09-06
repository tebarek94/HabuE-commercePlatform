import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { categoriesApi } from '@/lib/api';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.getCategories();
      setCategories(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
