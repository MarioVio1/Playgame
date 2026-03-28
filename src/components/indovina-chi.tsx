'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Character {
  id: number;
  name: string;
  emoji: string;
  hair: string;
  glasses: boolean;
  hat: boolean;
  beard: boolean;
  gender: string;
  age: string;
}

interface IndovinaChiProps {
  characters: Character[];
  secretCharacter: Character | null;
  eliminatedCharacters: number[];
  onAskQuestion: (attribute: string, value: string) => void;
  onGuess: (characterId: number) => void;
  isMyTurn: boolean;
  currentQuestion: string;
  answer: boolean | null;
  canGuess: boolean;
  winner: string | null;
  myCharacter: Character | null;
}

const QUESTIONS = [
  { key: 'gender_male', label: 'È maschio?', attribute: 'gender', value: 'male' },
  { key: 'gender_female', label: 'È femmina?', attribute: 'gender', value: 'female' },
  { key: 'age_young', label: 'È giovane?', attribute: 'age', value: 'young' },
  { key: 'age_adult', label: 'È adulto?', attribute: 'age', value: 'adult' },
  { key: 'age_elder', label: 'È anziano?', attribute: 'age', value: 'elder' },
  { key: 'glasses', label: 'Ha gli occhiali?', attribute: 'glasses', value: 'true' },
  { key: 'hat', label: 'Ha il cappello?', attribute: 'hat', value: 'true' },
  { key: 'beard', label: 'Ha la barba?', attribute: 'beard', value: 'true' },
  { key: 'hair_biondi', label: 'Capelli biondi?', attribute: 'hair', value: 'biondi' },
  { key: 'hair_neri', label: 'Capelli neri?', attribute: 'hair', value: 'neri' },
  { key: 'hair_castani', label: 'Capelli castani?', attribute: 'hair', value: 'castani' },
];

export function IndovinaChi({
  characters,
  secretCharacter,
  eliminatedCharacters,
  onAskQuestion,
  onGuess,
  isMyTurn,
  currentQuestion,
  answer,
  canGuess,
  winner,
  myCharacter,
}: IndovinaChiProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showGuess, setShowGuess] = useState(false);

  const visibleCharacters = characters.filter(c => !eliminatedCharacters.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 p-4">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🔍</span>
            Indovina Chi?
          </h1>
          
          <div className="flex items-center gap-4">
            {winner && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 rounded-xl text-white font-bold"
              >
                🏆 {winner === 'you' ? 'Hai vinto!' : 'Hai perso!'}
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Grid */}
        <div className="lg:col-span-2">
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Personaggi ({visibleCharacters.length}/{characters.length})
              </h2>
              <div className="text-purple-300 text-sm">
                Eliminati: {eliminatedCharacters.length}
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {characters.map((char) => {
                const isEliminated = eliminatedCharacters.includes(char.id);
                const isMyChar = myCharacter?.id === char.id;
                
                return (
                  <motion.button
                    key={char.id}
                    onClick={() => {
                      if (canGuess && !isEliminated) {
                        onGuess(char.id);
                      }
                    }}
                    whileHover={canGuess && !isEliminated ? { scale: 1.1 } : {}}
                    whileTap={canGuess ? { scale: 0.95 } : {}}
                    className={cn(
                      'relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all',
                      isEliminated
                        ? 'bg-gray-800/50 opacity-30 grayscale'
                        : 'bg-white/10 hover:bg-white/20 cursor-pointer',
                      isMyChar && 'ring-2 ring-green-400',
                      canGuess && !isEliminated && 'hover:shadow-lg hover:shadow-purple-500/30'
                    )}
                    disabled={!canGuess || isEliminated}
                  >
                    <span className="text-3xl">{char.emoji}</span>
                    <span className={cn(
                      'text-[10px] mt-1 truncate w-full text-center px-1',
                      isEliminated ? 'text-gray-500' : 'text-white'
                    )}>
                      {char.name}
                    </span>
                    
                    {/* Eliminated X */}
                    {isEliminated && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"
                      >
                        <span className="text-4xl text-red-500 font-bold">✗</span>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="space-y-4">
          {/* Current Question/Answer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
          >
            <h3 className="text-white font-semibold mb-3">Domanda Attuale</h3>
            
            {currentQuestion ? (
              <div className="space-y-3">
                <div className="bg-purple-500/20 rounded-xl p-3">
                  <p className="text-purple-200 text-sm">👤 {currentQuestion}</p>
                </div>
                
                {answer !== null && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      'rounded-xl p-3 text-center font-bold',
                      answer ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}
                  >
                    {answer ? '✅ SÌ' : '❌ NO'}
                  </motion.div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                {isMyTurn ? 'Fai una domanda!' : 'Aspetta il tuo turno...'}
              </p>
            )}
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
          >
            <h3 className="text-white font-semibold mb-3">Fai una Domanda</h3>
            
            {isMyTurn ? (
              <div className="grid grid-cols-2 gap-2">
                {QUESTIONS.map((q) => (
                  <motion.button
                    key={q.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAskQuestion(q.attribute, q.value)}
                    disabled={selectedQuestion === q.key}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedQuestion === q.key
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    )}
                  >
                    {q.label}
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Aspetta il tuo turno per fare domande.</p>
            )}
          </motion.div>

          {/* Guess Button */}
          {canGuess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setShowGuess(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                🎯 INDOVINA!
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* My Character Display */}
      {myCharacter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30"
        >
          <h3 className="text-green-400 font-semibold mb-2">👤 Il tuo personaggio (segreto!)</h3>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{myCharacter.emoji}</span>
            <div>
              <p className="text-white font-bold text-xl">{myCharacter.name}</p>
              <p className="text-gray-400 text-sm">
                {myCharacter.gender === 'male' ? 'Maschio' : 'Femmina'} • {myCharacter.age}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Guess Modal */}
      <AnimatePresence>
        {showGuess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowGuess(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                🎯 Chi pensi sia?
              </h2>
              
              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto mb-4">
                {visibleCharacters.map((char) => (
                  <motion.button
                    key={char.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onGuess(char.id);
                      setShowGuess(false);
                    }}
                    className="bg-white/10 hover:bg-white/20 rounded-xl p-3 flex flex-col items-center"
                  >
                    <span className="text-4xl">{char.emoji}</span>
                    <span className="text-white text-xs mt-1">{char.name}</span>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={() => setShowGuess(false)}
                className="w-full py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-500"
              >
                Annulla
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
