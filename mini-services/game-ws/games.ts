// ============================================
// GAME LOGIC FOR ALL 5 GAMES
// ============================================

// ============================================
// CHARACTERS FOR INDOVINA CHI
// ============================================
export const CHARACTERS = [
  { id: 1, name: 'Marco', emoji: '👨', hair: 'castani', glasses: false, hat: false, beard: true, gender: 'male', age: 'adult' },
  { id: 2, name: 'Laura', emoji: '👩', hair: 'biondi', glasses: true, hat: false, beard: false, gender: 'female', age: 'adult' },
  { id: 3, name: 'Giuseppe', emoji: '👴', hair: 'bianchi', glasses: true, hat: true, beard: true, gender: 'male', age: 'elder' },
  { id: 4, name: 'Sofia', emoji: '👧', hair: 'neri', glasses: false, hat: false, beard: false, gender: 'female', age: 'young' },
  { id: 5, name: 'Antonio', emoji: '🧔', hair: 'neri', glasses: false, hat: false, beard: true, gender: 'male', age: 'adult' },
  { id: 6, name: 'Elena', emoji: '👩‍🦰', hair: 'rossi', glasses: true, hat: false, beard: false, gender: 'female', age: 'adult' },
  { id: 7, name: 'Luca', emoji: '🧑', hair: 'castani', glasses: false, hat: true, beard: false, gender: 'male', age: 'young' },
  { id: 8, name: 'Maria', emoji: '👵', hair: 'bianchi', glasses: true, hat: true, beard: false, gender: 'female', age: 'elder' },
  { id: 9, name: 'Pietro', emoji: '👨‍🦱', hair: 'neri', glasses: false, hat: false, beard: false, gender: 'male', age: 'adult' },
  { id: 10, name: 'Anna', emoji: '👩‍🦱', hair: 'castani', glasses: false, hat: true, beard: false, gender: 'female', age: 'adult' },
  { id: 11, name: 'Roberto', emoji: '🧓', hair: 'biondi', glasses: true, hat: false, beard: true, gender: 'male', age: 'elder' },
  { id: 12, name: 'Giulia', emoji: '👱‍♀️', hair: 'biondi', glasses: false, hat: false, beard: false, gender: 'female', age: 'young' },
  { id: 13, name: 'Franco', emoji: '🧔', hair: 'castani', glasses: true, hat: true, beard: true, gender: 'male', age: 'adult' },
  { id: 14, name: 'Rosa', emoji: '👵', hair: 'rossi', glasses: false, hat: true, beard: false, gender: 'female', age: 'elder' },
  { id: 15, name: 'Paolo', emoji: '👨', hair: 'bianchi', glasses: false, hat: false, beard: false, gender: 'male', age: 'elder' },
  { id: 16, name: 'Chiara', emoji: '👧', hair: 'rossi', glasses: true, hat: false, beard: false, gender: 'female', age: 'young' },
];

// ============================================
// BRISCOLA CARDS
// ============================================
export const BRISCOLA_SUITS = ['♠️', '♣️', '♥️', '♦️'];
export const BRISCOLA_VALUES = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];
export const BRISCOLA_POINTS: Record<string, number> = {
  'A': 11, '3': 10, 'K': 4, 'Q': 3, 'J': 2,
  '2': 0, '4': 0, '5': 0, '6': 0, '7': 0
};

// ============================================
// UNO CARDS
// ============================================
export const UNO_COLORS = ['red', 'blue', 'green', 'yellow'];
export const UNO_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const UNO_SPECIAL = ['🚫', '⇄', '+2']; // Skip, Reverse, Draw Two
export const UNO_WILD = ['🎨', '+4']; // Wild, Wild Draw Four

