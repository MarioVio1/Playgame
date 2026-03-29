'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Smartphone, Tv, Users } from 'lucide-react';

interface TVModeProps {
  roomCode: string;
  gameType: string;
  players: { id: string; name: string; isHost: boolean }[];
  gameState?: any;
  onExit: () => void;
  onGameStart?: (gameState: any) => void;
  onPlayersUpdate?: (players: { id: string; name: string; isHost: boolean }[]) => void;
}

export function TVMode({ roomCode, gameType, players: initialPlayers, gameState, onExit, onGameStart, onPlayersUpdate }: TVModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showJoinHint, setShowJoinHint] = useState(true);
  const [players, setPlayers] = useState(initialPlayers);
  const [currentGameState, setCurrentGameState] = useState(gameState);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowJoinHint(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Poll for room updates (players joining, game starting)
  useEffect(() => {
    const pollRoomStatus = async () => {
      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getRoomStatus', roomCode })
        });
        const data = await res.json();
        if (data.success) {
          setPlayers(data.players);
          onPlayersUpdate?.(data.players);
          
          // Check if game started
          if (data.isGameStarted && !currentGameState) {
            setCurrentGameState(data.gameState);
            onGameStart?.(data.gameState);
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollRoomStatus, 2000);
    pollRoomStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, [roomCode, currentGameState, onGameStart, onPlayersUpdate]);

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?join=${roomCode}`
    : '';

  const gameEmoji = {
    forza4: '🔴',
    giocodelloca: '🪿',
    briscola: '🃏',
    uno: '🎴',
    scopa: '🪙',
    indovinachi: '🔍',
    nomecitta: '📝',
   ama: '♛',
    mercanteinfiera: '🎪',
  }[gameType] || '🎮';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/50 via-slate-900/80 to-slate-900" />
        
        {/* Animated Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30"
            >
              <span className="text-3xl">{gameEmoji}</span>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Playgame TV
              </h1>
              <p className="text-purple-300 text-sm">Schermo Principale</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right"
            >
              <p className="text-purple-300 text-xs">Codice Stanza</p>
              <motion.p 
                key={roomCode}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-mono font-bold text-white tracking-widest"
              >
                {roomCode}
              </motion.p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExit}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              ← Esci
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Unisciti al Gioco!</h2>
              <p className="text-purple-300 mb-6">Scansiona il QR code o vai all'URL</p>

              {/* QR Code Placeholder */}
              <div className="bg-white p-4 rounded-2xl mx-auto w-64 h-64 flex items-center justify-center mb-4">
                <div className="grid grid-cols-5 gap-1">
                  {[...Array(25)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={`w-10 h-10 rounded-sm ${
                        Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
                <p className="text-purple-300 text-xs mb-1">URL per unirsi:</p>
                <p className="text-white font-mono text-sm break-all">{joinUrl}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-purple-300">
                <Smartphone className="w-5 h-5" />
                <span>Usa il tuo smartphone come controller!</span>
              </div>
            </div>
          </motion.div>

          {/* Players Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Giocatori Connessi</h2>
                <span className="ml-auto px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm font-medium">
                  {players.length} / 8
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/5 rounded-2xl p-4 text-center border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.5 + index * 0.1 }}
                      className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${
                        index === 0 ? 'from-red-500 to-orange-500' :
                        index === 1 ? 'from-blue-500 to-cyan-500' :
                        index === 2 ? 'from-green-500 to-emerald-500' :
                        'from-purple-500 to-pink-500'
                      } flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </motion.div>
                    <p className="text-white font-semibold truncate">{player.name}</p>
                    {player.isHost && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        👑 Host
                      </span>
                    )}
                  </motion.div>
                ))}

                {/* Empty Slots */}
                {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                  <motion.div
                    key={`empty-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="bg-white/5 rounded-2xl p-4 text-center border-2 border-dashed border-white/20"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center">
                      <span className="text-3xl text-white/30">?</span>
                    </div>
                    <p className="text-white/30">In attesa...</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Game Instructions */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tv className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Come Funziona</h3>
                  <ul className="text-purple-200 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Gli altri giocatori scansionano il QR code con il loro smartphone
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Questo schermo mostra il tabellone di gioco principale
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      Ogni giocatore usa il proprio telefono per le azioni
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Join Hint Animation */}
      <AnimatePresence>
        {showJoinHint && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/30"
            >
              <p className="text-white font-semibold text-center">
                📱 Aspetta gli altri giocatori! Condividi il codice: <span className="font-mono font-bold">{roomCode}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Display */}
      <div className="fixed bottom-4 right-4 text-purple-300/50 text-sm font-mono">
        {currentTime.toLocaleTimeString()}
      </div>
    </div>
  );
}
