import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Simple in-memory storage
const rooms = new Map();
const CHARACTERS = [
  { id: 1, name: 'Marco', emoji: '👨', hair: 'castani', glasses: false, hat: false, beard: true },
  { id: 2, name: 'Laura', emoji: '👩', hair: 'biondi', glasses: true, hat: false, beard: false },
  { id: 3, name: 'Giuseppe', emoji: '👴', hair: 'bianchi', glasses: true, hat: true, beard: true },
  { id: 4, name: 'Sofia', emoji: '👧', hair: 'neri', glasses: false, hat: false, beard: false },
  { id: 5, name: 'Antonio', emoji: '🧔', hair: 'neri', glasses: false, hat: false, beard: true },
  { id: 6, name: 'Elena', emoji: '👩‍🦰', hair: 'rossi', glasses: true, hat: false, beard: false },
  { id: 7, name: 'Luca', emoji: '🧑', hair: 'castani', glasses: false, hat: true, beard: false },
  { id: 8, name: 'Maria', emoji: '👵', hair: 'bianchi', glasses: true, hat: true, beard: false },
  { id: 9, name: 'Pietro', emoji: '👨‍🦱', hair: 'neri', glasses: false, hat: false, beard: false },
  { id: 10, name: 'Anna', emoji: '👩‍🦱', hair: 'castani', glasses: false, hat: true, beard: false },
  { id: 11, name: 'Roberto', emoji: '🧓', hair: 'biondi', glasses: true, hat: false, beard: true },
  { id: 12, name: 'Giulia', emoji: '👱‍♀️', hair: 'biondi', glasses: false, hat: false, beard: false },
];

const BRISCOLA_SUITS = ['♠️', '♣️', '♥️', '♦️'];
const BRISCOLA_VALUES = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
const BRISCOLA_POINTS: Record<string, number> = { 'A': 11, '3': 10, 'K': 4, 'Q': 3, 'J': 2 };

