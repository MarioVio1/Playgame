'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

let socket: any = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const roomRef = useRef<string>('');
  const playerIdRef = useRef<string>('');
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return;
    isInitialized.current = true;

    import('socket.io-client').then(({ io }) => {
      if (!socket) {
        try {
          socket = io({
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            reconnection: false,
          });

          socket.on('connect', () => {
            setIsConnected(true);
          });

          socket.on('disconnect', () => {
            setIsConnected(false);
          });

          socket.on('player-joined', (data: any) => {
            setPlayers(data.players);
          });

          socket.on('player-left', (data: any) => {
            setPlayers((prev: any[]) => prev.filter((p: any) => p.id !== data.playerId));
          });

          socket.on('room-state', (data: any) => {
            setPlayers(data.players);
          });

          socket.on('game-started', (data: any) => {
            setGameStarted(true);
            setGameState(data.gameState);
          });

          socket.on('game-updated', (data: any) => {
            setGameState(data.gameState);
          });
        } catch (e) {
          console.log('Socket.io not available');
        }
      }
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('room-state');
        socket.off('game-started');
        socket.off('game-updated');
      }
    };
  }, []);

  const joinRoom = useCallback((roomCode: string, playerId: string, playerName: string) => {
    if (socket) {
      roomRef.current = roomCode;
      playerIdRef.current = playerId;
      socket.emit('join-room', { roomCode, playerId, playerName });
    }
  }, []);

  const leaveRoom = useCallback((roomCode: string, playerId: string) => {
    if (socket) {
      socket.emit('leave-room', { roomCode, playerId });
      roomRef.current = '';
      playerIdRef.current = '';
      setPlayers([]);
      setGameStarted(false);
      setGameState(null);
    }
  }, []);

  const notifyGameStart = useCallback((roomCode: string, gameState: any, players: any[]) => {
    if (socket) {
      socket.emit('start-game', { roomCode, gameState, players });
    }
  }, []);

  const notifyGameUpdate = useCallback((roomCode: string, gameState: any) => {
    if (socket) {
      socket.emit('game-update', { roomCode, gameState });
    }
  }, []);

  const resetGameStarted = useCallback(() => {
    setGameStarted(false);
    setGameState(null);
  }, []);

  return {
    isConnected,
    players,
    gameStarted,
    gameState,
    joinRoom,
    leaveRoom,
    notifyGameStart,
    notifyGameUpdate,
    resetGameStarted,
  };
}
