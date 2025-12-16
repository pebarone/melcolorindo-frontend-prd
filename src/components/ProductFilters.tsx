import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { IconFilter, IconClose, IconCheck, IconChevronDown } from './Icons';
import { useMobileAnimations } from '../hooks/useMobileAnimations';
import type { CategoryInfo } from '../services/api';
import type { SortOption } from '../hooks/useProductFilters';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  categories: CategoryInfo[];
  isLoadingCategories: boolean;
  selectedCategory: string | null;
  selectedSubcategories: string[];
  sortBy: SortOption;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryToggle: (subcategory: string) => void;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  getTotalProductCount: () => number;
  availableSubcategories: string[];
}

export function ProductFilters({
  categories,
  isLoadingCategories,
  selectedCategory,
  selectedSubcategories,
  sortBy,
  onCategoryChange,
  onSubcategoryToggle,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  getTotalProductCount,
  availableSubcategories,
}: ProductFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subcategories: true,
    sort: true,
  });

  // Estado temporário para mobile
  const [tempCategory, setTempCategory] = useState<string | null>(selectedCategory);
  // Mantemos como array no temp também
  const [tempSubcategories, setTempSubcategories] = useState<string[]>(selectedSubcategories);
  const [tempSortBy, setTempSortBy] = useState<SortOption>(sortBy);
  
  // Animações otimizadas para mobile
  const { spring, overlayTransition, overlayVariants, bottomSheetVariants } = useMobileAnimations();

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

  // Sincronizar temp state quando props mudam (se modal fechado)
  useEffect(() => {
    if (!isModalOpen) {
      setTempCategory(selectedCategory);
      setTempSubcategories(selectedSubcategories);
      setTempSortBy(sortBy);
    }
  }, [selectedCategory, selectedSubcategories, sortBy, isModalOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const openModal = useCallback(() => {
    setTempCategory(selectedCategory);
    setTempSubcategories(selectedSubcategories);
    setTempSortBy(sortBy);
    setIsModalOpen(true);
  }, [selectedCategory, selectedSubcategories, sortBy]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const applyMobileFilters = useCallback(() => {
    // Aplicar categoria
    if (tempCategory !== selectedCategory) {
      onCategoryChange(tempCategory);
    }
    
    // Aplicar sort
    if (tempSortBy !== sortBy) {
      onSortChange(tempSortBy);
    }

    // Aplicar subcategorias (calculando diff ou apenas enviando novos clicks seria complexo com a prop toggle)
    // Mas a prop é toggle. Se quisermos setar exato, o hook useProductFilters precisaria de 'setSubcategories'.
    // Como só temos toggle, vamos comparar e fazer os toggles necessários?
    // Não, o ideal é o parent expor um setSubcategories OU nós chamarmos toggle para cada diferença.
    // Vamos assumir que para simplificar, no mobile, podemos chamar o toggle para cada item que mudou de estado.
    // OU MELHOR: Vamos atualizar o hook useProductFilters para aceitar setar o array todo?
    // User pediu "refactor". 
    // Dado que toggle é o padrão, vamos inferir os toggles.
    
    const toAdd = tempSubcategories.filter(s => !selectedSubcategories.includes(s));
    const toRemove = selectedSubcategories.filter(s => !tempSubcategories.includes(s));
    
    [...toAdd, ...toRemove].forEach(sub => onSubcategoryToggle(sub));

    closeModal();
  }, [tempCategory, selectedCategory, tempSortBy, sortBy, tempSubcategories, selectedSubcategories, onCategoryChange, onSortChange, onSubcategoryToggle, closeModal]);

  const toggleTempSubcategory = (sub: string) => {
    setTempSubcategories(prev => {
      if (prev.includes(sub)) {
        return prev.filter(s => s !== sub);
      }
      return [...prev, sub];
    });
  };

  const activeFilterCount = [
    selectedCategory !== null,
    selectedSubcategories.length > 0,
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
                {selectedSubcategories.map(sub => (
                  <button key={sub} className={styles.filterChip} onClick={() => onSubcategoryToggle(sub)}>
                    {sub} <IconClose size={14} />
                  </button>
                ))}
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
            {availableSubcategories.length > 0 && (
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
                    {/* Opção "Todas" não faz sentido com multi-select aditivo, mas talvez para limpar? */}
                    {/* Se nenhuma selecionada, mostra "Todas" como ativo implícito ou check vazio? */}
                    {/* Vamos manter sem "Todas" explícito ou botão para limpar subcategorias */}
                    
                    {availableSubcategories.map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub);
                      return (
                        <button key={sub} className={styles.subcategoryOption} onClick={() => onSubcategoryToggle(sub)}>
                          <span className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                            {isSelected && <IconCheck size={14} />}
                          </span>
                          <span className={styles.subcategoryName}>{sub}</span>
                        </button>
                      );
                    })}
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
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={overlayTransition}
              onClick={closeModal}
            >
              <motion.div
                className={styles.modalContent}
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={spring}
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
                        onClick={() => { setTempCategory(null); }}
                      >
                        Todos ({getTotalProductCount()})
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.category}
                          className={`${styles.categoryBtn} ${tempCategory === cat.category ? styles.active : ''}`}
                          onClick={() => { setTempCategory(cat.category); }}
                        >
                          {cat.category} ({cat.productCount})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subcategorias */}
                  {(() => {
                    const modalSubcategories = tempCategory
                      ? categories.find(c => c.category === tempCategory)?.subcategories || []
                      : Array.from(new Set(categories.flatMap(c => c.subcategories))).sort();

                    if (modalSubcategories.length === 0) return null;

                    return (
                      <div className={styles.modalSection}>
                        <div className={styles.modalSectionTitle}>Subcategorias</div>
                        <div className={styles.modalOptions}>
                          {modalSubcategories.map((sub) => {
                            const isSelected = tempSubcategories.includes(sub);
                            return (
                              <button
                                key={sub}
                                className={`${styles.subcategoryBtn} ${isSelected ? styles.active : ''}`}
                                onClick={() => toggleTempSubcategory(sub)}
                              >
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

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
