import { NextRequest, NextResponse } from 'next/server';

// GameHub Multiplayer - In-memory game state (v2)
const rooms = new Map<string, any>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffle(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// AI Names
const AI_NAMES = ['Bot Mario', 'Bot Luigi', 'Bot Peach', 'Bot Toad', 'Bot Yoshi'];

// Italian deck for Mercante in Fiera (40 cards)
function createMercanteDeck() {
  const suits = [
    { suit: 'denari', emoji: '🪙' },
    { suit: 'coppe', emoji: '🏆' },
    { suit: 'spade', emoji: '⚔️' },
    { suit: 'bastoni', emoji: '🪵' },
  ];
  const values = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
  
  const deck: any[] = [];
  for (const s of suits) {
    for (const v of values) {
      deck.push({ 
        suit: s.emoji, 
        suitName: s.suit,
        value: v, 
        id: `${s.suit}-${v}`,
        points: v === 'A' ? 1 : (v === '3' ? 3 : (v === 'K' ? 4 : (v === 'Q' ? 5 : (v === 'J' ? 6 : parseInt(v) || 0))))
      });
    }
  }
  return shuffle(deck);
}

// Scopa deck - Italian 40-card deck (same suits as Briscola but different values)
function createScopaDeck() {
  const suits = [
    { suit: 'denari', emoji: '🪙' },
    { suit: 'coppe', emoji: '🏆' },
    { suit: 'spade', emoji: '⚔️' },
    { suit: 'bastoni', emoji: '🪵' },
  ];
  // Card values: A=1, 2-7=face value, J=8, Q=9, K=10
  const valueMappings: { value: string; numValue: number }[] = [
    { value: 'A', numValue: 1 },
    { value: '2', numValue: 2 },
    { value: '3', numValue: 3 },
    { value: '4', numValue: 4 },
    { value: '5', numValue: 5 },
    { value: '6', numValue: 6 },
    { value: '7', numValue: 7 },
    { value: 'J', numValue: 8 },
    { value: 'Q', numValue: 9 },
    { value: 'K', numValue: 10 },
  ];
  
  const deck: any[] = [];
  for (const s of suits) {
    for (const v of valueMappings) {
      deck.push({ 
        suit: s.emoji, 
        suitName: s.suit,
        value: v.value, 
        id: `${s.suit}-${v.value}`, 
        numValue: v.numValue,
        isDenari: s.suit === 'denari'
      });
    }
  }
  return shuffle(deck);
}

// Helper: Find all possible capture combinations for a card value
function findCaptureCombinations(tableCards: any[], targetValue: number): any[][] {
  const results: any[][] = [];
  
  // First check for exact value matches (single card)
  for (const card of tableCards) {
    if (card.numValue === targetValue) {
      results.push([card]);
    }
  }
  
  // Then check for sum combinations (2 or more cards)
  if (targetValue > 1) {
    const findSums = (cards: any[], target: number, current: any[], start: number) => {
      if (target === 0 && current.length >= 2) {
        results.push([...current]);
        return;
      }
      if (target < 0 || start >= cards.length) return;
      
      for (let i = start; i < cards.length; i++) {
        // Skip if this card's value is the same as target (already handled by direct match)
        if (cards[i].numValue === targetValue) continue;
        findSums(cards, target - cards[i].numValue, [...current, cards[i]], i + 1);
      }
    };
    
    findSums(tableCards, targetValue, [], 0);
  }
  
  return results;
}

// Helper: Calculate Primiera score
// Primiera is calculated from the best card in each suit collected by a player
// Card values for primiera: 7=21, 6=18, A=16, 5=15, 4=14, 3=13, 2=12, K=10, Q=10, J=10
function calculatePrimieraScore(collectedCards: any[]): number {
  const primieraValues: Record<string, number> = {
    '7': 21, '6': 18, 'A': 16, '5': 15, '4': 14, '3': 13, '2': 12,
    'K': 10, 'Q': 10, 'J': 10
  };
  
  const suits = ['denari', 'coppe', 'spade', 'bastoni'];
  let totalScore = 0;
  
  for (const suit of suits) {
    const suitCards = collectedCards.filter(c => c.suitName === suit);
    if (suitCards.length > 0) {
      // Find the card with highest primiera value in this suit
      let bestValue = 0;
      for (const card of suitCards) {
        const primieraVal = primieraValues[card.value] || 0;
        if (primieraVal > bestValue) bestValue = primieraVal;
      }
      totalScore += bestValue;
    }
  }
  
  return totalScore;
}

// Helper: Calculate final scores for Scopa
function calculateScopaScores(room: any) {
  const state = room.gameState;
  const scores: { playerId: string; points: number; details: string[] }[] = [];
  
  for (const player of state.players) {
    const collected = player.collectedCards || [];
    const details: string[] = []
    let points = 0;
    
    // Carte (Most cards) - 1 point
    details.push(`Carte: ${collected.length} carte raccolte`);
    
    // Denari (Most denari) - 1 point
    const denariCount = collected.filter((c: any) => c.suitName === 'denari').length;
    details.push(`Denari: ${denariCount} denari`);
    
    // Settebello (7 of denari) - 1 point
    const hasSettebello = collected.some((c: any) => c.suitName === 'denari' && c.value === '7');
    details.push(`Settebello: ${hasSettebello ? 'Sì' : 'No'}`);
    
    // Scopas - 1 point each
    const scopaCount = player.scopas || 0;
    details.push(`Scopa: ${scopaCount} scopa${scopaCount !== 1 ? 'e' : ''}`);
    
    scores.push({
      playerId: player.id,
      points,
      details
    });
  }
  
  // Compare and award points
  const player1Collected = state.players[0]?.collectedCards || [];
  const player2Collected = state.players[1]?.collectedCards || [];
  
  // Most cards (Carte)
  if (player1Collected.length > player2Collected.length) {
    scores[0].points += 1;
    scores[0].details[0] += ' ✓ +1 punto';
  } else if (player2Collected.length > player1Collected.length) {
    scores[1].points += 1;
    scores[1].details[0] += ' ✓ +1 punto';
  }
  
  // Most denari
  const p1Denari = player1Collected.filter((c: any) => c.suitName === 'denari').length;
  const p2Denari = player2Collected.filter((c: any) => c.suitName === 'denari').length;
  if (p1Denari > p2Denari) {
    scores[0].points += 1;
    scores[0].details[1] += ' ✓ +1 punto';
  } else if (p2Denari > p1Denari) {
    scores[1].points += 1;
    scores[1].details[1] += ' ✓ +1 punto';
  }
  
  // Settebello
  for (let i = 0; i < state.players.length; i++) {
    const hasSettebello = (i === 0 ? player1Collected : player2Collected)
      .some((c: any) => c.suitName === 'denari' && c.value === '7');
    if (hasSettebello) {
      scores[i].points += 1;
      scores[i].details[2] += ' ✓ +1 punto';
    }
  }
  
  // Scopas
  for (let i = 0; i < state.players.length; i++) {
    const scopaCount = state.players[i]?.scopas || 0;
    scores[i].points += scopaCount;
    if (scopaCount > 0) {
      scores[i].details[3] += ` ✓ +${scopaCount} punti`;
    }
  }
  
  // Primiera (complex scoring)
  const p1Primiera = calculatePrimieraScore(player1Collected);
  const p2Primiera = calculatePrimieraScore(player2Collected);
  
  scores[0].details.push(`Primiera: ${p1Primiera} punti`);
  scores[1].details.push(`Primiera: ${p2Primiera} punti`);
  
  if (p1Primiera > p2Primiera) {
    scores[0].points += 1;
    scores[0].details[4] += ' ✓ +1 punto';
  } else if (p2Primiera > p1Primiera) {
    scores[1].points += 1;
    scores[1].details[4] += ' ✓ +1 punto';
  }
  
  return scores;
}

// CPU Logic for Scopa
function cpuPlayScopa(room: any) {
  const state = room.gameState;
  const currentPlayer = state.players.find((p: any) => p.id === state.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  if (!currentPlayer.hand?.length) {
    // No cards, check if game should end
    const nextIdx = (state.players.findIndex((p: any) => p.id === state.currentTurn) + 1) % state.players.length;
    state.currentTurn = state.players[nextIdx].id;
    return true;
  }
  
  const tableCards = state.tableCards || [];
  
  // Analyze possible plays
  interface PlayOption {
    card: any;
    capture: any[] | null;
    score: number;
    isScopa: boolean;
    denariCaptured: number;
  }
  
  const playOptions: PlayOption[] = [];
  
  for (const card of currentPlayer.hand) {
    const captures = findCaptureCombinations(tableCards, card.numValue);
    
    if (captures.length > 0) {
      // Evaluate each capture option
      for (const capture of captures) {
        const denariCaptured = capture.filter(c => c.suitName === 'denari').length;
        const isScopa = tableCards.length === capture.length;
        const hasHighValueCards = capture.some(c => c.value === '7' || c.value === 'A' || c.value === 'K');
        
        // Score this play
        let score = 10 + capture.length; // Base score for capturing
        if (isScopa) score += 100; // High priority for scopa
        if (denariCaptured > 0) score += 20 * denariCaptured; // Bonus for denari
        if (card.suitName === 'denari' && card.value === '7') score -= 50; // Avoid playing settebello
        if (hasHighValueCards) score += 15; // Bonus for valuable cards
        
        playOptions.push({
          card,
          capture,
          score,
          isScopa,
          denariCaptured
        });
      }
    } else {
      // No capture possible - evaluate playing this card
      let score = 0;
      
      // Avoid giving opponent good captures
      const cardValue = card.numValue;
      const remainingTableSum = tableCards.reduce((sum: number, c: any) => sum + c.numValue, 0);
      
      // Lower score for cards that might help opponent
      if (tableCards.some((c: any) => c.numValue === cardValue)) {
        score -= 10; // Avoid playing matching values
      }
      
      // Prefer playing lower value cards
      score -= cardValue;
      
      // Avoid playing valuable denari
      if (card.suitName === 'denari') {
        score -= 30;
        if (card.value === '7') score -= 50; // Never play settebello if possible
      }
      
      playOptions.push({
        card,
        capture: null,
        score,
        isScopa: false,
        denariCaptured: 0
      });
    }
  }
  
  // Sort by score and pick best
  playOptions.sort((a, b) => b.score - a.score);
  const bestPlay = playOptions[0];
  
  // Execute the play
  const cardIndex = currentPlayer.hand.findIndex((c: any) => c.id === bestPlay.card.id);
  const playedCard = currentPlayer.hand.splice(cardIndex, 1)[0];
  
  if (bestPlay.capture) {
    // Perform capture
    currentPlayer.collectedCards = currentPlayer.collectedCards || [];
    currentPlayer.collectedCards.push(playedCard);
    
    for (const capturedCard of bestPlay.capture) {
      const tableIdx = tableCards.findIndex((c: any) => c.id === capturedCard.id);
      if (tableIdx !== -1) {
        const captured = tableCards.splice(tableIdx, 1)[0];
        currentPlayer.collectedCards.push(captured);
      }
    }
    
    // Check for scopa
    if (bestPlay.isScopa) {
      currentPlayer.scopas = (currentPlayer.scopas || 0) + 1;
      state.lastAction = {
        playerId: currentPlayer.id,
        message: `${currentPlayer.name} fa SCOPA! 🎉`
      };
    } else {
      state.lastAction = {
        playerId: currentPlayer.id,
        message: `${currentPlayer.name} cattura ${bestPlay.capture.length + 1} carte con ${playedCard.suit}${playedCard.value}`
      };
    }
  } else {
    // Just play the card to table
    tableCards.push(playedCard);
    state.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} gioca ${playedCard.suit}${playedCard.value}`
    };
  }
  
  // Deal new cards if needed
  const allHandsEmpty = state.players.every((p: any) => p.hand.length === 0);
  if (allHandsEmpty && state.deck.length > 0) {
    for (const p of state.players) {
      for (let i = 0; i < 3; i++) {
        if (state.deck.length > 0) {
          p.hand.push(state.deck.pop());
        }
      }
    }
  }
  
  // Check for game end
  if (state.players.every((p: any) => p.hand.length === 0) && state.deck.length === 0) {
    // Give remaining table cards to last player who captured
    const lastCapturer = state.lastCapturer || state.players[0].id;
    const lastPlayer = state.players.find((p: any) => p.id === lastCapturer);
    if (lastPlayer && tableCards.length > 0) {
      lastPlayer.collectedCards = lastPlayer.collectedCards || [];
      lastPlayer.collectedCards.push(...tableCards);
      tableCards.length = 0;
    }
    
    state.phase = 'gameOver';
    const finalScores = calculateScopaScores(room);
    state.finalScores = finalScores;
    
    const maxPoints = Math.max(...finalScores.map((s: any) => s.points));
    state.winner = finalScores.find((s: any) => s.points === maxPoints)?.playerId;
    
    return true;
  }
  
  // Next player's turn
  const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
  const nextIdx = (currentIdx + 1) % state.players.length;
  state.currentTurn = state.players[nextIdx].id;
  
  return true;
}

// Briscola deck
function createBriscolaDeck() {
  const suits = [
    { suit: 'denari', emoji: '🪙' },
    { suit: 'coppe', emoji: '🏆' },
    { suit: 'spade', emoji: '⚔️' },
    { suit: 'bastoni', emoji: '🪵' },
  ];
  const values = [
    { value: 'A', points: 11 },
    { value: '2', points: 0 },
    { value: '3', points: 10 },
    { value: '4', points: 0 },
    { value: '5', points: 0 },
    { value: '6', points: 0 },
    { value: '7', points: 0 },
    { value: 'J', points: 2 },
    { value: 'Q', points: 3 },
    { value: 'K', points: 4 },
  ];
  
  const deck: any[] = [];
  for (const s of suits) {
    for (const v of values) {
      deck.push({ 
        suit: s.emoji, 
        suitName: s.suit,
        value: v.value, 
        id: `${s.suit}-${v.value}`, 
        points: v.points 
      });
    }
  }
  return shuffle(deck);
}

// UNO deck
function createUnoDeck() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const deck: any[] = [];
  
  for (const c of colors) {
    deck.push({ color: c, value: '0', id: `${c}-0`, type: 'number' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color: c, value: String(i), id: `${c}-${i}-a`, type: 'number' });
      deck.push({ color: c, value: String(i), id: `${c}-${i}-b`, type: 'number' });
    }
    for (const s of ['🚫', '⇄', '+2']) {
      deck.push({ color: c, value: s, id: `${c}-${s}-a`, type: 'special' });
      deck.push({ color: c, value: s, id: `${c}-${s}-b`, type: 'special' });
    }
  }
  
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'black', value: '🎨', id: `wild-${i}`, type: 'wild' });
    deck.push({ color: 'black', value: '+4', id: `wild4-${i}`, type: 'wild' });
  }
  
  return shuffle(deck);
}

// Joking Hazard panels
const JOKING_PANELS = [
  { id: 1, text: 'Un uomo entra in un bar', emoji: '🍺' },
  { id: 2, text: 'E ordina qualcosa di strano', emoji: '🤪' },
  { id: 3, text: 'Il barista lo guarda male', emoji: '😤' },
  { id: 4, text: 'Poi scoppia a ridere', emoji: '😂' },
  { id: 5, text: 'Tutti applaudono', emoji: '👏' },
  { id: 6, text: 'Arriva la polizia', emoji: '👮' },
  { id: 7, text: 'Qualcosa esplode', emoji: '💥' },
  { id: 8, text: 'Tutti scappano urlando', emoji: '😱' },
  { id: 9, text: 'Una nave aliena atterra', emoji: '🛸' },
  { id: 10, text: 'Gli alieni rapiscono tutti', emoji: '👾' },
  { id: 11, text: 'L\'uomo si rivela essere un robot', emoji: '🤖' },
  { id: 12, text: 'Il barista piange', emoji: '😢' },
  { id: 13, text: 'Qualcuno si innamora', emoji: '💕' },
  { id: 14, text: 'Il bar chiude per sempre', emoji: '🔒' },
  { id: 15, text: 'Tutti ballano', emoji: '💃' },
  { id: 16, text: 'Un cane entra nel bar', emoji: '🐕' },
  { id: 17, text: 'Il cane inizia a parlare', emoji: '🗣️' },
  { id: 18, text: 'Qualcuno si trasforma', emoji: '🦋' },
  { id: 19, text: 'È tutto un sogno', emoji: '💤' },
  { id: 20, text: 'Fine del mondo', emoji: '🌍' },
  { id: 21, text: 'L\'uomo chiede il conto', emoji: '🧾' },
  { id: 22, text: 'Il barista si arrabbia', emoji: '😡' },
  { id: 23, text: 'Una guerra scoppia', emoji: '⚔️' },
  { id: 24, text: 'Tutti fanno pace', emoji: '☮️' },
  { id: 25, text: 'Un bambino piange', emoji: '👶' },
  { id: 26, text: 'Il soffitto crolla', emoji: '🏗️' },
  { id: 27, text: 'Una magia succede', emoji: '✨' },
  { id: 28, text: 'L\'uomo rivela un segreto', emoji: '🤫' },
];

// CPU Logic for Briscola
function cpuPlayBriscola(room: any) {
  const state = room.gameState;
  const currentPlayer = state.players.find((p: any) => p.id === state.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  if (!currentPlayer.hand?.length) {
    const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
    const nextIdx = (currentIdx + 1) % state.players.length;
    state.currentTurn = state.players[nextIdx].id;
    return true;
  }
  
  const cardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
  const card = currentPlayer.hand.splice(cardIndex, 1)[0];
  
  state.currentTrick = state.currentTrick || [];
  state.currentTrick.push({ 
    playerId: currentPlayer.id, 
    card,
    playerName: currentPlayer.name 
  });
  
  // Track last action for animation
  state.lastAction = {
    playerId: currentPlayer.id,
    message: `${currentPlayer.name} gioca ${card.suit}${card.value}`
  };
  
  if (state.currentTrick.length === state.players.length) {
    const briscolaSuit = state.briscolaSuit;
    let winningPlay = state.currentTrick[0];
    
    for (const play of state.currentTrick) {
      const isBriscola = play.card.suit === briscolaSuit;
      const winningIsBriscola = winningPlay.card.suit === briscolaSuit;
      
      if (isBriscola && !winningIsBriscola) {
        winningPlay = play;
      } else if (play.card.suit === state.currentTrick[0].card.suit && !isBriscola) {
        const values = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
        if (values.indexOf(play.card.value) > values.indexOf(winningPlay.card.value)) {
          winningPlay = play;
        }
      }
    }
    
    const points = state.currentTrick.reduce((sum: number, p: any) => sum + (p.card.points || 0), 0);
    const winner = state.players.find((p: any) => p.id === winningPlay.playerId);
    if (winner) winner.points = (winner.points || 0) + points;
    
    state.currentTrick = [];
    state.currentTurn = winningPlay.playerId;
    
    // Deal new cards
    if (state.deck.length > 0 && winner?.hand.length < 3) {
      winner.hand.push(state.deck.pop());
    }
    for (const p of state.players) {
      if (p.id !== winner?.id && state.deck.length > 0 && p.hand.length < 3) {
        p.hand.push(state.deck.pop());
      }
    }
  } else {
    const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
    const nextIdx = (currentIdx + 1) % state.players.length;
    state.currentTurn = state.players[nextIdx].id;
  }
  
  if (state.players.every((p: any) => p.hand.length === 0) && state.deck.length === 0) {
    state.phase = 'gameOver';
    const maxPoints = Math.max(...state.players.map((p: any) => p.points || 0));
    state.winner = state.players.find((p: any) => p.points === maxPoints)?.id;
  }
  
  return true;
}

// CPU Logic for UNO
function cpuPlayUno(room: any) {
  const state = room.gameState;
  const currentPlayer = state.players.find((p: any) => p.id === state.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  
  const topCard = state.discardPile[state.discardPile.length - 1];
  
  let playableCard = currentPlayer.hand.find((c: any) => 
    c.type === 'wild' || c.color === state.currentColor || c.value === topCard.value
  );
  
  if (playableCard) {
    const cardIndex = currentPlayer.hand.findIndex((c: any) => c.id === playableCard.id);
    currentPlayer.hand.splice(cardIndex, 1);
    
    if (playableCard.type === 'wild') {
      const colorCounts: Record<string, number> = {};
      for (const c of currentPlayer.hand) {
        if (c.color !== 'black') {
          colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
        }
      }
      playableCard.color = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'red';
    }
    
    state.discardPile.push(playableCard);
    state.currentColor = playableCard.color;
    
    state.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} gioca ${playableCard.value} ${playableCard.color}`
    };
    
    if (playableCard.value === '⇄') {
      state.direction = state.direction * -1;
    }
    
    if (currentPlayer.hand.length === 0) {
      state.phase = 'gameOver';
      state.winner = currentPlayer.id;
      return true;
    }
  } else {
    if (state.deck.length > 0) {
      currentPlayer.hand.push(state.deck.pop());
      state.lastAction = {
        playerId: currentPlayer.id,
        message: `${currentPlayer.name} pesca una carta`
      };
    }
  }
  
  const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
  const nextIdx = (currentIdx + state.direction + state.players.length) % state.players.length;
  state.currentTurn = state.players[nextIdx].id;
  
  return true;
}

