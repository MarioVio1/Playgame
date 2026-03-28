'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// TYPES
// ============================================
interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  isCpu?: boolean;
  money?: number;
  cards?: GameCard[];
  collectedCards?: GameCard[];
  scopas?: number;
}

interface GameCard {
  id: string;
  suit?: string;
  suitName?: string;
  value: string;
  color?: string;
  points?: number;
  numValue?: number;
  type?: string;
  emoji?: string;
  name?: string;
  text?: string;
  isDenari?: boolean;
  isPrize?: boolean;
}

// ============================================
// CONSTANTS
// ============================================
const BRISCOLA_SUITS = [
  { suit: 'denari', emoji: '🪙', color: '#D4AF37', name: 'Denari' },
  { suit: 'coppe', emoji: '🏆', color: '#CD7F32', name: 'Coppe' },
  { suit: 'spade', emoji: '⚔️', color: '#C0C0C0', name: 'Spade' },
  { suit: 'bastoni', emoji: '🪵', color: '#8B4513', name: 'Bastoni' },
];

const UNO_COLORS: Record<string, { bg: string; text: string }> = {
  red: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: '#fff' },
  blue: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', text: '#fff' },
  green: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', text: '#fff' },
  yellow: { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', text: '#000' },
  black: { bg: 'linear-gradient(135deg, #374151, #1f2937)', text: '#fff' },
};

