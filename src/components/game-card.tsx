'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback, useRef, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  value?: string | number;
  suit?: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  color?: 'red' | 'black';
  faceDown?: boolean;
  glowColor?: string;
  holographic?: boolean;
  foil?: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-24',
  md: 'w-24 h-36',
  lg: 'w-32 h-48',
};

const suitColors = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900 dark:text-gray-100',
  spades: 'text-gray-900 dark:text-gray-100',
};

export const GameCard = forwardRef<HTMLDivElement, GameCardProps>(
  (
    {
      children,
      className,
      value,
      suit,
      color,
      faceDown = false,
      glowColor = '#8b5cf6',
      holographic = false,
      foil = false,
      onClick,
      selected = false,
      disabled = false,
      size = 'md',
    },
    ref
  ) => {
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const scale = useSpring(1, { stiffness: 300, damping: 30 });
    const glow = useSpring(0, { stiffness: 200, damping: 20 });

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        rotateX.set(((y - centerY) / centerY) * -10);
        rotateY.set(((x - centerX) / centerX) * 10);
        glow.set(25);
      },
      [disabled, rotateX, rotateY, glow]
    );

    const handleMouseEnter = useCallback(() => {
      if (disabled) return;
      scale.set(1.05);
      glow.set(35);
    }, [disabled, scale, glow]);

    const handleMouseLeave = useCallback(() => {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
      glow.set(0);
    }, [rotateX, rotateY, scale, glow]);

    const suitColor = suit ? suitColors[suit] : color === 'red' ? 'text-red-500' : 'text-gray-900 dark:text-gray-100';

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative cursor-pointer perspective-1000',
          sizeClasses[size],
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
        style={{
          rotateX,
          rotateY,
          scale,
          filter: useTransform(glow, (g) => `drop-shadow(0 0 ${g}px ${glowColor})`),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={disabled ? undefined : onClick}
        whileTap={disabled ? {} : { scale: 0.95 }}
      >
        <motion.div
          className={cn(
            'relative w-full h-full rounded-xl border-2 transition-all duration-300',
            selected
              ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
              : 'border-white/20 dark:border-white/10',
            holographic && 'overflow-hidden',
            !faceDown && 'bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900'
          )}
        >
          {holographic && (
            <div className="absolute inset-0 holographic-effect" />
          )}

          {foil && !faceDown && (
            <div className="absolute inset-0 foil-effect" />
          )}

          {faceDown ? (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[3px]">
              <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1 p-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-sm bg-purple-500/50"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full p-2 flex flex-col">
              {value && (
                <div className={cn('text-xl font-bold', suitColor)}>
                  {value}
                </div>
              )}

              {suit && (
                <div className="absolute top-2 right-2 text-2xl">
                  {suit === 'hearts' && '♥'}
                  {suit === 'diamonds' && '♦'}
                  {suit === 'clubs' && '♣'}
                  {suit === 'spades' && '♠'}
                </div>
              )}

              <div className="flex-1 flex items-center justify-center">
                {children}
              </div>
            </div>
          )}

          {selected && (
            <motion.div
              className="absolute inset-0 rounded-xl border-4 border-cyan-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>
      </motion.div>
    );
  }
);

GameCard.displayName = 'GameCard';

interface CardStackProps {
  cards: React.ReactNode[];
  maxVisible?: number;
  className?: string;
  spread?: number;
}

export function CardStack({
  cards,
  maxVisible = 5,
  className,
  spread = 8,
}: CardStackProps) {
  const visibleCards = cards.slice(0, maxVisible);
  const remaining = cards.length - maxVisible;

  return (
    <div className={cn('relative', className)}>
      {visibleCards.map((card, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={{
            x: index * spread,
            y: -index * 2,
            rotate: index * 2 - (visibleCards.length - 1),
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {card}
        </motion.div>
      ))}

      {remaining > 0 && (
        <motion.div
          className="absolute left-0 top-0 flex items-center justify-center bg-gray-800 dark:bg-gray-200 rounded-xl text-white dark:text-gray-800 font-bold"
          style={{
            width: 96,
            height: 144,
            x: visibleCards.length * spread,
            y: -visibleCards.length * 2,
            rotate: visibleCards.length * 2 - (visibleCards.length - 1),
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          +{remaining}
        </motion.div>
      )}
    </div>
  );
}

interface FlippableCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  delay?: number;
}

export function FlippableCard({
  front,
  back,
  isFlipped = false,
  onFlip,
  className,
  delay = 0,
}: FlippableCardProps) {
  return (
    <motion.div
      className={cn('cursor-pointer perspective-1000', className)}
      onClick={onFlip}
      initial={{ rotateY: 0 }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut', delay }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
        <div className={cn('absolute inset-0', !isFlipped ? 'block' : 'hidden')}>
          {front}
        </div>
      </div>
      <div className="relative w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
        <div
          className={cn('absolute inset-0', isFlipped ? 'block' : 'hidden')}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </div>
    </motion.div>
  );
}