// ============================================
// JOKING HAZARD PANELS
// ============================================
export const COMIC_PANELS = {
  setups: [
    { text: '👨 "Oggi è una bella giornata!"', emoji: '😊' },
    { text: '👩 "Finalmente ho finito il lavoro!"', emoji: '🎉' },
    { text: '🧑 "Ho trovato 100 euro per terra!"', emoji: '💰' },
    { text: '👨‍🦰 "Il mio capo mi ha promosso!"', emoji: '📈' },
    { text: '👴 "Mi sento giovane oggi!"', emoji: '🕺' },
    { text: '👩‍🦱 "Ho vinto alla lotteria!"', emoji: '🎰' },
    { text: '🧔 "La mia dieta funziona!"', emoji: '💪' },
    { text: '👧 "Ho preso 10 all\'esame!"', emoji: '📝' },
  ],
  middle: [
    { text: '🌧️ *Piove a dirotto*', emoji: '🌧️' },
    { text: '💥 *Scoppia un incendio*', emoji: '💥' },
    { text: '🚗 *Mi hanno rubato la macchina*', emoji: '🚗' },
    { text: '📱 *Il telefono cade nel water*', emoji: '📱' },
    { text: '🐶 *Il cane mangia i documenti*', emoji: '🐶' },
    { text: '🌪️ *Un tornado avanza*', emoji: '🌪️' },
    { text: '💸 *Perdo tutto in borsa*', emoji: '💸' },
    { text: '🏃 *Scappa la fidanzata*', emoji: '🏃' },
  ],
  punchlines: [
    { text: '😂 *Ride fino alle lacrime*', emoji: '😂' },
    { text: '💀 *Muore dal ridere*', emoji: '💀' },
    { text: '🔥 *Tutto prende fuoco*', emoji: '🔥' },
    { text: '🎯 *Colpo di fulmine*', emoji: '🎯' },
    { text: '🎉 *Festa improvvisa*', emoji: '🎉' },
    { text: '👻 *Diventa un fantasma*', emoji: '👻' },
    { text: '🌍 *Fine del mondo*', emoji: '🌍' },
    { text: '🏆 *Vince un Oscar*', emoji: '🏆' },
    { text: '👽 *Arrivano gli alieni*', emoji: '👽' },
    { text: '🎪 *Diventa un clown*', emoji: '🎪' },
  ]
};

// ============================================
// MERCANTE IN FIERA PRIZES
// ============================================
export const MERCANTE_PRIZES = [
  { id: 1, name: 'Villa Lusso', value: 1000, emoji: '🏰' },
  { id: 2, name: 'Yacht', value: 800, emoji: '🛥️' },
  { id: 3, name: 'Auto Sportiva', value: 600, emoji: '🏎️' },
  { id: 4, name: 'Viaggio Mondo', value: 500, emoji: '🌍' },
  { id: 5, name: 'Oro', value: 400, emoji: '🥇' },
  { id: 6, name: 'Gioielli', value: 300, emoji: '💎' },
  { id: 7, name: 'Telefono Nuovo', value: 200, emoji: '📱' },
  { id: 8, name: 'Buono Shopping', value: 100, emoji: '🛍️' },
  { id: 9, name: 'Cena Gourmet', value: 50, emoji: '🍽️' },
  { id: 10, name: 'Gadget', value: 20, emoji: '🎁' },
];

// ============================================
// GAME STATE INTERFACES
// ============================================
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
}

export interface IndovinaChiState {
  phase: 'selecting' | 'playing' | 'gameOver';
  currentTurn: string;
  players: {
    id: string;
    name: string;
    secretCharacter: number;
    eliminatedCharacters: number[];
  }[];
  currentQuestion: string | null;
  lastAnswer: boolean | null;
  winner: string | null;
}

export interface BriscolaState {
  phase: 'playing' | 'roundEnd' | 'gameOver';
  briscolaSuit: string;
  currentTurn: string;
  deck: any[];
  players: {
    id: string;
    name: string;
    hand: any[];
    points: number;
    tricksWon: number;
  }[];
  currentTrick: { playerId: string; card: any }[];
  lastTrickWinner: string | null;
  winner: string | null;
}

