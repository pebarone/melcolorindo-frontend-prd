import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconFilter, IconClose, IconCheck, IconChevronDown } from './Icons';
import type { CategoryInfo } from '../services/api';
import type { SortOption } from '../hooks/useProductFilters';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  categories: CategoryInfo[];
  isLoadingCategories: boolean;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  sortBy: SortOption;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  getTotalProductCount: () => number;
}

export function ProductFilters({
  categories,
  isLoadingCategories,
  selectedCategory,
  selectedSubcategory,
  sortBy,
  onCategoryChange,
  onSubcategoryChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  getTotalProductCount,
}: ProductFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subcategories: true,
    sort: true,
  });

  // Estado temporário para mobile
  const [tempCategory, setTempCategory] = useState<string | null>(selectedCategory);
  const [tempSubcategory, setTempSubcategory] = useState<string | null>(selectedSubcategory);
  const [tempSortBy, setTempSortBy] = useState<SortOption>(sortBy);

  /* Prevent body scroll when modal is open */
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openModal = useCallback(() => {
    setTempCategory(selectedCategory);
    setTempSubcategory(selectedSubcategory);
    setTempSortBy(sortBy);
    setIsModalOpen(true);
  }, [selectedCategory, selectedSubcategory, sortBy]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyMobileFilters = useCallback(() => {
    onCategoryChange(tempCategory);
    setTimeout(() => {
      onSubcategoryChange(tempSubcategory);
      onSortChange(tempSortBy);
    }, 0);
    closeModal();
  }, [tempCategory, tempSubcategory, tempSortBy, onCategoryChange, onSubcategoryChange, onSortChange, closeModal]);

  // Subcategorias
  const subcategories = selectedCategory 
    ? categories.find(c => c.category === selectedCategory)?.subcategories || []
    : [];

  const tempSubcategories = tempCategory 
    ? categories.find(c => c.category === tempCategory)?.subcategories || []
    : [];

  const activeFilterCount = [
    selectedCategory !== null,
    selectedSubcategory !== null,
    sortBy !== 'default',
  ].filter(Boolean).length;

  return (
    <>
      {/* ==================== SIDEBAR (Desktop) ==================== */}
      <aside className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>
          <IconFilter size={20} />
          Filtros
        </h3>

        {isLoadingCategories ? (
          <div className={styles.loadingState}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.loadingSkeleton} />
            ))}
          </div>
        ) : (
          <>
            {/* Chips de filtros ativos */}
            {hasActiveFilters && (
              <div className={styles.activeFilters}>
                {selectedCategory && (
                  <button className={styles.filterChip} onClick={() => onCategoryChange(null)}>
                    {selectedCategory} <IconClose size={14} />
                  </button>
                )}
                {selectedSubcategory && (
                  <button className={styles.filterChip} onClick={() => onSubcategoryChange(null)}>
                    {selectedSubcategory} <IconClose size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Categorias */}
            <div className={styles.filterSection}>
              <button
                className={`${styles.filterHeader} ${expandedSections.categories ? styles.open : ''}`}
                onClick={() => toggleSection('categories')}
              >
                <span className={styles.filterLabel}>Categorias</span>
                <IconChevronDown size={18} />
              </button>
              
              {expandedSections.categories && (
                <div className={styles.filterOptions}>
                  <button
                    className={`${styles.categoryOption} ${selectedCategory === null ? styles.active : ''}`}
                    onClick={() => onCategoryChange(null)}
                  >
                    <span className={styles.categoryName}>Todos</span>
                    <span className={styles.categoryCount}>{getTotalProductCount()}</span>
                  </button>
                  
                  {categories.map((cat) => (
                    <button
                      key={cat.category}
                      className={`${styles.categoryOption} ${selectedCategory === cat.category ? styles.active : ''}`}
                      onClick={() => onCategoryChange(cat.category)}
                    >
                      <span className={styles.categoryName}>{cat.category}</span>
                      <span className={styles.categoryCount}>{cat.productCount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subcategorias */}
            {subcategories.length > 0 && (
              <div className={styles.filterSection}>
                <button
                  className={`${styles.filterHeader} ${expandedSections.subcategories ? styles.open : ''}`}
                  onClick={() => toggleSection('subcategories')}
                >
                  <span className={styles.filterLabel}>Subcategorias</span>
                  <IconChevronDown size={18} />
                </button>
                
                {expandedSections.subcategories && (
                  <div className={styles.filterOptions}>
                    <button className={styles.subcategoryOption} onClick={() => onSubcategoryChange(null)}>
                      <span className={`${styles.checkbox} ${selectedSubcategory === null ? styles.checked : ''}`}>
                        {selectedSubcategory === null && <IconCheck size={14} />}
                      </span>
                      <span className={styles.subcategoryName}>Todas</span>
                    </button>
                    
                    {subcategories.map((sub) => (
                      <button key={sub} className={styles.subcategoryOption} onClick={() => onSubcategoryChange(sub)}>
                        <span className={`${styles.checkbox} ${selectedSubcategory === sub ? styles.checked : ''}`}>
                          {selectedSubcategory === sub && <IconCheck size={14} />}
                        </span>
                        <span className={styles.subcategoryName}>{sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ordenação */}
            <div className={styles.filterSection}>
              <button
                className={`${styles.filterHeader} ${expandedSections.sort ? styles.open : ''}`}
                onClick={() => toggleSection('sort')}
              >
                <span className={styles.filterLabel}>Ordenar por</span>
                <IconChevronDown size={18} />
              </button>
              
              {expandedSections.sort && (
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                >
                  <option value="default">Destaques primeiro</option>
                  <option value="name-asc">Nome (A-Z)</option>
                  <option value="price-asc">Preço (menor)</option>
                  <option value="price-desc">Preço (maior)</option>
                </select>
              )}
            </div>

            {/* Limpar Filtros */}
            <button className={styles.clearButton} onClick={onClearFilters} disabled={!hasActiveFilters}>
              <IconClose size={16} />
              Limpar filtros
            </button>
          </>
        )}
      </aside>

      {/* ==================== MOBILE FILTER BAR (Topo) ==================== */}
      <div className={styles.mobileFilterBar}>
        <button className={styles.mobileFilterButton} onClick={openModal}>
          <IconFilter size={20} />
          Filtros
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* ==================== MODAL (Fixo no fim da TELA - Portal) ==================== */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className={styles.modalContent}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Filtros</h3>
                  <button className={styles.modalCloseButton} onClick={closeModal}>
                    <IconClose size={24} />
                  </button>
                </div>
                
                <div className={styles.modalBody}>
                  {/* Categorias */}
                  <div className={styles.modalSection}>
                    <div className={styles.modalSectionTitle}>Categorias</div>
                    <div className={styles.modalOptions}>
                      <button
                        className={`${styles.categoryBtn} ${tempCategory === null ? styles.active : ''}`}
                        onClick={() => { setTempCategory(null); setTempSubcategory(null); }}
                      >
                        Todos ({getTotalProductCount()})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.category}
                          className={`${styles.categoryBtn} ${tempCategory === cat.category ? styles.active : ''}`}
                          onClick={() => { setTempCategory(cat.category); setTempSubcategory(null); }}
                        >
                          {cat.category} ({cat.productCount})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subcategorias */}
                  {tempSubcategories.length > 0 && (
                    <div className={styles.modalSection}>
                      <div className={styles.modalSectionTitle}>Subcategorias</div>
                      <div className={styles.modalOptions}>
                        <button
                          className={`${styles.subcategoryBtn} ${tempSubcategory === null ? styles.active : ''}`}
                          onClick={() => setTempSubcategory(null)}
                        >
                          Todas
                        </button>
                        {tempSubcategories.map((sub) => (
                          <button
                            key={sub}
                            className={`${styles.subcategoryBtn} ${tempSubcategory === sub ? styles.active : ''}`}
                            onClick={() => setTempSubcategory(sub)}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ordenação */}
                  <div className={styles.modalSection}>
                    <div className={styles.modalSectionTitle}>Ordenar por</div>
                    <select
                      className={styles.sortSelect}
                      value={tempSortBy}
                      onChange={(e) => setTempSortBy(e.target.value as SortOption)}
                    >
                      <option value="default">Destaques primeiro</option>
                      <option value="name-asc">Nome (A-Z)</option>
                      <option value="price-asc">Preço (menor)</option>
                      <option value="price-desc">Preço (maior)</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.modalFooter}>
                  <button className={styles.applyButton} onClick={applyMobileFilters}>
                    Aplicar Filtros
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default ProductFilters;
