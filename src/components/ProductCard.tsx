import { memo, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { IconHeart, IconWhatsapp } from './Icons';
import type { Product } from '../services/api';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import { usePrefersReducedMotion } from '../hooks/useIsMobile';
import { useMobileAnimations } from '../hooks/useMobileAnimations';
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
  const { shouldUseLayout } = useMobileAnimations();
  const navigate = useNavigate();
  
  const handleCardClick = useCallback(() => {
    navigate(`/produto/${product.id}`);
  }, [navigate, product.id]);
  
  const handleFavoriteClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
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
  // Desativa layout animations em mobile para evitar reflows pesados
  const motionProps = useMemo(() => ({
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 },
    whileHover: prefersReducedMotion ? undefined : { y: -8, transition: { duration: 0.2 } },
    whileTap: prefersReducedMotion ? undefined : { scale: 0.98 },
    layout: shouldUseLayout, // Desativado em mobile
    transition: { 
      layout: { duration: 0.3 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  }), [prefersReducedMotion, shouldUseLayout]);

  const imageVariants = {
    hover: { scale: 1.1, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div 
      layout
      className={styles.cardWrapper}
      initial={motionProps.initial}
      animate={motionProps.animate}
      exit={motionProps.exit}
    >
      <motion.div
        className={styles.card}
        onClick={handleCardClick}
        whileHover={prefersReducedMotion ? undefined : "hover"}
        animate={prefersReducedMotion ? undefined : "rest"}
        whileTap={motionProps.whileTap}
        variants={{
          rest: { y: 0, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" },
          hover: { y: -8, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" }
        }}
        style={{ cursor: 'pointer' }}
      >
          {/* Badge de destaque */}
          {product.is_featured && (
            <div className={styles.featuredBadge}>⭐ Destaque</div>
          )}
          
          <div className={styles.cardImageWrapper}>
            <motion.img 
              src={product.image_url || '/placeholder.jpg'} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              variants={prefersReducedMotion ? undefined : imageVariants}
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
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.image_url === nextProps.product.image_url &&
    prevProps.product.is_featured === nextProps.product.is_featured &&
    prevProps.onFavoriteToggle === nextProps.onFavoriteToggle
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