export interface MercanteState {
  phase: 'buying' | 'extraction' | 'gameOver';
  roundNumber: number;
  currentCard: any;
  currentBid: number;
  highestBidder: string | null;
  players: {
    id: string;
    name: string;
    money: number;
    cards: any[];
    prizes: any[];
  }[];
  passedPlayers: string[];
  remainingCards: any[];
  extractedCards: any[];
  winner: string | null;
}

export interface JokingHazardState {
  phase: 'setup' | 'playing' | 'judging' | 'scoring';
  currentJudge: string;
  setup: any;
  middle: any;
  players: {
    id: string;
    name: string;
    hand: any[];
    score: number;
    playedPunchline: any | null;
  }[];
  currentRound: number;
  winner: string | null;
}

export interface UnoState {
  phase: 'playing' | 'choosingColor' | 'gameOver';
  currentTurn: string;
  direction: 1 | -1;
  deck: any[];
  discardPile: any[];
  players: {
    id: string;
    name: string;
    hand: any[];
    calledUno: boolean;
  }[];
  currentColor: string;
  mustDraw: number;
  winner: string | null;
}

// ============================================
// GAME LOGIC CLASSES
// ============================================

export class IndovinaChiGame {
  static createInitialState(players: Player[]): IndovinaChiState {
    return {
      phase: 'selecting',
      currentTurn: players[0].id,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        secretCharacter: -1,
        eliminatedCharacters: []
      })),
      currentQuestion: null,
      lastAnswer: null,
      winner: null
    };
  }

  static selectCharacter(state: IndovinaChiState, playerId: string, characterId: number): IndovinaChiState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;
    
    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      secretCharacter: characterId
    };

    // Check if all players selected
    const allSelected = newPlayers.every(p => p.secretCharacter !== -1);
    
    return {
      ...state,
      players: newPlayers,
      phase: allSelected ? 'playing' : 'selecting'
    };
  }

  static askQuestion(state: IndovinaChiState, question: string, targetPlayerId: string): { answer: boolean; newState: IndovinaChiState } {
    const targetPlayer = state.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer || targetPlayer.secretCharacter === -1) {
      return { answer: false, newState: state };
    }

    const secretChar = CHARACTERS.find(c => c.id === targetPlayer.secretCharacter);
    if (!secretChar) return { answer: false, newState: state };

    // Parse question and determine answer
    let answer = false;
    const q = question.toLowerCase();
    
    if (q.includes('occhiali')) answer = secretChar.glasses;
    else if (q.includes('cappello')) answer = secretChar.hat;
    else if (q.includes('barba')) answer = secretChar.beard;
    else if (q.includes('biondi')) answer = secretChar.hair === 'biondi';
    else if (q.includes('neri')) answer = secretChar.hair === 'neri';
    else if (q.includes('bianchi')) answer = secretChar.hair === 'bianchi';
    else if (q.includes('rossi')) answer = secretChar.hair === 'rossi';
    else if (q.includes('castani')) answer = secretChar.hair === 'castani';
    else if (q.includes('uomo') || q.includes('maschio')) answer = secretChar.gender === 'male';
    else if (q.includes('donna') || q.includes('femmina')) answer = secretChar.gender === 'female';
    else if (q.includes('giovane')) answer = secretChar.age === 'young';
    else if (q.includes('anziano') || q.includes('vecchio')) answer = secretChar.age === 'elder';
    else answer = Math.random() > 0.5;

    return {
      answer,
      newState: {
        ...state,
        currentQuestion: question,
        lastAnswer: answer
      }
    };
  }

  static eliminateCharacters(state: IndovinaChiState, playerId: string, characterIds: number[]): IndovinaChiState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;

    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      eliminatedCharacters: [...new Set([...newPlayers[playerIndex].eliminatedCharacters, ...characterIds])]
    };

    return { ...state, players: newPlayers };
  }

  static guessCharacter(state: IndovinaChiState, playerId: string, targetPlayerId: string, characterId: number): { correct: boolean; newState: IndovinaChiState } {
    const targetPlayer = state.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return { correct: false, newState: state };

    const correct = targetPlayer.secretCharacter === characterId;

    if (correct) {
      return {
        correct: true,
        newState: {
          ...state,
          phase: 'gameOver',
          winner: playerId
        }
      };
    }

    // Wrong guess - eliminate this character for the guesser
    const newState = this.eliminateCharacters(state, playerId, [characterId]);
    return { correct: false, newState };
  }
}

