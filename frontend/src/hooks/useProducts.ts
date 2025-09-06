import { useState, useEffect } from 'react';
import { Product, ProductFilters, PaginationInfo } from '@/types';
import { clientProductsApi } from '@/lib/api';

interface UseProductsOptions {
  filters?: ProductFilters;
  pagination?: {
    page?: number;
    limit?: number;
  };
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  setPage: (page: number) => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { filters = {}, pagination = {}, autoFetch = true } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(filters);
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await clientProductsApi.getProducts({
        ...currentFilters,
        page: currentPage,
        limit: pagination.limit || 12,
      });
      
      // The API returns { data: products[], pagination: {...} }
      setProducts(Array.isArray(response.data) ? response.data : []);
      setPaginationInfo(response.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      setPaginationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [currentFilters, currentPage, autoFetch]);

  const setFilters = (newFilters: ProductFilters) => {
    setCurrentFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    products,
    loading,
    error,
    pagination: paginationInfo,
    refetch: fetchProducts,
    setFilters,
    setPage,
  };
};
