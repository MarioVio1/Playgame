'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Game {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  players: string;
  time: string;
  gradient: string;
  isNew?: boolean;
  isHot?: boolean;
}

const GAMES: Game[] = [
  { id: 'forza4', name: 'Forza 4', emoji: '🔴', subtitle: 'Connetti 4 in fila!', players: '2', time: '5-15 min', gradient: 'from-yellow-500 to-red-500', isHot: true },
  { id: 'giocodelloca', name: 'Gioco dell\'Oca', emoji: '🪿', subtitle: 'Il classico percorso', players: '2-6', time: '20-40 min', gradient: 'from-amber-400 to-orange-500', isNew: true },
  { id: 'briscola', name: 'Briscola', emoji: '🃏', subtitle: 'Carte trevisane', players: '2-4', time: '15-25 min', gradient: 'from-amber-600 to-yellow-600' },
  { id: 'uno', name: 'UNO', emoji: '🎴', subtitle: 'Il classico colorato', players: '2-8', time: '15-30 min', gradient: 'from-red-500 to-pink-500', isHot: true },
  { id: 'scopa', name: 'Scopa', emoji: '🪙', subtitle: 'Prendi tutte le carte', players: '2-4', time: '20-30 min', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'indovinachi', name: 'Indovina Chi', emoji: '🔍', subtitle: 'Indovina il personaggio', players: '2', time: '10-20 min', gradient: 'from-purple-500 to-violet-500' },
  { id: 'nomecitta', name: 'Nome Città', emoji: '📝', subtitle: 'Cose, Animali, Città', players: '2-8', time: '10-20 min', gradient: 'from-pink-500 to-rose-500' },
  { id: 'dama', name: 'Dama', emoji: '♛', subtitle: 'Il classico da tavolo', players: '2', time: '15-30 min', gradient: 'from-violet-500 to-purple-500' },
  { id: 'mercanteinfiera', name: 'Mercante in Fiera', emoji: '🎪', subtitle: 'Vinci il jackpot', players: '2-6', time: '20-40 min', gradient: 'from-orange-500 to-amber-500' },
];

interface PremiumHomeProps {
  onSelectGame: (gameId: string) => void;
}

export function PremiumHome({ onSelectGame }: PremiumHomeProps) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tutti', icon: '🎮' },
    { id: 'classic', label: 'Classici', icon: '🎲' },
    { id: 'cards', label: 'Carte', icon: '🃏' },
    { id: 'party', label: 'Party', icon: '🎉' },
  ];

  const filteredGames = GAMES.filter(game => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'cards') return ['briscola', 'scopa', 'uno', 'mercanteinfiera'].includes(game.id);
    if (selectedCategory === 'classic') return ['forza4', 'dama', 'giocodelloca'].includes(game.id);
    if (selectedCategory === 'party') return ['indovinachi', 'nomecitta'].includes(game.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600 rounded-full blur-3xl opacity-20"
          animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎮
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Playgame
              </h1>
              <p className="text-purple-300 text-sm">Party Games Platform</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            ⚙️ Impostazioni
          </motion.button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Scegli il tuo{' '}
            <span className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Gioco
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Gioca con amici o contro la CPU. Divertiti con i classici giochi da tavolo italiani!
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-5 py-2 rounded-full font-medium transition-all duration-300',
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              )}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Games Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredGame(game.id)}
                onHoverEnd={() => setHoveredGame(null)}
              >
                <motion.button
                  onClick={() => onSelectGame(game.id)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative w-full p-6 rounded-3xl overflow-hidden',
                    'bg-gradient-to-br shadow-xl',
                    `bg-gradient-to-br ${game.gradient}`,
                    hoveredGame === game.id && 'shadow-2xl'
                  )}
                >
                  {/* Glow Effect */}
                  {hoveredGame === game.id && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Badge */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {game.isNew && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                        NUOVO
                      </span>
                    )}
                    {game.isHot && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        🔥 HOT
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-left">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={hoveredGame === game.id ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {game.emoji}
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-white/80 mb-4">{game.subtitle}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span className="flex items-center gap-1">
                        <span>👥</span> {game.players}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⏱️</span> {game.time}
                      </span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <motion.div
                    className="absolute bottom-4 right-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: hoveredGame === game.id ? 1 : 0 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <span className="text-3xl">▶️</span>
                  </motion.div>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-purple-300 text-sm">
        <p>© 2024 Playgame • Divertiti con gli amici! 🎉</p>
      </footer>
    </div>
  );
}
