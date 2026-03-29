'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const roomRef = useRef<string>('');
  const playerIdRef = useRef<string>('');

  useEffect(() => {
    if (!socket) {
      socket = io({
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
      });
    }

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('player-left', (data) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });

    socket.on('room-state', (data) => {
      setPlayers(data.players);
    });

    socket.on('game-started', (data) => {
      setGameStarted(true);
      setGameState(data.gameState);
    });

    socket.on('game-updated', (data) => {
      setGameState(data.gameState);
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
