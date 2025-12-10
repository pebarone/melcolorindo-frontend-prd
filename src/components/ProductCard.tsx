import { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconHeart, IconWhatsapp } from './Icons';
import type { Product } from '../services/api';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import { usePrefersReducedMotion } from '../hooks/useIsMobile';
import styles from '../pages/Products.module.css';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onFavoriteToggle: (productId: string, event: React.MouseEvent) => void;
}

/**
 * Card de produto otimizado com React.memo
 * Previne re-renders desnecessários para melhor performance
 * Animações otimizadas para 60fps+ em mobile usando apenas CSS transforms
 */
export const ProductCard = memo(({ product, isFavorite, onFavoriteToggle }: ProductCardProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const handleFavoriteClick = useCallback((event: React.MouseEvent) => {
    onFavoriteToggle(product.id, event);
  }, [product.id, onFavoriteToggle]);

  const generateWhatsAppLink = useCallback(() => {
    const phone = '5511972969552';
    const baseUrl = import.meta.env.VITE_URL_PREFIX || window.location.origin;
    const productLink = `${baseUrl}/produto/${product.id}`;
    
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${product.name} - R$ ${Number(product.price).toFixed(2)}\n${productLink}`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }, [product]);

  // Memo para evitar recálculo das cores da subcategoria
  const subcategoryColors = useMemo(() => {
    if (!product.subcategory) return null;
    return getSubcategoryColor(product.subcategory);
  }, [product.subcategory]);

  // Animações otimizadas para performance
  // Usa apenas propriedades GPU-accelerated (transform, opacity)
  const motionProps = useMemo(() => ({
    initial: prefersReducedMotion ? false : { opacity: 0 },
    animate: { opacity: 1 },
    exit: prefersReducedMotion ? undefined : { opacity: 0 },
    whileHover: prefersReducedMotion ? undefined : { y: -5 },
    transition: { 
      opacity: { duration: 0.2 },
      y: { type: "tween" as const, duration: 0.15 } // Tween é mais leve que spring
    }
  }), [prefersReducedMotion]);

  return (
    <div className={styles.cardWrapper}>
      <Link to={`/produto/${product.id}`} className={styles.cardLink}>
        <motion.div
          {...motionProps}
          className={styles.card}
        >
          {/* Badge de destaque */}
          {product.is_featured && (
            <div className={styles.featuredBadge}>⭐ Destaque</div>
          )}
          
          <div className={styles.cardImageWrapper}>
            <img 
              src={product.image_url || '/placeholder.jpg'} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
            />
          </div>
          
          <div className={styles.cardInfo}>
            <span className={styles.categoryTag}>{product.category}</span>
            {subcategoryColors && (
              <span 
                className={styles.subcategoryTag}
                style={{
                  backgroundColor: subcategoryColors.bg,
                  color: subcategoryColors.text,
                }}
              >
                {product.subcategory}
              </span>
            )}
            <h3>{product.name}</h3>
            <div className={styles.cardFooter}>
              <span className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</span>
              <span className={styles.viewBtn}>Ver Detalhes</span>
            </div>
          </div>
          
          {/* Botões de ação no footer */}
          <div className={styles.cardActions}>
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              title="Comprar via WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <IconWhatsapp size={24} />
            </a>

            <button
              className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <IconHeart
                size={24}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.image_url === nextProps.product.image_url &&
    prevProps.product.is_featured === nextProps.product.is_featured
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