// CPU Logic for Indovina Chi
function cpuSelectCharacter(room: any) {
  const state = room.gameState;
  
  for (const player of state.players) {
    if (player.id.startsWith('cpu-') && player.secretCharacter === -1) {
      player.secretCharacter = Math.floor(Math.random() * 24) + 1;
    }
  }
  
  if (state.players.every((p: any) => p.secretCharacter !== -1)) {
    state.phase = 'playing';
    // Randomly decide who starts asking
    state.currentQuestioner = state.players.find((p: any) => p.id.startsWith('cpu-'))?.id || state.players[0].id;
  }
  
  return true;
}

function cpuAskQuestion(room: any) {
  const state = room.gameState;
  const cpuPlayer = state.players.find((p: any) => p.id === state.currentQuestioner && p.id.startsWith('cpu-'));
  
  if (!cpuPlayer) return false;
  
  // CPU asks a random question
  const questions = [
    { text: 'Ha gli occhiali? 👓', key: 'glasses' },
    { text: 'Ha il cappello? 🎩', key: 'hat' },
    { text: 'Ha la barba? 🧔', key: 'beard' },
    { text: 'Ha i capelli biondi? 💛', key: 'hair_biondi' },
    { text: 'Ha i capelli neri? 🖤', key: 'hair_neri' },
  ];
  
  const q = questions[Math.floor(Math.random() * questions.length)];
  state.currentQuestion = q.text;
  state.currentQuestionKey = q.key;
  state.waitingForAnswer = true;
  state.targetPlayerId = state.players.find((p: any) => !p.id.startsWith('cpu-'))?.id;
  
  return true;
}

// CPU Logic for Joking Hazard
function cpuPlayJokingHazard(room: any) {
  const state = room.gameState;
  
  for (const player of state.players) {
    if (player.id.startsWith('cpu-') && !player.playedPunchline && player.id !== state.currentJudge) {
      if (player.hand?.length) {
        const randomIndex = Math.floor(Math.random() * player.hand.length);
        player.playedPunchline = player.hand.splice(randomIndex, 1)[0];
        state.lastAction = {
          playerId: player.id,
          message: `${player.name} gioca una carta`
        };
      }
    }
  }
  
  const allPlayed = state.players
    .filter((p: any) => p.id !== state.currentJudge)
    .every((p: any) => p.playedPunchline);
    
  if (allPlayed && state.currentJudge?.startsWith('cpu-')) {
    const submissions = state.players.filter((p: any) => p.playedPunchline);
    const winner = submissions[Math.floor(Math.random() * submissions.length)];
    winner.score = (winner.score || 0) + 1;
    
    state.players.forEach((p: any) => p.playedPunchline = null);
    const currentIdx = state.players.findIndex((p: any) => p.id === state.currentJudge);
    state.currentJudge = state.players[(currentIdx + 1) % state.players.length].id;
    state.currentRound++;
    
    // Deal new cards
    state.players.forEach((p: any) => {
      while (p.hand.length < 7 && state.deck.length > 0) {
        p.hand.push(state.deck.pop());
      }
    });
    
    if (winner.score >= 5) {
      state.phase = 'gameOver';
      state.winner = winner.id;
    }
  }
  
  return true;
}

