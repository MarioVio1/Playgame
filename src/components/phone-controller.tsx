'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Hand, Check } from 'lucide-react';

interface PhoneControllerProps {
  roomCode: string;
  playerName: string;
  playerId: string;
  isHost: boolean;
  onConnected: () => void;
}

export function PhoneController({ roomCode, playerName, playerId, isHost, onConnected }: PhoneControllerProps) {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [myTurn, setMyTurn] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setConnected(true);
      onConnected();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Controller</h1>
              <p className="text-purple-300 text-xs">Stanza: {roomCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connected ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Connesso</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Connessione...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!connected ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-6"
              />
              <h2 className="text-xl font-bold text-white mb-2">Connessione alla stanza...</h2>
              <p className="text-purple-300">Stanza {roomCode}</p>
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center w-full max-w-sm"
            >
              {/* Player Card */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-white/20"
              >
                <motion.div
                  animate={myTurn ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: myTurn ? Infinity : 0 }}
                  className={`w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${
                    isHost ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-pink-500'
                  } flex items-center justify-center shadow-xl`}
                >
                  <span className="text-4xl font-bold text-white">
                    {playerName.charAt(0).toUpperCase()}
                  </span>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-1">{playerName}</h2>
                {isHost && (
                  <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    👑 Host
                  </span>
                )}
              </motion.div>

              {/* Status Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6">
                {myTurn ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <Hand className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">È il tuo turno!</h3>
                    <p className="text-purple-300 text-sm">Seleziona un'azione sullo schermo TV</p>
                  </motion.div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⏳</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">In attesa...</h3>
                    <p className="text-purple-300 text-sm">Aspetta il tuo turno</p>
                  </div>
                )}
              </div>

              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 text-purple-300 text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>Connesso alla stanza {roomCode}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 text-purple-400">
            <span className="text-2xl">🎮</span>
            <span className="text-xs">Gioca</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-purple-400/50">
            <span className="text-2xl">💬</span>
            <span className="text-xs">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-purple-400/50">
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">Impostazioni</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
