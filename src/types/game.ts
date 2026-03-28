export interface ComicCard {
  id: string
  text: string
  panel: number
  type: 'setup' | 'punchline'
  category: 'dark' | 'absurd' | 'surreal' | 'crude' | 'normal'
}

export interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  isJudge: boolean
  hasSubmitted: boolean
  hasVoted: boolean
  avatar: string
  cardCount: number
}

export interface GameSettings {
  maxPlayers: number
  roundTime: number
  darkMode: boolean
  publicVoting: boolean
  contentFilter: 'soft' | 'free'
}

export interface GameState {
  roomCode: string
  gameType: 'joking-hazard' | 'mercante-fiera'
  phase: 'lobby' | 'playing' | 'judging' | 'results' | 'gameOver'
  roundNumber: number
  currentJudgeId: string | null
  currentSetup: ComicCard[]
  submittedPunchlines: ComicCard[]
  winner: string | null
  winningCard: ComicCard | null
  players: Player[]
  settings: GameSettings
  currentRound: number
  maxRounds: number
  timer: number
}

// Socket event types for better type safety
export interface CreateRoomData {
  playerName: string
  settings?: Partial<GameSettings>
  gameType?: 'joking-hazard' | 'mercante-fiera'
}

export interface CreateRoomResponse {
  roomCode: string
  player: Player
  gameType: 'joking-hazard' | 'mercante-fiera'
}

export interface JoinRoomData {
  roomCode: string
  playerName: string
}

export interface JoinRoomResponse {
  roomCode: string
  player: Player
}

export interface JoinError {
  message: string
}

export interface LobbyUpdate {
  players: Player[]
  settings: GameSettings
  gameType?: 'joking-hazard' | 'mercante-fiera'
}

export interface CardSubmittedData {
  playerId: string
  playerName: string
}

export interface VoteCastData {
  playerId: string
  playerName: string
}

export interface EmojiData {
  playerId: string
  playerName: string
  emoji: string
}

export interface RoundResultsData {
  winner: string | null
  winningCard: ComicCard | null
  scores: Array<{ id: string; name: string; score: number }>
}

export interface GameOverData {
  scores: Array<{ id: string; name: string; score: number; avatar: string }>
  winner: { id: string; name: string; score: number; avatar: string }
}

export interface PlayerCardsData {
  cards: ComicCard[]
}

export interface TimerUpdateData {
  timer: number
}
