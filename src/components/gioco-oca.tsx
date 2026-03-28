'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  position: number;
  color: string;
  isCpu: boolean;
}

interface GooseCell {
  number: number;
  type: 'normal' | 'goose' | 'bridge' | 'death' | 'star' | 'prison' | 'inn' | 'well' | 'labyrinth' | 'end';
  icon: string;
  description: string;
}

const GOOSE_CELLS: GooseCell[] = [
  { number: 1, type: 'normal', icon: '🚩', description: 'Partenza' },
  { number: 2, type: 'goose', icon: '🪿', description: 'Avanza di 2' },
  { number: 3, type: 'normal', icon: '⬜', description: '' },
  { number: 4, type: 'normal', icon: '⬜', description: '' },
  { number: 5, type: 'bridge', icon: '🌉', description: 'Vai al 12' },
  { number: 6, type: 'normal', icon: '⬜', description: '' },
  { number: 7, type: 'goose', icon: '🪿', description: 'Avanzadi 7' },
  { number: 8, type: 'normal', icon: '⬜', description: '' },
  { number: 9, type: 'normal', icon: '⬜', description: '' },
  { number: 10, type: 'goose', icon: '🪿', description: 'Avanzadi 10' },
  { number: 11, type: 'normal', icon: '⬜', description: '' },
  { number: 12, type: 'bridge', icon: '🌉', description: 'Dal 5' },
  { number: 13, type: 'death', icon: '💀', description: 'Torna all 1' },
  { number: 14, type: 'normal', icon: '⬜', description: '' },
  { number: 15, type: 'goose', icon: '🪿', description: 'Avanzadi 15' },
  { number: 16, type: 'prison', icon: '🏢', description: 'In prigione' },
  { number: 17, type: 'normal', icon: '⬜', description: '' },
  { number: 18, type: 'goose', icon: '🪿', description: 'Avanzadi 18' },
  { number: 19, type: 'normal', icon: '⬜', description: '' },
  { number: 20, type: 'normal', icon: '⬜', description: '' },
  { number: 21, type: 'goose', icon: '🪿', description: 'Avanzadi 21' },
  { number: 22, type: 'normal', icon: '⬜', description: '' },
  { number: 23, type: 'normal', icon: '⬜', description: '' },
  { number: 24, type: 'goose', icon: '🪿', description: 'Avanzadi 24' },
  { number: 25, type: 'normal', icon: '⬜', description: '' },
  { number: 26, type: 'well', icon: '🪣', description: 'Aspetta' },
  { number: 27, type: 'normal', icon: '⬜', description: '' },
  { number: 28, type: 'goose', icon: '🪿', description: 'Avanzadi 28' },
  { number: 29, type: 'normal', icon: '⬜', description: '' },
  { number: 30, type: 'normal', icon: '⬜', description: '' },
  { number: 31, type: 'goose', icon: '🪿', description: 'Avanzadi 31' },
  { number: 32, type: 'normal', icon: '⬜', description: '' },
  { number: 33, type: 'normal', icon: '⬜', description: '' },
  { number: 34, type: 'goose', icon: '🪿', description: 'Avanzadi 34' },
  { number: 35, type: 'normal', icon: '⬜', description: '' },
  { number: 36, type: 'labyrinth', icon: '🌀', description: 'Torna al 30' },
  { number: 37, type: 'normal', icon: '⬜', description: '' },
  { number: 38, type: 'normal', icon: '⬜', description: '' },
  { number: 39, type: 'inn', icon: '🏨', description: 'Passa il turno' },
  { number: 40, type: 'normal', icon: '⬜', description: '' },
  { number: 41, type: 'goose', icon: '🪿', description: 'Avanzadi 41' },
  { number: 42, type: 'normal', icon: '⬜', description: '' },
  { number: 43, type: 'normal', icon: '⬜', description: '' },
  { number: 44, type: 'goose', icon: '🪿', description: 'Avanzadi 44' },
  { number: 45, type: 'normal', icon: '⬜', description: '' },
  { number: 46, type: 'star', icon: '⭐', description: 'Gira dado' },
  { number: 47, type: 'normal', icon: '⬜', description: '' },
  { number: 48, type: 'goose', icon: '🪿', description: 'Avanzadi 48' },
  { number: 49, type: 'normal', icon: '⬜', description: '' },
  { number: 50, type: 'normal', icon: '⬜', description: '' },
  { number: 51, type: 'goose', icon: '🪿', description: 'Avanzadi 51' },
  { number: 52, type: 'normal', icon: '⬜', description: '' },
  { number: 53, type: 'normal', icon: '⬜', description: '' },
  { number: 54, type: 'goose', icon: '🪿', description: 'Avanzadi 54' },
  { number: 55, type: 'normal', icon: '⬜', description: '' },
  { number: 56, type: 'goose', icon: '🪿', description: 'Avanzadi 56' },
  { number: 57, type: 'normal', icon: '⬜', description: '' },
  { number: 58, type: 'normal', icon: '⬜', description: '' },
  { number: 59, type: 'goose', icon: '🪿', description: 'Avanzadi 59' },
  { number: 60, type: 'normal', icon: '⬜', description: '' },
  { number: 61, type: 'normal', icon: '⬜', description: '' },
  { number: 62, type: 'goose', icon: '🪿', description: 'Avanzadi 62' },
  { number: 63, type: 'end', icon: '🏆', description: 'FINE!' },
];

