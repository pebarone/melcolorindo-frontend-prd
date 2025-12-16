import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/Icons';
import styles from './Home.module.css';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';
import { getSubcategoryColor } from '../utils/subcategoryColors';
import { useMobileAnimations } from '../hooks/useMobileAnimations';

const MotionLink = motion.create(Link);

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(3); // Desktop: 3, Mobile: 1
  const [[page, direction], setPage] = useState([0, 0]); // [currentSlide, direction]
  
  // Helper para pre-carregar imagens
  const preloadImages = async (products: Product[]) => {
    const promises = products.map((product) => {
      return new Promise((resolve) => {
        if (!product.image_url) {
          resolve(true); 
          return;
        }
        const img = new Image();
        img.src = product.image_url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true); // Resolve mesmo com erro para não travar
      });
    });
    return Promise.all(promises);
  };

  // Atualizar slide com direção (para swipe)
  const paginate = (newDirection: number) => {
    const maxSlides = Math.ceil(featuredProducts.length / itemsPerSlide);
    const nextSlide = (page + newDirection + maxSlides) % maxSlides;
    setPage([nextSlide, newDirection]);
  };
  
  // Animações otimizadas para mobile
  const { skeletonTransition, prefersReducedMotion, isMobile } = useMobileAnimations();

  // Detectar tamanho da tela para responsividade com debounce
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      // Debounce de 150ms para evitar muitas recomputações
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
      }, 150);
    };
    
    // Verificar no mount (sem debounce)
    setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // Usar novo endpoint de produtos em destaque (máximo 6)
        const products = await productsApi.getFeatured();
        // Pré-carregar imagens antes de mostrar
        if (products.length > 0) {
          await preloadImages(products);
        }
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Auto-play do carrossel (opcional)
  useEffect(() => {
    if (featuredProducts.length <= itemsPerSlide) return; // Não precisa de carousel

    const interval = setInterval(() => {
        paginate(1);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [featuredProducts.length, itemsPerSlide, page]); // page depende de currentSlide

  const maxSlides = Math.ceil(featuredProducts.length / itemsPerSlide);

  const getCurrentProducts = () => {
    const start = page * itemsPerSlide;
    const end = start + itemsPerSlide;
    return featuredProducts.slice(start, end);
  };
  
  // Variantes para slide direcional
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={styles.title}
          >
        Colorindo<br />
            <span className={styles.gradientText}>Sonhos</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.subtitle}
          >
            Acessórios feitos à mão com muito amor e cor para alegrar o seu dia! 🌈
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <MotionLink 
              to="/produtos" 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05, backgroundColor: "#1982C4", boxShadow: "0 15px 30px rgba(25, 130, 196, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Coleção <IconArrowRight size={20} />
            </MotionLink>
          </motion.div>
        </div>

        <div className={styles.heroVisual}>
           <motion.div 
             className={styles.blob1}
             animate={prefersReducedMotion ? {} : { 
               x: [0, 30, -20, 0],
               y: [0, -30, 20, 0],
               rotate: [0, 10, -5, 0]
             }}
             transition={{ duration: isMobile ? 15 : 10, repeat: Infinity, ease: "linear" }}
           />
           <motion.div 
             className={styles.blob2}
             animate={prefersReducedMotion ? {} : { 
               x: [0, 30, -20, 0],
               y: [0, -30, 20, 0],
               rotate: [0, 10, -5, 0]
             }}
             transition={{ duration: isMobile ? 15 : 10, repeat: Infinity, ease: "linear", delay: 2 }}
           />
           <motion.div 
             className={styles.blob3}
             animate={prefersReducedMotion ? {} : { 
               x: [0, 30, -20, 0],
               y: [0, -30, 20, 0],
               rotate: [0, 10, -5, 0]
             }}
             transition={{ duration: isMobile ? 15 : 10, repeat: Infinity, ease: "linear", delay: 4 }}
           />
           <motion.img 
             src={"/produto3.jpg"} 
             alt="Acessórios Coloridos" 
             className={styles.heroImage}
             decoding="async"
             whileHover={{ scale: 1.02, rotate: 0 }}
             initial={{ rotate: -2 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
           />
        </div>
      </section>

      {/* Featured Section - Carrossel de Destaques */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <h2>Destaques da Semana</h2>
          <Link to="/produtos" className={styles.seeAll}>Ver tudo</Link>
        </div>
        
        {isLoading ? (
          // Loading skeleton
          <div className={styles.grid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.cardSkeleton}>
                <motion.div 
                  className={styles.skeletonImage}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={skeletonTransition}
                />
                <div className={styles.skeletonContent}>
                  <motion.div 
                    className={styles.skeletonTitle}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ ...skeletonTransition, delay: 0.1 }}
                  />
                  <motion.div 
                    className={styles.skeletonPrice}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ ...skeletonTransition, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.carouselContainer}>
            {/* Grid responsivo com produtos */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                className={styles.grid}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                drag={isMobile ? "x" : false} // Swipe apenas em mobile ou sempre
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  // Swipe left -> next
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } 
                  // Swipe right -> prev
                  else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
              >
                {getCurrentProducts().map((product) => (
                  <Link to={`/produto/${product.id}`} key={product.id} className={styles.cardLink}>
                    <motion.div 
                      whileHover="hover"
                      className={styles.card}
                      variants={{
                        hover: { y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }
                      }}
                      // No drag no card individual para não conflitar
                      drag={false} 
                    >
                      <div className={styles.cardImageWrapper}>
                        <motion.img 
                          src={product.image_url || '/placeholder.jpg'} 
                          alt={product.name} 
                          className={styles.cardImage}
                          // loading="lazy" -> Removido pois já fizemos preload
                          decoding="async"
                          variants={{
                            hover: { scale: 1.1 }
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className={styles.cardContent}>
                        <h3>{product.name}</h3>
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
                        <p className={styles.price}>R$ {Number(product.price || 0).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Indicadores de página */}
            {maxSlides > 1 && (
              <div className={styles.carouselIndicators}>
                {Array.from({ length: maxSlides }).map((_, index) => (
                  <motion.button
                    key={index}
                    className={`${styles.indicator} ${page === index ? styles.active : ''}`}
                    onClick={() => {
                        const newDirection = index > page ? 1 : -1;
                        setPage([index, newDirection]);
                    }}
                    aria-label={`Ir para slide ${index + 1}`}
                    whileHover={{ scale: 1.2, backgroundColor: "#aaa" }}
                    animate={{ 
                      width: page === index ? 30 : 12,
                      backgroundColor: page === index ? "#1982C4" : "#ddd"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum produto em destaque no momento.</p>
            <MotionLink 
              to="/produtos" 
              className={styles.ctaButton}
              whileHover={{ scale: 1.05, backgroundColor: "#1982C4" }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Coleção Completa
            </MotionLink>
          </div>
        )}
      </section>
    </div>
  );
};
