import { useState, useEffect, useCallback, useMemo } from 'react';
import { productsApi, type CategoryInfo } from '../services/api';

export type SortOption = 'default' | 'name-asc' | 'price-asc' | 'price-desc';

export interface UseProductFiltersReturn {
  // Dados de categorias
  categories: CategoryInfo[];
  isLoadingCategories: boolean;
  
  // Estado de filtros
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  sortBy: SortOption;
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  setCategory: (category: string | null) => void;
  setSubcategory: (subcategory: string | null) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  clearFilters: () => void;
  
  // Helpers
  getSubcategoriesForCategory: (category: string | null) => string[];
  getCategoryCount: (category: string) => number;
  getTotalProductCount: () => number;
  hasActiveFilters: boolean;
}

/**
 * Hook para gerenciar estado de filtros de produtos
 * Carrega categorias do endpoint /products/categories e gerencia seleções
 */
export function useProductFilters(): UseProductFiltersReturn {
  // Estado de categorias
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Estado de filtros
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Carregar categorias do endpoint dedicado
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await productsApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  // Resetar página ao mudar filtros
  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategoria ao mudar categoria
    setCurrentPage(1);
  }, []);

  const setSubcategory = useCallback((subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
  }, []);

  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSortBy('default');
    setCurrentPage(1);
  }, []);

  // Helpers
  const getSubcategoriesForCategory = useCallback((category: string | null): string[] => {
    if (!category) return [];
    const found = categories.find(c => c.category === category);
    return found?.subcategories || [];
  }, [categories]);

  const getCategoryCount = useCallback((category: string): number => {
    const found = categories.find(c => c.category === category);
    return found?.productCount || 0;
  }, [categories]);

  const getTotalProductCount = useCallback((): number => {
    return categories.reduce((sum, cat) => sum + cat.productCount, 0);
  }, [categories]);

  const hasActiveFilters = useMemo(() => {
    return selectedCategory !== null || selectedSubcategory !== null || sortBy !== 'default';
  }, [selectedCategory, selectedSubcategory, sortBy]);

  return {
    // Dados de categorias
    categories,
    isLoadingCategories,
    
    // Estado de filtros
    selectedCategory,
    selectedSubcategory,
    sortBy,
    
    // Paginação
    currentPage,
    itemsPerPage,
    
    // Actions
    setCategory,
    setSubcategory,
    setSortBy,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    clearFilters,
    
    // Helpers
    getSubcategoriesForCategory,
    getCategoryCount,
    getTotalProductCount,
    hasActiveFilters,
  };
}

export default useProductFilters;
