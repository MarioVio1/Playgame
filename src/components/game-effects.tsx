'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { useParticles, ParticleCanvas } from '@/lib/game-effects';

interface GameEffectsContextType {
  celebrateWin: (x: number, y: number) => void;
  shake: () => void;
  flash: (color?: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const GameEffectsContext = createContext<GameEffectsContextType | null>(null);

export function useGameEffects() {
  const context = useContext(GameEffectsContext);
  if (!context) {
    throw new Error('useGameEffects must be used within GameEffectsProvider');
  }
  return context;
}

export function GameEffectsProvider({ children }: { children: ReactNode }) {
  const { particles, emit } = useParticles();
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState('#8b5cf6');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const celebrateWin = useCallback(
    (x: number, y: number) => {
      emit(x, y, 50, [
        '#fbbf24',
        '#f59e0b',
        '#d97706',
        '#fcd34d',
        '#fef3c7',
      ]);
      emit(x, y, 30, ['#8b5cf6', '#a855f7', '#c084fc']);
    },
    [emit]
  );

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const flash = useCallback((color = '#8b5cf6') => {
    setFlashColor(color);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 200);
  }, []);

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  return (
    <GameEffectsContext.Provider
      value={{ celebrateWin, shake, flash, showNotification }}
    >
      {children}

      <ParticleCanvas particles={particles} />

      <AnimatePresence>
        {shaking && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            animate={{
              x: [0, -10, 10, -10, 10, 0],
              y: [0, -5, 5, -5, 5, 0],
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flashing && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: flashColor }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl font-bold"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              backgroundColor:
                notification.type === 'success'
                  ? '#10b981'
                  : notification.type === 'error'
                  ? '#ef4444'
                  : '#8b5cf6',
            }}
          >
            <p className="text-white">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </GameEffectsContext.Provider>
  );
}

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  onComplete?: () => void;
  className?: string;
}

export function AnimatedTimer({
  seconds,
  totalSeconds,
  className,
}: TimerProps) {
  const progress = seconds / totalSeconds;
  const circumference = 2 * Math.PI * 45;

  const color =
    progress > 0.5
      ? '#10b981'
      : progress > 0.25
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className={className}>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-700 dark:text-gray-300"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.5, ease: 'linear' }}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          key={seconds}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-3xl font-bold" style={{ color }}>
            {seconds}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

export function Confetti({ active, onComplete }: ConfettiProps) {
  const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];
  const confetti = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  }));

  useEffect(() => {
    if (active && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute w-3 h-3"
          style={{ left: `${c.x}%`, top: -20 }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: '120vh',
            rotate: c.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            ease: 'linear',
          }}
        >
          <div
            className="w-full h-full rounded-sm"
            style={{
              backgroundColor: c.color,
              boxShadow: `0 0 6px ${c.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface ScorePopupProps {
  points: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function ScorePopup({ points, x, y, onComplete }: ScorePopupProps) {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0, y: 0 }}
      animate={{
        scale: [0, 1.5, 1],
        opacity: [0, 1, 1],
        y: -100,
      }}
      exit={{ opacity: 0, y: -150 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
        <span className="text-2xl font-bold text-white">+{points}</span>
      </div>
    </motion.div>
  );
}

interface DramaticRevealProps {
  children: React.ReactNode;
  isRevealing: boolean;
  className?: string;
}

export function DramaticReveal({
  children,
  isRevealing,
  className,
}: DramaticRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
      animate={
        isRevealing
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 0.5, filter: 'blur(20px)' }
      }
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
