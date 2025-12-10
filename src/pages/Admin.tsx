import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconDashboard, 
  IconAdd, 
  IconPackage, 
  IconTag, 
  IconHistory, 
  IconSearch, 
  IconEdit, 
  IconDelete, 
  IconUpload,
  IconAlert
} from '../components/Icons';
import { productsApi, ApiError } from '../services/api';
import type { Product } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import styles from './Admin.module.css';

// Modal de produto (criar/editar)
interface ProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (formData: FormData, isEdit: boolean) => Promise<void>;
}

const ProductModal = ({ isOpen, product, onClose, onSave }: ProductModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setImagePreview(product.image_url);
    } else {
      setName('');
      setPrice('');
      setCategory('');
      setSubcategory('');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  // Carregar categorias e subcategorias existentes
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const data = await productsApi.getAll({ maxResults: 1000 });
        const categories = new Set<string>();
        const subcategories = new Set<string>();
        
        data.products.forEach(p => {
          if (p.category) categories.add(p.category);
          if (p.subcategory) subcategories.add(p.subcategory);
        });
        
        setExistingCategories(Array.from(categories).sort());
        setExistingSubcategories(Array.from(subcategories).sort());
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    if (isOpen) {
      loadExistingData();
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      if (subcategory.trim()) {
        formData.append('subcategory', subcategory.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSave(formData, !!product);
      onClose();
    } catch {
      // Erro tratado no componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className={styles.productModal}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className={styles.modalHeader}>
          <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <img src="/closeicon.svg" alt="Fechar" width={20} height={20} />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nome do Produto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pulseira Arco-Íris"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Categoria</label>
            <div className={styles.customSelect}>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                placeholder="Selecione ou digite uma categoria"
                required
              />
              {showCategoryDropdown && existingCategories.length > 0 && (
                <div className={styles.dropdown}>
                  {existingCategories
                    .filter(cat => cat.toLowerCase().includes(category.toLowerCase()))
                    .map(cat => (
                      <div
                        key={cat}
                        className={styles.dropdownItem}
                        onMouseDown={() => setCategory(cat)}
                      >
                        {cat}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Subcategoria (Opcional)</label>
            <div className={styles.customSelect}>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                onFocus={() => setShowSubcategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                placeholder="Selecione ou digite uma subcategoria"
              />
              {showSubcategoryDropdown && existingSubcategories.length > 0 && (
                <div className={styles.dropdown}>
                  {existingSubcategories
                    .filter(sub => sub.toLowerCase().includes(subcategory.toLowerCase()))
                    .map(sub => (
                      <div
                        key={sub}
                        className={styles.dropdownItem}
                        onMouseDown={() => setSubcategory(sub)}
                      >
                        {sub}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Imagem</label>
            {imagePreview ? (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className={styles.removeImage}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  aria-label="Remover imagem"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className={styles.imageUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <IconUpload size={32} color="#999" />
                <p>Clique para <span>enviar uma imagem</span></p>
              </label>
            )}
          </div>
        </form>

        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={isSubmitting || !name || !price || !category}
          >
            {isSubmitting ? 'Salvando...' : product ? 'Atualizar' : 'Criar Produto'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Modal de confirmação de exclusão
interface ConfirmDeleteProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const ConfirmDeleteModal = ({ isOpen, productName, onClose, onConfirm, isDeleting }: ConfirmDeleteProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.confirmModal}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <IconAlert size={48} color="#FF595E" />
        <h3>Excluir Produto</h3>
        <p>Tem certeza que deseja excluir <strong>"{productName}"</strong>? Esta ação não pode ser desfeita.</p>
        <div className={styles.confirmActions}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isDeleting}>
            Cancelar
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente principal Admin
export const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  // Redirecionar se não for admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Carregar produtos
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productsApi.getAll();
      setProducts(data.products); // Atualizado para usar data.products
      setFilteredProducts(data.products);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtrar produtos
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Salvar produto (criar ou editar)
  const handleSaveProduct = async (formData: FormData, isEdit: boolean) => {
    try {
      if (isEdit && editingProduct) {
        await productsApi.update(editingProduct.id, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productsApi.create(formData);
        toast.success('Produto criado com sucesso!');
      }
      loadProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao salvar produto');
      }
      throw err;
    }
  };

  // Excluir produto
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Produto excluído com sucesso! A imagem também foi removida do storage.');
      setDeleteProduct(null);
      loadProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao excluir produto');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle produto em destaque
  const handleToggleFeatured = async (product: Product) => {
    const newFeaturedState = !product.is_featured;
    
    // Otimisticamente atualiza a UI antes da resposta da API
    const updateLocalState = (isFeatured: boolean) => {
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_featured: isFeatured } : p
      ));
      setFilteredProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_featured: isFeatured } : p
      ));
    };

    updateLocalState(newFeaturedState);

    try {
      await productsApi.toggleFeatured(product.id, newFeaturedState);
      toast.success(
        newFeaturedState 
          ? 'Produto adicionado aos destaques!' 
          : 'Produto removido dos destaques'
      );
      // Não recarrega tudo, apenas mantém o estado local atualizado
    } catch (err) {
      // Reverte o estado local em caso de erro
      updateLocalState(!newFeaturedState);

      if (err instanceof ApiError) {
        // Tratamento especial para erro de limite de destaques
        if (err.code === 'FEATURED_LIMIT_REACHED') {
          toast.error(
            'Limite de destaques atingido! Você já possui 6 produtos em destaque. Remova um produto antes de adicionar outro.',
            7000 // 7 segundos para mensagem importante
          );
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Erro ao alterar status de destaque');
      }
    }
  };

  // Calcular estatísticas
  const uniqueCategories = new Set(products.map((p) => p.category)).size;
  const featuredCount = products.filter(p => p.is_featured).length;
  const recentProducts = products
    .filter((p) => {
      if (!p.created_at) return false;
      const createdDate = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    })
    .length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <IconDashboard size={28} color="#6A4C93" />
          <h1>Administração</h1>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
        >
          <IconAdd size={20} color="white" />
          Adicionar Produto
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.products}`}>
            <IconPackage size={24} color="#4267AC" />
          </div>
          <div className={styles.statInfo}>
            <h3>{products.length}</h3>
            <p>Produtos Cadastrados</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.categories}`}>
            <IconTag size={24} color="#8AC926" />
          </div>
          <div className={styles.statInfo}>
            <h3>{uniqueCategories}</h3>
            <p>Categorias</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.recent}`}>
            <IconHistory size={24} color="#6A4C93" />
          </div>
          <div className={styles.statInfo}>
            <h3>{recentProducts}</h3>
            <p>Adicionados esta semana</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.featured}`}>
            <span style={{ fontSize: '24px' }}>⭐</span>
          </div>
          <div className={styles.statInfo}>
            <h3>{featuredCount}/6</h3>
            <p>Produtos em Destaque</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2>Produtos</h2>
          <div className={styles.searchWrapper}>
            <IconSearch size={18} color="#999" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <IconPackage size={64} color="#ccc" />
            <h3>Nenhum produto encontrado</h3>
            <p>
              {searchQuery
                ? 'Tente ajustar sua busca'
                : 'Comece adicionando seu primeiro produto!'}
            </p>
            {!searchQuery && (
              <button
                className={styles.addBtn}
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
              >
                <IconAdd size={20} color="white" />
                Adicionar Produto
              </button>
            )}
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Destaque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productCell}>
                      <img
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        className={styles.productImage}
                      />
                      <div className={styles.productInfo}>
                        <h4>{product.name}</h4>
                        {product.subcategory && (
                          <span 
                            className={styles.subcategoryBadge}
                            style={{
                              backgroundColor: getSubcategoryColor(product.subcategory).bg,
                              color: getSubcategoryColor(product.subcategory).text,
                            }}
                          >
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>{product.category}</span>
                  </td>
                  <td>
                    <span className={styles.price}>
                      R$ {Number(product.price || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={product.is_featured || false}
                        onChange={() => handleToggleFeatured(product)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        title="Editar"
                      >
                        <IconEdit size={20} className={styles.icon} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => setDeleteProduct(product)}
                        title="Excluir"
                      >
                        <IconDelete size={20} className={styles.icon} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isProductModalOpen && (
          <ProductModal
            isOpen={isProductModalOpen}
            product={editingProduct}
            onClose={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteProduct && (
          <ConfirmDeleteModal
            isOpen={!!deleteProduct}
            productName={deleteProduct.name}
            onClose={() => setDeleteProduct(null)}
            onConfirm={handleDeleteProduct}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};