export class BriscolaGame {
  static createDeck(): any[] {
    const deck: any[] = [];
    for (const suit of BRISCOLA_SUITS) {
      for (const value of BRISCOLA_VALUES) {
        deck.push({
          suit,
          value,
          points: BRISCOLA_POINTS[value] || 0,
          id: `${suit}${value}`
        });
      }
    }
    return this.shuffle(deck);
  }

  static shuffle(array: any[]): any[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static getCardStrength(card: any, briscolaSuit: string, leadSuit: string | null): number {
    // Briscola cards are strongest
    if (card.suit === briscolaSuit) {
      const order = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
      return 100 + order.indexOf(card.value);
    }
    // Lead suit cards
    if (leadSuit && card.suit === leadSuit) {
      const order = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
      return order.indexOf(card.value);
    }
    // Other suits have no strength
    return -1;
  }

  static createInitialState(players: Player[]): BriscolaState {
    const deck = this.createDeck();
    const briscolaSuit = deck[deck.length - 1].suit;
    
    const gamePlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      hand: deck.splice(0, 3),
      points: 0,
      tricksWon: 0
    }));

    return {
      phase: 'playing',
      briscolaSuit,
      currentTurn: players[0].id,
      deck,
      players: gamePlayers,
      currentTrick: [],
      lastTrickWinner: null,
      winner: null
    };
  }

  static playCard(state: BriscolaState, playerId: string, cardId: string): BriscolaState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;

    const card = state.players[playerIndex].hand.find(c => c.id === cardId);
    if (!card) return state;

    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      hand: newPlayers[playerIndex].hand.filter(c => c.id !== cardId)
    };

    const newTrick = [...state.currentTrick, { playerId, card }];
    let newState = { ...state, players: newPlayers, currentTrick: newTrick };

    // If trick is complete (all players played), determine winner
    if (newTrick.length === state.players.length) {
      newState = this.resolveTrick(newState);
    } else {
      // Next player
      const currentIndex = state.players.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      newState.currentTurn = state.players[nextIndex].id;
    }

    return newState;
  }

  static resolveTrick(state: BriscolaState): BriscolaState {
    const leadSuit = state.currentTrick[0].card.suit;
    
    // Find winner
    let winningPlay = state.currentTrick[0];
    for (const play of state.currentTrick) {
      const strength = this.getCardStrength(play.card, state.briscolaSuit, leadSuit);
      const winningStrength = this.getCardStrength(winningPlay.card, state.briscolaSuit, leadSuit);
      if (strength > winningStrength) {
        winningPlay = play;
      }
    }

    const winnerId = winningPlay.playerId;
    const points = state.currentTrick.reduce((sum, p) => sum + p.card.points, 0);

    // Update winner's points
    const newPlayers = state.players.map(p => {
      if (p.id === winnerId) {
        return { ...p, points: p.points + points, tricksWon: p.tricksWon + 1 };
      }
      return p;
    });

    // Draw new cards
    for (let i = 0; i < newPlayers.length; i++) {
      if (state.deck.length > 0) {
        newPlayers[i].hand.push(state.deck.pop()!);
      }
    }

    // Check if game is over
    const allHandsEmpty = newPlayers.every(p => p.hand.length === 0);
    
    if (allHandsEmpty) {
      const maxPoints = Math.max(...newPlayers.map(p => p.points));
      const winner = newPlayers.find(p => p.points === maxPoints);
      return {
        ...state,
        players: newPlayers,
        phase: 'gameOver',
        winner: winner?.id || null,
        currentTrick: [],
        lastTrickWinner: winnerId
      };
    }

    return {
      ...state,
      players: newPlayers,
      currentTrick: [],
      currentTurn: winnerId,
      lastTrickWinner: winnerId
    };
  }
}

