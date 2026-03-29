'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiocoOca } from '@/components/gioco-oca';
import { TVMode } from '@/components/tv-mode';
import { PhoneController } from '@/components/phone-controller';
import { UNOCard, UNODeck, DiscardPile } from '@/components/uno-card';
import { IndovinaChi } from '@/components/indovina-chi';
import { useSocket } from '@/hooks/useSocket';
import { useSound } from '@/hooks/useSound';
import { useAuth } from '@/hooks/useAuth';

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
  { id: 1, name: 'Marco', image: '/images/characters/character-1.svg', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 2, name: 'Giuseppe', image: '/images/characters/character-2.svg', hair: 'neri', glasses: true, hat: true, beard: true, age: 'elder', gender: 'male', mustache: false },
  { id: 3, name: 'Antonio', image: '/images/characters/character-3.svg', hair: 'castani', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 4, name: 'Luca', image: '/images/characters/character-4.svg', hair: 'neri', glasses: false, hat: true, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 5, name: 'Pietro', image: '/images/characters/character-5.svg', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'elder', gender: 'male', mustache: false },
  { id: 6, name: 'Roberto', image: '/images/characters/character-6.svg', hair: 'castani', glasses: false, hat: true, beard: true, age: 'adult', gender: 'male', mustache: false },
  { id: 7, name: 'Francesco', image: '/images/characters/character-7.svg', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 8, name: 'Alessandro', image: '/images/characters/character-8.svg', hair: 'neri', glasses: false, hat: true, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 9, name: 'Giovanni', image: '/images/characters/character-9.svg', hair: 'neri', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 10, name: 'Matteo', image: '/images/characters/character-10.svg', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 11, name: 'Andrea', image: '/images/characters/character-11.svg', hair: 'castani', glasses: true, hat: true, beard: true, age: 'adult', gender: 'male', mustache: false },
  { id: 12, name: 'Stefano', image: '/images/characters/character-12.svg', hair: 'rossi', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 13, name: 'Laura', image: '/images/characters/character-13.svg', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 14, name: 'Sofia', image: '/images/characters/character-14.svg', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 15, name: 'Elena', image: '/images/characters/character-15.svg', hair: 'rossi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 16, name: 'Maria', image: '/images/characters/character-16.svg', hair: 'bianchi', glasses: true, hat: true, beard: false, age: 'elder', gender: 'female', earrings: true },
  { id: 17, name: 'Anna', image: '/images/characters/character-17.svg', hair: 'castani', glasses: false, hat: true, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 18, name: 'Giulia', image: '/images/characters/character-18.svg', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 19, name: 'Francesca', image: '/images/characters/character-19.svg', hair: 'neri', glasses: true, hat: true, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 20, name: 'Chiara', image: '/images/characters/character-20.svg', hair: 'castani', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 21, name: 'Valentina', image: '/images/characters/character-21.svg', hair: 'biondi', glasses: true, hat: true, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 22, name: 'Rosa', image: '/images/characters/character-22.svg', hair: 'neri', glasses: false, hat: false, beard: false, age: 'elder', gender: 'female', earrings: true },
  { id: 23, name: 'Lucia', image: '/images/characters/character-23.svg', hair: 'rossi', glasses: true, hat: true, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 24, name: 'Paola', image: '/images/characters/character-24.svg', hair: 'bianchi', glasses: false, hat: false, beard: false, age: 'elder', gender: 'female', earrings: true },
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

// Player colors for games
const PLAYER_COLORS = [
  { bg: 'bg-red-500', border: 'border-red-600', name: 'Rosso' },
  { bg: 'bg-blue-500', border: 'border-blue-600', name: 'Blu' },
  { bg: 'bg-green-500', border: 'border-green-600', name: 'Verde' },
  { bg: 'bg-yellow-500', border: 'border-yellow-600', name: 'Giallo' },
  { bg: 'bg-purple-500', border: 'border-purple-600', name: 'Viola' },
  { bg: 'bg-pink-500', border: 'border-pink-600', name: 'Rosa' },
];

// Games configuration
const GAMES = [
  { id: 'forza4', name: 'Forza 4', emoji: '🔴', subtitle: 'Connetti 4 in fila!', players: '2', time: '5-15 min', gradient: 'from-yellow-500 to-red-500', hot: true },
  { id: 'giocodelloca', name: 'Gioco dell\'Oca', emoji: '🪿', subtitle: 'Il classico percorso', players: '2-6', time: '20-40 min', gradient: 'from-amber-400 to-orange-500', isOca: true },
  { id: 'briscola', name: 'Briscola', emoji: '🃏', subtitle: 'Carte trevisane', players: '2-4', time: '15-25 min', gradient: 'from-amber-600 to-yellow-600' },
  { id: 'uno', name: 'UNO', emoji: '🎴', subtitle: 'Il classico colorato', players: '2-8', time: '15-30 min', gradient: 'from-red-500 to-pink-500', hot: true },
  { id: 'indovinachi', name: 'Indovina Chi', emoji: '🔍', subtitle: 'Indovina il personaggio', players: '2', time: '10-20 min', gradient: 'from-purple-500 to-violet-500' },
  { id: 'nomecitta', name: 'Nome Città', emoji: '📝', subtitle: 'Nome, Città, Lavoro...', players: '2-8', time: '10-20 min', gradient: 'from-pink-500 to-rose-500' },
  { id: 'dama', name: 'Dama', emoji: '♛', subtitle: 'Il classico da tavolo', players: '2', time: '15-30 min', gradient: 'from-violet-500 to-purple-500' },
  { id: 'mercanteinfiera', name: 'Mercante in Fiera', emoji: '🎪', subtitle: 'Vinci il jackpot', players: '2-6', time: '20-40 min', gradient: 'from-orange-500 to-amber-500' },
  { id: 'memory', name: 'Memory', emoji: '🧠', subtitle: 'Trova le coppie!', players: '1-2', time: '5-10 min', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'tombola', name: 'Tombola', emoji: '🎱', subtitle: 'Il classico natalizio', players: '2-10', time: '30-60 min', gradient: 'from-red-600 to-green-600' },
  { id: 'tris', name: 'Tris', emoji: '❌⭕', subtitle: 'Chi fa tris vince!', players: '2', time: '2-5 min', gradient: 'from-blue-500 to-indigo-500' },
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
  const [view, setView] = useState<'home' | 'lobby' | 'game' | 'giocooca' | 'tv' | 'phone'>('home');
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

  // Gioco dell'Oca state
    const [ocaPlayers, setOcaPlayers] = useState<{id: string; name: string; position: number; color: string; isCpu: boolean}[]>([]);

  // Gioco dell'Oca dice animation
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  // TV Mode state
  const [isTVMode, setIsTVMode] = useState(false);
  const [isPhoneMode, setIsPhoneMode] = useState(false);

  // Socket for real-time updates
  const { 
    isConnected, 
    players: socketPlayers, 
    gameStarted: socketGameStarted, 
    gameState: socketGameState,
    joinRoom: socketJoinRoom, 
    leaveRoom: socketLeaveRoom,
    notifyGameStart,
    resetGameStarted
  } = useSocket();

  // Sound effects
  const { playDice, playWin, playLose, playClick, playCard: playCardSound, playError, playSuccess, playTurn } = useSound();

  // Auth
  const { user, login, logout, isAuthenticated } = useAuth();

  // Sync user with player name
  useEffect(() => {
    if (user && !playerName) {
      setPlayerName(user.name);
    }
  }, [user, playerName]);

  // Sync socket players with local state
  useEffect(() => {
    if (socketPlayers.length > 0 && view === 'lobby') {
      setPlayers(socketPlayers);
    }
  }, [socketPlayers, view]);

  // Handle game start via socket
  useEffect(() => {
    if (socketGameStarted && socketGameState && view === 'lobby') {
      setGameState(socketGameState);
      setView('game');
      showNotification('🎮 Partita iniziata!', 'success');
      resetGameStarted();
    }
  }, [socketGameStarted, socketGameState, view, resetGameStarted]);

  // Check for join parameter on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join');
      if (joinCode) {
        setRoomCode(joinCode);
        setIsPhoneMode(true);
      }
      
      // Check if device is likely a TV/big screen
      const isLargeScreen = window.innerWidth > 1024;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isLargeScreen && !isMobile) {
        // Could auto-enable TV mode here if desired
      }
    }
  }, []);

  const enableTVMode = useCallback(() => {
    setIsTVMode(true);
    setView('tv');
  }, []);

  const disableTVMode = useCallback(() => {
    setIsTVMode(false);
    setView('home');
  }, []);

  // Poll for room updates when in lobby
  useEffect(() => {
    if (view !== 'lobby' || !roomCode) return;
    
    const pollRoom = async () => {
      try {
        const res = await gameApi('getRoomStatus', { roomCode });
        if (res.success) {
          setPlayers(res.players);
          // Auto-start game if it was started by host
          if (res.isGameStarted && res.gameState) {
            setGameState(res.gameState);
            setView('game');
            showNotification('🎮 Partita iniziata!', 'success');
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    };

    const interval = setInterval(pollRoom, 2000);
    pollRoom();

    return () => clearInterval(interval);
  }, [view, roomCode, showNotification]);

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const startOcaGame = useCallback((playerName: string, vsCpu: boolean, numBots: number) => {
    const colors = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Viola', 'Rosa'];
    const newPlayers = [{
      id: 'player-1',
      name: playerName || 'Tu',
      position: 0,
      color: colors[0],
      isCpu: false
    }];
    
    if (vsCpu) {
      for (let i = 0; i < numBots; i++) {
        newPlayers.push({
          id: `cpu-${i + 1}`,
          name: ['Mario 🤖', 'Luigi 🤖', 'Wario 🤖', 'Waluigi 🤖', 'Peach 🤖'][i] || `CPU ${i + 1}`,
          position: 0,
          color: colors[i + 1],
          isCpu: true
        });
      }
    }
    
    setOcaPlayers(newPlayers);
    setView('giocooca');
  }, []);

  const handleOcaGameEnd = useCallback((winner: {id: string; name: string; position: number; color: string; isCpu: boolean}) => {
    showNotification(`🏆 ${winner.name} ha vinto!`, 'success');
    setTimeout(() => {
      setView('home');
      setOcaPlayers([]);
    }, 3000);
  }, [showNotification]);

  const exitOcaGame = useCallback(() => {
    setView('home');
    setOcaPlayers([]);
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
        const prevTurn = gameState?.currentTurn;
        setGameState(data.gameState);
        // Play turn sound when it's my turn
        if (data.gameState.currentTurn === playerId && prevTurn !== playerId) {
          playTurn();
        }
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
    if (!res.success) {
      setIsLoading(false);
      setError(res.error || 'Errore');
      return;
    }
    
    setRoomCode(res.roomCode);
    setGameType(game);
    setIsHost(true);
    setPlayers(res.players);
    
    // Join socket room for real-time updates
    socketJoinRoom(res.roomCode, playerId, playerName);
    
    // Auto-start for Gioco dell'Oca multiplayer
    if (game === 'giocodelloca') {
      const startRes = await gameApi('startGame', { roomCode: res.roomCode, playerId: res.playerId, gameType: game });
      setIsLoading(false);
      if (startRes.success) {
        setGameState(startRes.gameState);
        notifyGameStart(res.roomCode, startRes.gameState, res.players);
        setView('game');
        showNotification('🎮 Partita iniziata!', 'success');
      } else {
        setError(startRes.error || 'Errore');
      }
    } else {
      setIsLoading(false);
      setView('lobby');
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
      // Join socket room for real-time updates
      socketJoinRoom(roomCode, playerId, playerName);
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
      // Notify other players via socket
      notifyGameStart(roomCode, res.gameState, res.players || players);
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
    playCardSound();
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
  // HOME SCREEN - AMAZON LUNA STYLE
  // ============================================
  if (view === 'home') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 overflow-hidden relative">
        {/* Cinematic Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-50, 50],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          {/* Orb lights */}
          <motion.div
            className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.15, 1], x: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[800px] h-[800px] bg-cyan-600/20 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        {loadingOverlay}
        {notificationEl}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur text-white px-6 py-3 rounded-2xl z-50 cursor-pointer shadow-xl border border-red-400/50" onClick={() => setError('')}>
            ⚠️ {error}
          </motion.div>
        )}
        
        {/* Header - Netflix/Luna style */}
        <header className="relative z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-3xl">🎮</span>
              </motion.div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent tracking-tight">
                  PLAYGAME
                </h1>
                <p className="text-purple-300/80 text-xs font-medium tracking-widest">STREAMING PARTY</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              {/* Quick Join */}
              <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                <span className="text-gray-400 text-sm">Codice:</span>
                <input
                  type="text"
                  placeholder="XXXX"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-16 bg-transparent text-white font-mono text-center focus:outline-none"
                  maxLength={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                <span className="text-green-400 text-sm font-medium">LIVE</span>
              </div>

              {/* User Profile */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                  <div className="text-right hidden sm:block">
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-purple-300 text-xs">Profilo</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const name = prompt('Inserisci il tuo nome per continuare:');
                    if (name?.trim()) {
                      login(name.trim());
                      setPlayerName(name.trim());
                    }
                  }}
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium shadow-lg"
                >
                  Accedi
                </motion.button>
              )}
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Gioca{' '}
              <span className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Insieme
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              La piattaforma di party games per TV e mobile.{' '}
              <span className="text-cyan-400 font-medium">Connetti, Gioca, Divertiti!</span>
            </p>
          </motion.div>

          {/* Connection Modes - Luna Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12"
          >
            {/* TV Mode Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative bg-gradient-to-br from-purple-900/60 to-blue-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 cursor-pointer overflow-hidden"
              onClick={() => setView('tv')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <span className="text-4xl">📺</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Modalità TV</h3>
                  <p className="text-gray-400">Gioca sul grande schermo</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">CONSIGLIATO</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Phone Controller Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="group relative bg-gradient-to-br from-cyan-900/60 to-blue-900/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 cursor-pointer overflow-hidden"
              onClick={() => {
                setRoomCode('');
                setIsPhoneMode(true);
                showNotification('Usa questo dispositivo come controller!', 'info');
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                  <span className="text-4xl">📱</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Controller</h3>
                  <p className="text-gray-400"> usa il telefono come joystick</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">MULTIPLAYER</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Player Setup */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">👤 Il tuo nome</label>
                  <input
                    type="text"
                    placeholder="Nickname"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-lg"
                    maxLength={20}
                  />
                </div>
                
                {/* Game Mode */}
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">⚙️ Modalità</label>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVsCpu(false)}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        !vsCpu 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      👥 Multiplayer
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVsCpu(true)}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        vsCpu 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      🤖 CPU
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {vsCpu && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <label className="block text-purple-200 text-sm font-medium mb-3">Numero avversari</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map(n => (
                      <motion.button
                        key={n}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNumBots(n)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 ${
                          numBots === n 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Join Room Input */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <label className="block text-purple-200 text-sm font-medium mb-3">🔗 Entra in una stanza</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Codice (4 lettere)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    maxLength={4}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={joinRoom}
                    disabled={roomCode.length !== 4}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ENTRA
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Featured Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="relative bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-cyan-500/5" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-full mb-2">✨ NOVITÀ</span>
                  <h3 className="text-3xl font-bold text-white">Gioco dell'Oca</h3>
                  <p className="text-gray-300 mt-1">Il classico italiano - Multiplayer online!</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => createRoom('giocodelloca')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30"
                >
                  GIOCA ORA 🪿
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Section Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <h3 className="text-2xl font-bold text-white">Tutti i Giochi</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>

          {/* Games Grid - Premium Cards */}
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {GAMES.map((game, index) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  onHoverStart={() => setHoveredGame(game.id)}
                  onHoverEnd={() => setHoveredGame(null)}
                >
                  <motion.button
                    onClick={() => {
                      if ((game as any).isOca) {
                        if (roomCode && playerName) {
                          createRoom(game.id);
                        } else if (!vsCpu) {
                          showNotification('Inserisci un nome e scegli CPU o Multiplayer', 'info');
                        } else {
                          startOcaGame(playerName, vsCpu, numBots);
                        }
                      } else {
                        createRoom(game.id);
                      }
                    }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full overflow-hidden rounded-3xl shadow-xl transition-shadow duration-500 ${
                      hoveredGame === game.id ? 'shadow-2xl shadow-purple-500/40' : ''
                    }`}
                  >
                    {/* 3D Card Effect */}
                    <div className={`bg-gradient-to-br ${game.gradient} p-5 aspect-[4/3] flex flex-col items-center justify-center relative`}>
                      {/* Animated Glow */}
                      {hoveredGame === game.id && (
                        <motion.div
                          className="absolute inset-0 bg-white/30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      {/* Floating Emoji */}
                      <motion.div
                        className="text-6xl md:text-7xl mb-2 relative z-10"
                        animate={hoveredGame === game.id ? { 
                          scale: [1, 1.15, 1], 
                          rotate: [0, 8, -8, 0],
                          y: [0, -8, 0]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        {game.emoji}
                      </motion.div>
                      
                      {/* Title */}
                      <h3 className="text-white font-bold text-lg md:text-xl relative z-10">{game.name}</h3>
                      <p className="text-white/70 text-xs md:text-sm mt-1 relative z-10">{game.subtitle}</p>

                      {/* Hot Badge */}
                      {(game as any).hot && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-3 right-3"
                        >
                          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            🔥 HOT
                          </span>
                        </motion.div>
                      )}
                      
                      {/* New Badge */}
                      {(game as any).isOca && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 left-3"
                        >
                          <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                            NUOVO
                          </span>
                        </motion.div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <motion.div
                        className="absolute bottom-3 right-3"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: hoveredGame === game.id ? 1 : 0, scale: hoveredGame === game.id ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <span className="text-xl">▶</span>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md px-4 py-3 flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                        <span>👥</span> {game.players}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/60 text-xs">
                        <span>⏱️</span> {game.time}
                      </span>
                    </div>
                    
                    {/* Hover Glow Border */}
                    <div className={`absolute inset-0 rounded-3xl border-2 transition-opacity duration-300 ${
                      hoveredGame === game.id ? 'opacity-100 border-white/30' : 'opacity-0'
                    }`} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-8 text-center">
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm mb-4">
            <a href="#" className="hover:text-white transition-colors">Assistenza</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Termini</a>
          </div>
          <p className="text-gray-600 text-sm">© 2024 Playgame • Streaming Party Games</p>
        </footer>
      </main>
    );
  }

  // ============================================
  // GIOCO DELL'OCA
  // ============================================
  if (view === 'giocooca') {
    return (
      <GiocoOca
        players={ocaPlayers}
        onGameEnd={handleOcaGameEnd}
        onExit={exitOcaGame}
      />
    );
  }

  // ============================================
  // PHONE CONTROLLER MODE
  // ============================================
  if (view === 'phone' || isPhoneMode) {
    return (
      <PhoneController
        roomCode={roomCode}
        playerName={playerName}
        playerId={playerId}
        isHost={false}
        onConnected={() => {
          // After connecting, show a simplified lobby
          setView('lobby');
        }}
      />
    );
  }

  // ============================================
  // TV MODE
  // ============================================
  if (view === 'tv') {
    return (
      <TVMode
        roomCode={roomCode}
        gameType={gameType}
        players={players}
        gameState={gameState}
        playerId={playerId}
        playerName={playerName}
        onExit={disableTVMode}
        onGameStart={(gs) => {
          setGameState(gs);
          setView('game');
          showNotification('🎮 Partita iniziata!', 'success');
        }}
        onPlayersUpdate={(updatedPlayers) => {
          setPlayers(updatedPlayers);
        }}
      />
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
          <div className="flex flex-col gap-3">
            {/* TV Mode Button - Show as big feature */}
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={enableTVMode}
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
              >
                📺 Modalità TV - Mostra su Schermo Grande
              </motion.button>
            )}
            
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
                  className={`flex-1 py-3 bg-gradient-to-r ${game.gradient} text-white font-bold rounded-xl hover:opacity-90 transition-opacity`}
                >
                  🚀 INIZIA
                </button>
              )}
            </div>
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
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 flex flex-col items-center justify-center p-4">
          {notificationEl}
          {opponentActionEl}
          
          {/* Room Code */}
          <div className="absolute top-4 bg-black/40 px-4 py-1 rounded-full">
            <span className="text-cyan-300 font-mono text-lg">{roomCode}</span>
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2">FORZA 4</h1>
          <p className="text-gray-400 mb-6">🔴 Connetterai 4 in fila!</p>
          
          {isGameOver ? (
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-8xl mb-6"
              >
                {winner === playerId ? '🎉' : '😢'}
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
              </h2>
              <button
                onClick={() => { setView('home'); setGameState(null); setForza4Board(Array(6).fill(null).map(() => Array(7).fill(0))); }}
                className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl text-xl shadow-xl shadow-green-500/30"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-full text-white font-bold text-xl mb-6 shadow-xl shadow-green-500/30"
                >
                  🎯 Tocca a te!
                </motion.div>
              )}
              
              {/* Board - Premium Style */}
              <div className="bg-gradient-to-b from-blue-600 to-blue-800 p-6 rounded-3xl shadow-2xl border-4 border-blue-500/30">
                {/* Column Buttons */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {board[0].map((_, colIndex) => (
                    <motion.button
                      key={`col-${colIndex}`}
                      whileHover={isMyTurn ? { scale: 1.1 } : {}}
                      whileTap={isMyTurn ? { scale: 0.9 } : {}}
                      onClick={() => isMyTurn && playForza4(colIndex)}
                      disabled={!isMyTurn}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl transition-all flex items-center justify-center ${
                        isMyTurn ? 'hover:bg-blue-400/50 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span className="text-3xl opacity-50">⬆️</span>
                    </motion.button>
                  ))}
                </div>
                
                {/* Game Grid */}
                <div className="grid grid-cols-7 gap-3">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 md:w-16 md:h-16 bg-blue-900/80 rounded-2xl flex items-center justify-center shadow-inner"
                      >
                        {cell === 1 && (
                          <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg border-2 border-red-300/30"
                          />
                        )}
                        {cell === 2 && (
                          <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg border-2 border-yellow-200/30"
                          />
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Players */}
              <div className="flex gap-4 mt-8">
                {(gameState.players as any[])?.map((p: any, i: number) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl ${
                      gameState.currentTurn === p.id 
                        ? 'bg-white/20 ring-2 ring-cyan-400 shadow-lg shadow-cyan-400/20' 
                        : 'bg-black/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${i === 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}></div>
                    <div>
                      <div className="text-white font-bold">{p.name}</div>
                      <div className="text-xs text-gray-400">{i === 0 ? '🔴' : '🟡'}</div>
                    </div>
                    {p.isCpu && <span className="text-lg">🤖</span>}
                  </motion.div>
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
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-6 text-lg shadow-lg shadow-green-500/30"
                >
                  🎯 È il tuo turno!
                </motion.div>
              )}
              
              {/* Center area with premium cards */}
              <div className="flex gap-12 items-center mb-8">
                {/* Draw pile */}
                <UNODeck
                  remaining={gameState.deck?.length || 0}
                  onDraw={() => isMyTurn && drawCard()}
                  disabled={!isMyTurn}
                />
                
                {/* Discard pile */}
                <div className="flex flex-col items-center gap-2">
                  <DiscardPile
                    topCard={topCard}
                    currentColor={currentColor}
                  />
                </div>
              </div>
              
              {/* Current color indicator */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="px-6 py-3 rounded-2xl text-white font-bold mb-6 text-lg shadow-lg"
                style={{
                  background: UNO_COLORS[currentColor]?.bg
                }}
              >
                Colore Attuale: {currentColor?.toUpperCase()}
              </motion.div>
              
              {/* My cards with premium design */}
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 max-w-4xl w-full border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-300 font-semibold">Le tue carte</p>
                  <span className="bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                    {myCards.length} carte
                  </span>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {myCards.map((card, i) => {
                    const canPlay = canPlayCard(card);
                    const cardType = card.value === '🚫' ? 'skip' :
                                    card.value === '🔄' ? 'reverse' :
                                    card.value === '+2' ? 'draw2' :
                                    card.value === '🎨' ? 'wild' :
                                    card.value === '+4' ? 'wild4' : 'number';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <UNOCard
                          value={card.value}
                          color={card.color as any}
                          type={cardType as any}
                          onClick={() => canPlay && playCard(card.id)}
                          disabled={!canPlay}
                          selected={canPlay}
                          size="lg"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              
              {/* Other players */}
              <div className="mt-6 bg-black/30 backdrop-blur-xl rounded-2xl p-4 w-full max-w-md border border-white/10">
                <h3 className="text-white font-semibold mb-3">Giocatori</h3>
                <div className="space-y-2">
                  {(gameState.players as any[])?.map((p: any, i: number) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                        gameState.currentTurn === p.id 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30' 
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          i === 0 ? 'from-red-500 to-orange-500' :
                          i === 1 ? 'from-blue-500 to-cyan-500' :
                          i === 2 ? 'from-green-500 to-emerald-500' :
                          'from-purple-500 to-pink-500'
                        } flex items-center justify-center text-white font-bold text-sm`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">{p.name} {p.isCpu && '🤖'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{p.hand?.length || 0}</span>
                        {gameState.currentTurn === p.id && (
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

    // INDOVINA CHI GAME
    if (gameType === 'indovinachi') {
      const isMyTurn = gameState.currentTurn === playerId;
      const phase = gameState.phase as string;
      const winner = gameState.winner as string | null;
      const myCharacterId = gameState.myCharacter as number | null;
      const secretCharacterId = gameState.secretCharacter as number | null;
      const eliminatedCharacters = (gameState.eliminatedCharacters as number[]) || [];
      const currentQuestion = gameState.currentQuestion as string || '';
      const answer = gameState.lastAnswer as boolean | null;
      const canGuess = isMyTurn && phase === 'guessing';
      const myCharacter = CHARACTERS.find(c => c.id === myCharacterId) || null;
      const secretCharacter = CHARACTERS.find(c => c.id === secretCharacterId) || null;

      const handleAskQuestion = async (attribute: string, value: string) => {
        const res = await gameApi('askQuestion', { roomCode, playerId, attribute, value });
        if (res.success) {
          setGameState(res.gameState);
        }
      };

      const handleGuess = async (characterId: number) => {
        const res = await gameApi('guessCharacter', { roomCode, playerId, characterId });
        if (res.success) {
          setGameState(res.gameState);
          if (res.winner) {
            showNotification(res.winner === playerId ? '🏆 Hai indovinato!' : '😢 Non era quello giusto!', res.winner === playerId ? 'success' : 'error');
          }
        }
      };

      return (
        <IndovinaChi
          characters={CHARACTERS}
          secretCharacter={secretCharacter}
          eliminatedCharacters={eliminatedCharacters}
          onAskQuestion={handleAskQuestion}
          onGuess={handleGuess}
          isMyTurn={isMyTurn}
          currentQuestion={currentQuestion}
          answer={answer}
          canGuess={canGuess}
          winner={winner === playerId ? 'you' : winner ? 'opponent' : null}
          myCharacter={myCharacter}
        />
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
      const categories = ['Nome', 'Città', 'Animale', 'Frutto', 'Lavoro', 'Fiore'];
      
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

    // GIOCO DELL'OCA
    if (gameType === 'giocodelloca') {
      const ocaPlayers = gameState.players as any[];
      const lastDice = gameState.lastDiceResult as number | null;
      const lastAction = gameState.lastAction as { playerId: string; message: string } | null;
      const winner = gameState.winner as string | null;
      const isGameOver = gameState.phase === 'gameOver';

      return (
        <main className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800/20 to-amber-900 flex flex-col items-center p-2 sm:p-4">
          {notificationEl}
          {opponentActionEl}
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🪿 Gioco dell'Oca</h1>
          
          {/* Room Code */}
          <div className="bg-black/40 px-4 py-1 rounded-full mb-3">
            <span className="text-amber-300 font-mono text-lg">{roomCode}</span>
          </div>

          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {winner === playerId ? 'HAI VINTO!' : `${ocaPlayers?.find(p => p.id === winner)?.name} ha vinto!`}
              </h2>
              <button
                onClick={() => { setView('home'); setGameState(null); setRoomCode(''); }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {/* Turn indicator */}
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno! Tirare il dado
                </div>
              )}

              {/* Last action */}
              {lastAction && (
                <div className="bg-black/50 px-4 py-2 rounded-xl mb-3 text-center max-w-md">
                  <p className="text-white text-sm">{lastAction.message}</p>
                </div>
              )}

              {/* Dice button with animation */}
              {isMyTurn && (
                <motion.button
                  animate={isRolling ? { rotate: [0, 360, 720] } : {}}
                  transition={isRolling ? { duration: 0.5, repeat: 2 } : {}}
                  onClick={async () => {
                    setIsRolling(true);
                    setDiceResult(null);
                    playDice();
                    // Animate dice rolling
                    const interval = setInterval(() => {
                      setDiceResult(Math.floor(Math.random() * 6) + 1);
                    }, 100);
                    
                    setTimeout(async () => {
                      clearInterval(interval);
                      const res = await gameApi('rollDice', { roomCode, playerId });
                      setIsRolling(false);
                      if (res.success) {
                        setDiceResult(res.lastDiceResult);
                        setGameState(res.gameState);
                        if (res.winner) {
                          res.winner === playerId ? playWin() : playLose();
                          showNotification(res.winner === playerId ? '🎉 HAI VINTO!' : '😢 Hai perso!', res.winner === playerId ? 'success' : 'error');
                        } else if (res.skipped) {
                          showNotification('⏭️ Salti il turno!', 'info');
                        }
                      } else {
                        setDiceResult(null);
                        playError();
                        showNotification(res.error || 'Errore', 'error');
                      }
                    }, 1000);
                  }}
                  className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform mb-4 flex flex-col items-center justify-center"
                >
                  {isRolling ? (
                    <div className="text-5xl">🎲</div>
                  ) : diceResult ? (
                    <div className="text-5xl">{diceResult}</div>
                  ) : (
                    <div className="text-5xl">🎲</div>
                  )}
                  <span className="text-xs mt-1">{isRolling ? 'Tirando...' : 'TIRA!'}</span>
                </motion.button>
              )}

              {/* Players positions */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {ocaPlayers?.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      gameState.currentTurn === p.id ? 'bg-white/30 ring-2 ring-amber-400' : 'bg-black/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${PLAYER_COLORS[idx % PLAYER_COLORS.length].bg} flex items-center justify-center text-white font-bold text-sm`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{p.name}</div>
                      <div className="text-amber-300 text-xs">Casella {p.position}</div>
                    </div>
                    {p.isCpu && <span className="text-xs bg-blue-500/50 px-1 rounded text-white">CPU</span>}
                  </div>
                ))}
              </div>

              {/* Visual Board */}
              <div className="bg-gradient-to-br from-amber-800/50 to-orange-900/50 rounded-3xl p-4 border-2 border-amber-500/30">
                <div className="text-center text-amber-200 text-sm mb-2 font-semibold">🎯 Obiettivo: Casella 63 🏆</div>
                
                {/* Gioco dell'Oca Board - Spiral Layout */}
                <div className="relative">
                  {/* Board grid - 9x9 outer, center empty for decoration */}
                  <div className="grid grid-cols-9 gap-1">
                    {[
                      // Row 1 (top) - right to left: 63, 62, 61, 60, 59, 58, 57, 56, 55
                      [63, 62, 61, 60, 59, 58, 57, 56, 55],
                      // Row 2
                      [46, 47, 48, 49, 50, 51, 52, 53, 54],
                      // Row 3
                      [45, 44, 43, 42, 41, 40, 39, 38, 37],
                      // Row 4
                      [28, 29, 30, 31, 32, 33, 34, 35, 36],
                      // Row 5
                      [27, 26, 25, 24, 23, 22, 21, 20, 19],
                      // Row 6
                      [10, 11, 12, 13, 14, 15, 16, 17, 18],
                      // Row 7
                      [9, 8, 7, 6, 5, 4, 3, 2, 1],
                    ].map((row, rowIdx) => (
                      row.map((num, colIdx) => {
                        const playersHere = ocaPlayers?.filter(p => p.position === num) || [];
                        const isSpecial = [6, 9, 18, 27, 36, 45, 54, 63].includes(num);
                        const isBridge = num === 6 || num === 12 || num === 20 || num === 42;
                        const isDeath = num === 58;
                        
                        return (
                          <div
                            key={num}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center text-xs relative ${
                              num === 1 ? 'bg-green-500/80 ring-2 ring-green-300' :
                              num === 63 ? 'bg-yellow-500/80 ring-2 ring-yellow-300' :
                              isDeath ? 'bg-red-900/80 ring-2 ring-red-500' :
                              isBridge ? 'bg-blue-600/60' :
                              isSpecial ? 'bg-amber-600/60' :
                              'bg-amber-900/40'
                            }`}
                          >
                            <span className={`font-bold ${num === 1 || num === 63 ? 'text-white' : 'text-amber-200/70'}`}>
                              {num}
                            </span>
                            {/* Player tokens */}
                            {playersHere.map((p, pIdx) => (
                              <div
                                key={p.id}
                                className={`absolute w-4 h-4 rounded-full border border-white shadow-lg ${
                                  PLAYER_COLORS[ocaPlayers?.indexOf(p) % PLAYER_COLORS.length]?.bg || 'bg-gray-500'
                                }`}
                                style={{
                                  left: pIdx === 0 ? '1px' : pIdx === 1 ? '50%' : 'auto',
                                  right: pIdx === 2 ? '1px' : 'auto',
                                  transform: pIdx > 1 ? 'scale(0.7)' : 'none',
                                }}
                              />
                            ))}
                            {/* Special icons */}
                            {num === 6 && <span className="absolute -top-1 -right-1 text-[8px]">🌉</span>}
                            {num === 9 && <span className="absolute -top-1 -right-1 text-[8px]]">🪿</span>}
                            {num === 58 && <span className="absolute -top-1 -right-1 text-[8px]">💀</span>}
                          </div>
                        );
                      })
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <button onClick={() => { setView('home'); setGameState(null); setRoomCode(''); }} className="mt-4 text-white/60">
            ← Esci
          </button>
        </main>
      );
    }

    // MEMORY GAME
    if (gameType === 'memory') {
      const memoryState = gameState as any;
      const cards = memoryState?.cards || [];
      const isGameOver = memoryState?.phase === 'gameOver';
      const winner = memoryState?.winner;

      return (
        <main className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800/20 to-emerald-900 flex flex-col items-center p-2 sm:p-4">
          {notificationEl}
          {opponentActionEl}
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🧠 Memory</h1>
          
          <div className="bg-black/40 px-4 py-1 rounded-full mb-3">
            <span className="text-emerald-300 font-mono text-lg">{roomCode}</span>
          </div>

          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {winner === playerId ? 'HAI VINTO!' : winner === 'draw' ? 'Pareggio!' : `${memoryState.players?.find((p: any) => p.id === winner)?.name} ha vinto!`}
              </h2>
              <p className="text-white mb-4">Mosse totali: {memoryState.moves}</p>
              <button
                onClick={() => { setView('home'); setGameState(null); setRoomCode(''); }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno! Scegli una carta
                </div>
              )}

              <div className="text-white mb-2">
                Mosse: {memoryState.moves} | Il tuo punteggio: {memoryState.scores?.[playerId] || 0}
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm sm:max-w-md">
                {cards.map((card: any) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (isMyTurn && !card.isFlipped && !card.isMatched && memoryState.flippedCards.length < 2) {
                        playCard();
                        gameApi('playMemory', { roomCode, playerId, cardId: card.id }).then((res) => {
                          if (res.success) {
                            setGameState(res.gameState);
                            playFlip();
                          }
                        });
                      }
                    }}
                    disabled={!isMyTurn || card.isFlipped || card.isMatched || memoryState.flippedCards.length >= 2}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl text-3xl sm:text-4xl flex items-center justify-center transition-all ${
                      card.isFlipped || card.isMatched
                        ? 'bg-white rotate-0'
                        : 'bg-gradient-to-br from-emerald-600 to-teal-700 rotate-y-180'
                    } ${!isMyTurn || card.isFlipped || card.isMatched ? '' : 'hover:scale-105 active:scale-95'}`}
                  >
                    {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setView('home'); setGameState(null); }}
                className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
              >
                ← Esci
              </button>
            </>
          )}
        </main>
      );
    }

    // TOMBOLA GAME
    if (gameType === 'tombola') {
      const tombolaState = gameState as any;
      const extractedNumbers = tombolaState?.extractedNumbers || [];
      const currentNumber = tombolaState?.currentNumber;
      const isGameOver = tombolaState?.phase === 'gameOver';
      const winner = tombolaState?.winner;
      const myPlayer = tombolaState?.players?.find((p: any) => p.id === playerId);
      const myCartella = myPlayer?.cartella || [];
      const myMatched = myPlayer?.matchedNumbers || [];

      return (
        <main className="min-h-screen bg-gradient-to-br from-red-900 via-green-800/20 to-red-900 flex flex-col items-center p-2 sm:p-4">
          {notificationEl}
          {opponentActionEl}
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎱 Tombola</h1>
          
          <div className="bg-black/40 px-4 py-1 rounded-full mb-3">
            <span className="text-red-300 font-mono text-lg">{roomCode}</span>
          </div>

          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {winner === playerId ? 'HAI VINTO!' : winner === 'draw' ? 'Pareggio!' : `${tombolaState.players?.find((p: any) => p.id === winner)?.name} ha vinto!`}
              </h2>
              <button
                onClick={() => { setView('home'); setGameState(null); setRoomCode(''); }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno! Estrai un numero
                </div>
              )}

              {currentNumber && (
                <div className="bg-white rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-4 shadow-2xl">
                  <span className="text-5xl sm:text-6xl font-bold text-red-600">{currentNumber}</span>
                </div>
              )}

              {isMyTurn && (
                <button
                  onClick={() => {
                    playDice();
                    gameApi('drawTombolaNumber', { roomCode, playerId }).then((res) => {
                      if (res.success) {
                        setGameState(res.gameState);
                        playDice();
                      }
                    });
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-green-500 text-white font-bold rounded-2xl mb-4"
                >
                  🎲 Estrai Numero
                </button>
              )}

              <div className="text-white mb-2">Numeri estratti: {extractedNumbers.length}/90</div>

              <div className="flex flex-wrap gap-1 justify-center max-w-xs sm:max-w-md mb-4">
                {extractedNumbers.slice(-15).map((n: number) => (
                  <span key={n} className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {n}
                  </span>
                ))}
              </div>

              <div className="text-white text-sm mb-2">La tua cartella:</div>
              <div className="bg-white rounded-lg p-2 sm:p-3 max-w-sm">
                {myCartella.map((row: number[], rowIdx: number) => (
                  <div key={rowIdx} className="flex justify-center gap-1 mb-1">
                    {row.map((num: number | null, colIdx: number) => (
                      <div
                        key={colIdx}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm font-bold rounded ${
                          num === null ? 'bg-gray-200' : myMatched.includes(num) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {num || ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setView('home'); setGameState(null); }}
                className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
              >
                ← Esci
              </button>
            </>
          )}
        </main>
      );
    }

    // TRIS GAME
    if (gameType === 'tris') {
      const trisState = gameState as any;
      const board = trisState?.board || [];
      const isGameOver = trisState?.phase === 'gameOver';
      const winner = trisState?.winner;
      const playerSymbol = trisState?.players?.findIndex((p: any) => p.id === playerId) === 0 ? 'X' : 'O';

      return (
        <main className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800/20 to-blue-900 flex flex-col items-center p-2 sm:p-4">
          {notificationEl}
          {opponentActionEl}
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">❌⭕ Tris</h1>
          
          <div className="bg-black/40 px-4 py-1 rounded-full mb-3">
            <span className="text-blue-300 font-mono text-lg">{roomCode}</span>
          </div>

          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {winner === playerId ? 'HAI VINTO!' : winner === 'draw' ? 'Pareggio!' : `${trisState.players?.find((p: any) => p.id === winner)?.name} ha vinto!`}
              </h2>
              <button
                onClick={() => { setView('home'); setGameState(null); setRoomCode(''); }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
              >
                🏠 Nuova Partita
              </button>
            </div>
          ) : (
            <>
              {isMyTurn && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
                  🎯 È il tuo turno! Tocca a te (sei {playerSymbol})
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                {board.map((row: (string | null)[], rowIdx: number) =>
                  row.map((cell: string | null, colIdx: number) => (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => {
                        if (isMyTurn && cell === null) {
                          playCard();
                          gameApi('playTris', { roomCode, playerId, row: rowIdx, col: colIdx }).then((res) => {
                            if (res.success) {
                              setGameState(res.gameState);
                              playFlip();
                            }
                          });
                        }
                      }}
                      disabled={!isMyTurn || cell !== null}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-5xl sm:text-6xl font-bold flex items-center justify-center transition-all ${
                        cell === null 
                          ? 'bg-white/20 hover:bg-white/30' 
                          : cell === 'X' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-red-500 text-white'
                      }`}
                    >
                      {cell || ''}
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => { setView('home'); setGameState(null); }}
                className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
              >
                ← Esci
              </button>
            </>
          )}
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
