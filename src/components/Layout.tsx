import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';
import { useShouldReduceAnimations } from '../hooks/useIsMobile';

export const Layout = () => {
  const shouldReduceAnimations = useShouldReduceAnimations();

  // Simplified transitions for mobile/reduced motion - only opacity (GPU composited)
  // Full transitions for desktop with transform + opacity
  const pageTransition = shouldReduceAnimations
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
      };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <motion.div
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
          style={{
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};
