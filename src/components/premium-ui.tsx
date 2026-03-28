'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  gradient?: boolean;
  shimmer?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      gradient = false,
      shimmer = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      premium:
        'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:from-violet-500 hover:via-purple-500 hover:to-pink-500',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm rounded-lg',
      md: 'h-11 px-6 text-base rounded-xl',
      lg: 'h-14 px-8 text-lg rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          gradient && variant === 'premium' && 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600',
          glow && !disabled && 'shadow-lg shadow-primary/50',
          shimmer && !disabled && 'shimmer',
          className
        )}
        disabled={disabled}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {children}
        {glow && !disabled && (
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  glow = false,
  glowColor = '#8b5cf6',
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl glass-effect overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {glow && (
        <div
          className="absolute inset-0 blur-2xl opacity-30"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  animated?: boolean;
}

export function GlowBorder({
  children,
  className,
  color = '#8b5cf6',
  animated = true,
}: GlowBorderProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-[2px]',
        animated && 'card-glow',
        className
      )}
      style={{ color }}
    >
      <div className="absolute inset-0 rounded-2xl bg-current opacity-50 blur-md" />
      <div className="relative bg-background rounded-2xl">{children}</div>
    </div>
  );
}

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function PremiumBadge({
  children,
  variant = 'default',
  size = 'md',
}: PremiumBadgeProps) {
  const colors = {
    default: 'from-violet-500 to-purple-500',
    success: 'from-emerald-500 to-green-500',
    warning: 'from-amber-500 to-orange-500',
    error: 'from-red-500 to-rose-500',
    info: 'from-cyan-500 to-blue-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        'bg-gradient-to-r text-white shadow-lg',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colors[variant]
      )}
    >
      {children}
    </span>
  );
}

interface PlayerAvatarProps {
  name: string;
  avatar?: string;
  isActive?: boolean;
  isWinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatar({
  name,
  avatar,
  isActive = false,
  isWinner = false,
  size = 'md',
  className,
}: PlayerAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <motion.div
      className={cn('relative', className)}
      animate={isWinner ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5, repeat: isWinner ? Infinity : 0 }}
    >
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center font-bold overflow-hidden',
          'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
          'ring-2 ring-offset-2 ring-offset-background',
          isActive ? 'ring-cyan-400 scale-110' : 'ring-transparent',
          isWinner && 'ring-amber-400',
          sizes[size]
        )}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>

      {isWinner && (
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 360] }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <span className="text-xs">🏆</span>
        </motion.div>
      )}

      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-400 text-cyan-950 text-xs font-bold rounded-full">
          Your Turn
        </span>
      )}
    </motion.div>
  );
}

export { Button };
export type { ButtonProps };