const PLAYER_COLORS = [
  { bg: 'bg-red-500', border: 'border-red-600', name: 'Rosso' },
  { bg: 'bg-blue-500', border: 'border-blue-600', name: 'Blu' },
  { bg: 'bg-green-500', border: 'border-green-600', name: 'Verde' },
  { bg: 'bg-yellow-500', border: 'border-yellow-600', name: 'Giallo' },
  { bg: 'bg-purple-500', border: 'border-purple-600', name: 'Viola' },
  { bg: 'bg-pink-500', border: 'border-pink-600', name: 'Rosa' },
];

interface GiocoOcaProps {
  players: Player[];
  onGameEnd: (winner: Player) => void;
  onExit: () => void;
}

export function GiocoOca({ players, onGameEnd, onExit }: GiocoOcaProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [movingPlayer, setMovingPlayer] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'info' | 'success' | 'danger'>('info');
  const [diceAnim, setDiceAnim] = useState(false);
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);
  const [winner, setWinner] = useState<Player | null>(null);
  const [inWellPlayers, setInWellPlayers] = useState<Set<string>>(new Set());
  const [skippedPlayers, setSkippedPlayers] = useState<Set<string>>(new Set());

  const currentPlayer = localPlayers[currentPlayerIndex];

  const rollDice = useCallback(() => {
    if (isRolling || dice !== null) return;
    
    setDiceAnim(true);
    setIsRolling(true);
    
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(rollInterval);
        setDiceAnim(false);
        setIsRolling(false);
        
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDice(finalDice);
        
        setTimeout(() => movePlayer(finalDice), 500);
      }
    }, 100);
  }, [isRolling, dice]);

  const movePlayer = useCallback((steps: number) => {
    const player = localPlayers[currentPlayerIndex];
    
    setMovingPlayer(player.id);
    let newPosition = player.position + steps;
    
    if (newPosition > 63) {
      newPosition = 63 - (newPosition - 63);
      showMessage('Hai superato il 63! Rimbalzi indietro!', 'info');
    }
    
    setTimeout(() => {
      setLocalPlayers(prev => prev.map(p => 
        p.id === player.id ? { ...p, position: newPosition } : p
      ));
      
      const cell = GOOSE_CELLS.find(c => c.number === newPosition);
      handleCellEffect(newPosition, cell);
    }, 300);
  }, [localPlayers, currentPlayerIndex]);

  const handleCellEffect = (position: number, cell: GooseCell | undefined) => {
    if (!cell) {
      setMovingPlayer(null);
      setTimeout(nextTurn, 500);
      return;
    }

    switch (cell.type) {
      case 'goose':
        showMessage(`${cell.icon} Oca! Avanza di ${position}!`, 'success');
        setTimeout(() => {
          const nextCell = GOOSE_CELLS.find(c => c.number === position + position);
          movePlayerNoDice(position);
          setTimeout(() => handleCellEffect(position + position, nextCell), 800);
        }, 600);
        break;
        
      case 'bridge':
        showMessage('🌉 Ponte! Vai al 12!', 'info');
        setTimeout(() => {
          setLocalPlayers(prev => prev.map(p => 
            p.id === localPlayers[currentPlayerIndex].id ? { ...p, position: 12 } : p
          ));
          setTimeout(nextTurn, 800);
        }, 600);
        break;
        
      case 'death':
        showMessage('💀 Morte! Torna al 1!', 'danger');
        setTimeout(() => {
          setLocalPlayers(prev => prev.map(p => 
            p.id === localPlayers[currentPlayerIndex].id ? { ...p, position: 1 } : p
          ));
          setTimeout(nextTurn, 800);
        }, 600);
        break;
        
      case 'prison':
        showMessage('🏢 Prigione! Salti 2 turni!', 'danger');
        setSkippedPlayers(prev => new Set([...prev, localPlayers[currentPlayerIndex].id]));
        setTimeout(nextTurn, 800);
        break;
        
      case 'well':
        showMessage('🪣 Pozzo! Aspetti che qualcuno ti salvi!', 'info');
        setInWellPlayers(prev => new Set([...prev, localPlayers[currentPlayerIndex].id]));
        setTimeout(nextTurn, 800);
        break;
        
      case 'inn':
        showMessage('🏨 Locanda! Passa il turno!', 'info');
        setTimeout(nextTurn, 800);
        break;
        
      case 'labyrinth':
        showMessage('🌀 Labirinto! Torna al 30!', 'danger');
        setTimeout(() => {
          setLocalPlayers(prev => prev.map(p => 
            p.id === localPlayers[currentPlayerIndex].id ? { ...p, position: 30 } : p
          ));
          setTimeout(nextTurn, 800);
        }, 600);
        break;
        
      case 'star':
        showMessage('⭐ Stella! Gira di nuovo!', 'success');
        setTimeout(rollDice, 800);
        return;
        
      case 'end':
        showMessage('🏆 VITTORIA!', 'success');
        setWinner(localPlayers[currentPlayerIndex]);
        setMovingPlayer(null);
        setTimeout(() => onGameEnd(localPlayers[currentPlayerIndex]), 2000);
        return;
        
      default:
        setMovingPlayer(null);
        setTimeout(nextTurn, 500);
    }
  };

  const movePlayerNoDice = (extraSteps: number) => {
    const player = localPlayers[currentPlayerIndex];
    let newPosition = player.position + extraSteps;
    
    if (newPosition > 63) {
      newPosition = 63 - (newPosition - 63);
    }
    
    setLocalPlayers(prev => prev.map(p => 
      p.id === player.id ? { ...p, position: newPosition } : p
    ));
  };

  const showMessage = (msg: string, type: 'info' | 'success' | 'danger') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 2500);
  };

  const nextTurn = useCallback(() => {
    setDice(null);
    setMovingPlayer(null);
    
    let nextIndex = (currentPlayerIndex + 1) % localPlayers.length;
    let attempts = 0;
    
    while (attempts < localPlayers.length) {
      const nextPlayer = localPlayers[nextIndex];
      if (!skippedPlayers.has(nextPlayer.id) && !inWellPlayers.has(nextPlayer.id)) {
        break;
      }
      
      if (skippedPlayers.has(nextPlayer.id)) {
        setSkippedPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(nextPlayer.id);
          return newSet;
        });
        break;
      }
      
      if (inWellPlayers.has(nextPlayer.id) && dice && dice === 6) {
        setInWellPlayers(prev => {
          const newSet = new Set(prev);
          newSet.delete(nextPlayer.id);
          return newSet;
        });
        showMessage(`${nextPlayer.name} è libero dal pozzo!`, 'success');
        break;
      }
      
      nextIndex = (nextIndex + 1) % localPlayers.length;
      attempts++;
    }
    
    setCurrentPlayerIndex(nextIndex);
  }, [currentPlayerIndex, localPlayers, skippedPlayers, inWellPlayers, dice]);

  const cpuTurn = useCallback(() => {
    if (currentPlayer?.isCpu && !winner) {
      setTimeout(rollDice, 1500);
    }
  }, [currentPlayer, winner, rollDice]);

  useEffect(() => {
    if (!isRolling && dice === null && !movingPlayer && !winner) {
      if (currentPlayer?.isCpu) {
        cpuTurn();
      }
    }
  }, [currentPlayer, isRolling, dice, movingPlayer, winner, cpuTurn]);

  const getPositionCoords = (num: number): { x: number; y: number } => {
    const path: { x: number; y: number }[] = [];
    
    // Path along the spiral
    // Bottom row: 1-4 (left to right)
    path.push({ x: 0, y: 5 });
    path.push({ x: 1, y: 5 });
    path.push({ x: 2, y: 5 });
    path.push({ x: 3, y: 5 });
    
    // Right column up: 5-6
    path.push({ x: 4, y: 5 });
    path.push({ x: 4, y: 4 });
    
    // Top row right to left: 7-12
    path.push({ x: 3, y: 4 });
    path.push({ x: 2, y: 4 });
    path.push({ x: 1, y: 4 });
    path.push({ x: 0, y: 4 });
    
    // Left column: 13
    path.push({ x: 0, y: 3 });
    
    // Bottom row inner: 14-21
    path.push({ x: 0, y: 2 });
    path.push({ x: 1, y: 2 });
    path.push({ x: 2, y: 2 });
    path.push({ x: 3, y: 2 });
    path.push({ x: 4, y: 2 });
    path.push({ x: 4, y: 1 });
    path.push({ x: 3, y: 1 });
    path.push({ x: 2, y: 1 });
    
    // Top row inner: 22-27
    path.push({ x: 1, y: 1 });
    path.push({ x: 0, y: 1 });
    path.push({ x: 0, y: 0 });
    path.push({ x: 1, y: 0 });
    path.push({ x: 2, y: 0 });
    path.push({ x: 3, y: 0 });
    
    // Right column: 28-33
    path.push({ x: 4, y: 0 });
    path.push({ x: 4, y: 1 });
    path.push({ x: 5, y: 0 });
    path.push({ x: 6, y: 0 });
    path.push({ x: 7, y: 0 });
    path.push({ x: 7, y: 1 });
    
    // Continue the path...
    for (let i = 0; i < 30; i++) {
      const baseX = (i % 8);
      const baseY = Math.floor(i / 8);
      path.push({ x: baseX, y: 6 - baseY });
    }
    
    return path[num - 1] || { x: 0, y: 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={onExit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold hover:bg-white/30"
        >
          ← Indietro
        </motion.button>
        
        <h1 className="text-2xl font-bold text-white">🪿 Gioco dell'Oca</h1>
        
        <div className="text-white/60 text-sm">
          Turno: <span className={cn('font-bold', PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length].bg, 'px-2 py-1 rounded')}>
            {currentPlayer?.name}
          </span>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl font-bold text-white text-lg',
              messageType === 'success' && 'bg-green-500',
              messageType === 'danger' && 'bg-red-500',
              messageType === 'info' && 'bg-purple-500'
            )}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Board */}
      <div className="relative max-w-4xl mx-auto mb-6">
        <div className="bg-amber-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-amber-600">
          {/* Board Grid */}
          <div className="grid grid-cols-9 gap-1 relative">
            {GOOSE_CELLS.map((cell) => {
              const coords = getPositionCoords(cell.number);
              const playersHere = localPlayers.filter(p => p.position === cell.number);
              
              return (
                <motion.div
                  key={cell.number}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center relative',
                    'border-2 transition-all duration-300',
                    cell.type === 'goose' && 'bg-gradient-to-br from-amber-400 to-yellow-500 border-yellow-400',
                    cell.type === 'bridge' && 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500',
                    cell.type === 'death' && 'bg-gradient-to-br from-red-700 to-red-900 border-red-800',
                    cell.type === 'prison' && 'bg-gradient-to-br from-slate-600 to-slate-800 border-slate-700',
                    cell.type === 'well' && 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500',
                    cell.type === 'inn' && 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-600',
                    cell.type === 'labyrinth' && 'bg-gradient-to-br from-purple-600 to-purple-900 border-purple-700',
                    cell.type === 'star' && 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-400',
                    cell.type === 'end' && 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 border-amber-400',
                    cell.type === 'normal' && 'bg-amber-700/50 border-amber-600/50',
                    movingPlayer && playersHere.length > 0 && 'ring-4 ring-yellow-400 ring-opacity-80'
                  )}
                  animate={movingPlayer && playersHere.some(p => p.id === movingPlayer) ? { scale: [1, 1.1, 1] } : {}}
                  style={{
                    gridColumn: coords.x + 1,
                    gridRow: coords.y + 1,
                  }}
                >
                  <span className="text-2xl">{cell.icon}</span>
                  <span className="text-xs text-white/70 font-bold">{cell.number}</span>
                  
                  {/* Players on cell */}
                  <div className="absolute -bottom-1 -right-1 flex -space-x-1">
                    {playersHere.map((player, idx) => (
                      <motion.div
                        key={player.id}
                        initial={movingPlayer === player.id ? { scale: 0, y: -20 } : {}}
                        animate={{ scale: 1, y: 0 }}
                        className={cn(
                          'w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-lg',
                          PLAYER_COLORS.find(c => c.name === player.color)?.bg || 'bg-gray-500'
                        )}
                      >
                        {player.name[0]}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 flex items-center justify-between gap-6">
          {/* Player Info */}
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">Turno di:</h3>
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white',
                  PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length].bg
                )}
                animate={!currentPlayer?.isCpu ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: !currentPlayer?.isCpu ? Infinity : 0 }}
              >
                {currentPlayer?.name[0]}
              </motion.div>
              <div>
                <p className="text-white font-bold">{currentPlayer?.name}</p>
                <p className="text-white/60 text-sm">
                  Casella: {currentPlayer?.position}
                  {inWellPlayers.has(currentPlayer?.id || '') && ' (nel pozzo!)'}
                </p>
              </div>
            </div>
          </div>

          {/* Dice */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={diceAnim ? { rotate: [0, 360], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.1, repeat: diceAnim ? Infinity : 0 }}
              className={cn(
                'w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl font-bold',
                'border-4 border-gray-200'
              )}
            >
              {dice || '?'}
            </motion.div>
            <p className="text-white/60 text-sm mt-2">Lancio</p>
          </div>

          {/* Roll Button */}
          <div>
            <motion.button
              onClick={rollDice}
              disabled={isRolling || currentPlayer?.isCpu || dice !== null}
              whileHover={!isRolling && !currentPlayer?.isCpu && dice === null ? { scale: 1.05 } : {}}
              whileTap={!isRolling && !currentPlayer?.isCpu && dice === null ? { scale: 0.95 } : {}}
              className={cn(
                'px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all',
                'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !isRolling && !currentPlayer?.isCpu && dice === null && 'hover:from-green-400 hover:to-emerald-500'
              )}
            >
              {isRolling ? '🎲 Lancio...' : currentPlayer?.isCpu ? '🤖 CPU...' : '🎲 Lancia!'}
            </motion.button>
          </div>
        </div>

        {/* Players Status */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {localPlayers.map((player, idx) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'p-3 rounded-xl backdrop-blur-sm',
                currentPlayerIndex === idx ? 'bg-white/30 ring-2 ring-yellow-400' : 'bg-white/10'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white',
                  PLAYER_COLORS[idx % PLAYER_COLORS.length].bg
                )}>
                  {player.name[0]}
                </div>
                <div className="text-white text-sm font-semibold truncate">
                  {player.name}
                  {player.isCpu && ' 🤖'}
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <span>📍 {player.position}</span>
                {inWellPlayers.has(player.id) && <span>🪣</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🏆
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-2">Vittoria!</h2>
              <p className="text-2xl text-white/90 mb-6">{winner.name} ha vinto!</p>
              <motion.button
                onClick={onExit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-amber-600 rounded-xl font-bold text-lg shadow-lg"
              >
                Menu Principale
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