const CHARACTERS = [
  { id: 1, name: 'Marco', image: '/images/characters/character-1.png', hair: 'castani', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 2, name: 'Giuseppe', image: '/images/characters/character-3.png', hair: 'bianchi', glasses: true, hat: true, beard: true, age: 'elder', gender: 'male', mustache: false },
  { id: 3, name: 'Antonio', image: '/images/characters/character-5.png', hair: 'neri', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 4, name: 'Luca', image: '/images/characters/character-7.png', hair: 'castani', glasses: false, hat: true, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 5, name: 'Pietro', image: '/images/characters/character-9.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 6, name: 'Roberto', image: '/images/characters/character-11.png', hair: 'biondi', glasses: true, hat: false, beard: true, age: 'elder', gender: 'male', mustache: false },
  { id: 7, name: 'Francesco', image: '/images/characters/character-1.png', hair: 'castani', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 8, name: 'Alessandro', image: '/images/characters/character-3.png', hair: 'neri', glasses: false, hat: true, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 9, name: 'Giovanni', image: '/images/characters/character-5.png', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'elder', gender: 'male', mustache: false },
  { id: 10, name: 'Matteo', image: '/images/characters/character-7.png', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 11, name: 'Andrea', image: '/images/characters/character-9.png', hair: 'rossi', glasses: true, hat: true, beard: true, age: 'adult', gender: 'male', mustache: false },
  { id: 12, name: 'Stefano', image: '/images/characters/character-11.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: true },
  { id: 13, name: 'Laura', image: '/images/characters/character-2.png', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 14, name: 'Sofia', image: '/images/characters/character-4.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 15, name: 'Elena', image: '/images/characters/character-6.png', hair: 'rossi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 16, name: 'Maria', image: '/images/characters/character-8.png', hair: 'bianchi', glasses: true, hat: true, beard: false, age: 'elder', gender: 'female', earrings: true },
  { id: 17, name: 'Anna', image: '/images/characters/character-10.png', hair: 'castani', glasses: false, hat: true, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 18, name: 'Giulia', image: '/images/characters/character-12.png', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 19, name: 'Francesca', image: '/images/characters/character-2.png', hair: 'neri', glasses: true, hat: true, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 20, name: 'Chiara', image: '/images/characters/character-4.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 21, name: 'Valentina', image: '/images/characters/character-6.png', hair: 'biondi', glasses: false, hat: true, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 22, name: 'Rosa', image: '/images/characters/character-8.png', hair: 'bianchi', glasses: false, hat: false, beard: false, age: 'elder', gender: 'female', earrings: false },
  { id: 23, name: 'Lucia', image: '/images/characters/character-10.png', hair: 'rossi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 24, name: 'Paola', image: '/images/characters/character-12.png', hair: 'neri', glasses: true, hat: true, beard: false, age: 'elder', gender: 'female', earrings: false },
];

const QUESTIONS = [
  { text: 'È maschio?', key: 'gender_male' },
  { text: 'È femmina?', key: 'gender_female' },
  { text: 'È giovane?', key: 'age_young' },
  { text: 'È adulto?', key: 'age_adult' },
  { text: 'È anziano?', key: 'age_elder' },
  { text: 'Ha gli occhiali?', key: 'glasses' },
  { text: 'Ha il cappello?', key: 'hat' },
  { text: 'Ha la barba?', key: 'beard' },
  { text: 'Ha i baffi?', key: 'mustache' },
  { text: 'Ha gli orecchini?', key: 'earrings' },
  { text: 'Ha i capelli biondi?', key: 'hair_biondi' },
  { text: 'Ha i capelli neri?', key: 'hair_neri' },
  { text: 'Ha i capelli bianchi?', key: 'hair_bianchi' },
  { text: 'Ha i capelli castani?', key: 'hair_castani' },
  { text: 'Ha i capelli rossi?', key: 'hair_rossi' },
];

const JOKING_PANELS = [
  { id: 1, text: 'Un uomo entra in un bar', emoji: '🍺' },
  { id: 2, text: 'E ordina qualcosa di strano', emoji: '🤪' },
  { id: 3, text: 'Il barista lo guarda male', emoji: '😤' },
  { id: 4, text: 'Poi scoppia a ridere', emoji: '😂' },
  { id: 5, text: 'Tutti applaudono', emoji: '👏' },
  { id: 6, text: 'Arriva la polizia', emoji: '👮' },
  { id: 7, text: 'Qualcosa esplode', emoji: '💥' },
  { id: 8, text: 'Tutti scappano urlando', emoji: '😱' },
];

// Games configuration
const GAMES = [
  { id: 'forza4', name: 'Forza 4', emoji: '🔴', subtitle: 'Connetti 4 in fila!', players: '2', time: '5-15 min', gradient: 'from-yellow-500 to-red-500' },
  { id: 'briscola', name: 'Briscola', emoji: '🃏', subtitle: 'Carte trevisane', players: '2-4', time: '15-25 min', gradient: 'from-amber-600 to-yellow-600' },
  { id: 'uno', name: 'UNO', emoji: '🎴', subtitle: 'Il classico colorato', players: '2-8', time: '15-30 min', gradient: 'from-red-500 to-pink-500' },
  { id: 'scopa', name: 'Scopa', emoji: '🪙', subtitle: 'Prendi tutte le carte', players: '2-4', time: '20-30 min', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'indovinachi', name: 'Indovina Chi', emoji: '🔍', subtitle: 'Indovina il personaggio', players: '2', time: '10-20 min', gradient: 'from-purple-500 to-violet-500' },
  { id: 'nomecitta', name: 'Nome Città', emoji: '📝', subtitle: 'Cose, Animali, Città', players: '2-8', time: '10-20 min', gradient: 'from-pink-500 to-rose-500' },
  { id: 'dama', name: 'Dama', emoji: '♛', subtitle: 'Il classico da tavolo', players: '2', time: '15-30 min', gradient: 'from-violet-500 to-purple-500' },
  { id: 'mercanteinfiera', name: 'Mercante in Fiera', emoji: '🎪', subtitle: 'Vinci il jackpot', players: '2-6', time: '20-40 min', gradient: 'from-orange-500 to-amber-500' },
];

// ============================================
// API HELPER with Retry Logic
// ============================================
async function gameApi(action: string, data: Record<string, unknown> = {}, retries = 5): Promise<any> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      
      const result = await res.json();
      
      // Check for "function is pending" error
      if (result.Code === 'PreconditionFailed' || result.Message?.includes('pending')) {
        console.log(`Attempt ${attempt + 1}: Function pending, retrying in ${1000 * (attempt + 1)}ms...`);
        await delay(1000 * (attempt + 1)); // Exponential backoff: 1s, 2s, 3s, 4s, 5s
        continue;
      }
      
      return result;
    } catch (e) {
      console.error(`Attempt ${attempt + 1} failed:`, e);
      if (attempt < retries - 1) {
        await delay(1000 * (attempt + 1));
      } else {
        return { success: false, error: 'Errore di connessione. Riprova.' };
      }
    }
  }
  
  return { success: false, error: 'Servizio temporaneamente non disponibile. Riprova tra qualche secondo.' };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Home() {
  const [view, setView] = useState<'home' | 'lobby' | 'game'>('home');
  const [gameType, setGameType] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');
  const [myCards, setMyCards] = useState<GameCard[]>([]);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [playerId] = useState(() => `player-${Date.now()}`);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [vsCpu, setVsCpu] = useState(false);
  const [numBots, setNumBots] = useState(1);
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [opponentAction, setOpponentAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Indovina Chi state
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [secretCharacter, setSecretCharacter] = useState<number | null>(null);
  const [eliminatedCharacters, setEliminatedCharacters] = useState<number[]>([]);
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [isMyTurnToAnswer, setIsMyTurnToAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  
  // Dama state
  const [selectedPiece, setSelectedPiece] = useState<{x: number, y: number} | null>(null);
  
  // Mercante state
  const [currentBid, setCurrentBid] = useState(0);
  
  // Nome Città state
  const [localTimer, setLocalTimer] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Forza 4 state
  const [forza4Board, setForza4Board] = useState<number[][]>(() => 
    Array(6).fill(null).map(() => Array(7).fill(0))
  );

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Polling for game state updates with error handling
  const pollState = useCallback(async () => {
    if (!roomCode || view !== 'game') return;
    try {
      const res = await fetch(`/api/game?roomCode=${roomCode}&playerId=${playerId}`);
      const data = await res.json();
      
      // Skip if "function is pending" error - will retry next poll
      if (data.Code === 'PreconditionFailed' || data.Message?.includes('pending')) {
        console.log('Polling: Function pending, skipping...');
        return;
      }
      
      if (data.gameState) {
        setGameState(data.gameState);
        if (data.lastAction && data.lastAction.playerId !== playerId) {
          setOpponentAction(data.lastAction.message);
          setTimeout(() => setOpponentAction(null), 2000);
        }
        // Forza 4 board
        if (data.gameState.board) {
          setForza4Board(data.gameState.board as number[][]);
        }
      }
      if (data.myCards) setMyCards(data.myCards);
      if (data.mySecret !== undefined) setSecretCharacter(data.mySecret);
      if (data.players) setPlayers(data.players);
      if (data.isMyTurnToAnswer !== undefined) setIsMyTurnToAnswer(data.isMyTurnToAnswer);
      if (data.currentQuestion) setCurrentQuestion(data.currentQuestion);
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, [roomCode, view, playerId]);

  useEffect(() => {
    if (view === 'game') {
      pollingRef.current = setInterval(pollState, 1000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [view, pollState]);

  // Nome Città timer
  useEffect(() => {
    if (view === 'game' && gameType === 'nomecitta' && gameState?.phase === 'writing') {
      const startTime = gameState.timerStart as number || Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 90 - elapsed);
        setLocalTimer(remaining);
        if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [view, gameType, gameState?.phase, gameState?.timerStart]);

  const createRoom = async (game: string) => {
    if (!playerName.trim()) { setError('Inserisci il tuo nome!'); return; }
    setIsLoading(true);
    setError('');
    const res = await gameApi('createRoom', { gameType: game, playerName, playerId, vsCpu, numBots });
    setIsLoading(false);
    if (res.success) {
      setRoomCode(res.roomCode);
      setGameType(game);
      setIsHost(true);
      setPlayers(res.players);
      setView('lobby');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const joinRoom = async () => {
    if (roomCode.length !== 4) { setError('Codice non valido!'); return; }
    if (!playerName.trim()) { setError('Inserisci il tuo nome!'); return; }
    setIsLoading(true);
    setError('');
    const res = await gameApi('joinRoom', { roomCode, playerName, playerId });
    setIsLoading(false);
    if (res.success) {
      setGameType(res.gameType);
      setPlayers(res.players);
      setView('lobby');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    const res = await gameApi('startGame', { roomCode, playerId, gameType });
    setIsLoading(false);
    if (res.success) {
      setGameState(res.gameState);
      const me = res.gameState?.players?.find((p: Player) => p.id === playerId);
      if (me?.hand) setMyCards(me.hand);
      if (res.gameState?.board) setForza4Board(res.gameState.board as number[][]);
      setView('game');
      showNotification('🎮 Partita iniziata!', 'success');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const playCard = async (cardId: string, captureIndex?: number) => {
    if (playingCard) return;
    setPlayingCard(cardId);
    setOpponentAction(null);
    try {
      const res = await gameApi('playCard', { roomCode, playerId, cardId, captureIndex });
      if (res.success) {
        setGameState(res.gameState);
        setMyCards(res.hand || []);
        if (res.opponentAction) {
          setTimeout(() => {
            setOpponentAction(res.opponentAction);
            setTimeout(() => setOpponentAction(null), 2000);
          }, 500);
        }
      } else {
        showNotification(res.error || 'Non puoi giocare questa carta', 'error');
      }
    } finally {
      setTimeout(() => setPlayingCard(null), 500);
    }
  };

  const drawCard = async () => {
    const res = await gameApi('drawCard', { roomCode, playerId });
    if (res.success) {
      setGameState(res.gameState);
      setMyCards(res.hand || []);
      showNotification('📥 Hai pescato una carta', 'info');
    }
  };

  // Forza 4 move
  const playForza4 = async (col: number) => {
    const res = await gameApi('playForza4', { roomCode, playerId, column: col });
    if (res.success) {
      setGameState(res.gameState);
      if (res.gameState?.board) setForza4Board(res.gameState.board as number[][]);
    } else {
      showNotification(res.error || 'Mossa non valida', 'error');
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  
  const notificationEl = notification && (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-semibold z-50 shadow-2xl ${
      notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
      notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
      'bg-gradient-to-r from-blue-500 to-cyan-500'
    } text-white`}>
      {notification.message}
    </div>
  );

  const opponentActionEl = opponentAction && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full font-semibold z-50 border-2 border-cyan-400">
      {opponentAction}
    </div>
  );

  const loadingOverlay = isLoading && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800/90 rounded-3xl p-8 text-center border border-white/10">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Connessione in corso...</p>
        <p className="text-gray-400 text-sm mt-2">Se il server è freddo, potrebbe richiedere qualche secondo</p>
      </div>
    </div>
  );

  // ============================================
  // HOME SCREEN
  // ============================================
  if (view === 'home') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        {loadingOverlay}
        {notificationEl}
        {error && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl z-50 cursor-pointer" onClick={() => setError('')}>
            ⚠️ {error}
          </div>
        )}
        
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                GameHub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Giochi Multiplayer
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Online</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Crea una stanza, condividi il codice con gli amici e gioca insieme! 
              📺 TV mostra il gioco • 📱 Smartphone sono i controller
            </p>
          </div>

          {/* Player Setup */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <label className="block text-gray-300 text-sm font-medium mb-2">👤 Il tuo nome</label>
              <input
                type="text"
                placeholder="Come ti chiami?"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={20}
              />
              
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="vsCpu"
                  checked={vsCpu}
                  onChange={(e) => setVsCpu(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="vsCpu" className="text-gray-300 cursor-pointer">🤖 Gioca contro il PC</label>
              </div>
              
              {vsCpu && (
                <div className="mt-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">Numero di Bot</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => setNumBots(n)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          numBots === n 
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Join Room */}
          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Codice stanza"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl text-white text-center text-xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:border-purple-500"
                maxLength={4}
              />
              <button
                onClick={joinRoom}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                ENTRA
              </button>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GAMES.map(game => (
              <div
                key={game.id}
                onClick={() => createRoom(game.id)}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                  hoveredGame === game.id ? 'scale-105 shadow-2xl shadow-purple-500/20' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${game.gradient} aspect-[4/3] flex flex-col items-center justify-center p-4`}>
                  <span className="text-5xl mb-2">{game.emoji}</span>
                  <h3 className="text-white font-bold text-lg">{game.name}</h3>
                  <p className="text-white/80 text-sm">{game.subtitle}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2 flex justify-between text-xs text-white/80">
                  <span>👥 {game.players}</span>
                  <span>⏱️ {game.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // ============================================
  // LOBBY SCREEN
  // ============================================
  if (view === 'lobby') {
    const game = GAMES.find(g => g.id === gameType) || GAMES[0];
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        {loadingOverlay}
        {notificationEl}
        
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-lg w-full">
          {/* Game Icon */}
          <div className={`w-24 h-24 bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <span className="text-5xl">{game.emoji}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">{game.name}</h2>
          <p className="text-gray-400 text-center mb-6">{game.subtitle}</p>
          
          {/* Room Code */}
          <div className="bg-gray-900/50 rounded-2xl p-6 text-center mb-6">
            <p className="text-gray-400 text-sm mb-2">Codice Stanza</p>
            <p className="text-4xl font-mono font-bold text-white tracking-widest">{roomCode}</p>
            <p className="text-gray-500 text-sm mt-2">Condividi con gli amici!</p>
          </div>
          
          {/* Players */}
          <div className="bg-gray-900/50 rounded-2xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-3">Giocatori ({players.length})</p>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-gray-800/50">
                  <div className={`w-10 h-10 bg-gradient-to-br ${game.gradient} rounded-full flex items-center justify-center text-white font-bold`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white flex-1">{p.name}</span>
                  {p.isHost && <span className="text-yellow-400">👑</span>}
                  {p.isCpu && <span className="text-green-400">🤖</span>}
                  <span className="text-green-400">✓</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setView('home'); setRoomCode(''); setPlayers([]); }}
              className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors"
            >
              ← Indietro
            </button>
            {isHost && (
              <button
                onClick={startGame}
                className={`flex-2 py-3 bg-gradient-to-r ${game.gradient} text-white font-bold rounded-xl hover:opacity-90 transition-opacity px-8`}
              >
                🚀 INIZIA
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // GAME SCREENS
  // ============================================
  if (view === 'game' && gameState) {
    const game = GAMES.find(g => g.id === gameType) || GAMES[0];
    const isMyTurn = gameState.currentTurn === playerId;
    
    // FORZA 4 GAME
    if (gameType === 'forza4') {
      const board = forza4Board;
      const winner = gameState.winner as string;
      const isGameOver = gameState.phase === 'gameOver';
      const myPlayerIndex = (gameState.players as any[])?.findIndex((p: any) => p.id === playerId);
      const myColor = myPlayerIndex === 0 ? 'red' : 'yellow';
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex flex-col items-center justify-center p-4">
          {notificationEl}
          {opponentActionEl}
          
          <h1 className="text-3xl font-bold text-white mb-4">🔴 Forza 4</h1>
          
          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">{winner === playerId ? '🎉' : '😢'}</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
              </h2>
              <button
                onClick={() => { setView('home'); setGameState(null); }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno!
                </div>
              )}
              
              {/* Board */}
              <div className="bg-blue-600 p-4 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-7 gap-2">
                  {board[0].map((_, colIndex) => (
                    <button
                      key={colIndex}
                      onClick={() => isMyTurn && playForza4(colIndex)}
                      disabled={!isMyTurn}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-xl transition-all ${
                        isMyTurn ? 'hover:bg-blue-400 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className="text-2xl">⬇️</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="w-12 h-12 md:w-16 md:h-16 bg-blue-800 rounded-xl flex items-center justify-center"
                      >
                        {cell === 1 && <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"></div>}
                        {cell === 2 && <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Players */}
              <div className="flex gap-6 mt-6">
                {(gameState.players as any[])?.map((p: any, i: number) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                      gameState.currentTurn === p.id ? 'bg-white/20 ring-2 ring-white' : 'bg-black/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                    <span className="text-white font-medium">{p.name}</span>
                    {p.isCpu && <span>🤖</span>}
                  </div>
                ))}
              </div>
            </>
          )}
          
          <button
            onClick={() => { setView('home'); setGameState(null); }}
            className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            ← Esci
          </button>
        </main>
      );
    }

    // BRISCOLA GAME
    if (gameType === 'briscola') {
      const trumpSuit = BRISCOLA_SUITS.find(s => s.emoji === gameState.briscolaSuit);
      const deckCount = (gameState.deck as any[])?.length || 0;
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      const opponent = (gameState.players as any[])?.find(p => p.id !== playerId);
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const myScore = myPlayer?.points || 0;
      const opponentScore = opponent?.points || 0;
      const tableCards = (gameState.currentTrick as any[]) || [];
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex flex-col">
          {notificationEl}
          {opponentActionEl}
          
          {/* Top bar */}
          <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 p-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">🃏 Briscola</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Mazzo: {deckCount}</span>
                <div className="bg-gradient-to-br from-amber-600 to-yellow-600 px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="text-2xl">{gameState.briscolaSuit}</span>
                  <span className="text-white font-bold">{trumpSuit?.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isGameOver ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">{winner === playerId ? '🏆' : '😢'}</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
                </h2>
                <p className="text-gray-400 mb-6">{myScore} - {opponentScore} punti</p>
                <button
                  onClick={() => { setView('home'); setGameState(null); }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
                >
                  🏠 Nuova Partita
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Opponent */}
              <div className="p-4 text-center">
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${gameState.currentTurn === opponent?.id ? 'bg-red-500/20 ring-2 ring-red-400' : 'bg-black/20'}`}>
                  <span className="text-white font-medium">{opponent?.name}</span>
                  {opponent?.isCpu && <span>🤖</span>}
                  <span className="text-yellow-400 font-bold">{opponentScore} pt</span>
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  {Array.from({ length: opponent?.hand?.length || 0 }).map((_, i) => (
                    <div key={i} className="w-10 h-14 bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg border-2 border-amber-600 flex items-center justify-center">
                      <span className="text-xl">🂠</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Table */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 rounded-3xl p-8 min-w-[300px] min-h-[200px] flex items-center justify-center gap-8">
                  {/* Deck */}
                  {deckCount > 0 && (
                    <div className="relative">
                      <div className="w-16 h-24 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl border-2 border-amber-600 flex items-center justify-center shadow-xl">
                        <span className="text-3xl">🂠</span>
                      </div>
                      <div className="absolute -right-8 top-1/2 -translate-y-1/2 rotate-90 w-14 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-2xl">{gameState.briscolaSuit}</span>
                        <span className="text-xs text-amber-800 font-bold">{trumpSuit?.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Played cards */}
                  {tableCards.length === 0 ? (
                    <p className="text-white/40 text-lg">Tavolo vuoto</p>
                  ) : (
                    <div className="flex gap-4">
                      {tableCards.map((play: any, i: number) => {
                        const isMe = play.playerId === playerId;
                        const cardSuit = BRISCOLA_SUITS.find(s => s.emoji === play.card.suit);
                        return (
                          <div key={i} className="text-center">
                            <p className={`text-sm font-bold mb-2 ${isMe ? 'text-green-400' : 'text-yellow-400'}`}>
                              {isMe ? 'Tu' : play.playerName}
                            </p>
                            <div className="w-20 h-28 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300 flex flex-col items-center justify-center shadow-xl">
                              <span className="text-3xl">{play.card.suit}</span>
                              <span className="text-xl font-bold text-amber-900">{play.card.value}</span>
                              <span className="text-xs text-amber-700">{cardSuit?.name}</span>
                              {play.card.points > 0 && (
                                <span className="absolute bottom-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                  {play.card.points}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* My cards */}
              <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 p-4">
                {isMyTurn && (
                  <div className="text-center mb-2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1 rounded-full text-white font-bold text-sm">
                      🎯 È IL TUO TURNO!
                    </span>
                  </div>
                )}
                <div className="flex justify-center gap-3">
                  {myCards.map((card, i) => {
                    const cardSuit = BRISCOLA_SUITS.find(s => s.emoji === card.suit);
                    return (
                      <button
                        key={i}
                        onClick={() => isMyTurn && !playingCard && playCard(card.id)}
                        disabled={!isMyTurn || !!playingCard}
                        className={`w-18 h-26 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 transition-all ${
                          isMyTurn ? 'border-amber-400 hover:-translate-y-2 hover:shadow-xl cursor-pointer' : 'border-amber-200 opacity-70 cursor-default'
                        }`}
                        style={{ width: '72px', height: '104px' }}
                      >
                        <span className="text-3xl">{card.suit}</span>
                        <span className="text-lg font-bold text-amber-900">{card.value}</span>
                        <span className="text-xs text-amber-600">{cardSuit?.name}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-white/60 mt-2">Tu: {myScore} pt</p>
              </div>
            </>
          )}
          
          <button
            onClick={() => { setView('home'); setGameState(null); }}
            className="p-4 text-white/60 hover:text-white transition-colors"
          >
            ← Esci
          </button>
        </main>
      );
    }

    // UNO GAME
    if (gameType === 'uno') {
      const topCard = (gameState.discardPile as any[])?.slice(-1)[0];
      const currentColor = gameState.currentColor as string;
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      
      const canPlayCard = (card: GameCard) => {
        if (!isMyTurn) return false;
        if (card.type === 'wild') return true;
        if (card.color === currentColor) return true;
        if (card.value === topCard?.value) return true;
        return false;
      };
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex flex-col items-center p-4">
          {notificationEl}
          
          <h1 className="text-3xl font-bold text-white mb-4">🎴 UNO</h1>
          
          {isGameOver ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">{winner === playerId ? '🎉' : '😢'}</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
                </h2>
                <button
                  onClick={() => { setView('home'); setGameState(null); setMyCards([]); }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
                >
                  🏠 Nuova Partita
                </button>
              </div>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno!
                </div>
              )}
              
              {/* Center area */}
              <div className="flex gap-8 mb-6">
                {/* Draw pile */}
                <button
                  onClick={() => isMyTurn && drawCard()}
                  disabled={!isMyTurn}
                  className={`w-20 h-28 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border-2 border-gray-600 flex items-center justify-center transition-all ${isMyTurn ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-default'}`}
                >
                  <span className="text-3xl">🎴</span>
                </button>
                
                {/* Discard pile */}
                <div
                  className="w-24 h-32 rounded-xl flex items-center justify-center shadow-2xl"
                  style={{ background: UNO_COLORS[topCard?.color || currentColor]?.bg }}
                >
                  <span className="text-4xl text-white font-bold">{topCard?.value || '?'}</span>
                </div>
              </div>
              
              {/* Current color */}
              <div
                className="px-4 py-2 rounded-xl text-white font-bold mb-4"
                style={{ background: UNO_COLORS[currentColor]?.bg }}
              >
                Colore: {currentColor?.toUpperCase()}
              </div>
              
              {/* My cards */}
              <div className="bg-black/30 rounded-2xl p-4 max-w-md">
                <p className="text-gray-400 text-sm text-center mb-3">Le tue carte ({myCards.length})</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {myCards.map((card, i) => {
                    const canPlay = canPlayCard(card);
                    return (
                      <button
                        key={i}
                        onClick={() => canPlay && playCard(card.id)}
                        className={`w-14 h-20 rounded-lg flex items-center justify-center transition-all ${
                          canPlay ? 'border-2 border-white/50 hover:-translate-y-2 cursor-pointer' : 'opacity-50 cursor-default'
                        }`}
                        style={{ background: UNO_COLORS[card.color || 'black']?.bg }}
                      >
                        <span className="text-xl text-white font-bold">{card.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Other players */}
              <div className="mt-4 bg-black/20 rounded-xl p-3 w-full max-w-sm">
                {(gameState.players as any[])?.map((p: any, i: number) => (
                  <div key={i} className={`flex justify-between items-center p-2 rounded-lg ${gameState.currentTurn === p.id ? 'bg-white/10' : ''}`}>
                    <span className="text-white">{p.name} {p.isCpu && '🤖'}</span>
                    <span className="text-gray-400">{p.hand?.length || 0} carte</span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <button
            onClick={() => { setView('home'); setGameState(null); setMyCards([]); }}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
          >
            ← Esci
          </button>
        </main>
      );
    }

    // NOME CITTÀ GAME
    if (gameType === 'nomecitta') {
      const currentLetter = gameState.currentLetter as string;
      const roundNumber = gameState.roundNumber as number || 1;
      const phase = gameState.phase as string;
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const myAnswers = myPlayer?.answers || {};
      const allAnswers = gameState.allAnswers as Record<string, Record<string, string>> || {};
      const scores = gameState.scores as Record<string, number> || {};
      const hostPlayer = players.find(p => p.isHost);
      const isPlayerHost = hostPlayer?.id === playerId;
      const categories = ['Nome', 'Città', 'Cosa', 'Animale', 'Frutto', 'Oggetto'];
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900/20 to-gray-900 flex flex-col items-center p-4">
          {notificationEl}
          
          <h1 className="text-3xl font-bold text-white mb-4">📝 Nome Città</h1>
          
          {phase === 'rolling' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-6xl">🎲</span>
              </div>
              <button
                onClick={async () => {
                  const res = await gameApi('chooseLetter', { roomCode, playerId });
                  if (res.success) {
                    setGameState(res.gameState);
                    setLocalTimer(90);
                    showNotification(`Lettera: ${res.rolledLetter}!`, 'success');
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-2xl text-xl"
              >
                🎲 TIRA IL DADO!
              </button>
            </div>
          )}
          
          {phase === 'writing' && (
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-center mb-4">
                <span className="text-6xl font-bold text-white">{currentLetter}</span>
                <p className="text-white/80 mt-1">Round {roundNumber}</p>
              </div>
              
              <div className={`rounded-xl p-4 text-center mb-4 ${localTimer <= 15 ? 'bg-red-500/30 border-2 border-red-400' : 'bg-black/30'}`}>
                <span className="text-2xl font-bold text-white">
                  ⏱️ {Math.floor(localTimer / 60)}:{(localTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-4 mb-4">
                {categories.map(cat => (
                  <div key={cat} className="mb-3">
                    <label className="text-gray-300 text-sm">{cat}</label>
                    <input
                      type="text"
                      placeholder={`${cat} con ${currentLetter}...`}
                      defaultValue={myAnswers[cat] || ''}
                      onBlur={async (e) => {
                        const newAnswers = { ...myAnswers, [cat]: e.target.value.toUpperCase() };
                        await gameApi('submitAnswer', { roomCode, playerId, answers: newAnswers });
                      }}
                      className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-xl text-white mt-1"
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={async () => {
                  const inputs = document.querySelectorAll('input');
                  const newAnswers: Record<string, string> = {};
                  inputs.forEach((input, i) => {
                    newAnswers[categories[i]] = (input as HTMLInputElement).value.toUpperCase();
                  });
                  const res = await gameApi('finishWriting', { roomCode, playerId, answers: newAnswers });
                  if (res.success) {
                    setGameState(res.gameState);
                    showNotification('Hai finito!', 'success');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
              >
                ✅ HO FINITO!
              </button>
            </div>
          )}
          
          {phase === 'review' && (
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-green-400 text-center mb-4">Risultati Round {roundNumber}</h2>
              
              {Object.entries(allAnswers).map(([pid, answers]) => {
                const player = players.find(p => p.id === pid);
                return (
                  <div key={pid} className="bg-black/30 rounded-xl p-4 mb-3">
                    <p className="text-white font-bold mb-2">{player?.name} {player?.isCpu && '🤖'}</p>
                    {categories.map(cat => {
                      const answer = (answers as any)[cat] || '-';
                      const isValid = answer && answer.length > 1 && answer.startsWith(currentLetter);
                      return (
                        <div key={cat} className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-gray-400">{cat}</span>
                          <span className={isValid ? 'text-green-400' : 'text-red-400'}>{answer} {isValid ? '✓' : '✗'}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              <div className="bg-yellow-500/20 rounded-xl p-4 mb-4">
                <p className="text-yellow-400 font-bold mb-2">Punteggi</p>
                {Object.entries(scores).sort(([,a], [,b]) => (b as number) - (a as number)).map(([pid, score]) => {
                  const player = players.find(p => p.id === pid);
                  return (
                    <div key={pid} className="flex justify-between py-1">
                      <span className="text-white">{player?.name}</span>
                      <span className="text-green-400 font-bold">{score as number} pt</span>
                    </div>
                  );
                })}
              </div>
              
              {isPlayerHost && (
                <button
                  onClick={async () => {
                    const res = await gameApi('nextRound', { roomCode, playerId });
                    if (res.success) {
                      setGameState(res.gameState);
                      setLocalTimer(90);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl"
                >
                  🎲 PROSSIMO ROUND
                </button>
              )}
            </div>
          )}
          
          {phase === 'gameOver' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-4">Partita Finita!</h2>
              <div className="bg-black/30 rounded-xl p-4">
                {Object.entries(scores).sort(([,a], [,b]) => (b as number) - (a as number)).map(([pid, score], i) => {
                  const player = players.find(p => p.id === pid);
                  return (
                    <div key={pid} className={`flex justify-between p-2 rounded-lg ${i === 0 ? 'bg-yellow-500/30' : ''}`}>
                      <span className="text-white font-bold">{i === 0 && '👑 '}{player?.name}</span>
                      <span className="text-yellow-400 font-bold">{score as number} pt</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">
            ← Esci
          </button>
        </main>
      );
    }

    // Other games - show simplified view
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center justify-center p-4">
        {notificationEl}
        {opponentActionEl}
        
        <h1 className="text-3xl font-bold text-white mb-4">{game.emoji} {game.name}</h1>
        {isMyTurn && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
            🎯 È il tuo turno!
          </div>
        )}
        
        <div className="bg-black/30 rounded-2xl p-6 max-w-sm text-center">
          <p className="text-gray-400">Il gioco è in corso...</p>
          <p className="text-white mt-2">Fase: {gameState.phase as string}</p>
        </div>
        
        <button
          onClick={() => { setView('home'); setGameState(null); }}
          className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
        >
          ← Esci
        </button>
      </main>
    );
  }

  return null;
}
