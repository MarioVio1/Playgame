'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UNOCardProps {
  value: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'black';
  type?: 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
}

const colorGradients = {
  red: 'from-red-500 to-red-700',
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  yellow: 'from-yellow-500 to-yellow-700',
  black: 'from-slate-800 to-slate-900',
};

const colorIcons = {
  red: '❤️',
  blue: '💙',
  green: '💚',
  yellow: '💛',
  black: '🃏',
};

const typeIcons: Record<string, string> = {
  skip: '🚫',
  reverse: '🔄',
  draw2: '+2',
  wild: '🎨',
  wild4: '+4',
};

const sizeClasses = {
  sm: 'w-12 h-16 text-xs',
  md: 'w-16 h-24 text-sm',
  lg: 'w-20 h-32 text-base',
};

export function UNOCard({
  value,
  color,
  type,
  onClick,
  disabled = false,
  selected = false,
  size = 'md',
  faceDown = false,
}: UNOCardProps) {
  const isSpecial = type && ['skip', 'reverse', 'draw2', 'wild', 'wild4'].includes(type);
  const displayValue = type ? typeIcons[type] || value : value;

  if (faceDown) {
    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
        className={cn(
          'rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        <div className="grid grid-cols-3 gap-0.5 p-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-red-500 rounded-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.08, y: -8 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-xl flex items-center justify-center font-bold transition-all',
        'bg-gradient-to-br shadow-xl',
        colorGradients[color],
        sizeClasses[size],
        selected && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-black',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer hover:shadow-2xl'
      )}
      style={{
        boxShadow: selected
          ? '0 0 20px rgba(250, 204, 21, 0.5)'
          : `0 4px 20px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Card Border Glow */}
      <div className="absolute inset-1 rounded-lg border-2 border-white/20" />

      {/* Card Content */}
      <div className="flex flex-col items-center justify-center">
        {/* Top-left corner */}
        <div className="absolute top-1 left-1 flex flex-col items-center">
          <span className={cn(
            'font-black',
            size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-xs' : 'text-sm'
          )}>
            {displayValue}
          </span>
          <span className="text-[6px]">{colorIcons[color]}</span>
        </div>

        {/* Center */}
        <span className={cn(
          'font-black text-white',
          'drop-shadow-lg',
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'
        )}>
          {displayValue}
        </span>

        {/* Bottom-right corner (inverted) */}
        <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
          <span className={cn(
            'font-black',
            size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-xs' : 'text-sm'
          )}>
            {displayValue}
          </span>
          <span className="text-[6px]">{colorIcons[color]}</span>
        </div>
      </div>

      {/* Holographic Shine Effect */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(125deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 2s ease-in-out infinite',
            }}
          />
        </motion.div>
      )}
    </motion.button>
  );
}

interface UNODeckProps {
  remaining: number;
  onDraw?: () => void;
  disabled?: boolean;
}

export function UNODeck({ remaining, onDraw, disabled }: UNODeckProps) {
  return (
    <div className="relative">
      {/* Stacked cards effect */}
      <div className="relative w-16 h-24">
        {[2, 1, 0].map((offset) => (
          <motion.div
            key={offset}
            className="absolute w-16 h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600"
            style={{
              transform: `translateY(${offset * -2}px) translateX(${offset * 2}px)`,
              zIndex: offset,
            }}
            whileHover={!disabled ? { scale: 1.05 } : {}}
          />
        ))}
        
        {/* Top card with interaction */}
        <motion.button
          whileHover={!disabled ? { scale: 1.1, rotate: -5 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={onDraw}
          disabled={disabled}
          className="absolute inset-0 w-16 h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-all"
        >
          <span className="text-3xl">🃏</span>
          <span className="text-white text-xs font-bold mt-1">UNO</span>
        </motion.button>
      </div>

      {/* Card count badge */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <span className="text-white text-xs font-bold">{remaining}</span>
      </div>
    </div>
  );
}

interface DiscardPileProps {
  topCard?: { value: string; color: string };
  currentColor?: string;
}

export function DiscardPile({ topCard, currentColor }: DiscardPileProps) {
  const color = (currentColor || topCard?.color || 'black') as keyof typeof colorGradients;

  return (
    <motion.div
      initial={{ scale: 0.8, rotate: Math.random() * 20 - 10 }}
      animate={{ scale: 1, rotate: 0 }}
      className={cn(
        'w-20 h-28 rounded-xl flex items-center justify-center shadow-2xl',
        'bg-gradient-to-br border-2 border-white/30',
        colorGradients[color]
      )}
    >
      <div className="flex flex-col items-center">
        <span className="text-3xl font-black text-white drop-shadow-lg">
          {topCard?.value || '?'}
        </span>
        <span className="text-xl">{colorIcons[color]}</span>
      </div>
    </motion.div>
  );
}
