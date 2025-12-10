import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '../components/Icons';
import styles from './Home.module.css';
import { productsApi } from '../services/api';
import type { Product } from '../services/api';
import { getSubcategoryColor } from '../utils/subcategoryColors';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3); // Desktop: 3, Mobile: 1

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
      setCurrentSlide((prev) => {
        const maxSlides = Math.ceil(featuredProducts.length / itemsPerSlide);
        return (prev + 1) % maxSlides;
      });
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [featuredProducts.length, itemsPerSlide, currentSlide]);

  const maxSlides = Math.ceil(featuredProducts.length / itemsPerSlide);

  const getCurrentProducts = () => {
    const start = currentSlide * itemsPerSlide;
    const end = start + itemsPerSlide;
    return featuredProducts.slice(start, end);
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
            <Link to="/produtos" className={styles.ctaButton}>
              Ver Coleção <IconArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <div className={styles.heroVisual}>
           <div className={styles.blob1}></div>
           <div className={styles.blob2}></div>
           <div className={styles.blob3}></div>
           <img 
             src={"/produto3.jpg"} 
             alt="Acessórios Coloridos" 
             className={styles.heroImage}
             decoding="async"
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
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className={styles.carouselContainer}>
            {/* Grid responsivo com produtos */}
            <div className={styles.grid}>
              <AnimatePresence mode="wait">
                {getCurrentProducts().map((product) => (
                  <Link to={`/produto/${product.id}`} key={product.id} className={styles.cardLink}>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={styles.card}
                    >
                      <div className={styles.cardImageWrapper}>
                        <img 
                          src={product.image_url || '/placeholder.jpg'} 
                          alt={product.name} 
                          className={styles.cardImage}
                          loading="lazy"
                          decoding="async"
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
              </AnimatePresence>
            </div>

            {/* Indicadores de página */}
            {maxSlides > 1 && (
              <div className={styles.carouselIndicators}>
                {Array.from({ length: maxSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum produto em destaque no momento.</p>
            <Link to="/produtos" className={styles.ctaButton}>Ver Coleção Completa</Link>
          </div>
        )}
      </section>
    </div>
  );
};
