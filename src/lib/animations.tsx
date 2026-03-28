'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const smoothTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...smoothTransition, type: 'spring', stiffness: 200 },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...smoothTransition, type: 'spring', stiffness: 250 },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...smoothTransition, type: 'spring', stiffness: 250 },
  },
};

export const cardDeal: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotateY: 180 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const cardFlip: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

export const pulse: Variants = {
  initial: { scale: 1, boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.5)' },
  pulse: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(139, 92, 246, 0.5)',
      '0 0 20px 10px rgba(139, 92, 246, 0.3)',
      '0 0 0 0 rgba(139, 92, 246, 0.5)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
};

export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const bounce: Variants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: { duration: 0.6, type: 'spring' },
  },
};

export const victory: Variants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  victory: {
    scale: [0, 1.2, 1],
    rotate: [0, 360, 0],
    opacity: 1,
    transition: { duration: 0.8, type: 'spring', stiffness: 200 },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

interface AnimationContextType {
  shake: (ref: React.RefObject<HTMLElement | null>, intensity?: number) => void;
  celebrate: (ref: React.RefObject<HTMLElement | null>) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const shake = useCallback(
    (ref: React.RefObject<HTMLElement | null>, intensity = 10) => {
      if (!ref.current) return;
      ref.current.style.animation = 'none';
      ref.current.offsetHeight;
      ref.current.style.animation = `shake ${intensity * 0.1}s ease-in-out`;
    },
    []
  );

  const celebrate = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    if (!ref.current) return;
    ref.current.style.animation = 'celebrate 0.6s ease-out';
  }, []);

  return (
    <AnimationContext.Provider value={{ shake, celebrate }}>
      {children}
    </AnimationContext.Provider>
  );
}

export { AnimatePresence, motion };
export { springTransition, smoothTransition };
