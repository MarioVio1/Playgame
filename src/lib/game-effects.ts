'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useSpring as useNativeSpring } from 'framer-motion';

export function useScreenShake(intensity = 10) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const shake = useCallback(() => {
    const duration = 500;
    const startTime = Date.now();

    const doShake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const decay = 1 - elapsed / duration;
        x.set((Math.random() - 0.5) * intensity * decay);
        y.set((Math.random() - 0.5) * intensity * decay);
        requestAnimationFrame(doShake);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    requestAnimationFrame(doShake);
  }, [intensity, x, y]);

  return { x: springX, y: springY, shake };
}

export function useCountdown(
  initialSeconds: number,
  onComplete?: () => void
) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, seconds, onComplete]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const progress = useTransform(
    useMotionValue(seconds),
    [initialSeconds, 0],
    [1, 0]
  );

  return { seconds, isRunning, start, pause, reset, progress };
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  const emit = useCallback(
    (
      x: number,
      y: number,
      count = 20,
      colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981']
    ) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const velocity = 5 + Math.random() * 10;
        newParticles.push({
          id: idRef.current++,
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    },
    []
  );

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.5,
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  return { particles, emit };
}

export function ParticleCanvas({
  particles,
  className = '',
}: {
  particles: Particle[];
  className?: string;
}) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-50 ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{ scale: p.life }}
        />
      ))}
    </div>
  );
}

export function useCardHover() {
  const rotateX = useNativeSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useNativeSpring(0, { stiffness: 300, damping: 30 });
  const scale = useNativeSpring(1, { stiffness: 300, damping: 30 });
  const glow = useSpring(0, { stiffness: 200, damping: 20 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateXValue = ((y - centerY) / centerY) * -15;
      const rotateYValue = ((x - centerX) / centerX) * 15;

      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
      glow.set(20);
    },
    [rotateX, rotateY, glow]
  );

  const onMouseEnter = useCallback(() => {
    scale.set(1.05);
    glow.set(30);
  }, [scale, glow]);

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    glow.set(0);
  }, [rotateX, rotateY, scale, glow]);

  return {
    rotateX,
    rotateY,
    scale,
    glow,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
  };
}

export function useTypewriter(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}
