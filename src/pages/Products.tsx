import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';
import styles from './Products.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { useProductFilters } from '../hooks/useProductFilters';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

export const Products = () => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  
  // Hook centralizado de filtros
  const {
    categories,
    isLoadingCategories,
    selectedCategory,
    selectedSubcategory,
    sortBy,
    currentPage,
    itemsPerPage,
    setCategory,
    setSubcategory,
    setSortBy,
    setCurrentPage,
    setItemsPerPage,
    clearFilters,
    hasActiveFilters,
    getTotalProductCount,
  } = useProductFilters();
  
  // Paginação
  const [totalProducts, setTotalProducts] = useState(0);

  // Carregar produtos com base nos filtros
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          maxResults: itemsPerPage,
          page: currentPage,
        };

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        if (selectedSubcategory) {
          params.subcategory = selectedSubcategory;
        }

        const data = await productsApi.getAll(params);
        setProducts(data.products);
        setTotalProducts(data.total);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, selectedCategory, selectedSubcategory, itemsPerPage]);

  // Ordenar produtos com destaques no topo por padrão
  const sortedProducts = useMemo(() => {
    const productsToSort = [...products];

    if (sortBy === 'default') {
      return productsToSort.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
    }

    if (sortBy === 'name-asc') {
      return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === 'price-asc') {
      return productsToSort.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    if (sortBy === 'price-desc') {
      return productsToSort.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return productsToSort;
  }, [products, sortBy]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleFavoriteToggle = useCallback(async (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      return;
    }

    try {
      const willBeFavorite = !isFavorite(productId);
      await toggleFavorite(productId);
      if (willBeFavorite) {
        toast.success("Adicionado aos favoritos!");
      } else {
        toast.success("Removido dos favoritos");
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      toast.error("Erro ao atualizar favoritos");
    }
  }, [isAuthenticated, toggleFavorite, isFavorite, toast]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);

  const getPaginationRange = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Nossa Coleção</h1>
        <p>Escolha o acessório perfeito para brilhar!</p>
        <div className={styles.productsCount}>
          {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
        </div>
      </div>

      <div className={styles.pageLayout}>
        {/* Sidebar de Filtros (desktop) + Barra Mobile (topo) */}
        <ProductFilters
          categories={categories}
          isLoadingCategories={isLoadingCategories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          sortBy={sortBy}
          onCategoryChange={setCategory}
          onSubcategoryChange={setSubcategory}
          onSortChange={setSortBy}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          getTotalProductCount={getTotalProductCount}
        />

        {/* Conteúdo Principal */}
        <div className={styles.mainContent}>
          {/* Controles de paginação */}
          <div className={styles.controls}>
            <div className={styles.itemsPerPageSelector}>
              <label>Mostrar:</label>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>por página</span>
            </div>
          </div>

          {isLoading ? (
            <motion.div className={styles.grid} layout>
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className={styles.cardSkeleton}>
                  <motion.div 
                    className={styles.skeletonImage}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.div>
                  <div className={styles.skeletonContent}>
                    <motion.div 
                      className={styles.skeletonBadge}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                    ></motion.div>
                    <motion.div 
                      className={styles.skeletonTitle}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    ></motion.div>
                    <motion.div 
                      className={styles.skeletonPrice}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : sortedProducts.length > 0 ? (
            <>
              <motion.div className={styles.grid} layout>
                <AnimatePresence mode="popLayout">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={isFavorite(product.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>

                  <div className={styles.pageNumbers}>
                    {getPaginationRange().map((page, index) => (
                      page === '...' ? (
                        <span key={`dots-${index}`} className={styles.pageDots}>...</span>
                      ) : (
                        <button
                          key={page}
                          className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>Nenhum produto encontrado</h3>
              <p>Não há produtos disponíveis {selectedCategory ? `na categoria "${selectedCategory}"` : 'no momento'}.</p>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};
