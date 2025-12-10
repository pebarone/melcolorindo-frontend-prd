import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsApi, favoritesApi } from '../services/api';
import type { Product } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { IconArrowLeft, IconHeart, IconWhatsapp, IconEdit } from '../components/Icons';
import styles from './ProductDetails.module.css';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);

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
      setIsLoginModalOpen(true);
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
          <Link to="/produtos" className={styles.backButton}>
            <IconArrowLeft size={20} />
            Ver todos os produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/produtos" className={styles.backLink}>
        <IconArrowLeft size={20} />
        Voltar para produtos
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
      {isFullScreenImage && (
        <div className={styles.fullScreenOverlay} onClick={() => setIsFullScreenImage(false)}>
          <button className={styles.closeButton} onClick={() => setIsFullScreenImage(false)}>
            ✕
          </button>
          <img
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            className={styles.fullScreenImage}
            onClick={(e) => e.stopPropagation()}
          />
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
