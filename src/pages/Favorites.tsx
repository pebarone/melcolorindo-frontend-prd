import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { favoritesApi, type Product } from '../services/api';
import { IconHeart, IconHeartFilled, IconAlertCircle } from '../components/Icons';
import styles from './Favorites.module.css';
import { getSubcategoryColor } from '../utils/subcategoryColors';

export const Favorites = () => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await favoritesApi.getAll();
      setFavorites(data);
    } catch (err) {
      setError('Erro ao carregar favoritos. Tente novamente.');
      console.error('Erro ao carregar favoritos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === productId);
      
      if (isFavorite) {
        await favoritesApi.remove(productId);
        setFavorites(prev => prev.filter(fav => fav.id !== productId));
      } else {
        await favoritesApi.add(productId);
        // Não adiciona aqui pois não temos os dados completos do produto
        // O usuário precisaria voltar para recarregar
        loadFavorites();
      }
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <IconAlertCircle size={48} color="#c62828" />
          <p>{error}</p>
          <button onClick={loadFavorites} className={styles.retryBtn}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <IconHeartFilled size={32} color="#c62828" />
          Meus Favoritos
        </h1>
        <p>
          {favorites.length === 0
            ? 'Você ainda não tem produtos favoritos'
            : `${favorites.length} ${favorites.length === 1 ? 'produto favorito' : 'produtos favoritos'}`}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <IconHeart size={64} color="#ccc" />
          <h2>Nenhum favorito ainda</h2>
          <p>Explore nossos produtos e adicione seus favoritos clicando no coração ❤️</p>
          <Link to="/produto" className={styles.exploreBtn}>
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <motion.div
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {favorites.map((product) => (
            <motion.div
              key={product.id}
              className={styles.card}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link to={`/produto/${product.id}`} className={styles.imageWrapper}>
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className={styles.image}
                  loading="lazy"
                />
                {product.is_featured && (
                  <span className={styles.featuredBadge}>⭐ Destaque</span>
                )}
              </Link>

              <div className={styles.content}>
                <Link to={`/produto/${product.id}`}>
                  <h3 className={styles.name}>{product.name}</h3>
                </Link>
                
                {product.description && (
                  <p className={styles.description}>
                    {product.description.length > 80
                      ? `${product.description.substring(0, 80)}...`
                      : product.description}
                  </p>
                )}

                <div className={styles.meta}>
                  <span className={styles.category}>{product.category}</span>
                  {product.subcategory && (
                    <span 
                      className={styles.subcategory}
                      style={{
                        backgroundColor: getSubcategoryColor(product.subcategory).bg,
                        color: getSubcategoryColor(product.subcategory).text,
                      }}
                    >
                      {product.subcategory}
                    </span>
                  )}
                </div>

                <div className={styles.footer}>
                  <Link to={`/products/${product.id}`} className={styles.detailsBtn}>
                    Ver Detalhes
                  </Link>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={styles.favoriteBtn}
                    aria-label="Remover dos favoritos"
                  >
                    <IconHeartFilled size={24} color="#c62828" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