// CPU Logic for Mercante in Fiera - Auction Bidding
function cpuPlayMercante(room: any) {
  const state = room.gameState;
  
  if (state.phase === 'auction') {
    const currentBidder = state.players[state.currentAuction.currentPlayerIndex];
    
    if (!currentBidder?.id?.startsWith('cpu-')) return false;
    
    // Calculate card value estimate
    const cardNumber = state.currentAuction.cardNumber;
    const cardInDeck = state.deck.find((c: any) => c.number === cardNumber);
    
    // CPU bidding strategy:
    // - If has many cards, bid less aggressively
    // - If has few cards, bid more aggressively
    // - Random factor for unpredictability
    const myCardCount = state.deck.filter((c: any) => c.ownerId === currentBidder.id && !c.eliminated).length;
    const totalActiveCards = state.deck.filter((c: any) => !c.eliminated).length;
    
    // Base bid threshold based on how many cards we have
    let maxBid = currentBidder.money;
    if (myCardCount >= 3) {
      maxBid = Math.floor(currentBidder.money * 0.3); // Conservative
    } else if (myCardCount >= 1) {
      maxBid = Math.floor(currentBidder.money * 0.5); // Moderate
    } else {
      maxBid = Math.floor(currentBidder.money * 0.7); // Aggressive
    }
    
    // Add randomness
    const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    maxBid = Math.floor(maxBid * randomFactor);
    
    // Consider card position - lower numbers tend to survive longer
    if (cardNumber && cardNumber <= 20) {
      maxBid += 10; // Boost for lower numbers
    }
    
    const currentBid = state.currentAuction.highestBid;
    const minBid = currentBid + 1;
    
    // Decision: pass or bid
    const shouldPass = minBid > maxBid || Math.random() < 0.3; // 30% random pass
    
    if (shouldPass) {
      // Pass - count passes
      state.currentAuction.passCount = (state.currentAuction.passCount || 0) + 1;
      state.lastAction = {
        playerId: currentBidder.id,
        message: `${currentBidder.name} passa`
      };
      
      // Check if everyone passed (auction ends)
      const totalPlayers = state.players.length;
      if (state.currentAuction.passCount >= totalPlayers - 1 && state.currentAuction.highestBidderId) {
        // Winner gets the card
        const winnerId = state.currentAuction.highestBidderId;
        const winner = state.players.find((p: any) => p.id === winnerId);
        const winningBid = state.currentAuction.highestBid;
        
        if (winner && cardInDeck) {
          winner.money -= winningBid;
          cardInDeck.ownerId = winnerId;
          winner.cards.push(cardInDeck);
          
          state.lastAction = {
            playerId: winner.id,
            message: `${winner.name} vince la carta ${cardNumber} per ${winningBid}€!`
          };
        }
        
        // Reset for next auction or move to playing phase
        state.auctionCardsSold = (state.auctionCardsSold || 0) + 1;
        
        // Check if we should continue auctions or move to playing
        const totalOwnedCards = state.deck.filter((c: any) => c.ownerId !== null).length;
        if (totalOwnedCards >= 20 || state.auctionCardsSold >= 20) {
          // Move to playing phase
          state.phase = 'playing';
          state.currentExtraction = {
            roundNumber: 1,
            cardsToEliminate: [],
            revealedCards: [],
            currentRevealIndex: 0,
            eliminatedCard: null,
            suspenseActive: false
          };
        } else {
          // Start next auction - pick next unowned card
          const unownedCards = state.deck.filter((c: any) => c.ownerId === null);
          if (unownedCards.length > 0) {
            const nextCard = unownedCards[0];
            state.currentAuction = {
              cardId: nextCard.id,
              cardNumber: nextCard.number,
              highestBid: 0,
              highestBidderId: null,
              currentPlayerIndex: 0,
              passCount: 0
            };
          }
        }
      } else {
        // Move to next player
        state.currentAuction.currentPlayerIndex = (state.currentAuction.currentPlayerIndex + 1) % state.players.length;
      }
    } else {
      // Bid
      const bidAmount = Math.min(minBid + Math.floor(Math.random() * 10), maxBid);
      
      state.currentAuction.highestBid = bidAmount;
      state.currentAuction.highestBidderId = currentBidder.id;
      state.currentAuction.passCount = 0; // Reset pass count
      
      state.lastAction = {
        playerId: currentBidder.id,
        message: `${currentBidder.name} offre ${bidAmount}€`
      };
      
      // Move to next player
      state.currentAuction.currentPlayerIndex = (state.currentAuction.currentPlayerIndex + 1) % state.players.length;
    }
    
    return true;
  }
  
  if (state.phase === 'playing') {
    // CPU observes the elimination - no action needed
    return false;
  }
  
  return false;
}

// CPU Logic for Dama (Checkers)
function cpuPlayDama(room: any) {
  const state = room.gameState;
  const currentPlayer = state.players.find((p: any) => p.id === state.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  
  const board = state.board;
  const cpuColor = 'black'; // CPU plays black (top)
  
  // Find all possible moves
  const possibleMoves: { from: { x: number, y: number }, to: { x: number, y: number }, isCapture: boolean }[] = [];
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && (piece === cpuColor || piece === `${cpuColor}-king`)) {
        const isKing = piece === `${cpuColor}-king`;
        const directions = isKing ? [-1, 1] : [1]; // Kings can move both directions
        
        for (const dy of directions) {
          for (const dx of [-1, 1]) {
            const newY = y + dy;
            const newX = x + dx;
            
            // Simple move
            if (newY >= 0 && newY < 8 && newX >= 0 && newX < 8 && !board[newY][newX]) {
              possibleMoves.push({ from: { x, y }, to: { x: newX, y: newY }, isCapture: false });
            }
            
            // Capture move
            const jumpY = y + dy * 2;
            const jumpX = x + dx * 2;
            if (jumpY >= 0 && jumpY < 8 && jumpX >= 0 && jumpX < 8 && !board[jumpY][jumpX]) {
              const midPiece = board[newY][newX];
              if (midPiece && midPiece !== cpuColor && midPiece !== `${cpuColor}-king`) {
                possibleMoves.push({ from: { x, y }, to: { x: jumpX, y: jumpY }, isCapture: true });
              }
            }
          }
        }
      }
    }
  }
  
  // Prioritize captures
  const captures = possibleMoves.filter(m => m.isCapture);
  const moves = captures.length > 0 ? captures : possibleMoves;
  
  if (moves.length > 0) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const piece = board[move.from.y][move.from.x];
    
    board[move.from.y][move.from.x] = null;
    board[move.to.y][move.to.x] = piece;
    
    // Remove captured piece
    if (move.isCapture) {
      const midY = (move.from.y + move.to.y) / 2;
      const midX = (move.from.x + move.to.x) / 2;
      board[midY][midX] = null;
    }
    
    // Check for king promotion
    if (piece === 'black' && move.to.y === 7) {
      board[move.to.y][move.to.x] = 'black-king';
    }
    
    state.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} muove una pedina`
    };
  }
  
  // Next turn
  const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
  state.currentTurn = state.players[(currentIdx + 1) % state.players.length].id;
  
  return true;
}

// CPU Logic for Forza 4
function cpuPlayForza4(room: any) {
  const state = room.gameState;
  const currentPlayer = state.players.find((p: any) => p.id === state.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  if (state.phase === 'gameOver') return false;
  
  const board = state.board as number[][];
  const playerIndex = state.players.findIndex((p: any) => p.id === currentPlayer.id);
  const cpuNum = playerIndex + 1;
  const opponentNum = cpuNum === 1 ? 2 : 1;
  
  // Helper: Check if a move wins
  const checkWin = (board: number[][], player: number): boolean => {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
      }
    }
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
      }
    }
    return false;
  };
  
  // Helper: Find lowest empty row in column
  const findRow = (board: number[][], col: number): number => {
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === 0) return r;
    }
    return -1;
  };
  
  // Get valid columns
  const validColumns: number[] = [];
  for (let c = 0; c < 7; c++) {
    if (findRow(board, c) !== -1) validColumns.push(c);
  }
  
  if (validColumns.length === 0) return false;
  
  // Strategy: Check for winning move, then block opponent, then center preference
  let bestCol = -1;
  
  // 1. Check for winning move
  for (const col of validColumns) {
    const row = findRow(board, col);
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = cpuNum;
    if (checkWin(testBoard, cpuNum)) {
      bestCol = col;
      break;
    }
  }
  
  // 2. Block opponent's winning move
  if (bestCol === -1) {
    for (const col of validColumns) {
      const row = findRow(board, col);
      const testBoard = board.map(r => [...r]);
      testBoard[row][col] = opponentNum;
      if (checkWin(testBoard, opponentNum)) {
        bestCol = col;
        break;
      }
    }
  }
  
  // 3. Prefer center columns
  if (bestCol === -1) {
    const centerPreference = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerPreference) {
      if (validColumns.includes(col)) {
        bestCol = col;
        break;
      }
    }
  }
  
  // Make the move
  const row = findRow(board, bestCol);
  board[row][bestCol] = cpuNum;
  
  // Check for win
  if (checkWin(board, cpuNum)) {
    state.phase = 'gameOver';
    state.winner = currentPlayer.id;
    state.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} vince!`
    };
    return true;
  }
  
  // Check for draw
  if (board[0].every((cell: number) => cell !== 0)) {
    state.phase = 'gameOver';
    state.winner = 'draw';
    return true;
  }
  
  // Next turn
  const currentIdx = state.players.findIndex((p: any) => p.id === state.currentTurn);
  state.currentTurn = state.players[(currentIdx + 1) % state.players.length].id;
  state.lastAction = {
    playerId: currentPlayer.id,
    message: `${currentPlayer.name} gioca colonna ${bestCol + 1}`
  };
  
  return true;
}