export class MercanteGame {
  static createInitialState(players: Player[]): MercanteState {
    const cards = MERCANTE_PRIZES.map(p => ({ ...p, revealed: false }));
    const shuffled = BriscolaGame.shuffle(cards);
    
    // Deal 3 cards to each player
    const gamePlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      money: 1000,
      cards: shuffled.splice(0, 3),
      prizes: []
    }));

    return {
      phase: 'buying',
      roundNumber: 1,
      currentCard: null,
      currentBid: 100,
      highestBidder: null,
      players: gamePlayers,
      passedPlayers: [],
      remainingCards: shuffled,
      extractedCards: [],
      winner: null
    };
  }

  static startAuction(state: MercanteState): MercanteState {
    if (state.remainingCards.length === 0) {
      return { ...state, phase: 'gameOver', winner: this.determineWinner(state) };
    }

    const currentCard = state.remainingCards.pop();
    return {
      ...state,
      phase: 'buying',
      currentCard,
      currentBid: 100,
      highestBidder: null,
      passedPlayers: []
    };
  }

  static placeBid(state: MercanteState, playerId: string, amount: number): MercanteState {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.money < amount) return state;
    if (amount <= state.currentBid) return state;

    return {
      ...state,
      currentBid: amount,
      highestBidder: playerId,
      passedPlayers: state.passedPlayers.filter(id => id !== playerId)
    };
  }

  static passBid(state: MercanteState, playerId: string): MercanteState {
    const newPassed = [...state.passedPlayers, playerId];
    
    // Check if all but one passed
    if (newPassed.length >= state.players.length - 1 && state.highestBidder) {
      // Winner pays and gets card
      const winner = state.players.find(p => p.id === state.highestBidder);
      if (winner) {
        const newPlayers = state.players.map(p => {
          if (p.id === state.highestBidder) {
            return {
              ...p,
              money: p.money - state.currentBid,
              cards: [...p.cards, state.currentCard]
            };
          }
          return p;
        });

        // Start extraction phase
        return {
          ...state,
          players: newPlayers,
          phase: 'extraction',
          passedPlayers: []
        };
      }
    }

    return { ...state, passedPlayers: newPassed };
  }

  static extractCard(state: MercanteState): MercanteState {
    // Randomly select a player's card
    const allCards = state.players.flatMap(p => p.cards.map(c => ({ ...c, ownerId: p.id })));
    if (allCards.length === 0) {
      return { ...state, phase: 'gameOver', winner: this.determineWinner(state) };
    }

    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    
    // Award prize to owner
    const newPlayers = state.players.map(p => {
      if (p.id === randomCard.ownerId) {
        return {
          ...p,
          cards: p.cards.filter(c => c.id !== randomCard.id),
          prizes: [...p.prizes, randomCard]
        };
      }
      return p;
    });

    const newExtracted = [...state.extractedCards, randomCard];

    // Check if game should end
    if (newExtracted.length >= 5 || newPlayers.every(p => p.cards.length === 0)) {
      return {
        ...state,
        players: newPlayers,
        extractedCards: newExtracted,
        phase: 'gameOver',
        winner: this.determineWinner({ ...state, players: newPlayers })
      };
    }

    // Continue to next auction
    return {
      ...state,
      players: newPlayers,
      extractedCards: newExtracted,
      roundNumber: state.roundNumber + 1
    };
  }

  static determineWinner(state: MercanteState): string {
    const scores = state.players.map(p => ({
      id: p.id,
      total: p.prizes.reduce((sum, prize) => sum + prize.value, 0) + p.money
    }));
    scores.sort((a, b) => b.total - a.total);
    return scores[0].id;
  }
}