function shuffle(arr: any[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBriscolaDeck() {
  const deck: any[] = [];
  for (const suit of BRISCOLA_SUITS) {
    for (const value of BRISCOLA_VALUES) {
      deck.push({ suit, value, points: BRISCOLA_POINTS[value] || 0, id: `${suit}${value}` });
    }
  }
  return shuffle(deck);
}

function createUnoDeck() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const deck: any[] = [];
  for (const color of colors) {
    deck.push({ color, value: '0', id: `${color}-0`, type: 'number' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: String(i), id: `${color}-${i}a`, type: 'number' });
      deck.push({ color, value: String(i), id: `${color}-${i}b`, type: 'number' });
    }
    for (const s of ['🚫', '⇄', '+2']) {
      deck.push({ color, value: s, id: `${color}-${s}a`, type: 'special' });
      deck.push({ color, value: s, id: `${color}-${s}b`, type: 'special' });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'black', value: '🎨', id: `wild${i}`, type: 'wild' });
    deck.push({ color: 'black', value: '+4', id: `wild4${i}`, type: 'wild' });
  }
  return shuffle(deck);
}

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  socket.on('createRoom', (data: { gameType: string; playerName: string }) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms.set(code, {
      code,
      gameType: data.gameType,
      players: [{ id: socket.id, name: data.playerName, isHost: true, score: 0 }],
      gameState: null,
      hostId: socket.id
    });
    socket.join(code);
    socket.emit('roomCreated', { roomCode: code, gameType: data.gameType });
    io.to(code).emit('playerList', rooms.get(code).players);
  });

  socket.on('joinRoom', (data: { roomCode: string; playerName: string }) => {
    const room = rooms.get(data.roomCode.toUpperCase());
    if (!room) return socket.emit('error', { message: 'Stanza non trovata!' });
    room.players.push({ id: socket.id, name: data.playerName, isHost: false, score: 0 });
    socket.join(data.roomCode.toUpperCase());
    socket.emit('roomJoined', { gameType: room.gameType });
    io.to(data.roomCode.toUpperCase()).emit('playerList', room.players);
  });

  socket.on('startGame', (data: { roomCode: string }) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;

    const players = room.players;
    
    switch (room.gameType) {
      case 'briscola': {
        const deck = createBriscolaDeck();
        const briscolaSuit = deck[deck.length - 1].suit;
        room.gameState = {
          phase: 'playing',
          briscolaSuit,
          currentTurn: players[0].id,
          deck,
          players: players.map(p => ({ ...p, hand: deck.splice(0, 3), points: 0 })),
          currentTrick: []
        };
        break;
      }
      case 'uno': {
        let deck = createUnoDeck();
        let startCard = deck.pop()!;
        while (startCard.type === 'wild') {
          deck.unshift(startCard);
          deck = shuffle(deck);
          startCard = deck.pop()!;
        }
        room.gameState = {
          phase: 'playing',
          currentTurn: players[0].id,
          direction: 1,
          deck,
          discardPile: [startCard],
          players: players.map(p => ({ ...p, hand: deck.splice(0, 7), calledUno: false })),
          currentColor: startCard.color,
          mustDraw: 0
        };
        break;
      }
      case 'indovinachi': {
        room.gameState = {
          phase: 'selecting',
          currentTurn: players[0].id,
          players: players.map(p => ({ id: p.id, name: p.name, secretCharacter: -1, eliminated: [] }))
        };
        break;
      }
      case 'mercante': {
        const prizes = shuffle([
          { id: 1, name: 'Villa', value: 1000, emoji: '🏰' },
          { id: 2, name: 'Yacht', value: 800, emoji: '🛥️' },
          { id: 3, name: 'Auto', value: 600, emoji: '🏎️' },
          { id: 4, name: 'Viaggio', value: 500, emoji: '🌍' },
          { id: 5, name: 'Oro', value: 400, emoji: '🥇' },
        ]);
        room.gameState = {
          phase: 'buying',
          round: 1,
          currentCard: prizes.pop(),
          currentBid: 100,
          highestBidder: null,
          players: players.map(p => ({ id: p.id, name: p.name, money: 1000, cards: [], prizes: [] })),
          remainingCards: prizes,
          passedPlayers: []
        };
        break;
      }
      case 'jokinghazard': {
        const panels = [
          { text: '👨 "Che bella giornata!"', emoji: '😊' },
          { text: '🌧️ "Piove!"', emoji: '🌧️' },
          { text: '😂 *Ride*', emoji: '😂' },
          { text: '💀 *Shock*', emoji: '💀' },
          { text: '🔥 *Brucia*', emoji: '🔥' },
        ];
        room.gameState = {
          phase: 'playing',
          currentJudge: players[0].id,
          setup: panels[0],
          middle: panels[1],
          players: players.map(p => ({ ...p, hand: shuffle(panels).slice(0, 3), score: 0, played: null })),
          round: 1
        };
        break;
      }
    }

    io.to(data.roomCode).emit('gameStarted', { gameState: room.gameState });
    room.players.forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s && room.gameState.players) {
        const pd = room.gameState.players.find((x: any) => x.id === p.id);
        if (pd?.hand) s.emit('yourCards', { cards: pd.hand });
      }
    });
  });

  // Game events
  socket.on('playBriscolaCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player) return;
    const card = player.hand.find((c: any) => c.id === data.cardId);
    if (!card) return;
    
    player.hand = player.hand.filter((c: any) => c.id !== data.cardId);
    room.gameState.currentTrick.push({ playerId: socket.id, card });
    
    if (room.gameState.currentTrick.length === room.gameState.players.length) {
      // Resolve trick
      const lead = room.gameState.currentTrick[0].card.suit;
      let winner = room.gameState.currentTrick[0];
      for (const play of room.gameState.currentTrick) {
        if (play.card.suit === room.gameState.briscolaSuit && winner.card.suit !== room.gameState.briscolaSuit) {
          winner = play;
        } else if (play.card.suit === lead && winner.card.suit !== room.gameState.briscolaSuit) {
          if (BRISCOLA_VALUES.indexOf(play.card.value) > BRISCOLA_VALUES.indexOf(winner.card.value)) {
            winner = play;
          }
        }
      }
      const wp = room.gameState.players.find((p: any) => p.id === winner.playerId);
      if (wp) wp.points += room.gameState.currentTrick.reduce((s: number, p: any) => s + p.card.points, 0);
      room.gameState.currentTrick = [];
      room.gameState.currentTurn = winner.playerId;
    } else {
      const idx = room.gameState.players.findIndex((p: any) => p.id === socket.id);
      room.gameState.currentTurn = room.gameState.players[(idx + 1) % room.gameState.players.length].id;
    }
    
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('playUnoCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.currentTurn !== socket.id) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player) return;
    const card = player.hand.find((c: any) => c.id === data.cardId);
    if (!card) return;
    const top = room.gameState.discardPile.slice(-1)[0];
    
    if (card.type !== 'wild' && card.color !== room.gameState.currentColor && card.value !== top.value) return;
    
    player.hand = player.hand.filter((c: any) => c.id !== data.cardId);
    room.gameState.discardPile.push(card);
    room.gameState.currentColor = data.chosenColor || card.color;
    
    if (player.hand.length === 0) {
      room.gameState.phase = 'gameOver';
      io.to(data.roomCode).emit('gameOver', { winner: socket.id });
    } else {
      const idx = room.gameState.players.findIndex((p: any) => p.id === socket.id);
      room.gameState.currentTurn = room.gameState.players[(idx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length].id;
    }
    
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    socket.emit('yourCards', { cards: player.hand });
  });

  socket.on('drawUnoCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.currentTurn !== socket.id) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player || room.gameState.deck.length === 0) return;
    
    const card = room.gameState.deck.pop()!;
    player.hand.push(card);
    
    const idx = room.gameState.players.findIndex((p: any) => p.id === socket.id);
    room.gameState.currentTurn = room.gameState.players[(idx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length].id;
    
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    socket.emit('yourCards', { cards: player.hand });
  });

  socket.on('selectCharacter', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (player) player.secretCharacter = data.characterId;
    socket.emit('secretCharacter', { characterId: data.characterId });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('askQuestion', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const target = room.gameState.players.find((p: any) => p.id === data.targetPlayerId);
    if (!target || target.secretCharacter === -1) return;
    
    const char = CHARACTERS.find(c => c.id === target.secretCharacter);
    let answer = false;
    const q = data.question.toLowerCase();
    if (q.includes('occhiali')) answer = char?.glasses || false;
    else if (q.includes('cappello')) answer = char?.hat || false;
    else if (q.includes('barba')) answer = char?.beard || false;
    else if (q.includes('biondi')) answer = char?.hair === 'biondi';
    else if (q.includes('neri')) answer = char?.hair === 'neri';
    else if (q.includes('bianchi')) answer = char?.hair === 'bianchi';
    else answer = Math.random() > 0.5;
    
    io.to(data.roomCode).emit('questionAsked', { question: data.question, answer, askedBy: socket.id, askedTo: data.targetPlayerId });
  });

  socket.on('placeBid', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player || player.money < data.amount || data.amount <= room.gameState.currentBid) return;
    room.gameState.currentBid = data.amount;
    room.gameState.highestBidder = socket.id;
    room.gameState.passedPlayers = room.gameState.passedPlayers.filter((id: string) => id !== socket.id);
    io.to(data.roomCode).emit('bidUpdate', { bid: data.amount, playerId: socket.id, playerName: player.name });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('passBid', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    room.gameState.passedPlayers.push(socket.id);
    
    if (room.gameState.passedPlayers.length >= room.gameState.players.length - 1 && room.gameState.highestBidder) {
      const winner = room.gameState.players.find((p: any) => p.id === room.gameState.highestBidder);
      if (winner) {
        winner.money -= room.gameState.currentBid;
        winner.cards.push(room.gameState.currentCard);
      }
      room.gameState.phase = 'extraction';
    }
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('playPunchline', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.currentJudge === socket.id) return;
    const player = room.gameState.players.find((p: any) => p.id === socket.id);
    if (!player || data.cardIndex >= player.hand.length) return;
    
    player.played = player.hand[data.cardIndex];
    player.hand.splice(data.cardIndex, 1);
    
    socket.emit('yourCards', { cards: player.hand });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('judgeSelect', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.currentJudge !== socket.id) return;
    const winner = room.gameState.players.find((p: any) => p.id === data.selectedPlayerId);
    if (winner) winner.score += 1;
    io.to(data.roomCode).emit('roundWinner', { winnerId: data.selectedPlayerId, winnerName: winner?.name });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected:', socket.id);
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex((p: any) => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.players.length === 0) rooms.delete(code);
        else io.to(code).emit('playerList', room.players);
      }
    });
  });
});

const PORT = 3003;
httpServer.listen(PORT, () => console.log(`🎮 WS Server on port ${PORT}`));