function processCpuTurns(room: any) {
  if (!room?.gameState) return;
  
  const state = room.gameState;
  let iterations = 0;
  const maxIterations = 10;
  
  while (iterations < maxIterations) {
    const currentPlayer = state.players?.find((p: any) => p.id === state.currentTurn);
    const isCpuTurn = currentPlayer?.id?.startsWith('cpu-');
    const isCpuQuestioner = state.currentQuestioner?.startsWith('cpu-');
    const isCpuAuction = state.phase === 'auction' && state.players?.[state.currentAuction?.currentPlayerIndex]?.id?.startsWith('cpu-');
    
    // Nome Città CPU handling
    if (room.gameType === 'nomecitta' && state.phase === 'writing') {
      const cpuPlayers = state.players.filter((p: any) => p.id.startsWith('cpu-'));
      for (const cpu of cpuPlayers) {
        if (!cpu.finished) {
          // CPU generates real words for each letter
          const letter = state.currentLetter;
          const categories = ['Nome', 'Città', 'Cosa', 'Animale', 'Frutto', 'Oggetto'];
          
          // Complete word lists for each letter
          const wordLists: Record<string, Record<string, string[]>> = {
            'A': {
              'Nome': ['Antonio', 'Anna', 'Alessandro', 'Andrea', 'Alessia', 'Angelo', 'Aurora', 'Adele'],
              'Città': ['Ancona', 'Aosta', 'Avellino', 'Asti', 'Agrigento', 'Arezzo', 'Ascoli', 'Asti'],
              'Cosa': ['Albero', 'Anguria', 'Automobile', 'Anello', 'Arco', 'Aquila', 'Ago', 'Arnia'],
              'Animale': ['Aquila', 'Asino', 'Aquila', 'Anatra', 'Ape', 'Ariete', 'Alce', 'Anemone'],
              'Frutto': ['Arancia', 'Anguria', 'Albicocca', 'Ananas', 'Aronia', 'Avocado'],
              'Oggetto': ['Asciugamano', 'Accendino', 'Apribottiglie', 'Angolo', 'Arnia', 'Anello'],
            },
            'B': {
              'Nome': ['Bianca', 'Bruno', 'Barbara', 'Benedetta', 'Beatrice', 'Beppe', 'Bruno', 'Bettino'],
              'Città': ['Bari', 'Bergamo', 'Bologna', 'Brescia', 'Bolzano', 'Busto', 'Benevento', 'Brindisi'],
              'Cosa': ['Borsa', 'Barca', 'Bottiglia', 'Balena', 'Bambola', 'Banco', 'Borsa', 'Barile'],
              'Animale': ['Balestra', 'Bue', 'Bisonte', 'Babirussa', 'Basilisco', 'Barbagianni'],
              'Frutto': ['Banana', 'Bacca', 'Baccello', 'Bergamotto'],
              'Oggetto': ['Bottiglia', 'Borsa', 'Balaustra', 'Barchetta', 'Bambola', 'Bicchiere'],
            },
            'C': {
              'Nome': ['Carlo', 'Chiara', 'Caterina', 'Claudio', 'Cristina', 'Cesare', 'Ciro', 'Carmelo'],
              'Città': ['Catania', 'Como', 'Cagliari', 'Cuneo', 'Cremona', 'Cosenza', 'Campobasso', 'Catanzaro'],
              'Cosa': ['Casa', 'Cane', 'Cavallo', 'Camicia', 'Caffè', 'Campana', 'Carta', 'Chiave'],
              'Animale': ['Cavallo', 'Cane', 'Cervo', 'Coccodrillo', 'Capra', 'Cinghiale', 'Cane'],
              'Frutto': ['Ciliegia', 'Caco', 'Carruba', 'Clementina'],
              'Oggetto': ['Chiave', 'Candela', 'Cuscino', 'Cucchiaio', 'Camera', 'Cassetto'],
            },
            'D': {
              'Nome': ['Daniele', 'Davide', 'Diana', 'Domenico', 'Donato', 'Dario', 'Dora', 'Damiano'],
              'Città': ['Domodossola', 'Frosinone', 'Dongo', 'Diamante'],
              'Cosa': ['Dado', 'Dente', 'Domani', 'Dito', 'Dama', 'Distanza', 'Domanda'],
              'Animale': ['Delfino', 'Daino', 'Dingo', 'Dromedario'],
              'Frutto': ['Dattero', 'Durian', 'Duku'],
              'Oggetto': ['Dito', 'Dado', 'Distanziatore', 'Divano'],
            },
            'E': {
              'Nome': ['Elena', 'Enrico', 'Emanuele', 'Erika', 'Edoardo', 'Elisa', 'Eugenio', 'Ettore'],
              'Città': ['Enna', 'Empoli', 'Este', 'Eboli'],
              'Cosa': ['Erba', 'Erta', 'Est', 'Eco', 'Elica', 'Estratto'],
              'Animale': ['Elefante', 'Ermellino', 'Equideo'],
              'Frutto': ['Eucalyptus'],
              'Oggetto': ['Elmetto', 'Elica', 'Elettrodo'],
            },
            'F': {
              'Nome': ['Francesco', 'Federico', 'Federica', 'Flavio', 'Fabio', 'Fiorella', 'Filippo', 'Furio'],
              'Città': ['Firenze', 'Ferrara', 'Foggia', 'Frosinone', 'Forlì', 'Fermo', 'Fidenza', 'Fabriano'],
              'Cosa': ['Festa', 'Fiora', 'Farfalla', 'Fontana', 'Fiume', 'Festa', 'Finestra', 'Foglia'],
              'Animale': ['Farfalla', 'Foca', 'Fagiano', 'Furetto', 'Furetto', 'Formica'],
              'Frutto': ['Fragola', 'Fico', 'Fico', 'Frambuesa', 'Feijoa'],
              'Oggetto': ['Forchetta', 'Finestra', 'Fazzoletto', 'Fiammifero', 'Fontana'],
            },
            'G': {
              'Nome': ['Giuseppe', 'Giovanni', 'Giulia', 'Giorgia', 'Gabriele', 'Giacomo', 'Ginevra', 'Gaetano'],
              'Città': ['Genova', 'Gorizia', 'Grosseto', 'Gela', 'Gubbio', 'Gallipoli', 'Grugliasco'],
              'Cosa': ['Gatto', 'Gioco', 'Gomma', 'Gioiello', 'Gabbia', 'Gondola', 'Grembo'],
              'Animale': ['Gatto', 'Giraffa', 'Gallo', 'Gorilla', 'Ghepardo', 'Gabbiano'],
              'Frutto': ['Guava', 'Gelso', 'Grosella'],
              'Oggetto': ['Giocattolo', 'Gancio', 'Gomma', 'Guanto', 'Grembiule'],
            },
            'H': {
              'Nome': ['Hector', 'Helena', 'Hans', 'Hugo'],
              'Città': ['Helsinki', 'Hamburg', 'Houston'],
              'Cosa': ['Hotel', 'Hobby', 'Hamburger'],
              'Animale': ['Ippopotamo', 'Istrice'],
              'Frutto': ['Hickory'],
              'Oggetto': ['Helico', 'Hard disk'],
            },
            'I': {
              'Nome': ['Ivano', 'Ivana', 'Ivan', 'Ilaria', 'Italo', 'Ida', 'Ignazio', 'Irene'],
              'Città': ['Imperia', 'Isernia', 'Ivrea', 'Iserlohn'],
              'Cosa': ['Isola', 'Idea', 'Inverno', 'Istrice', 'Infanzia', 'Inchiostro'],
              'Animale': ['Istrice', 'Iena', 'Iguana', 'Ippopotamo'],
              'Frutto': ['Ippofeo', 'Incircetta'],
              'Oggetto': ['Inchiostro', 'Indizio', 'Insegna'],
            },
            'L': {
              'Nome': ['Luca', 'Laura', 'Lorenzo', 'Lucia', 'Luigi', 'Luisa', 'Leonardo', 'Livia'],
              'Città': ['Lucca', 'Livorno', 'Lecce', 'Lodi', 'Latina', 'Lecco', 'Lodi', 'Lamezia'],
              'Cosa': ['Libro', 'Luna', 'Luce', 'Lago', 'Lampada', 'Lento', 'Legno'],
              'Animale': ['Leone', 'Lupo', 'Lepre', 'Lontra', 'Lince', 'Lama'],
              'Frutto': ['Limone', 'Litchi', 'Lampone', 'Lime'],
              'Oggetto': ['Lampada', 'Libro', 'Lente', 'Lancia', 'Lavello'],
            },
            'M': {
              'Nome': ['Marco', 'Maria', 'Matteo', 'Martina', 'Michele', 'Monica', 'Mario', 'Marta'],
              'Città': ['Milano', 'Messina', 'Mantova', 'Modena', 'Matera', 'Monza', 'Massa', 'Molfetta'],
              'Cosa': ['Mela', 'Mare', 'Monte', 'Mano', 'Madre', 'Mese', 'Muro'],
              'Animale': ['Maiale', 'Mucca', 'Mosca', 'Millepiedi', 'Mammuth', 'Marasso'],
              'Frutto': ['Mela', 'Mandarino', 'Melone', 'Mirtillo', 'Mora', 'Mango', 'Maracuja'],
              'Oggetto': ['Martello', 'Matita', 'Maschera', 'Moneta', 'Mappamondo', 'Metro'],
            },
            'N': {
              'Nome': ['Nicola', 'Nadia', 'Nino', 'Nicoletta', 'Natalia', 'Napoleone', 'Norberto', 'Nora'],
              'Città': ['Napoli', 'Novara', 'Nuoro', 'Nola', 'Nocera', 'Narni'],
              'Cosa': ['Nota', 'Nave', 'Notte', 'Naso', 'Nodo', 'Nuvola', 'Neve'],
              'Animale': ['Notturna', 'Narvalo', 'Nutria'],
              'Frutto': ['Noce', 'Nespola', 'Noci'],
              'Oggetto': ['Nastro', 'Navigatore', 'Notch'],
            },
            'O': {
              'Nome': ['Oscar', 'Olga', 'Omar', 'Ornella', 'Oreste', 'Ottavia', 'Osvaldo', 'Olimpia'],
              'Città': ['Olbia', 'Oristano', 'Orvieto', 'Ostia', 'Oderzo', 'Olevano'],
              'Cosa': ['Oro', 'Occhio', 'Onda', 'Ombra', 'Orizzonte', 'Orecchio', 'Oliva'],
              'Animale': ['Orso', 'Oca', 'Orata', 'Opossum', 'Orangutan'],
              'Frutto': ['Oliva', 'Ortica', 'Ontano'],
              'Oggetto': ['Orologio', 'Ombrello', 'Occhiale', 'Origano'],
            },
            'P': {
              'Nome': ['Paolo', 'Pietro', 'Patrizia', 'Pierluigi', 'Piera', 'Palmiro', 'Pio', 'Piera'],
              'Città': ['Palermo', 'Padova', 'Parma', 'Perugia', 'Pescara', 'Pisa', 'Piacenza', 'Pistoia'],
              'Cosa': ['Porta', 'Piano', 'Ponte', 'Palla', 'Piazza', 'Pietra', 'Porto'],
              'Animale': ['Pecora', 'Pavone', 'Pinguino', 'Pappagallo', 'Polpo', 'Pesce'],
              'Frutto': ['Pesca', 'Pera', 'Pompelmo', 'Pistacchio', 'Prugna', 'Papaya'],
              'Oggetto': ['Portafoglio', 'Penne', 'Piatto', 'Porta', 'Pentola'],
            },
            'Q': {
              'Nome': ['Quirino', 'Quintilio', 'Quarto'],
              'Città': ['Quarto', 'Quinto', 'Quistello'],
              'Cosa': ['Quercia', 'Quadro', 'Quota', 'Quintale'],
              'Animale': ['Quaglia', 'Quetzal'],
              'Frutto': ['Quince'],
              'Oggetto': ['Quaderno', 'Quadro', 'Quadrante'],
            },
            'R': {
              'Nome': ['Roberto', 'Rosa', 'Riccardo', 'Raffaella', 'Romeo', 'Rita', 'Ruggero', 'Rina'],
              'Città': ['Roma', 'Ravenna', 'Reggio', 'Rieti', 'Rovigo', 'Ragusa', 'Rimini', 'Rovigo'],
              'Cosa': ['Rosa', 'Ramo', 'Rete', 'Radio', 'Roccia', 'Raggio', 'Rana'],
              'Animale': ['Rana', 'Riccio', 'Rondine', 'Rospo', 'Renna'],
              'Frutto': ['Rabarbaro', 'Rambutan', 'Ribes', 'Rosa'],
              'Oggetto': ['Raccoglitore', 'Radio', 'Rete', 'Rastrello', 'Rasoio'],
            },
            'S': {
              'Nome': ['Stefano', 'Sara', 'Sergio', 'Sonia', 'Salvatore', 'Silvia', 'Simone', 'Sandro'],
              'Città': ['Salerno', 'Sassari', 'Siena', 'Siracusa', 'Savona', 'Sondrio', 'Spoleto', 'Sondrio'],
              'Cosa': ['Sole', 'Stella', 'Sedia', 'Scuola', 'Sera', 'Sasso', 'Scarpa'],
              'Animale': ['Scimpanzé', 'Scoiattolo', 'Serpente', 'Squalo', 'Salmone', 'Scorpione'],
              'Frutto': ['Susina', 'Sambuco', 'Sorba'],
              'Oggetto': ['Sedia', 'Scarpa', 'Scopa', 'Scatola', 'Specchio'],
            },
            'T': {
              'Nome': ['Thomas', 'Teresa', 'Tommaso', 'Tiziana', 'Tullio', 'Tatiana', 'Teodoro', 'Tina'],
              'Città': ['Torino', 'Taranto', 'Teramo', 'Terni', 'Trapani', 'Trento', 'Treviso', 'Trieste'],
              'Cosa': ['Tavolo', 'Treno', 'Terra', 'Tempo', 'Tetto', 'Testa', 'Tavola'],
              'Animale': ['Tigre', 'Toro', 'Talpa', 'Tartaruga', 'Tacchino', 'Topo'],
              'Frutto': ['Taccola', 'Tamarindo', 'Tomatillo'],
              'Oggetto': ['Telefono', 'Tavolo', 'Tappeto', 'Tazza', 'Torneo'],
            },
            'U': {
              'Nome': ['Umberto', 'Ugo', 'Ubaldo', 'Ursula', 'Uliviero'],
              'Città': ['Udine', 'Urbino', 'Ugento', 'Uggiate'],
              'Cosa': ['Uva', 'Uovo', 'Uscita', 'Unione', 'Uragano', 'Ulivo'],
              'Animale': ['Upupa', 'Uccello', 'Urina'],
              'Frutto': ['Uva', 'Ugni'],
              'Oggetto': ['Uovo', 'Uscio', 'Unicorno'],
            },
            'V': {
              'Nome': ['Vincenzo', 'Valentina', 'Vittorio', 'Veronica', 'Vittoria', 'Vladimiro', 'Vera', 'Valerio'],
              'Città': ['Venezia', 'Verona', 'Vicenza', 'Viterbo', 'Varese', 'Vibo', 'Vercelli', 'Venezia'],
              'Cosa': ['Vento', 'Vino', 'Valle', 'Verde', 'Vita', 'Vulcano', 'Vela'],
              'Animale': ['Volpe', 'Vipera', 'Vermiglio', 'Vampiro'],
              'Frutto': ['Vaniglia', 'Vite', 'Voavanga'],
              'Oggetto': ['Ventaglio', 'Valigia', 'Vaso', 'Vestito', 'Vanga'],
            },
            'Z': {
              'Nome': ['Zaccaria', 'Zoe', 'Zenone', 'Zaira', 'Zelinda'],
              'Città': ['Zara', 'Zavattarello', 'Zogno'],
              'Cosa': ['Zanzara', 'Zebra', 'Zio', 'Zuppa', 'Zona', 'Zucca', 'Zero'],
              'Animale': ['Zebra', 'Zanzara', 'Zanzare'],
              'Frutto': ['Zucca', 'Zucca', 'Zenzero'],
              'Oggetto': ['Zaino', 'Zanzariera', 'Zoccolo', 'Zattera'],
            },
          };
          
          // Default words if letter not found
          const defaultWords: Record<string, string[]> = {
            'Nome': ['Nome1', 'Nome2', 'Nome3'],
            'Città': ['Città1', 'Città2', 'Città3'],
            'Cosa': ['Cosa1', 'Cosa2', 'Cosa3'],
            'Animale': ['Animale1', 'Animale2', 'Animale3'],
            'Frutto': ['Frutto1', 'Frutto2', 'Frutto3'],
            'Oggetto': ['Oggetto1', 'Oggetto2', 'Oggetto3'],
          };
          
          cpu.answers = {};
          for (const cat of categories) {
            const wordsForLetter = wordLists[letter]?.[cat] || defaultWords[cat] || [];
            // Pick a random word
            if (wordsForLetter.length > 0) {
              cpu.answers[cat] = wordsForLetter[Math.floor(Math.random() * wordsForLetter.length)];
            } else {
              cpu.answers[cat] = letter + '...';
            }
          }
          cpu.finished = true;
          state.allAnswers[cpu.id] = cpu.answers;
        }
      }
    }
    
    if (!isCpuTurn && state.phase !== 'selecting' && !isCpuQuestioner && !isCpuAuction && room.gameType !== 'nomecitta' && room.gameType !== 'forza4') break;
    
    switch (room.gameType) {
      case 'briscola':
        if (!cpuPlayBriscola(room)) return;
        break;
      case 'uno':
        if (!cpuPlayUno(room)) return;
        break;
      case 'indovinachi':
        if (state.phase === 'selecting') {
          cpuSelectCharacter(room);
        } else if (state.currentQuestioner?.startsWith('cpu-') && !state.waitingForAnswer) {
          cpuAskQuestion(room);
          break; // Wait for player answer
        }
        break;
      case 'jokinghazard':
        cpuPlayJokingHazard(room);
        break;
      case 'scatti':
        // CPU auto-clicks when image shows
        if (state.showImage && state.cpuClickDelay > 0) {
          state.cpuClickDelay--;
          if (state.cpuClickDelay === 0) {
            const cpuPlayer = state.players.find((p: any) => p.id.startsWith('cpu-'));
            if (cpuPlayer) {
              cpuPlayer.score = (cpuPlayer.score || 0) + 1;
              state.showImage = false;
              state.lastAction = {
                playerId: cpuPlayer.id,
                message: `${cpuPlayer.name} ha vinto questo round!`
              };
            }
          }
        }
        break;
      case 'mercanteinfiera':
        if (!cpuPlayMercante(room)) return;
        break;
      case 'scopa':
        if (!cpuPlayScopa(room)) return;
        break;
      case 'dama':
        if (!cpuPlayDama(room)) return;
        break;
      case 'forza4':
        if (!cpuPlayForza4(room)) return;
        break;
    }
    
    iterations++;
    
    const nextPlayer = state.players?.find((p: any) => p.id === state.currentTurn);
    const nextAuctionPlayer = state.phase === 'auction' ? state.players?.[state.currentAuction?.currentPlayerIndex] : null;
    if (nextPlayer && !nextPlayer.id.startsWith('cpu-')) break;
    if (nextAuctionPlayer && !nextAuctionPlayer.id.startsWith('cpu-')) break;
    if (state.phase === 'gameOver') break;
    if (state.waitingForAnswer) break;
  }
  
  room.lastUpdate = Date.now();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomCode, gameType, playerName, playerId, cardId, characterId, vsCpu, numBots, chosenColor, answer, questionKey, targetPlayerId, cardIndex, from, to } = body;

    switch (action) {
      case 'createRoom': {
        const code = generateCode();
        const pId = playerId || `player-${Date.now()}`;
        
        const players = [{ id: pId, name: playerName, isHost: true, score: 0 }];
        
        if (vsCpu) {
          const bots = numBots || 1;
          for (let i = 0; i < bots; i++) {
            players.push({ 
              id: `cpu-${i}`, 
              name: AI_NAMES[i % AI_NAMES.length], 
              isHost: false, 
              score: 0,
              isCpu: true 
            });
          }
        }
        
        rooms.set(code, {
          code,
          gameType,
          players,
          hostId: pId,
          gameState: null,
          lastUpdate: Date.now(),
          vsCpu: !!vsCpu
        });
        return NextResponse.json({ success: true, roomCode: code, playerId: pId, players });
      }

      case 'joinRoom': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata!' });
        const pId = playerId || `player-${Date.now()}`;
        room.players.push({ id: pId, name: playerName, isHost: false, score: 0 });
        room.lastUpdate = Date.now();
        return NextResponse.json({ success: true, playerId: pId, gameType: room.gameType, players: room.players });
      }

      case 'startGame': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata!' });

        room.gameState = {
          phase: 'playing',
          currentTurn: room.players[0].id,
          players: room.players.map(p => ({ id: p.id, name: p.name, hand: [], score: 0, isCpu: p.isCpu })),
          lastAction: null,
        };

        if (room.gameType === 'briscola') {
          const deck = createBriscolaDeck();
          const briscolaCard = deck.pop();
          room.gameState.briscolaSuit = briscolaCard.suit;
          room.gameState.briscolaEmoji = briscolaCard.suit;
          room.gameState.deck = deck;
          room.gameState.currentTrick = [];
          room.gameState.players.forEach((p: any) => { 
            p.hand = [];
            p.points = 0;
            for (let i = 0; i < 3; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }

        if (room.gameType === 'forza4') {
          // 6 rows x 7 columns - 0 = empty, 1 = player 1, 2 = player 2
          room.gameState.board = Array(6).fill(null).map(() => Array(7).fill(0));
          room.gameState.phase = 'playing';
          room.gameState.winner = null;
          room.gameState.currentTurn = room.players[0].id;
        }

        if (room.gameType === 'uno') {
          const deck = createUnoDeck();
          let startCard = deck.pop()!;
          while (startCard.type === 'wild') {
            deck.unshift(startCard);
            deck.sort(() => Math.random() - 0.5);
            startCard = deck.pop()!;
          }
          room.gameState.deck = deck;
          room.gameState.discardPile = [startCard];
          room.gameState.currentColor = startCard.color;
          room.gameState.direction = 1;
          room.gameState.players.forEach((p: any) => { 
            p.hand = [];
            for (let i = 0; i < 7; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }

        if (room.gameType === 'indovinachi') {
          room.gameState.phase = 'selecting';
          room.gameState.players.forEach((p: any) => {
            p.secretCharacter = -1;
            p.eliminatedCharacters = [];
          });
        }

        if (room.gameType === 'jokinghazard') {
          const deck = shuffle([...JOKING_PANELS]);
          room.gameState.deck = deck;
          room.gameState.players.forEach((p: any) => {
            p.hand = [];
            for (let i = 0; i < 7; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
            p.playedPunchline = null;
          });
          room.gameState.currentJudge = room.players[0].id;
          room.gameState.setup = { text: 'Un uomo entra in un bar' };
          room.gameState.middle = { text: 'E ordina qualcosa di strano' };
          room.gameState.phase = 'playing';
          room.gameState.currentRound = 1;
        }

        if (room.gameType === 'scatti') {
          room.gameState.showImage = false;
          room.gameState.nextImageIn = Math.floor(Math.random() * 10) + 5;
          room.gameState.cpuClickDelay = 0;
        }

        if (room.gameType === 'mercanteinfiera') {
          // Create 40 cards with random prize assignments
          const deck: any[] = [];
          const prizePositions = new Set<number>();
          while (prizePositions.size < 4) {
            prizePositions.add(Math.floor(Math.random() * 40) + 1);
          }
          
          for (let i = 1; i <= 40; i++) {
            const isPrize = prizePositions.has(i);
            deck.push({
              id: `card-${i}`,
              number: i,
              type: isPrize ? 'prize' : 'empty',
              value: isPrize ? Math.floor(Math.random() * 50) + 10 : undefined,
              ownerId: null,
              revealed: false,
              eliminated: false
            });
          }
          
          // Shuffle the deck
          for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
          }
          
          room.gameState.deck = deck;
          room.gameState.phase = 'auction';
          room.gameState.auctionCardsSold = 0;
          room.gameState.prizePool = 0;
          
          // Give each player starting money
          room.gameState.players.forEach((p: any) => {
            p.money = 100;
            p.cards = [];
          });
          
          // Start auction with first unowned card
          const firstCard = deck.find((c: any) => c.ownerId === null);
          room.gameState.currentAuction = {
            cardId: firstCard?.id || null,
            cardNumber: firstCard?.number || 1,
            highestBid: 0,
            highestBidderId: null,
            currentPlayerIndex: 0,
            passCount: 0
          };
          
          room.gameState.currentExtraction = {
            roundNumber: 1,
            cardsToEliminate: [],
            revealedCards: [],
            currentRevealIndex: 0,
            eliminatedCard: null,
            suspenseActive: false
          };
        }

        if (room.gameType === 'dama') {
          const board = Array(8).fill(null).map(() => Array(8).fill(null));
          // Place black pieces (top - CPU)
          for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 8; x++) {
              if ((x + y) % 2 === 1) board[y][x] = 'black';
            }
          }
          // Place white pieces (bottom - Player)
          for (let y = 5; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              if ((x + y) % 2 === 1) board[y][x] = 'white';
            }
          }
          room.gameState.board = board;
          room.gameState.selectedPiece = null;
          room.gameState.playerColor = 'white';
        }

        if (room.gameType === 'scopa') {
          const deck = createScopaDeck();
          room.gameState.deck = deck;
          room.gameState.tableCards = [];
          room.gameState.lastCapturer = null;
          
          // Deal 4 cards to table first
          for (let i = 0; i < 4; i++) {
            if (deck.length > 0) {
              room.gameState.tableCards.push(deck.pop());
            }
          }
          
          // Deal 3 cards to each player
          room.gameState.players.forEach((p: any) => {
            p.hand = [];
            p.collectedCards = [];
            p.scopas = 0;
            for (let i = 0; i < 3; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }

        if (room.gameType === 'nomecitta') {
          room.gameState.phase = 'rolling'; // Start with dice roll animation
          room.gameState.roundNumber = 1;
          room.gameState.maxRounds = 5;
          room.gameState.letterChosen = false;
          room.gameState.currentLetter = '';
          room.gameState.timeLeft = 90; // 1:30 minutes
          room.gameState.allAnswers = {};
          room.gameState.scores = {};
          room.gameState.players.forEach((p: any) => {
            p.answers = {};
            p.finished = false;
            room.gameState.scores[p.id] = 0;
          });
        }

        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        const me = room.gameState?.players?.find((p: any) => p.id === playerId);
        return NextResponse.json({ success: true, gameState: room.gameState, myCards: me?.hand || [] });
      }

      case 'playCard': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        const player = room.gameState?.players?.find((p: any) => p.id === playerId);
        if (!player) return NextResponse.json({ success: false });
        
        const cardIndex = player.hand?.findIndex((c: any) => c.id === cardId);
        if (cardIndex === -1) return NextResponse.json({ success: false, error: 'Carta non trovata' });
        
        const card = player.hand.splice(cardIndex, 1)[0];
        room.gameState.lastAction = null;
        
        if (room.gameType === 'uno') {
          if (chosenColor) card.color = chosenColor;
          room.gameState.discardPile.push(card);
          room.gameState.currentColor = card.color;
          const currentIdx = room.gameState.players.findIndex((p: any) => p.id === playerId);
          const nextIdx = (currentIdx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length;
          room.gameState.currentTurn = room.gameState.players[nextIdx].id;
          
          if (player.hand.length === 0) {
            room.gameState.phase = 'gameOver';
            room.gameState.winner = playerId;
          }
        } else if (room.gameType === 'scopa') {
          // Scopa card play logic
          const tableCards = room.gameState.tableCards || [];
          const captures = findCaptureCombinations(tableCards, card.numValue);
          
          // Get the selected capture index from the request (optional)
          const selectedCaptureIndex = body.captureIndex || 0;
          
          if (captures.length > 0) {
            // Player can capture - use selected capture or first option
            const selectedCapture = captures[Math.min(selectedCaptureIndex, captures.length - 1)];
            
            player.collectedCards = player.collectedCards || [];
            player.collectedCards.push(card);
            
            for (const capturedCard of selectedCapture) {
              const tableIdx = tableCards.findIndex((c: any) => c.id === capturedCard.id);
              if (tableIdx !== -1) {
                const captured = tableCards.splice(tableIdx, 1)[0];
                player.collectedCards.push(captured);
              }
            }
            
            // Track last capturer for end game
            room.gameState.lastCapturer = playerId;
            
            // Check for scopa
            const isScopa = tableCards.length === 0 && selectedCapture.length > 0;
            if (isScopa) {
              player.scopas = (player.scopas || 0) + 1;
              room.gameState.lastAction = {
                playerId,
                message: `SCOPA! 🎉`
              };
            } else {
              room.gameState.lastAction = {
                playerId,
                message: `Cattura ${selectedCapture.length + 1} carte con ${card.suit}${card.value}`
              };
            }
          } else {
            // No capture possible - play card to table
            tableCards.push(card);
            room.gameState.lastAction = {
              playerId,
              message: `Gioca ${card.suit}${card.value}`
            };
          }
          
          // Deal new cards if needed
          const allHandsEmpty = room.gameState.players.every((p: any) => p.hand.length === 0);
          if (allHandsEmpty && room.gameState.deck.length > 0) {
            for (const p of room.gameState.players) {
              for (let i = 0; i < 3; i++) {
                if (room.gameState.deck.length > 0) {
                  p.hand.push(room.gameState.deck.pop());
                }
              }
            }
          }
          
          // Check for game end
          if (room.gameState.players.every((p: any) => p.hand.length === 0) && room.gameState.deck.length === 0) {
            // Give remaining table cards to last capturer
            const lastCapturer = room.gameState.lastCapturer || room.gameState.players[0].id;
            const lastPlayer = room.gameState.players.find((p: any) => p.id === lastCapturer);
            if (lastPlayer && tableCards.length > 0) {
              lastPlayer.collectedCards = lastPlayer.collectedCards || [];
              lastPlayer.collectedCards.push(...tableCards);
              tableCards.length = 0;
            }
            
            room.gameState.phase = 'gameOver';
            const finalScores = calculateScopaScores(room);
            room.gameState.finalScores = finalScores;
            
            const maxPoints = Math.max(...finalScores.map((s: any) => s.points));
            room.gameState.winner = finalScores.find((s: any) => s.points === maxPoints)?.playerId;
          } else {
            // Next player's turn
            const currentIdx = room.gameState.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % room.gameState.players.length;
            room.gameState.currentTurn = room.gameState.players[nextIdx].id;
          }
        } else {
          // Briscola
          room.gameState.currentTrick = room.gameState.currentTrick || [];
          room.gameState.currentTrick.push({ 
            playerId, 
            card,
            playerName: player.name 
          });
          
          if (room.gameState.currentTrick.length === room.gameState.players.length) {
            const briscolaSuit = room.gameState.briscolaSuit;
            let winningPlay = room.gameState.currentTrick[0];
            
            for (const play of room.gameState.currentTrick) {
              const isBriscola = play.card.suit === briscolaSuit;
              const winningIsBriscola = winningPlay.card.suit === briscolaSuit;
              
              if (isBriscola && !winningIsBriscola) {
                winningPlay = play;
              } else if (play.card.suit === room.gameState.currentTrick[0].card.suit && !isBriscola) {
                const values = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
                if (values.indexOf(play.card.value) > values.indexOf(winningPlay.card.value)) {
                  winningPlay = play;
                }
              }
            }
            
            const points = room.gameState.currentTrick.reduce((sum: number, p: any) => sum + (p.card.points || 0), 0);
            const winner = room.gameState.players.find((p: any) => p.id === winningPlay.playerId);
            if (winner) winner.points = (winner.points || 0) + points;
            
            room.gameState.currentTrick = [];
            room.gameState.currentTurn = winningPlay.playerId;
            
            if (room.gameState.deck.length > 0 && winner?.hand.length < 3) {
              winner.hand.push(room.gameState.deck.pop());
            }
            for (const p of room.gameState.players) {
              if (p.id !== winner?.id && room.gameState.deck.length > 0 && p.hand.length < 3) {
                p.hand.push(room.gameState.deck.pop());
              }
            }
            
            if (room.gameState.players.every((p: any) => p.hand.length === 0) && room.gameState.deck.length === 0) {
              room.gameState.phase = 'gameOver';
              const maxPoints = Math.max(...room.gameState.players.map((p: any) => p.points || 0));
              room.gameState.winner = room.gameState.players.find((p: any) => p.points === maxPoints)?.id;
            }
          } else {
            const currentIdx = room.gameState.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % room.gameState.players.length;
            room.gameState.currentTurn = room.gameState.players[nextIdx].id;
          }
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ 
          success: true, 
          gameState: room.gameState, 
          hand: player.hand,
          opponentAction: room.gameState.lastAction?.message 
        });
      }

      case 'drawCard': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room || !room.gameState?.deck?.length) return NextResponse.json({ success: false });
        
        const player = room.gameState.players.find((p: any) => p.id === playerId);
        if (!player) return NextResponse.json({ success: false });
        
        const card = room.gameState.deck.pop();
        player.hand.push(card);
        
        const currentIdx = room.gameState.players.findIndex((p: any) => p.id === playerId);
        const nextIdx = (currentIdx + room.gameState.direction + room.gameState.players.length) % room.gameState.players.length;
        room.gameState.currentTurn = room.gameState.players[nextIdx].id;
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, hand: player.hand, gameState: room.gameState });
      }

      case 'selectCharacter': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        const player = room.gameState.players.find((p: any) => p.id === playerId);
        if (player) {
          player.secretCharacter = characterId;
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: room.gameState });
      }

      case 'askQuestion': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        const targetPlayer = room.gameState.players.find((p: any) => p.id === targetPlayerId);
        if (!targetPlayer || targetPlayer.secretCharacter === -1) {
          return NextResponse.json({ success: false, error: 'Giocatore non valido' });
        }

        // Get the secret character with all attributes - 24 characters
        const CHARACTERS = [
          // Uomini
          { id: 1, glasses: false, hat: false, beard: true, hair: 'castani', age: 'adult', gender: 'male', mustache: true },
          { id: 2, glasses: true, hat: true, beard: true, hair: 'bianchi', age: 'elder', gender: 'male', mustache: false },
          { id: 3, glasses: false, hat: false, beard: true, hair: 'neri', age: 'adult', gender: 'male', mustache: true },
          { id: 4, glasses: false, hat: true, beard: false, hair: 'castani', age: 'young', gender: 'male', mustache: false },
          { id: 5, glasses: false, hat: false, beard: false, hair: 'neri', age: 'adult', gender: 'male', mustache: false },
          { id: 6, glasses: true, hat: false, beard: true, hair: 'biondi', age: 'elder', gender: 'male', mustache: false },
          { id: 7, glasses: true, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'male', mustache: false },
          { id: 8, glasses: false, hat: true, beard: true, hair: 'neri', age: 'adult', gender: 'male', mustache: true },
          { id: 9, glasses: true, hat: false, beard: false, hair: 'bianchi', age: 'elder', gender: 'male', mustache: false },
          { id: 10, glasses: false, hat: false, beard: false, hair: 'biondi', age: 'young', gender: 'male', mustache: false },
          { id: 11, glasses: true, hat: true, beard: true, hair: 'rossi', age: 'adult', gender: 'male', mustache: false },
          { id: 12, glasses: false, hat: false, beard: false, hair: 'castani', age: 'adult', gender: 'male', mustache: true },
          // Donne
          { id: 13, glasses: true, hat: false, beard: false, hair: 'biondi', age: 'adult', gender: 'female', earrings: true },
          { id: 14, glasses: false, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'female', earrings: false },
          { id: 15, glasses: true, hat: false, beard: false, hair: 'rossi', age: 'adult', gender: 'female', earrings: true },
          { id: 16, glasses: true, hat: true, beard: false, hair: 'bianchi', age: 'elder', gender: 'female', earrings: true },
          { id: 17, glasses: false, hat: true, beard: false, hair: 'castani', age: 'adult', gender: 'female', earrings: false },
          { id: 18, glasses: false, hat: false, beard: false, hair: 'biondi', age: 'young', gender: 'female', earrings: true },
          { id: 19, glasses: true, hat: true, beard: false, hair: 'neri', age: 'adult', gender: 'female', earrings: false },
          { id: 20, glasses: false, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'female', earrings: true },
          { id: 21, glasses: false, hat: true, beard: false, hair: 'biondi', age: 'adult', gender: 'female', earrings: true },
          { id: 22, glasses: false, hat: false, beard: false, hair: 'bianchi', age: 'elder', gender: 'female', earrings: false },
          { id: 23, glasses: true, hat: false, beard: false, hair: 'rossi', age: 'adult', gender: 'female', earrings: true },
          { id: 24, glasses: true, hat: true, beard: false, hair: 'neri', age: 'elder', gender: 'female', earrings: false },
        ];

        const secretChar = CHARACTERS.find(c => c.id === targetPlayer.secretCharacter);
        let answer = false;

        // Gender questions
        if (questionKey === 'gender_male') answer = secretChar?.gender === 'male';
        else if (questionKey === 'gender_female') answer = secretChar?.gender === 'female';
        // Age questions
        else if (questionKey === 'age_young') answer = secretChar?.age === 'young';
        else if (questionKey === 'age_adult') answer = secretChar?.age === 'adult';
        else if (questionKey === 'age_elder') answer = secretChar?.age === 'elder';
        // Appearance questions
        else if (questionKey === 'glasses') answer = secretChar?.glasses || false;
        else if (questionKey === 'hat') answer = secretChar?.hat || false;
        else if (questionKey === 'beard') answer = secretChar?.beard || false;
        else if (questionKey === 'mustache') answer = secretChar?.mustache || false;
        else if (questionKey === 'earrings') answer = secretChar?.earrings || false;
        // Hair questions
        else if (questionKey === 'hair_biondi') answer = secretChar?.hair === 'biondi';
        else if (questionKey === 'hair_neri') answer = secretChar?.hair === 'neri';
        else if (questionKey === 'hair_bianchi') answer = secretChar?.hair === 'bianchi';
        else if (questionKey === 'hair_castani') answer = secretChar?.hair === 'castani';
        else if (questionKey === 'hair_rossi') answer = secretChar?.hair === 'rossi';
        
        // Now it's CPU's turn to ask
        room.gameState.currentQuestioner = room.gameState.players.find((p: any) => p.id.startsWith('cpu-'))?.id;
        room.gameState.waitingForAnswer = false;
        
        room.lastUpdate = Date.now();
        
        // Process CPU turn
        if (room.vsCpu) {
          setTimeout(() => processCpuTurns(room), 1000);
        }
        
        return NextResponse.json({ success: true, answer, gameState: room.gameState });
      }

      case 'answerQuestion': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        // CPU received answer, now it's player's turn again
        room.gameState.waitingForAnswer = false;
        room.gameState.currentQuestioner = null;
        room.gameState.currentQuestion = null;
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: room.gameState });
      }

      case 'makeGuess': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });

        const targetPlayer = room.gameState.players.find((p: any) => p.id !== playerId);
        const correct = targetPlayer?.secretCharacter === characterId;

        if (correct) {
          room.gameState.phase = 'gameOver';
          room.gameState.winner = playerId;
          room.gameState.revealedCharacter = targetPlayer?.secretCharacter;
          room.gameState.winMessage = `Hai indovinato il personaggio!`;
        } else {
          // Player loses their turn, CPU wins
          const cpu = room.gameState.players.find((p: any) => p.id.startsWith('cpu-'));
          const humanPlayer = room.gameState.players.find((p: any) => !p.id.startsWith('cpu-'));
          if (cpu) {
            room.gameState.phase = 'gameOver';
            room.gameState.winner = cpu.id;
            room.gameState.revealedCharacter = targetPlayer?.secretCharacter;
            room.gameState.winMessage = `${cpu.name} ha vinto!`;
          }
          // Reveal the player's character too
          if (humanPlayer) {
            room.gameState.playerCharacter = humanPlayer.secretCharacter;
          }
        }

        return NextResponse.json({ success: true, correct, gameState: room.gameState });
      }

      // =====================
      // FORZA 4 ACTIONS
      // =====================
      case 'playMove': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        if (state.phase === 'gameOver') {
          return NextResponse.json({ success: false, error: 'Partita finita' });
        }
        
        if (state.currentTurn !== playerId) {
          return NextResponse.json({ success: false, error: 'Non è il tuo turno' });
        }
        
        const column = body.column;
        if (column === undefined || column < 0 || column > 6) {
          return NextResponse.json({ success: false, error: 'Colonna non valida' });
        }
        
        const board = state.board;
        
        // Find the lowest empty row in the column
        let row = -1;
        for (let r = 5; r >= 0; r--) {
          if (board[r][column] === null) {
            row = r;
            break;
          }
        }
        
        if (row === -1) {
          return NextResponse.json({ success: false, error: 'Colonna piena' });
        }
        
        // Place the piece
        board[row][column] = playerId;
        
        // Check for win
        const checkWin = (player: string): boolean => {
          // Horizontal
          for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r][c+1] === player && 
                  board[r][c+2] === player && board[r][c+3] === player) {
                return true;
              }
            }
          }
          // Vertical
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 7; c++) {
              if (board[r][c] === player && board[r+1][c] === player && 
                  board[r+2][c] === player && board[r+3][c] === player) {
                return true;
              }
            }
          }
          // Diagonal (down-right)
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r+1][c+1] === player && 
                  board[r+2][c+2] === player && board[r+3][c+3] === player) {
                return true;
              }
            }
          }
          // Diagonal (up-right)
          for (let r = 3; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r-1][c+1] === player && 
                  board[r-2][c+2] === player && board[r-3][c+3] === player) {
                return true;
              }
            }
          }
          return false;
        };
        
        if (checkWin(playerId)) {
          state.phase = 'gameOver';
          state.winner = playerId;
        } else {
          // Check for draw
          const isDraw = board[0].every((cell: string | null) => cell !== null);
          if (isDraw) {
            state.phase = 'gameOver';
            state.winner = 'draw';
          } else {
            // Switch turn
            const currentIdx = state.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % state.players.length;
            state.currentTurn = state.players[nextIdx].id;
          }
        }
        
        room.lastUpdate = Date.now();
        
        // Process CPU turn if needed
        if (room.vsCpu && state.phase !== 'gameOver' && state.currentTurn.startsWith('cpu-')) {
          setTimeout(() => {
            // Simple CPU: pick a random valid column
            const validColumns: number[] = [];
            for (let c = 0; c < 7; c++) {
              if (board[0][c] === null) validColumns.push(c);
            }
            if (validColumns.length > 0) {
              const randomCol = validColumns[Math.floor(Math.random() * validColumns.length)];
              // Find row
              let cpuRow = -1;
              for (let r = 5; r >= 0; r--) {
                if (board[r][randomCol] === null) {
                  cpuRow = r;
                  break;
                }
              }
              if (cpuRow !== -1) {
                board[cpuRow][randomCol] = state.currentTurn;
                
                // Check win for CPU
                const cpuId = state.currentTurn;
                if (checkWin(cpuId)) {
                  state.phase = 'gameOver';
                  state.winner = cpuId;
                } else {
                  const isDraw = board[0].every((cell: string | null) => cell !== null);
                  if (isDraw) {
                    state.phase = 'gameOver';
                    state.winner = 'draw';
                  } else {
                    state.currentTurn = playerId;
                  }
                }
              }
            }
          }, 500);
        }
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'playPunchline': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        const player = room.gameState.players.find((p: any) => p.id === playerId);
        if (player && player.hand.length && cardIndex !== undefined) {
          player.playedPunchline = player.hand.splice(cardIndex, 1)[0];
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: room.gameState, hand: player?.hand });
      }

      case 'scattoClick': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        if (room.gameState.showImage) {
          const player = room.gameState.players.find((p: any) => p.id === playerId);
          if (player) {
            player.score = (player.score || 0) + 1;
            room.gameState.showImage = false;
            room.gameState.nextImageIn = Math.floor(Math.random() * 15) + 5;
          }
        }
        
        return NextResponse.json({ success: true, winner: true, gameState: room.gameState });
      }

      case 'movePiece': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false });
        
        // Simple checkers move logic
        const board = room.gameState.board;
        const piece = board[from.y][from.x];
        
        if (piece && (from.x + from.y) % 2 === 1) {
          board[from.y][from.x] = null;
          board[to.y][to.x] = piece;
          
          // Check for king promotion
          if (piece === 'white' && to.y === 0) board[to.y][to.x] = 'white-king';
          if (piece === 'black' && to.y === 7) board[to.y][to.x] = 'black-king';
          
          room.gameState.selectedPiece = null;
          
          // Next turn
          const currentIdx = room.gameState.players.findIndex((p: any) => p.id === playerId);
          room.gameState.currentTurn = room.gameState.players[(currentIdx + 1) % room.gameState.players.length].id;
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: room.gameState });
      }

      // =====================
      // MERCANTE IN FIERA ACTIONS
      // =====================

      case 'mercanteBid': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        const player = state.players.find((p: any) => p.id === playerId);
        const amount = body.amount;
        
        if (!player) return NextResponse.json({ success: false, error: 'Giocatore non trovato' });
        if (state.phase !== 'auction') return NextResponse.json({ success: false, error: 'Non in fase asta' });
        if (amount <= state.currentAuction.highestBid) return NextResponse.json({ success: false, error: 'Offerta troppo bassa' });
        if (amount > player.money) return NextResponse.json({ success: false, error: 'Fondi insufficienti' });
        
        // Check if it's this player's turn to bid
        const currentBidder = state.players[state.currentAuction.currentPlayerIndex];
        if (currentBidder?.id !== playerId) {
          return NextResponse.json({ success: false, error: 'Non è il tuo turno' });
        }
        
        // Place the bid
        state.currentAuction.highestBid = amount;
        state.currentAuction.highestBidderId = playerId;
        state.currentAuction.passCount = 0; // Reset pass count
        
        state.lastAction = {
          playerId,
          message: `${player.name} offre ${amount}€`
        };
        
        // Move to next player
        state.currentAuction.currentPlayerIndex = (state.currentAuction.currentPlayerIndex + 1) % state.players.length;
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'mercantePass': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        const player = state.players.find((p: any) => p.id === playerId);
        
        if (!player) return NextResponse.json({ success: false, error: 'Giocatore non trovato' });
        if (state.phase !== 'auction') return NextResponse.json({ success: false, error: 'Non in fase asta' });
        
        // Check if it's this player's turn
        const currentBidder = state.players[state.currentAuction.currentPlayerIndex];
        if (currentBidder?.id !== playerId) {
          return NextResponse.json({ success: false, error: 'Non è il tuo turno' });
        }
        
        // Pass - count passes
        state.currentAuction.passCount = (state.currentAuction.passCount || 0) + 1;
        state.lastAction = {
          playerId,
          message: `${player.name} passa`
        };
        
        const cardNumber = state.currentAuction.cardNumber;
        const cardInDeck = state.deck.find((c: any) => c.number === cardNumber);
        const totalPlayers = state.players.length;
        
        // Check if everyone passed (auction ends)
        if (state.currentAuction.passCount >= totalPlayers - 1 && state.currentAuction.highestBidderId) {
          // Winner gets the card
          const winnerId = state.currentAuction.highestBidderId;
          const winner = state.players.find((p: any) => p.id === winnerId);
          const winningBid = state.currentAuction.highestBid;
          
          if (winner && cardInDeck) {
            winner.money -= winningBid;
            cardInDeck.ownerId = winnerId;
            winner.cards = winner.cards || [];
            winner.cards.push(cardInDeck);
            
            state.lastAction = {
              playerId: winner.id,
              message: `${winner.name} vince la carta ${cardNumber} per ${winningBid}€!`
            };
          }
          
          // Reset for next auction or move to playing phase
          state.auctionCardsSold = (state.auctionCardsSold || 0) + 1;
          
          // Check if we should continue auctions or move to playing
          const totalOwnedCards = state.deck.filter((c: any) => c.ownerId !== null).length;
          if (totalOwnedCards >= 20 || state.auctionCardsSold >= 20) {
            // Move to playing phase
            state.phase = 'playing';
            state.currentExtraction = {
              roundNumber: 1,
              cardsToEliminate: [],
              revealedCards: [],
              currentRevealIndex: 0,
              eliminatedCard: null,
              suspenseActive: false
            };
          } else {
            // Start next auction - pick next unowned card
            const unownedCards = state.deck.filter((c: any) => c.ownerId === null);
            if (unownedCards.length > 0) {
              const nextCard = unownedCards[0];
              state.currentAuction = {
                cardId: nextCard.id,
                cardNumber: nextCard.number,
                highestBid: 0,
                highestBidderId: null,
                currentPlayerIndex: 0,
                passCount: 0
              };
            }
          }
        } else {
          // Move to next player
          state.currentAuction.currentPlayerIndex = (state.currentAuction.currentPlayerIndex + 1) % state.players.length;
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'mercanteStartElimination': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        if (state.phase !== 'playing') return NextResponse.json({ success: false, error: 'Non in fase gioco' });
        
        // Randomly select cards to eliminate (1-3 cards per round)
        const activeCards = state.deck.filter((c: any) => !c.eliminated);
        const numToEliminate = Math.min(Math.floor(Math.random() * 3) + 1, activeCards.length - 1); // Leave at least 1 card
        
        const shuffledActive = [...activeCards].sort(() => Math.random() - 0.5);
        const cardsToEliminate = shuffledActive.slice(0, numToEliminate).map((c: any) => c.number);
        
        state.currentExtraction = {
          ...state.currentExtraction,
          cardsToEliminate,
          revealedCards: [],
          currentRevealIndex: 0,
          suspenseActive: true
        };
        
        state.phase = 'revelation';
        
        state.lastAction = {
          playerId: 'system',
          message: `Estrazione Round ${state.currentExtraction.roundNumber}: ${numToEliminate} carta/e da eliminare`
        };
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'mercanteRevealNext': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        if (state.phase !== 'revelation') return NextResponse.json({ success: false, error: 'Non in fase rivelazione' });
        
        const extraction = state.currentExtraction;
        const currentIdx = extraction.currentRevealIndex;
        
        if (currentIdx >= extraction.cardsToEliminate.length) {
          // All cards revealed, check for winner
          const activeCards = state.deck.filter((c: any) => !c.eliminated);
          
          if (activeCards.length === 1) {
            // Game over - we have a winner!
            const winningCard = activeCards[0];
            const winner = state.players.find((p: any) => p.id === winningCard.ownerId);
            
            state.phase = 'gameOver';
            state.winners = winner ? [winner] : [];
            winningCard.revealed = true;
            
            state.lastAction = {
              playerId: winner?.id || 'system',
              message: winner ? `${winner.name} vince con la carta ${winningCard.number}!` : 'La carta vincente non ha proprietario!'
            };
          } else if (activeCards.length > 1) {
            // Continue to next round
            state.phase = 'playing';
            state.currentExtraction = {
              roundNumber: extraction.roundNumber + 1,
              cardsToEliminate: [],
              revealedCards: [],
              currentRevealIndex: 0,
              eliminatedCard: null,
              suspenseActive: false
            };
          }
        } else {
          // Reveal and eliminate the next card
          const cardNumber = extraction.cardsToEliminate[currentIdx];
          const card = state.deck.find((c: any) => c.number === cardNumber);
          
          if (card) {
            card.eliminated = true;
            card.revealed = true;
            extraction.revealedCards.push(cardNumber);
            
            state.lastAction = {
              playerId: 'system',
              message: `Carta ${cardNumber} eliminata! ${card.type === 'prize' ? 'Era un premio!' : 'Era vuota.'}`
            };
          }
          
          extraction.currentRevealIndex++;
        }
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'mercantePlayAgain': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        // Reset the game
        const deck: any[] = [];
        const prizePositions = new Set<number>();
        while (prizePositions.size < 4) {
          prizePositions.add(Math.floor(Math.random() * 40) + 1);
        }
        
        for (let i = 1; i <= 40; i++) {
          const isPrize = prizePositions.has(i);
          deck.push({
            id: `card-${i}`,
            number: i,
            type: isPrize ? 'prize' : 'empty',
            value: isPrize ? Math.floor(Math.random() * 50) + 10 : undefined,
            ownerId: null,
            revealed: false,
            eliminated: false
          });
        }
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        room.gameState.deck = deck;
        room.gameState.phase = 'auction';
        room.gameState.auctionCardsSold = 0;
        room.gameState.prizePool = 0;
        
        // Reset players
        room.gameState.players.forEach((p: any) => {
          p.money = 100;
          p.cards = [];
        });
        
        // Start new auction
        const firstCard = deck.find((c: any) => c.ownerId === null);
        room.gameState.currentAuction = {
          cardId: firstCard?.id || null,
          cardNumber: firstCard?.number || 1,
          highestBid: 0,
          highestBidderId: null,
          currentPlayerIndex: 0,
          passCount: 0
        };
        
        room.gameState.currentExtraction = {
          roundNumber: 1,
          cardsToEliminate: [],
          revealedCards: [],
          currentRevealIndex: 0,
          eliminatedCard: null,
          suspenseActive: false
        };
        
        room.gameState.winners = [];
        room.gameState.lastAction = null;
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: room.gameState });
      }

      // =====================
      // SCOPA ACTIONS
      // =====================

      case 'getScopaCaptures': {
        // Get possible capture options for a card in Scopa
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room || room.gameType !== 'scopa') {
          return NextResponse.json({ success: false, error: 'Invalid game' });
        }
        
        const player = room.gameState?.players?.find((p: any) => p.id === playerId);
        if (!player) return NextResponse.json({ success: false });
        
        const card = player.hand?.find((c: any) => c.id === cardId);
        if (!card) return NextResponse.json({ success: false, error: 'Card not in hand' });
        
        const tableCards = room.gameState.tableCards || [];
        const captures = findCaptureCombinations(tableCards, card.numValue);
        
        return NextResponse.json({ 
          success: true, 
          cardId,
          cardValue: card.numValue,
          captures: captures.map((capture, index) => ({
            index,
            cards: capture,
            totalCards: capture.length + 1, // Including the played card
            isScopa: capture.length === tableCards.length,
            denariCount: capture.filter(c => c.suitName === 'denari').length
          })),
          tableCards
        });
      }

      // =====================
      // NOME CITTÀ ACTIONS
      // =====================

      case 'chooseLetter': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        
        // Random letter selection like rolling a dice
        const letters = 'ABCDEFGHILMNOPQRSTUVZ';
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        
        state.currentLetter = randomLetter;
        state.letterChosen = true;
        state.phase = 'writing';
        state.timeLeft = 90; // 1:30 minutes
        state.allAnswers = {};
        state.timerStart = Date.now();
        state.players.forEach((p: any) => {
          p.answers = {};
          p.finished = false;
        });
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state, rolledLetter: randomLetter });
      }

      case 'submitAnswer': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        const player = state.players.find((p: any) => p.id === playerId);
        if (!player) return NextResponse.json({ success: false, error: 'Giocatore non trovato' });
        
        player.answers = body.answers;
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'finishWriting': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        const player = state.players.find((p: any) => p.id === playerId);
        if (!player) return NextResponse.json({ success: false, error: 'Giocatore non trovato' });
        
        // Update answers from request
        if (body.answers) {
          player.answers = body.answers;
        }
        
        player.finished = true;
        state.allAnswers[playerId] = player.answers;
        
        // Check if all players finished
        const allFinished = state.players.every((p: any) => p.finished);
        
        if (allFinished) {
          // Calculate scores
          const categories = ['Nome', 'Città', 'Cosa', 'Animale', 'Frutto', 'Oggetto'];
          const letter = state.currentLetter;
          
          for (const cat of categories) {
            const answersInCat: Record<string, string[]> = {};
            
            for (const p of state.players) {
              const answer = p.answers[cat] || '';
              if (answer && answer.toUpperCase().startsWith(letter)) {
                if (!answersInCat[answer]) answersInCat[answer] = [];
                answersInCat[answer].push(p.id);
              }
            }
            
            // Award points
            for (const p of state.players) {
              const answer = p.answers[cat] || '';
              if (answer && answer.toUpperCase().startsWith(letter)) {
                if (answersInCat[answer].length === 1) {
                  // Unique answer: 10 points
                  state.scores[p.id] = (state.scores[p.id] || 0) + 10;
                } else {
                  // Shared answer: 5 points
                  state.scores[p.id] = (state.scores[p.id] || 0) + 5;
                }
              }
            }
          }
          
          state.phase = 'review';
        }
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state });
      }

      case 'nextRound': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        
        if (state.roundNumber >= state.maxRounds) {
          state.phase = 'gameOver';
          room.lastUpdate = Date.now();
          return NextResponse.json({ success: true, gameState: state, gameOver: true });
        }
        
        // Next round - start with rolling phase
        state.roundNumber = (state.roundNumber || 1) + 1;
        state.phase = 'rolling';
        state.letterChosen = false;
        state.currentLetter = '';
        state.timeLeft = 90;
        state.allAnswers = {};
        
        state.players.forEach((p: any) => {
          p.answers = {};
          p.finished = false;
        });
        
        room.lastUpdate = Date.now();
        
        return NextResponse.json({ success: true, gameState: state });
      }

      // =====================
      // FORZA 4 ACTIONS
      // =====================
      case 'playForza4': {
        const room = rooms.get(roomCode?.toUpperCase());
        if (!room) return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        
        const state = room.gameState;
        const column = body.column as number;
        
        if (state.phase === 'gameOver') {
          return NextResponse.json({ success: false, error: 'Partita finita' });
        }
        
        if (state.currentTurn !== playerId) {
          return NextResponse.json({ success: false, error: 'Non è il tuo turno' });
        }
        
        if (column < 0 || column > 6) {
          return NextResponse.json({ success: false, error: 'Colonna non valida' });
        }
        
        const board = state.board as number[][];
        
        // Find the lowest empty row in the column
        let row = -1;
        for (let r = 5; r >= 0; r--) {
          if (board[r][column] === 0) {
            row = r;
            break;
          }
        }
        
        if (row === -1) {
          return NextResponse.json({ success: false, error: 'Colonna piena' });
        }
        
        // Determine player number (1 or 2)
        const playerIndex = state.players.findIndex((p: any) => p.id === playerId);
        const playerNum = playerIndex + 1;
        
        // Place the piece
        board[row][column] = playerNum;
        
        // Check for win
        const checkWin = (board: number[][], player: number): boolean => {
          // Check horizontal
          for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r][c+1] === player && 
                  board[r][c+2] === player && board[r][c+3] === player) {
                return true;
              }
            }
          }
          // Check vertical
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 7; c++) {
              if (board[r][c] === player && board[r+1][c] === player && 
                  board[r+2][c] === player && board[r+3][c] === player) {
                return true;
              }
            }
          }
          // Check diagonal (down-right)
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r+1][c+1] === player && 
                  board[r+2][c+2] === player && board[r+3][c+3] === player) {
                return true;
              }
            }
          }
          // Check diagonal (up-right)
          for (let r = 3; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r-1][c+1] === player && 
                  board[r-2][c+2] === player && board[r-3][c+3] === player) {
                return true;
              }
            }
          }
          return false;
        };
        
        if (checkWin(board, playerNum)) {
          state.phase = 'gameOver';
          state.winner = playerId;
          state.lastAction = {
            playerId,
            message: `${state.players[playerIndex].name} vince!`
          };
        } else {
          // Check for draw (board full)
          const isFull = board[0].every((cell: number) => cell !== 0);
          if (isFull) {
            state.phase = 'gameOver';
            state.winner = 'draw';
            state.lastAction = {
              playerId: 'system',
              message: 'Pareggio!'
            };
          } else {
            // Next turn
            const currentIdx = state.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % state.players.length;
            state.currentTurn = state.players[nextIdx].id;
            state.lastAction = {
              playerId,
              message: `${state.players[playerIndex].name} gioca colonna ${column + 1}`
            };
          }
        }
        
        room.lastUpdate = Date.now();
        
        if (room.vsCpu) {
          processCpuTurns(room);
        }
        
        return NextResponse.json({ success: true, gameState: state });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const playerId = searchParams.get('playerId');
  
  if (!roomCode) {
    return NextResponse.json({ success: false, error: 'Room code required' });
  }
  
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) {
    return NextResponse.json({ success: false, error: 'Room not found' });
  }
  
  // Auto-show image for Scatti
  if (room.gameType === 'scatti' && !room.gameState.showImage) {
    room.gameState.nextImageIn--;
    if (room.gameState.nextImageIn <= 0) {
      room.gameState.showImage = true;
      room.gameState.cpuClickDelay = Math.floor(Math.random() * 5) + 2;
    }
  }
  
  // Process CPU turns
  if (room.vsCpu) {
    processCpuTurns(room);
  }
  
  // Get player's hand from game state
  const player = room.gameState?.players?.find((p: any) => p.id === playerId);
  const myCards = player?.hand || [];
  const mySecret = player?.secretCharacter;
  
  // Indovina Chi specific
  const isMyTurnToAnswer = room.gameState?.targetPlayerId === playerId && room.gameState?.waitingForAnswer;
  const currentQuestion = room.gameState?.currentQuestion;
  
  return NextResponse.json({
    success: true,
    players: room.players,
    gameState: room.gameState,
    myCards,
    mySecret,
    isMyTurnToAnswer,
    currentQuestion,
    lastAction: room.gameState?.lastAction,
    lastUpdate: room.lastUpdate
  });
}
