import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { productsApi, favoritesApi } from '../services/api';
import type { Product } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { IconArrowLeft, IconHeart, IconWhatsapp, IconEdit } from '../components/Icons';
import styles from './ProductDetails.module.css';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const backPath = location.state?.from === '/favoritos' ? '/favoritos' : '/produtos';
  const backText = location.state?.from === '/favoritos' ? 'Voltar para favoritos' : 'Voltar para produtos';
  const { isAuthenticated, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);

  useEffect(() => {
    if (isFullScreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreenImage]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        const data = await productsApi.getById(id);
        setProduct(data);

        // Verificar se é favorito (se autenticado)
        if (isAuthenticated) {
          try {
            const { isFavorite: fav } = await favoritesApi.check(id);
            setIsFavorite(fav);
          } catch {
            // Ignora erro de favoritos
          }
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!id) return;

    // Se não está autenticado, abre o modal de login
    if (!isAuthenticated) {
      // Dispara evento customizado para abrir modal da Navbar
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(id);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const generateWhatsAppLink = () => {
    if (!product) return '#';
    const phone = '5511972969552';
    const baseUrl = import.meta.env.VITE_URL_PREFIX || window.location.origin;
    const productLink = `${baseUrl}/produto/${product.id}`;

    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name} - R$ ${Number(product.price).toFixed(2)}\n${productLink}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Produto não encontrado</h2>
          <p>O produto que você procura não existe ou foi removido.</p>
          <Link to={backPath} className={styles.backButton}>
            <IconArrowLeft size={20} />
            {backText === 'Voltar para favoritos' ? 'Voltar para favoritos' : 'Ver todos os produtos'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to={backPath} className={styles.backLink}>
        <IconArrowLeft size={20} />
        {backText}
      </Link>

      <motion.div
        className={styles.grid}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Imagem do Produto */}
        <motion.div
          className={styles.imageWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => setIsFullScreenImage(true)}
          style={{ cursor: 'pointer' }}
          title="Clique para ver em tela cheia"
        >
          <img
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
          />
        </motion.div>

        {/* Informações do Produto */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h1>{product.name}</h1>
          <p className={styles.price}>R$ {Number(product.price).toFixed(2)}</p>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          <div className={styles.actions}>
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.buyButton}
            >
              <IconWhatsapp size={24} />
              Comprar via WhatsApp
            </a>

            <button
              className={`${styles.wishlistButton} ${isFavorite ? styles.active : ''}`}
              onClick={handleFavoriteToggle}
              disabled={isFavoriteLoading}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              title={!isAuthenticated ? 'Faça login para favoritar' : ''}
            >
              <IconHeart
                size={24}
                fill={isFavorite ? 'currentColor' : 'none'}
                className={isFavoriteLoading ? styles.spinIcon : ''}
              />
            </button>

            {isAdmin && (
              <Link to="/admin" className={styles.adminButton}>
                <IconEdit size={20} />
                Editar
              </Link>
            )}
          </div>

          <div className={styles.features}>
            <div className={styles.featureItem}>Feito à mão</div>
            <div className={styles.featureItem}>Cores vibrantes</div>
            <div className={styles.featureItem}>Peça única</div>
            <div className={styles.featureItem}>Envio rápido</div>
          </div>
        </div>
      </motion.div>

      {/* Modal de imagem em tela cheia */}
      {createPortal(
        <AnimatePresence>
          {isFullScreenImage && (
            <motion.div
              className={styles.fullScreenOverlay}
              onClick={() => setIsFullScreenImage(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button className={styles.closeButton} onClick={() => setIsFullScreenImage(false)}>
                ✕
              </button>
              <motion.img
                src={product.image_url || '/placeholder.jpg'}
                alt={product.name}
                className={styles.fullScreenImage}
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
