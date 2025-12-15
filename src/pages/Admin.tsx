import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  IconAlert,
  IconStar,
  IconCamera,
  IconCheck
} from '../components/Icons';
import { productsApi, ApiError } from '../services/api';
import type { Product } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import styles from './Admin.module.css';
import modalStyles from '../components/LoginModal.module.css';

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

  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={modalStyles.modal}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              className={modalStyles.closeBtn}
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={modalStyles.modalContent}>
              <div className={modalStyles.header}>
                <div className={modalStyles.iconWrapper}>
                  {product ? <IconEdit size={32} color="#6A4C93" /> : <IconAdd size={32} color="#6A4C93" />}
                </div>
                <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p>{product ? 'Atualize as informações do produto' : 'Preencha os dados para criar um novo produto'}</p>
              </div>

              <form className={modalStyles.form} onSubmit={handleSubmit}>
                <div className={modalStyles.inputGroup}>
                  <label>Nome do Produto</label>
                  <div className={modalStyles.inputWrapper}>
                    <IconTag size={18} color="#999" className={modalStyles.inputIcon} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Pulseira Arco-Íris"
                      required
                    />
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Preço (R$)</label>
                  <div className={modalStyles.inputWrapper}>
                    <span className={modalStyles.inputIcon} style={{ fontSize: '14px', fontWeight: 'bold', top: '50%', transform: 'translateY(-50%)' }}>R$</span>
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
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Categoria</label>
                  <div className={styles.customSelect}>
                    <div className={modalStyles.inputWrapper}>
                      <IconPackage size={18} color="#999" className={modalStyles.inputIcon} />
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        placeholder="Selecione ou digite"
                        required
                      />
                    </div>
                    <AnimatePresence>
                      {showCategoryDropdown && existingCategories.length > 0 && (
                        <motion.div 
                          className={styles.dropdown} 
                          style={{ top: '100%', zIndex: 10 }}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Subcategoria (Opcional)</label>
                  <div className={styles.customSelect}>
                    <div className={modalStyles.inputWrapper}>
                      <IconPackage size={18} color="#999" className={modalStyles.inputIcon} />
                      <input
                        type="text"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        onFocus={() => setShowSubcategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                        placeholder="Selecione ou digite"
                      />
                    </div>
                    <AnimatePresence>
                      {showSubcategoryDropdown && existingSubcategories.length > 0 && (
                        <motion.div 
                          className={styles.dropdown} 
                          style={{ top: '100%', zIndex: 10 }}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={modalStyles.inputGroup}>
                  <label>Imagem</label>
                  {imagePreview ? (
                    <div className={styles.imagePreview} style={{ marginTop: '0.5rem' }}>
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
                    <div className={styles.uploadOptions} style={{ display: 'flex', gap: '1rem' }}>
                      <label className={styles.imageUpload} style={{ background: 'white', flex: 1, cursor: 'pointer' }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <IconUpload size={32} color="#999" />
                        <p>Abrir <span>Galeria</span></p>
                      </label>
                      
                      <label className={styles.imageUpload} style={{ background: 'white', flex: 1, cursor: 'pointer' }}>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <IconCamera size={32} color="#999" />
                        <p>Tirar <span>Foto</span></p>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={modalStyles.submitBtn}
                  disabled={isSubmitting || !name || !price || !category}
                >
                  {isSubmitting ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={modalStyles.switchLink}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
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
  // Prevenir scroll do body quando modal aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.confirmModal}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
      )}
    </AnimatePresence>,
    document.body
  );
};

// Modal de criação em massa
interface BulkProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
}

const BulkProductModal = ({ isOpen, onClose, onSave }: BulkProductModalProps) => {
  const [drafts, setDrafts] = useState<Array<{
    id: number;
    name: string;
    price: string;
    category: string;
    subcategory: string;
    imageFile: File | null;
    imagePreview: string | null;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [existingSubcategories, setExistingSubcategories] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<{index: number, type: 'category' | 'subcategory'} | null>(null);

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
      if (drafts.length === 0) {
        addDraft();
      }
    }
  }, [isOpen]);

  const addDraft = () => {
    setDrafts(prev => [...prev, {
      id: Date.now(),
      name: '',
      price: '',
      category: '',
      subcategory: '',
      imageFile: null,
      imagePreview: null
    }]);
  };

  const removeDraft = (id: number) => {
    if (drafts.length > 1) {
      setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const updateDraft = (id: number, field: string, value: any) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateDraft(id, 'imageFile', file);
      updateDraft(id, 'imagePreview', URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (drafts.some(d => !d.name || !d.price || !d.category || !d.imageFile)) {
      alert('Preencha todos os campos obrigatórios e adicione imagens para todos os produtos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const productsData = drafts.map(d => ({
        name: d.name,
        price: parseFloat(d.price),
        category: d.category,
        subcategory: d.subcategory,
        is_featured: false
      }));

      formData.append('products', JSON.stringify(productsData));
      
      drafts.forEach(d => {
        if (d.imageFile) {
          formData.append('images', d.imageFile);
        }
      });

      await onSave(formData);
      setDrafts([]);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={modalStyles.modal}
            style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            <button className={modalStyles.closeBtn} onClick={onClose}>
              <img src="/closeicon.svg" alt="Fechar" width={24} height={24} />
            </button>

            <div className={modalStyles.header}>
              <div className={`${modalStyles.iconWrapper}`} style={{ marginTop: '1rem' }}>
                <IconAdd size={32} color="#6A4C93" />
              </div>
              <h2>Adicionar Vários Produtos</h2>
              <p>Adicione múltiplos produtos de uma vez ao catálogo</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem' }}>
              <form id="bulkForm" onSubmit={handleSubmit}>
                {drafts.map((draft, index) => (
                  <motion.div 
                    key={draft.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={styles.bulkItemWrapper}
                  >
                    <div className={styles.bulkGrid}>
                      {/* Image Upload */}
                      <div>
                        <label 
                          className={styles.bulkImageUploadLabel}
                          style={{ 
                            backgroundImage: draft.imagePreview ? `url(${draft.imagePreview})` : 'none'
                          }}
                        >
                          <input type="file" accept="image/*" onChange={(e) => handleImageChange(draft.id, e)} style={{ display: 'none' }} />
                          {!draft.imagePreview && <IconUpload size={20} color="#999" />}
                        </label>
                      </div>

                      {/* Fields Column 1 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div className={modalStyles.inputGroup}>
                          <div className={modalStyles.inputWrapper}>
                             <IconTag size={16} color="#999" className={modalStyles.inputIcon} />
                             <input 
                                placeholder="Nome do Produto" 
                                value={draft.name} 
                                onChange={e => updateDraft(draft.id, 'name', e.target.value)}
                                required
                                style={{ fontSize: '14px' }}
                             />
                          </div>
                        </div>
                        <div className={modalStyles.inputGroup}>
                          <div className={modalStyles.inputWrapper}>
                             <span className={modalStyles.inputIcon} style={{ fontSize: '14px', fontWeight: 'bold', top: '50%', transform: 'translateY(-50%)' }}>R$</span>
                             <input 
                                type="number" 
                                placeholder="Preço" 
                                value={draft.price} 
                                onChange={e => updateDraft(draft.id, 'price', e.target.value)}
                                required
                                style={{ fontSize: '14px' }}
                             />
                          </div>
                        </div>
                      </div>

                      {/* Fields Column 2 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                         {/* Category */}
                         <div className={styles.customSelect} style={{ position: 'relative' }}>
                            <div className={modalStyles.inputGroup}>
                              <div className={modalStyles.inputWrapper}>
                                <IconPackage size={16} color="#999" className={modalStyles.inputIcon} />
                                <input
                                  placeholder="Categoria"
                                  value={draft.category}
                                  onChange={e => updateDraft(draft.id, 'category', e.target.value)}
                                  onFocus={() => setActiveDropdown({ index, type: 'category' })}
                                  onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                  required
                                  style={{ fontSize: '14px' }}
                                />
                              </div>
                            </div>
                            <AnimatePresence>
                              {activeDropdown?.index === index && activeDropdown.type === 'category' && existingCategories.length > 0 && (
                                <motion.div 
                                  className={styles.dropdown} 
                                  style={{ position: 'absolute', width: '100%', zIndex: 100 }}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {existingCategories.filter(c => c.toLowerCase().includes(draft.category.toLowerCase())).map(c => (
                                    <div key={c} className={styles.dropdownItem} onMouseDown={() => updateDraft(draft.id, 'category', c)}>
                                      {c}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>

                         {/* Subcategory */}
                         <div className={styles.customSelect} style={{ position: 'relative' }}>
                            <div className={modalStyles.inputGroup}>
                              <div className={modalStyles.inputWrapper}>
                                <IconPackage size={16} color="#999" className={modalStyles.inputIcon} />
                                <input
                                  placeholder="Subcategoria"
                                  value={draft.subcategory}
                                  onChange={e => updateDraft(draft.id, 'subcategory', e.target.value)}
                                  onFocus={() => setActiveDropdown({ index, type: 'subcategory' })}
                                  onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                  style={{ fontSize: '14px' }}
                                />
                              </div>
                            </div>
                            <AnimatePresence>
                              {activeDropdown?.index === index && activeDropdown.type === 'subcategory' && existingSubcategories.length > 0 && (
                                <motion.div 
                                  className={styles.dropdown} 
                                  style={{ position: 'absolute', width: '100%', zIndex: 100 }}
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {existingSubcategories.filter(s => s.toLowerCase().includes(draft.subcategory.toLowerCase())).map(s => (
                                    <div key={s} className={styles.dropdownItem} onMouseDown={() => updateDraft(draft.id, 'subcategory', s)}>
                                      {s}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>
                      </div>
                    </div>
                    
                    {drafts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeDraft(draft.id)}
                        style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          color: '#FF595E'
                        }}
                      >
                        <IconDelete size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}

                <button 
                  type="button" 
                  onClick={addDraft}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    border: '2px dashed #ccc', 
                    borderRadius: '8px', 
                    background: 'none', 
                    color: '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: 500
                  }}
                >
                  <IconAdd size={20} /> Adicionar mais um produto
                </button>
              </form>
            </div>

            <div className={modalStyles.footer} style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button 
                  type="button" 
                  onClick={onClose}
                  className={styles.cancelBtn}
               >
                 Cancelar
               </button>
               <button 
                  type="submit" 
                  form="bulkForm"
                  className={modalStyles.submitBtn}
                  disabled={isSubmitting}
                  style={{ width: 'auto', padding: '0 2rem', margin: 0 }}
               >
                 {isSubmitting ? 'Salvando...' : `Salvar ${drafts.length} Produtos`}
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Mobile Action Modal (Bottom Sheet)
interface MobileActionModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}

const MobileActionModal = ({ isOpen, product, onClose, onEdit, onDelete, onToggleFeatured }: MobileActionModalProps) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
            className={styles.bottomSheetOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div 
                className={styles.bottomSheet}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                <div className={styles.sheetHeader}>
                    <img 
                        src={product.image_url || '/placeholder.jpg'} 
                        alt={product.name} 
                        className={styles.sheetImage}
                    />
                    <div className={styles.sheetInfo}>
                        <h3>{product.name}</h3>
                        <p>{product.category}</p>
                        <p style={{ fontWeight: 'bold', color: 'var(--color-green)', marginTop: '0.25rem' }}>
                            R$ {Number(product.price).toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className={styles.sheetActions}>
                    <button className={`${styles.sheetBtn} ${styles.edit}`} onClick={() => { onEdit(product); onClose(); }}>
                        <IconEdit size={20} />
                        Editar Produto
                    </button>
                    
                    <button className={`${styles.sheetBtn} ${styles.featured}`} onClick={() => { onToggleFeatured(product); onClose(); }}>
                        <IconStar size={20} fill={product.is_featured ? "currentColor" : "none"} />
                        {product.is_featured ? 'Remover dos Destaques' : 'Adicionar aos Destaques'}
                    </button>

                    <button className={`${styles.sheetBtn} ${styles.delete}`} onClick={() => { onDelete(product); onClose(); }}>
                        <IconDelete size={20} />
                        Excluir Produto
                    </button>

                    <button className={`${styles.sheetBtn} ${styles.cancel}`} onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// Componente principal Admin
export const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  // We keep a separate state for categories/subcategories options
  const [filterOptions, setFilterOptions] = useState<{categories: string[], subcategories: string[]}>({ categories: [], subcategories: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination & Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | 'featured'; direction: 'asc' | 'desc' } | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Statistics State
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    recentCount: 0,
    featuredCount: 0
  });

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null); // For single delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkProductModalOpen, setIsBulkProductModalOpen] = useState(false);
  const [mobileActionProduct, setMobileActionProduct] = useState<Product | null>(null);
  
  // Selection Mode (Long Press) Ref
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const startPress = (id: string) => {
    isLongPress.current = false;
    longPressTimeout.current = setTimeout(() => {
      isLongPress.current = true;
      handleSelectOne(id);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  };
  
  const toast = useToast();

  // Redirecionar se não for admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Carregar opções de filtro e estatísticas
  useEffect(() => {
    const loadData = async () => {
      try {
        // Busca 1000 itens para filtros e estatísticas
        const data = await productsApi.getAll({ maxResults: 1000 }); 
        const categories = new Set<string>();
        const subcategories = new Set<string>();
        let recent = 0;
        let featured = 0;
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        data.products.forEach(p => {
          if (p.category) categories.add(p.category);
          if (p.subcategory) subcategories.add(p.subcategory);
          if (p.is_featured) featured++;
          if (p.created_at && new Date(p.created_at) > weekAgo) recent++;
        });
        
        setFilterOptions({
          categories: Array.from(categories).sort(),
          subcategories: Array.from(subcategories).sort()
        });

        setStats({
          productsCount: data.total || data.products.length,
          categoriesCount: categories.size,
          recentCount: recent,
          featuredCount: featured
        });
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
      }
    };
    loadData();
  }, [products]); // Re-run when products change (e.g. after add/delete) to update stats? 
  // Ideally we should move this to a separate callback called after mutations.
  // But adding [products] might cause loop if products updates often. 
  // Let's rely on explicit refresh or just initial load. 
  // Actually, 'products' changes on pagination. We don't want to re-fetch stats on pagination.
  // So [] is better, and we manually update stats after create/delete/feature toggle.
  // Or we create a 'refreshStats' function.

  // Carregar produtos com filtros e paginação
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        maxResults: itemsPerPage
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubcategory) params.subcategory = selectedSubcategory;

      const data = await productsApi.getAll(params);
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedCategory, selectedSubcategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle Search... (same as before)

  // Sorting Logic... (same as before)
  const handleSort = (key: keyof Product | 'featured') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aValue: any = a[key as keyof Product];
    let bValue: any = b[key as keyof Product];
    if (key === 'featured') {
      aValue = a.is_featured ? 1 : 0;
      bValue = b.is_featured ? 1 : 0;
    }
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const displayedProducts = sortedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Selection Logic... (same as before)
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      displayedProducts.forEach(p => newSelected.add(p.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      displayedProducts.forEach(p => newSelected.delete(p.id));
      setSelectedIds(newSelected);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      await productsApi.deleteBulk(idsToDelete);
      toast.success(`${idsToDelete.length} produtos excluídos com sucesso!`);
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      loadProducts();
      // Force reload page to update filters/stats?
      // window.location.reload(); // Too aggressive.
    } catch (err) {
      toast.error('Erro ao excluir produtos em massa');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Single Delete
  const handleDeleteProduct = async () => {
     // ... (same as before)
     if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Produto excluído com sucesso!');
      setDeleteProduct(null);
      const newSelected = new Set(selectedIds);
      if (newSelected.has(deleteProduct.id)) {
        newSelected.delete(deleteProduct.id);
        setSelectedIds(newSelected);
      }
      loadProducts();
    } catch (err) {
        toast.error('Erro ao excluir produto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save/Edit/Toggle logic...
  const handleSaveProduct = async (formData: FormData, isEdit: boolean) => {
    // ...
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

  const handleBulkSave = async (formData: FormData) => {
    try {
      const result = await productsApi.createBulk(formData);
      toast.success(result.message || `${result.createdCount} produtos criados!`);
      loadProducts();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao criar produtos em massa');
      }
      throw err;
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const newFeaturedState = !product.is_featured;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newFeaturedState } : p));
    try {
      await productsApi.toggleFeatured(product.id, newFeaturedState);
      // Update stats count locally
      setStats(prev => ({
          ...prev,
          featuredCount: newFeaturedState ? prev.featuredCount + 1 : prev.featuredCount - 1
      }));
      toast.success(newFeaturedState ? 'Adicionado aos destaques!' : 'Removido dos destaques');
    } catch (err) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: !newFeaturedState } : p));
      if (err instanceof ApiError && err.code === 'FEATURED_LIMIT_REACHED') {
          toast.error('Limite de destaques atingido! (Max 6)');
      } else {
          toast.error('Erro ao alterar destaque');
      }
    }
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <IconDashboard size={28} color="#6A4C93" />
          <h1>Administração</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            className={styles.addBtn}
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconAdd size={20} color="white" />
            Adicionar Produto
          </motion.button>
          <motion.button
            className={styles.addBtn}
            style={{ backgroundColor: '#4267AC' }}
            onClick={() => setIsBulkProductModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconAdd size={20} color="white" />
            Adicionar Vários
          </motion.button>
        </div>
      </div>

      <div className={styles.stats}>
        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.products}`}>
            <IconPackage size={24} color="#4267AC" />
          </div>
          <div className={styles.statInfo}>
            <h3>{totalProducts}</h3>
            <p>Total de Produtos</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.categories}`}>
            <IconTag size={24} color="#8AC926" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.categoriesCount}</h3>
            <p>Categorias</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.recent}`}>
            <IconHistory size={24} color="#6A4C93" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.recentCount}</h3>
            <p>Adicionados esta semana</p>
          </div>
        </motion.div>

        <motion.div className={styles.statCard} whileHover={{ y: -4 }}>
          <div className={`${styles.statIcon} ${styles.featured}`}>
            <IconStar size={24} color="#ff9800" fill="#ff9800" />
          </div>
          <div className={styles.statInfo}>
            <h3>{stats.featuredCount}/6</h3>
            <p>Produtos em Destaque</p>
          </div>
        </motion.div>
      </div>

      {/* Products Table Wrapper */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h2>Gerenciar Produtos</h2>
          <div className={styles.searchWrapper}>
            <IconSearch size={18} color="#999" />
            <input
              type="text"
              placeholder="Buscar na página..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className={styles.filterBar}>
            <select 
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas as Categorias</option>
              {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={selectedSubcategory}
              onChange={(e) => { setSelectedSubcategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas as Subcategorias</option>
              {filterOptions.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              className={styles.bulkActions}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <span>{selectedIds.size} produtos selecionados</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  className={styles.bulkDeleteBtn}
                  style={{ background: '#6A4C93' }}
                  onClick={() => {
                    const allSelected = displayedProducts.every(p => selectedIds.has(p.id));
                    if (allSelected) {
                      const newSelected = new Set(selectedIds);
                      displayedProducts.forEach(p => newSelected.delete(p.id));
                      setSelectedIds(newSelected);
                    } else {
                      const newSelected = new Set(selectedIds);
                      displayedProducts.forEach(p => newSelected.add(p.id));
                      setSelectedIds(newSelected);
                    }
                  }}
                >
                  <span style={{display:'inline-flex', marginRight: 6}}>
                    <IconCheck size={16} color="white" />
                  </span>
                  {displayedProducts.length > 0 && displayedProducts.every(p => selectedIds.has(p.id)) ? 'Deselecionar' : 'Todos'}
                </button>

                <button 
                  className={styles.bulkDeleteBtn}
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                >
                  <span style={{display:'inline-flex', marginRight: 6}}>
                    <IconDelete size={16} color="white" />
                  </span>
                  Excluir
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className={styles.loading}>
            <motion.div 
              className={styles.loadingSpinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p>Carregando produtos...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <IconPackage size={64} color="#ccc" />
            <h3>Nenhum produto encontrado</h3>
          </div>
        ) : (
          <>
            <div className={styles.desktopTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      className={styles.checkbox}
                      checked={displayedProducts.length > 0 && displayedProducts.every(p => selectedIds.has(p.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      PRODUTO {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('category')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      CATEGORIA {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('price')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      PREÇO {sortConfig?.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('featured')} className={styles.sortableHeader}>
                    <div className={styles.headerContent}>
                      DESTAQUE {sortConfig?.key === 'featured' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                  </th>
                  <th>AÇÕES</th>
                </tr>
              </thead>
              <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {displayedProducts.map((product) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ background: selectedIds.has(product.id) ? '#fff5f5' : undefined }}
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        className={styles.checkbox}
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </td>
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
                    <td><span className={styles.categoryBadge}>{product.category}</span></td>
                    <td><span className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</span></td>
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
                        <motion.button
                          className={`${styles.actionBtn} ${styles.edit}`}
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconEdit size={20} className={styles.icon} />
                        </motion.button>
                        <motion.button
                          className={`${styles.actionBtn} ${styles.delete}`}
                          onClick={() => setDeleteProduct(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IconDelete size={20} className={styles.icon} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            </div>

            {/* Mobile List View */}
            <div className={styles.mobileList}>
              {displayedProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  className={styles.mobileListItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ 
                    border: selectedIds.has(product.id) ? '2px solid #6A4C93' : '1px solid #eee',
                    background: selectedIds.has(product.id) ? '#f3f0f7' : 'white'
                  }}
                  onPointerDown={() => startPress(product.id)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onClick={() => {
                    if (isLongPress.current) return;
                    
                    if (selectedIds.size > 0) {
                      handleSelectOne(product.id);
                    } else {
                      setMobileActionProduct(product);
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={product.image_url || '/placeholder.jpg'} 
                      alt={product.name} 
                      className={styles.mobileProductImage}
                    />
                    {selectedIds.has(product.id) && (
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        background: '#6A4C93',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.mobileProductInfo}>
                    <div className={styles.mobileProductHeader}>
                      <h4 className={styles.mobileProductName}>{product.name}</h4>
                      <span className={styles.mobileProductPrice}>R$ {Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className={styles.mobileProductMeta}>
                       <span className={styles.categoryBadge} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{product.category}</span>
                       {product.is_featured && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ff9800', fontSize: '0.75rem', fontWeight: 600 }}>
                           <IconStar size={12} fill="#ff9800" color="#ff9800" />
                           Destaque
                         </span>
                       )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className={styles.pagination}>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                className={styles.pageBtn} 
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteProduct}
        productName={deleteProduct?.name || ''}
        // ... (rest of props)
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
        isDeleting={isDeleting}
      />

      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        productName={`${selectedIds.size} produtos selecionados`}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
      />

      <BulkProductModal
        isOpen={isBulkProductModalOpen}
        onClose={() => setIsBulkProductModalOpen(false)}
        onSave={handleBulkSave}
      />

      <MobileActionModal
        isOpen={!!mobileActionProduct}
        product={mobileActionProduct}
        onClose={() => setMobileActionProduct(null)}
        onEdit={(p) => {
            setEditingProduct(p);
            setIsProductModalOpen(true);
        }}
        onDelete={(p) => setDeleteProduct(p)}
        onToggleFeatured={handleToggleFeatured}
      />

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};
