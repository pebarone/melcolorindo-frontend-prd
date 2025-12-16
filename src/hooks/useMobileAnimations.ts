import { useMemo } from 'react';
import { useIsMobile, usePrefersReducedMotion } from './useIsMobile';
import type { Transition, Variants } from 'motion/react';

/**
 * Configurações de animação otimizadas para mobile
 * Fornece presets de spring, transições e variantes GPU-accelerated
 */

// Spring presets otimizados
const MOBILE_SPRING: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 400,
  mass: 0.8,
};

const DESKTOP_SPRING: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

// Transição rápida para overlays
const OVERLAY_TRANSITION: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

// Transição para skeleton loaders
const SKELETON_TRANSITION: Transition = {
  duration: 1.2,
  repeat: Infinity,
  ease: 'linear',
};

export interface MobileAnimationConfig {
  /** Spring transition otimizada para o dispositivo */
  spring: Transition;
  /** Transição rápida para overlays/backdrops */
  overlayTransition: Transition;
  /** Transição para skeleton loaders */
  skeletonTransition: Transition;
  /** Se deve usar layout animations (falso em mobile) */
  shouldUseLayout: boolean;
  /** Se usuário prefere animações reduzidas */
  prefersReducedMotion: boolean;
  /** Se é dispositivo mobile */
  isMobile: boolean;
  /** Variantes de modal otimizadas */
  modalVariants: Variants;
  /** Variantes de overlay otimizadas */
  overlayVariants: Variants;
  /** Variantes de bottom sheet */
  bottomSheetVariants: Variants;
}

/**
 * Hook que fornece configurações de animação otimizadas para mobile
 * Usa apenas propriedades GPU-accelerated (transform, opacity)
 */
export function useMobileAnimations(): MobileAnimationConfig {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  return useMemo(() => {
    const spring = isMobile ? MOBILE_SPRING : DESKTOP_SPRING;
    
    // Variantes de modal (entrada por scale + opacity)
    const modalVariants: Variants = {
      hidden: { 
        scale: 0.95, 
        opacity: 0, 
        y: prefersReducedMotion ? 0 : 20 
      },
      visible: { 
        scale: 1, 
        opacity: 1, 
        y: 0 
      },
      exit: { 
        scale: 0.95, 
        opacity: 0, 
        y: prefersReducedMotion ? 0 : 20 
      },
    };

    // Variantes de overlay (fade simples)
    const overlayVariants: Variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };

    // Variantes de bottom sheet (slide de baixo)
    const bottomSheetVariants: Variants = {
      hidden: { y: '100%' },
      visible: { y: 0 },
      exit: { y: '100%' },
    };

    return {
      spring,
      overlayTransition: OVERLAY_TRANSITION,
      skeletonTransition: SKELETON_TRANSITION,
      shouldUseLayout: !isMobile, // Desativa layout animations em mobile
      prefersReducedMotion,
      isMobile,
      modalVariants,
      overlayVariants,
      bottomSheetVariants,
    };
  }, [isMobile, prefersReducedMotion]);
}

export default useMobileAnimations;