export class JokingHazardGame {
  static createInitialState(players: Player[]): JokingHazardState {
    const deck = [
      ...COMIC_PANELS.middle,
      ...COMIC_PANELS.punchlines
    ];

    return {
      phase: 'setup',
      currentJudge: players[0].id,
      setup: null,
      middle: null,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        hand: BriscolaGame.shuffle([...deck]).slice(0, 5),
        score: 0,
        playedPunchline: null
      })),
      currentRound: 1,
      winner: null
    };
  }

  static startRound(state: JokingHazardState): JokingHazardState {
    const setup = COMIC_PANELS.setups[Math.floor(Math.random() * COMIC_PANELS.setups.length)];
    const middle = COMIC_PANELS.middle[Math.floor(Math.random() * COMIC_PANELS.middle.length)];

    // Reset played punchlines
    const newPlayers = state.players.map(p => ({ ...p, playedPunchline: null }));

    return {
      ...state,
      phase: 'playing',
      setup,
      middle,
      players: newPlayers
    };
  }

  static playPunchline(state: JokingHazardState, playerId: string, cardIndex: number): JokingHazardState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;
    if (state.players[playerIndex].id === state.currentJudge) return state;

    const card = state.players[playerIndex].hand[cardIndex];
    if (!card) return state;

    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      playedPunchline: card,
      hand: newPlayers[playerIndex].hand.filter((_, i) => i !== cardIndex)
    };

    // Check if all non-judge players played
    const allPlayed = newPlayers
      .filter(p => p.id !== state.currentJudge)
      .every(p => p.playedPunchline !== null);

    return {
      ...state,
      players: newPlayers,
      phase: allPlayed ? 'judging' : 'playing'
    };
  }

  static judgeSelect(state: JokingHazardState, selectedPlayerId: string): JokingHazardState {
    const selectedPlayer = state.players.find(p => p.id === selectedPlayerId);
    if (!selectedPlayer) return state;

    // Award point
    const newPlayers = state.players.map(p => {
      if (p.id === selectedPlayerId) {
        return { ...p, score: p.score + 1 };
      }
      return p;
    });

    // Check for winner (first to 5 points)
    const winner = newPlayers.find(p => p.score >= 5);
    if (winner) {
      return {
        ...state,
        players: newPlayers,
        phase: 'gameOver',
        winner: winner.id
      };
    }

    // Next round, rotate judge
    const currentIndex = state.players.findIndex(p => p.id === state.currentJudge);
    const nextJudgeIndex = (currentIndex + 1) % state.players.length;

    return {
      ...state,
      players: newPlayers,
      currentJudge: state.players[nextJudgeIndex].id,
      currentRound: state.currentRound + 1,
      phase: 'setup'
    };
  }
}

