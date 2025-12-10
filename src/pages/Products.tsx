import { useState, useEffect, useMemo, useCallback } from 'react';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';
import styles from './Products.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ProductCard } from '../components/ProductCard';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';

export const Products = () => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'price-asc' | 'price-desc'>('default');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          maxResults: itemsPerPage,
          page: currentPage,
        };

        if (selectedCategory !== 'Todos') {
          params.category = selectedCategory;
        }

        if (selectedSubcategory) {
          params.subcategory = selectedSubcategory;
        }

        const data = await productsApi.getAll(params);
        setProducts(data.products);
        setTotalProducts(data.total);
        // Favoritos agora são gerenciados pelo FavoritesContext
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

  // Extrair categorias e subcategorias únicas dos produtos
  const allCategories = useMemo(() => {
    // Buscar todas as categorias da API (sem filtro)
    const categories = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(categories)];
  }, [products]);

  const subcategories = useMemo(() => {
    if (selectedCategory === 'Todos') return [];
    
    const subs = new Set(
      products
        .filter(p => p.category === selectedCategory && p.subcategory)
        .map(p => p.subcategory!)
    );
    return Array.from(subs);
  }, [products, selectedCategory]);

  // Ordenar produtos com destaques no topo por padrão
  const sortedProducts = useMemo(() => {
    const productsToSort = [...products];

    if (sortBy === 'default') {
      // Padrão: Destaques primeiro, depois ordem original
      return productsToSort.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });
    }

    // Com filtro aplicado, ignora prioridade de destaque
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
      setIsLoginModalOpen(true);
      return;
    }

    try {
      await toggleFavorite(productId);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  }, [isAuthenticated, toggleFavorite, setIsLoginModalOpen]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setCurrentPage(1);
  }, []);

  const handleSubcategoryChange = useCallback((subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

      {/* Filtros de Categoria */}
      <div className={styles.categories}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.catButton} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros de Subcategoria */}
      {subcategories.length > 0 && (
        <div className={styles.subcategories}>
          <button
            className={`${styles.subButton} ${!selectedSubcategory ? styles.active : ''}`}
            onClick={() => handleSubcategoryChange(null)}
          >
            Todas
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className={`${styles.subButton} ${selectedSubcategory === sub ? styles.active : ''}`}
              onClick={() => handleSubcategoryChange(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Seletor de itens por página */}
      <div className={styles.controls}>
        <div className={styles.itemsPerPageSelector}>
          <label>Mostrar:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>por página</span>
        </div>

        <div className={styles.sortSelector}>
          <label>Ordenar por:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="default">Destaques primeiro</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="price-asc">Preço (menor)</option>
            <option value="price-desc">Preço (maior)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className={styles.grid}>
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonBadge}></div>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonPrice}></div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <>
          <div className={styles.grid}>
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={isFavorite(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>

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
          <p>Não há produtos disponíveis {selectedCategory !== 'Todos' ? `na categoria "${selectedCategory}"` : 'no momento'}.</p>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
};
