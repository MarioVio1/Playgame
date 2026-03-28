// Mercante in Fiera Game Types and Logic

export interface MercanteCard {
  id: string
  number: number // 1-40
  type: 'prize' | 'empty' // prize = carta vincente, empty = carta perdente
  value?: number // valore del premio (se prize)
  ownerId: string | null // player che possiede la carta
  revealed: boolean
  eliminated: boolean
}

export interface MercantePlayer {
  id: string
  name: string
  avatar: string
  money: number // soldi per le aste
  cards: MercanteCard[] // carte possedute
  eliminated: boolean
  isHost: boolean
}

export interface MercanteGameState {
  roomCode: string
  phase: 'lobby' | 'auction' | 'playing' | 'revelation' | 'gameOver'
  players: MercantePlayer[]
  deck: MercanteCard[]
  currentAuction: {
    cardId: string | null
    cardNumber: number | null
    highestBid: number
    highestBidderId: string | null
    currentPlayerIndex: number
  }
  currentExtraction: {
    roundNumber: number
    cardsToEliminate: number[]
    revealedCards: number[]
    currentRevealIndex: number
    eliminatedCard: number | null
    suspenseActive: boolean
  }
  settings: MercanteSettings
  winners: MercantePlayer[]
  prizePool: number
}

export interface MercanteSettings {
  startingMoney: number // soldi iniziali per ogni giocatore
  totalCards: number // numero totale carte (default 40)
  prizeCards: number // numero carte vincenti (default 4)
  auctionRounds: number // round di asta iniziali
}

// Default deck configuration (40 cards, 4 prizes)
export const DEFAULT_MERCANTE_SETTINGS: MercanteSettings = {
  startingMoney: 100,
  totalCards: 40,
  prizeCards: 4,
  auctionRounds: 3,
}

// Generate a shuffled deck
export function generateMercanteDeck(settings: MercanteSettings): MercanteCard[] {
  const cards: MercanteCard[] = []
  
  // Create prize cards (with random values)
  const prizePositions = new Set<number>()
  while (prizePositions.size < settings.prizeCards) {
    prizePositions.add(Math.floor(Math.random() * settings.totalCards) + 1)
  }
  
  for (let i = 1; i <= settings.totalCards; i++) {
    const isPrize = prizePositions.has(i)
    cards.push({
      id: `card-${i}`,
      number: i,
      type: isPrize ? 'prize' : 'empty',
      value: isPrize ? Math.floor(Math.random() * 50) + 10 : undefined,
      ownerId: null,
      revealed: false,
      eliminated: false,
    })
  }
  
  return cards
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get cards by owner
export function getPlayerCards(deck: MercanteCard[], playerId: string): MercanteCard[] {
  return deck.filter(card => card.ownerId === playerId && !card.eliminated)
}

// Get active (non-eliminated) cards
export function getActiveCards(deck: MercanteCard[]): MercanteCard[] {
  return deck.filter(card => !card.eliminated)
}

// Random elimination
export function getRandomElimination(activeCards: MercanteCard[], count: number = 1): number[] {
  const shuffled = shuffleArray(activeCards.map(c => c.number))
  return shuffled.slice(0, count)
}

// Check for winner
export function checkWinner(deck: MercanteCard[]): MercanteCard | null {
  const activeCards = getActiveCards(deck)
  if (activeCards.length === 1) {
    return activeCards[0]
  }
  return null
}

// Prize values for display
export const PRIZE_DESCRIPTIONS = [
  { min: 10, max: 20, label: 'Piccolo Premio', emoji: '🎁' },
  { min: 21, max: 35, label: 'Premio Medio', emoji: '🏆' },
  { min: 36, max: 50, label: 'Gran Premio', emoji: '💎' },
  { min: 51, max: 100, label: 'Super Premio', emoji: '👑' },
]

export function getPrizeDescription(value: number): { label: string; emoji: string } {
  const prize = PRIZE_DESCRIPTIONS.find(p => value >= p.min && value <= p.max)
  return prize || { label: 'Premio', emoji: '🎁' }
}