export class UnoGame {
  static createDeck(): any[] {
    const deck: any[] = [];
    
    // Number cards (2 of each except 0)
    for (const color of UNO_COLORS) {
      deck.push({ color, value: '0', id: `${color}-0`, type: 'number' });
      for (let i = 1; i <= 9; i++) {
        deck.push({ color, value: String(i), id: `${color}-${i}-a`, type: 'number' });
        deck.push({ color, value: String(i), id: `${color}-${i}-b`, type: 'number' });
      }
      // Special cards (2 of each)
      for (const special of UNO_SPECIAL) {
        deck.push({ color, value: special, id: `${color}-${special}-a`, type: 'special' });
        deck.push({ color, value: special, id: `${color}-${special}-b`, type: 'special' });
      }
    }
    
    // Wild cards (4 of each)
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'black', value: UNO_WILD[0], id: `wild-${i}`, type: 'wild' });
      deck.push({ color: 'black', value: UNO_WILD[1], id: `wild4-${i}`, type: 'wild' });
    }

    return BriscolaGame.shuffle(deck);
  }

  static createInitialState(players: Player[]): UnoState {
    let deck = this.createDeck();
    let startCard = deck.pop()!;
    
    // Skip wild cards as starting card
    while (startCard.type === 'wild') {
      deck.unshift(startCard);
      deck = BriscolaGame.shuffle(deck);
      startCard = deck.pop()!;
    }

    return {
      phase: 'playing',
      currentTurn: players[0].id,
      direction: 1,
      deck,
      discardPile: [startCard],
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        hand: deck.splice(0, 7),
        calledUno: false
      })),
      currentColor: startCard.color,
      mustDraw: 0,
      winner: null
    };
  }

  static canPlayCard(card: any, currentCard: any, currentColor: string): boolean {
    if (card.type === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === currentCard.value) return true;
    return false;
  }

  static playCard(state: UnoState, playerId: string, cardId: string, chosenColor?: string): UnoState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;
    if (state.currentTurn !== playerId) return state;

    const card = state.players[playerIndex].hand.find(c => c.id === cardId);
    if (!card) return state;

    const topCard = state.discardPile[state.discardPile.length - 1];
    if (!this.canPlayCard(card, topCard, state.currentColor)) return state;

    // Remove card from hand
    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      hand: newPlayers[playerIndex].hand.filter(c => c.id !== cardId)
    };

    // Check for winner
    if (newPlayers[playerIndex].hand.length === 0) {
      return {
        ...state,
        players: newPlayers,
        phase: 'gameOver',
        winner: playerId
      };
    }

    // Add to discard pile
    const newDiscard = [...state.discardPile, card];
    
    // Determine next state
    let newState: UnoState = {
      ...state,
      players: newPlayers,
      discardPile: newDiscard,
      currentColor: card.type === 'wild' ? (chosenColor || 'red') : card.color
    };

    // Handle special cards
    if (card.value === '🚫') { // Skip
      const nextIndex = (playerIndex + state.direction + state.players.length) % state.players.length;
      const skipIndex = (nextIndex + state.direction + state.players.length) % state.players.length;
      newState.currentTurn = state.players[skipIndex].id;
    } else if (card.value === '⇄') { // Reverse
      newState.direction = (state.direction * -1) as 1 | -1;
      const nextIndex = (playerIndex + newState.direction + state.players.length) % state.players.length;
      newState.currentTurn = state.players[nextIndex].id;
    } else if (card.value === '+2') {
      const nextIndex = (playerIndex + state.direction + state.players.length) % state.players.length;
      newState.mustDraw = state.mustDraw + 2;
      newState.currentTurn = state.players[nextIndex].id;
    } else if (card.value === '+4') {
      const nextIndex = (playerIndex + state.direction + state.players.length) % state.players.length;
      newState.mustDraw = state.mustDraw + 4;
      newState.currentTurn = state.players[nextIndex].id;
    } else {
      const nextIndex = (playerIndex + state.direction + state.players.length) % state.players.length;
      newState.currentTurn = state.players[nextIndex].id;
    }

    return newState;
  }

  static drawCard(state: UnoState, playerId: string): UnoState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;
    if (state.currentTurn !== playerId) return state;
    if (state.deck.length === 0) return state;

    const card = state.deck.pop()!;
    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      hand: [...newPlayers[playerIndex].hand, card]
    };

    // Move to next player
    const nextIndex = (playerIndex + state.direction + state.players.length) % state.players.length;

    return {
      ...state,
      players: newPlayers,
      deck: state.deck,
      currentTurn: state.players[nextIndex].id,
      mustDraw: Math.max(0, state.mustDraw - 1)
    };
  }

  static callUno(state: UnoState, playerId: string): UnoState {
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;

    const newPlayers = [...state.players];
    newPlayers[playerIndex] = {
      ...newPlayers[playerIndex],
      calledUno: true
    };

    return { ...state, players: newPlayers };
  }
}
