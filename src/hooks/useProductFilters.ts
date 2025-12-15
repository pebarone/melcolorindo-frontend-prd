import { useState, useEffect, useCallback, useMemo } from 'react';
import { productsApi, type CategoryInfo } from '../services/api';

export type SortOption = 'default' | 'name-asc' | 'price-asc' | 'price-desc';

export interface UseProductFiltersReturn {
  // Dados de categorias
  categories: CategoryInfo[];
  isLoadingCategories: boolean;
  
  // Estado de filtros
  selectedCategory: string | null;
  selectedSubcategories: string[];
  sortBy: SortOption;
  
  // Paginação
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  setCategory: (category: string | null) => void;
  toggleSubcategory: (subcategory: string) => void;
  setSortBy: (sort: SortOption) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  clearFilters: () => void;
  
  // Helpers
  getAvailableSubcategories: () => string[];
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
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
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
    // Não resetamos subcategorias pois elas são independentes/globais
    setCurrentPage(1);
  }, []);

  const toggleSubcategory = useCallback((subcategory: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategory)) {
        return prev.filter(s => s !== subcategory);
      }
      return [...prev, subcategory];
    });
    setCurrentPage(1);
  }, []);

  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSubcategories([]);
    setSortBy('default');
    setCurrentPage(1);
  }, []);

  // Helpers
  const getAvailableSubcategories = useCallback((): string[] => {
    // Se tem categoria selecionada, retorna apenas as dela
    if (selectedCategory) {
      const found = categories.find(c => c.category === selectedCategory);
      return found?.subcategories || [];
    }
    
    // Se não, retorna TODAS as subcategorias únicas
    const allSubcategories = new Set<string>();
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => allSubcategories.add(sub));
    });
    return Array.from(allSubcategories).sort();
  }, [categories, selectedCategory]);

  const getCategoryCount = useCallback((category: string): number => {
    const found = categories.find(c => c.category === category);
    return found?.productCount || 0;
  }, [categories]);

  const getTotalProductCount = useCallback((): number => {
    return categories.reduce((sum, cat) => sum + cat.productCount, 0);
  }, [categories]);

  const hasActiveFilters = useMemo(() => {
    return selectedCategory !== null || selectedSubcategories.length > 0 || sortBy !== 'default';
  }, [selectedCategory, selectedSubcategories, sortBy]);

  return {
    // Dados de categorias
    categories,
    isLoadingCategories,
    
    // Estado de filtros
    selectedCategory,
    selectedSubcategories,
    sortBy,
    
    // Paginação
    currentPage,
    itemsPerPage,
    
    // Actions
    setCategory,
    toggleSubcategory,
    setSortBy,
    setCurrentPage,
    setItemsPerPage: handleSetItemsPerPage,
    clearFilters,
    
    // Helpers
    getAvailableSubcategories,
    getCategoryCount,
    getTotalProductCount,
    hasActiveFilters,
  };
}

export default useProductFilters;
