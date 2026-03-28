const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('createRoom', (data) => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms.set(code, {
      code,
      gameType: data.gameType,
      players: [{ id: socket.id, name: data.playerName, isHost: true, score: 0 }],
      hostId: socket.id,
      gameState: null
    });
    socket.join(code);
    socket.emit('roomCreated', { roomCode: code, gameType: data.gameType });
    io.to(code).emit('playerList', rooms.get(code).players);
    console.log('Room created:', code);
  });
  
  socket.on('joinRoom', (data) => {
    const room = rooms.get(data.roomCode.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    room.players.push({ id: socket.id, name: data.playerName, isHost: false, score: 0 });
    socket.join(data.roomCode.toUpperCase());
    socket.emit('roomJoined', { gameType: room.gameType });
    io.to(data.roomCode.toUpperCase()).emit('playerList', room.players);
    console.log('Player joined:', data.playerName);
  });
  
  socket.on('startGame', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    
    // Create basic game state
    room.gameState = {
      phase: 'playing',
      currentTurn: room.players[0].id,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        hand: [],
        score: 0
      }))
    };
    
    // Deal cards based on game type
    if (room.gameType === 'briscola') {
      const suits = ['♠️', '♣️', '♥️', '♦️'];
      const values = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
      const deck = [];
      for (const s of suits) {
        for (const v of values) {
          deck.push({ suit: s, value: v, id: s+v, points: v === 'A' ? 11 : v === '3' ? 10 : v === 'K' ? 4 : v === 'Q' ? 3 : v === 'J' ? 2 : 0 });
        }
      }
      // Shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      room.gameState.briscolaSuit = deck[deck.length - 1].suit;
      room.gameState.deck = deck;
      room.gameState.currentTrick = [];
      room.gameState.players.forEach(p => {
        p.hand = deck.splice(0, 3);
      });
    }
    
    if (room.gameType === 'uno') {
      const colors = ['red', 'blue', 'green', 'yellow'];
      const deck = [];
      for (const c of colors) {
        deck.push({ color: c, value: '0', id: c+'-0', type: 'number' });
        for (let i = 1; i <= 9; i++) {
          deck.push({ color: c, value: String(i), id: c+'-'+i+'-a', type: 'number' });
          deck.push({ color: c, value: String(i), id: c+'-'+i+'-b', type: 'number' });
        }
        for (const s of ['🚫', '⇄', '+2']) {
          deck.push({ color: c, value: s, id: c+'-'+s+'-a', type: 'special' });
          deck.push({ color: c, value: s, id: c+'-'+s+'-b', type: 'special' });
        }
      }
      for (let i = 0; i < 4; i++) {
        deck.push({ color: 'black', value: '🎨', id: 'wild-'+i, type: 'wild' });
        deck.push({ color: 'black', value: '+4', id: 'wild4-'+i, type: 'wild' });
      }
      // Shuffle
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      const startCard = deck.pop();
      room.gameState.deck = deck;
      room.gameState.discardPile = [startCard];
      room.gameState.currentColor = startCard.color;
      room.gameState.direction = 1;
      room.gameState.players.forEach(p => {
        p.hand = deck.splice(0, 7);
      });
    }
    
    if (room.gameType === 'indovinachi') {
      room.gameState.phase = 'selecting';
      room.gameState.players.forEach(p => {
        p.secretCharacter = -1;
        p.eliminatedCharacters = [];
      });
    }
    
    if (room.gameType === 'mercante') {
      const prizes = [
        { id: 1, name: 'Villa', value: 1000, emoji: '🏰' },
        { id: 2, name: 'Yacht', value: 800, emoji: '🛥️' },
        { id: 3, name: 'Auto', value: 600, emoji: '🏎️' },
        { id: 4, name: 'Viaggio', value: 500, emoji: '🌍' },
        { id: 5, name: 'Oro', value: 400, emoji: '🥇' },
      ];
      room.gameState.players.forEach(p => {
        p.money = 1000;
        p.cards = [];
        p.prizes = [];
      });
      room.gameState.currentCard = prizes.shift();
      room.gameState.currentBid = 100;
      room.gameState.phase = 'buying';
    }
    
    if (room.gameType === 'jokinghazard') {
      const panels = [
        { text: '😂 Ride fino alle lacrime', emoji: '😂' },
        { text: '💀 Muore dal ridere', emoji: '💀' },
        { text: '🔥 Tutto prende fuoco', emoji: '🔥' },
        { text: '🎯 Colpo di fulmine', emoji: '🎯' },
      ];
      room.gameState.players.forEach(p => {
        p.hand = panels.slice();
        p.playedPunchline = null;
      });
      room.gameState.currentJudge = room.players[0].id;
      room.gameState.setup = { text: '👨 "Oggi è una bella giornata!"' };
      room.gameState.middle = { text: '🌧️ *Piove a dirotto*' };
      room.gameState.phase = 'playing';
      room.gameState.currentRound = 1;
    }
    
    io.to(data.roomCode).emit('gameStarted', { gameState: room.gameState });
    
    room.gameState.players.forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s && p.hand) {
        s.emit('yourCards', { cards: p.hand });
      }
    });
    
    console.log('Game started:', room.gameType);
  });
  
  // Game events
  socket.on('playBriscolaCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;
    const cardIndex = player.hand.findIndex(c => c.id === data.cardId);
    if (cardIndex === -1) return;
    const card = player.hand.splice(cardIndex, 1)[0];
    room.gameState.currentTrick.push({ playerId: socket.id, card });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    room.gameState.players.forEach(p => {
      const s = io.sockets.sockets.get(p.id);
      if (s) s.emit('yourCards', { cards: p.hand });
    });
  });
  
  socket.on('playUnoCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;
    const cardIndex = player.hand.findIndex(c => c.id === data.cardId);
    if (cardIndex === -1) return;
    const card = player.hand.splice(cardIndex, 1)[0];
    if (data.chosenColor) card.color = data.chosenColor;
    room.gameState.discardPile.push(card);
    room.gameState.currentColor = card.color;
    
    // Next player
    const currentIdx = room.gameState.players.findIndex(p => p.id === socket.id);
    const nextIdx = (currentIdx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length;
    room.gameState.currentTurn = room.gameState.players[nextIdx].id;
    
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    io.to(data.roomCode).emit('cardPlayed', { playerId: socket.id, card });
    const s = io.sockets.sockets.get(socket.id);
    if (s) s.emit('yourCards', { cards: player.hand });
  });
  
  socket.on('drawUnoCard', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.deck.length === 0) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;
    const card = room.gameState.deck.pop();
    player.hand.push(card);
    
    const currentIdx = room.gameState.players.findIndex(p => p.id === socket.id);
    const nextIdx = (currentIdx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length;
    room.gameState.currentTurn = room.gameState.players[nextIdx].id;
    
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    const s = io.sockets.sockets.get(socket.id);
    if (s) {
      s.emit('yourCards', { cards: player.hand });
      s.emit('cardDrawn', { card });
    }
  });
  
  socket.on('selectCharacter', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (player) {
      player.secretCharacter = data.characterId;
      socket.emit('secretCharacter', { characterId: data.characterId });
      if (room.gameState.players.every(p => p.secretCharacter !== -1)) {
        room.gameState.phase = 'playing';
        io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
        io.to(data.roomCode).emit('allCharactersSelected');
      }
    }
  });
  
  socket.on('askQuestion', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const target = room.gameState.players.find(p => p.id === data.targetPlayerId);
    if (target && target.secretCharacter !== -1) {
      const chars = [
        { id: 1, name: 'Marco', glasses: false, hat: false, beard: true, hair: 'castani' },
        { id: 2, name: 'Laura', glasses: true, hat: false, beard: false, hair: 'biondi' },
        { id: 3, name: 'Giuseppe', glasses: true, hat: true, beard: true, hair: 'bianchi' },
        { id: 4, name: 'Sofia', glasses: false, hat: false, beard: false, hair: 'neri' },
      ];
      const char = chars.find(c => c.id === target.secretCharacter) || chars[0];
      const q = data.question.toLowerCase();
      let answer = false;
      if (q.includes('occhiali')) answer = char.glasses;
      else if (q.includes('cappello')) answer = char.hat;
      else if (q.includes('barba')) answer = char.beard;
      else answer = Math.random() > 0.5;
      
      io.to(data.roomCode).emit('questionAsked', {
        question: data.question,
        answer,
        askedBy: socket.id,
        askedTo: data.targetPlayerId
      });
    }
  });
  
  socket.on('placeBid', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    room.gameState.currentBid = data.amount;
    room.gameState.highestBidder = socket.id;
    io.to(data.roomCode).emit('bidUpdate', { bid: data.amount, playerId: socket.id });
    io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
  });
  
  socket.on('passBid', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const winner = room.gameState.players.find(p => p.id === room.gameState.highestBidder);
    if (winner && room.gameState.currentCard) {
      winner.cards.push(room.gameState.currentCard);
      winner.money -= room.gameState.currentBid;
      room.gameState.phase = 'extraction';
      io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
    }
  });
  
  socket.on('playPunchline', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const player = room.gameState.players.find(p => p.id === socket.id);
    if (player && player.hand[data.cardIndex]) {
      player.playedPunchline = player.hand.splice(data.cardIndex, 1)[0];
      const s = io.sockets.sockets.get(socket.id);
      if (s) s.emit('yourCards', { cards: player.hand });
      io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
      
      const allPlayed = room.gameState.players
        .filter(p => p.id !== room.gameState.currentJudge)
        .every(p => p.playedPunchline);
      
      if (allPlayed) {
        io.to(data.roomCode).emit('judgingPhase', {
          submissions: room.gameState.players
            .filter(p => p.id !== room.gameState.currentJudge && p.playedPunchline)
            .map(p => ({ playerId: p.id, playerName: p.name, card: p.playedPunchline }))
        });
      }
    }
  });
  
  socket.on('judgeSelect', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;
    const winner = room.gameState.players.find(p => p.id === data.selectedPlayerId);
    if (winner) {
      winner.score = (winner.score || 0) + 1;
      io.to(data.roomCode).emit('roundWinner', { winnerId: data.selectedPlayerId, winnerName: winner.name });
      
      if (winner.score >= 5) {
        room.gameState.phase = 'gameOver';
        io.to(data.roomCode).emit('gameOver', { winner: data.selectedPlayerId });
      } else {
        // Next round
        room.gameState.players.forEach(p => p.playedPunchline = null);
        const currentIdx = room.gameState.players.findIndex(p => p.id === room.gameState.currentJudge);
        room.gameState.currentJudge = room.gameState.players[(currentIdx + 1) % room.gameState.players.length].id;
        room.gameState.currentRound++;
        io.to(data.roomCode).emit('gameStateUpdate', room.gameState);
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          io.to(code).emit('playerList', room.players);
        }
      }
    });
  });
});

const PORT = 3003;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('🎮 Game WebSocket Server running on port', PORT);
});
