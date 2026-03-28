import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 120000,
  pingInterval: 25000,
})

// ============= TYPES =============
interface Card {
  id: string
  text: string
  imageUrl?: string
  panel: number
  type: 'setup' | 'punchline'
  category: string
}

interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  isJudge: boolean
  cards: Card[]
  hasSubmitted: boolean
  hasVoted: boolean
  avatar: string
}

interface Room {
  code: string
  hostId: string
  players: Map<string, Player>
  phase: 'lobby' | 'playing' | 'judging' | 'results' | 'gameOver'
  roundNumber: number
  maxRounds: number
  currentJudgeId: string | null
  currentSetup: Card[]
  submittedCards: Map<string, { playerId: string; card: Card }>
  submittedPunchlines: Card[]
  winner: string | null
  winningCard: Card | null
  timer: number
  timerInterval: ReturnType<typeof setInterval> | null
  settings: { maxPlayers: number; roundTime: number }
}

// ============= CARD DECK =============
const PUNCHLINES: Card[] = [
  { id: 'p1', text: "E questo è il motivo per cui non mi invitate più.", panel: 3, type: 'punchline', category: 'dark' },
  { id: 'p2', text: "Il mio avvocato dice di non commentare.", panel: 3, type: 'punchline', category: 'dark' },
  { id: 'p3', text: "Nessuno ha riso. Era un funerale.", panel: 3, type: 'punchline', category: 'dark' },
  { id: 'p4', text: "Sono stato bandito da 5 stati e 3 continenti.", panel: 3, type: 'punchline', category: 'absurd' },
  { id: 'p5', text: "Gli alieni mi hanno rispedito indietro: 'No grazie'.", panel: 3, type: 'punchline', category: 'absurd' },
  { id: 'p6', text: "La NASA mi ha contattato per studi.", panel: 3, type: 'punchline', category: 'absurd' },
  { id: 'p7', text: "Ho creato una nuova terapia: l'evitamento.", panel: 3, type: 'punchline', category: 'surreal' },
  { id: 'p8', text: "Ora vivo in una realtà alternativa.", panel: 3, type: 'punchline', category: 'surreal' },
  { id: 'p9', text: "La mia famiglia mi ha diseredato. Due volte.", panel: 3, type: 'punchline', category: 'crude' },
  { id: 'p10', text: "Sono diventato la leggenda negativa del villaggio.", panel: 3, type: 'punchline', category: 'crude' },
  { id: 'p11', text: "Il mio video ha avuto 2 visualizzazioni: io e mia mamma.", panel: 3, type: 'punchline', category: 'normal' },
  { id: 'p12', text: "Ho deciso di non uscire mai più.", panel: 3, type: 'punchline', category: 'normal' },
  { id: 'p13', text: "Mi hanno dato un premio: 'Peggior decisione'.", panel: 3, type: 'punchline', category: 'normal' },
  { id: 'p14', text: "È finita su YouTube. 3 milioni di visualizzazioni di vergogna.", panel: 3, type: 'punchline', category: 'crude' },
  { id: 'p15', text: "La mia terapista ha iniziato a piangere. Per lei.", panel: 3, type: 'punchline', category: 'dark' },
  { id: 'p16', text: "Ho dovuto cambiare identità. Di nuovo.", panel: 3, type: 'punchline', category: 'surreal' },
  { id: 'p17', text: "Abbiamo scoperto di essere fratelli. A fine serata.", panel: 3, type: 'punchline', category: 'crude' },
  { id: 'p18', text: "Ha ottenuto la promozione. Io un avvocato.", panel: 3, type: 'punchline', category: 'dark' },
  { id: 'p19', text: "I bambini del quartiere mi chiamano 'quello strano'.", panel: 3, type: 'punchline', category: 'normal' },
  { id: 'p20', text: "Il museo degli errori ha una mia sezione dedicata.", panel: 3, type: 'punchline', category: 'surreal' },
]

const SETUPS: Card[] = [
  { id: 's1', text: "Il mio dottore mi ha detto che mi restano 6 mesi...", panel: 1, type: 'setup', category: 'dark' },
  { id: 's2', text: "...così ho sparato al dottore.", panel: 2, type: 'setup', category: 'dark' },
  { id: 's3', text: "La mia ex mi ha detto 'Spero tu muoia solo'...", panel: 1, type: 'setup', category: 'dark' },
  { id: 's4', text: "...così ho comprato biglietti per uno.", panel: 2, type: 'setup', category: 'dark' },
  { id: 's5', text: "Ho deciso di cambiare vita e diventare...", panel: 1, type: 'setup', category: 'absurd' },
  { id: 's6', text: "...un avocado professionista.", panel: 2, type: 'setup', category: 'absurd' },
  { id: 's7', text: "Il mio capo mi ha chiesto di andare oltre...", panel: 1, type: 'setup', category: 'absurd' },
  { id: 's8', text: "...così ho attraversato il muro.", panel: 2, type: 'setup', category: 'absurd' },
  { id: 's9', text: "Mi sono svegliato e tutto era fatto di...", panel: 1, type: 'setup', category: 'surreal' },
  { id: 's10', text: "...formaggio cheddar.", panel: 2, type: 'setup', category: 'surreal' },
  { id: 's11', text: "Il mio primo bacio è stato...", panel: 1, type: 'setup', category: 'crude' },
  { id: 's12', text: "...con mia cugina al matrimonio.", panel: 2, type: 'setup', category: 'crude' },
  { id: 's13', text: "Ho fatto la cosa più imbarazzante alla festa...", panel: 1, type: 'setup', category: 'crude' },
  { id: 's14', text: "...mi sono presentato.", panel: 2, type: 'setup', category: 'crude' },
  { id: 's15', text: "La cosa peggiore che ho fatto al lavoro...", panel: 1, type: 'setup', category: 'normal' },
  { id: 's16', text: "...è stata addormentarmi in riunione.", panel: 2, type: 'setup', category: 'normal' },
  { id: 's17', text: "Il mio appuntamento è andato benissimo...", panel: 1, type: 'setup', category: 'normal' },
  { id: 's18', text: "...fino a quando non ho aperto bocca.", panel: 2, type: 'setup', category: 'normal' },
]

const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐵', '🦄', '🐻', '🐼', '🐨', '🦋', '🐙']
const rooms = new Map<string, Room>()
const playerRooms = new Map<string, string>()

function genCode(): string {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let r = ''
  for (let i = 0; i < 4; i++) r += c[Math.floor(Math.random() * c.length)]
  return r
}

function shuffle<T>(a: T[]): T[] {
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getState(room: Room) {
  return {
    roomCode: room.code,
    phase: room.phase,
    roundNumber: room.roundNumber,
    currentJudgeId: room.currentJudgeId,
    currentSetup: room.currentSetup,
    submittedPunchlines: room.phase === 'judging' || room.phase === 'results' ? room.submittedPunchlines : [],
    winner: room.winner,
    winningCard: room.winningCard,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id, name: p.name, score: p.score, isHost: p.isHost, isJudge: p.isJudge,
      hasSubmitted: p.hasSubmitted, hasVoted: p.hasVoted, avatar: p.avatar, cardCount: p.cards.length
    })),
    settings: room.settings,
    maxRounds: room.maxRounds,
    timer: room.timer
  }
}

function broadcast(room: Room, event: string, data?: any) {
  console.log(`[BROADCAST] ${room.code} -> ${event}`)
  io.to(room.code).emit(event, data ?? getState(room))
}

function sendCards(room: Room, playerId: string) {
  const p = room.players.get(playerId)
  if (p && !p.isJudge && p.cards.length > 0) {
    console.log(`[CARDS] -> ${p.name}: ${p.cards.length} cards`)
    io.to(playerId).emit('player-cards', { cards: p.cards, roundNumber: room.roundNumber })
  }
}

function startRound(room: Room) {
  console.log(`\n========== ROUND ${room.roundNumber} ==========`)
  
  // Setup cards
  const s = shuffle(SETUPS)
  room.currentSetup = [s.find(c => c.panel === 1)!, s.find(c => c.panel === 2)!]
  
  // Reset
  room.submittedCards.clear()
  room.submittedPunchlines = []
  room.winner = null
  room.winningCard = null
  
  // Assign judge and deal cards
  const punchlines = shuffle(PUNCHLINES)
  let idx = 0
  
  room.players.forEach((p, pid) => {
    p.hasSubmitted = false
    p.hasVoted = false
    p.isJudge = pid === room.currentJudgeId
    p.cards = []
    
    if (!p.isJudge) {
      p.cards = punchlines.slice(idx, idx + 5)
      idx += 5
      console.log(`[DEAL] ${p.name}: [${p.cards.map(c => c.id).join(',')}]`)
    }
  })
  
  console.log(`[JUDGE] ${room.players.get(room.currentJudgeId!)?.name}`)
  
  // Timer
  if (room.timerInterval) clearInterval(room.timerInterval)
  room.timer = room.settings.roundTime
  room.timerInterval = setInterval(() => {
    room.timer--
    io.to(room.code).emit('timer-update', { timer: room.timer })
    if (room.timer <= 0) {
      clearInterval(room.timerInterval!)
      room.timerInterval = null
      if (room.phase === 'playing') startJudging(room)
      else if (room.phase === 'judging') endRound(room)
    }
  }, 1000)
  
  // Broadcast state
  broadcast(room, 'game-state')
  
  // Send cards after short delay
  setTimeout(() => {
    room.players.forEach((p, pid) => {
      if (!p.isJudge) sendCards(room, pid)
    })
  }, 200)
}

function startJudging(room: Room) {
  console.log(`\n[JUDGING]`)
  if (room.timerInterval) clearInterval(room.timerInterval)
  
  room.phase = 'judging'
  room.submittedPunchlines = shuffle(Array.from(room.submittedCards.values()).map(s => s.card))
  console.log(`[CARDS] ${room.submittedPunchlines.length} submitted`)
  
  room.timer = 60
  room.timerInterval = setInterval(() => {
    room.timer--
    io.to(room.code).emit('timer-update', { timer: room.timer })
    if (room.timer <= 0) {
      clearInterval(room.timerInterval!)
      room.timerInterval = null
      endRound(room)
    }
  }, 1000)
  
  broadcast(room, 'game-state')
}

function endRound(room: Room) {
  console.log(`\n[RESULTS]`)
  if (room.timerInterval) clearInterval(room.timerInterval)
  
  room.phase = 'results'
  
  const entries = Array.from(room.submittedCards.values())
  if (entries.length > 0) {
    const win = entries[Math.floor(Math.random() * entries.length)]
    room.winner = win.playerId
    room.winningCard = win.card
    const winner = room.players.get(win.playerId)
    if (winner) {
      winner.score++
      console.log(`[WINNER] ${winner.name}: "${win.card.text}"`)
    }
  }
  
  broadcast(room, 'game-state')
  
  // Next round or end
  setTimeout(() => {
    if (room.roundNumber >= room.maxRounds) {
      room.phase = 'gameOver'
      broadcast(room, 'game-state')
    } else {
      room.roundNumber++
      const ids = Array.from(room.players.keys())
      const cur = ids.indexOf(room.currentJudgeId!)
      room.currentJudgeId = ids[(cur + 1) % ids.length]
      room.phase = 'playing'
      startRound(room)
    }
  }, 5000)
}

// ============= SOCKET =============
io.on('connection', (socket) => {
  console.log(`\n[+] ${socket.id}`)
  
  socket.on('create-room', (data: { playerName: string }) => {
    let code = genCode()
    while (rooms.has(code)) code = genCode()
    
    const player: Player = {
      id: socket.id, name: data.playerName, score: 0, isHost: true, isJudge: false,
      cards: [], hasSubmitted: false, hasVoted: false,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]
    }
    
    const room: Room = {
      code, hostId: socket.id, players: new Map([[socket.id, player]]),
      phase: 'lobby', roundNumber: 0, maxRounds: 5, currentJudgeId: null,
      currentSetup: [], submittedCards: new Map(), submittedPunchlines: [],
      winner: null, winningCard: null, timer: 0, timerInterval: null,
      settings: { maxPlayers: 10, roundTime: 60 }
    }
    
    rooms.set(code, room)
    playerRooms.set(socket.id, code)
    socket.join(code)
    
    console.log(`[CREATE] ${code} by ${data.playerName}`)
    socket.emit('room-created', { roomCode: code, playerId: socket.id })
    broadcast(room, 'game-state')
  })
  
  socket.on('join-room', (data: { roomCode: string; playerName: string }) => {
    const code = data.roomCode.toUpperCase()
    const room = rooms.get(code)
    
    if (!room) return socket.emit('join-error', { message: 'Stanza non trovata' })
    if (room.phase !== 'lobby') return socket.emit('join-error', { message: 'Partita già iniziata' })
    if (room.players.size >= room.settings.maxPlayers) return socket.emit('join-error', { message: 'Stanza piena' })
    
    const player: Player = {
      id: socket.id, name: data.playerName, score: 0, isHost: false, isJudge: false,
      cards: [], hasSubmitted: false, hasVoted: false,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]
    }
    
    room.players.set(socket.id, player)
    playerRooms.set(socket.id, code)
    socket.join(code)
    
    console.log(`[JOIN] ${data.playerName} -> ${code} (${room.players.size} players)`)
    socket.emit('room-joined', { roomCode: code, playerId: socket.id })
    broadcast(room, 'game-state')
  })
  
  socket.on('start-game', () => {
    const code = playerRooms.get(socket.id)
    if (!code) return
    const room = rooms.get(code)
    if (!room || room.hostId !== socket.id || room.players.size < 2) return
    
    console.log(`\n========== START GAME ==========`)
    
    // Reset scores but KEEP players
    room.players.forEach(p => {
      p.score = 0
      p.isJudge = false
      p.cards = []
      p.hasSubmitted = false
      p.hasVoted = false
    })
    
    // Pick first judge
    const ids = Array.from(room.players.keys())
    room.currentJudgeId = ids[Math.floor(Math.random() * ids.length)]
    room.roundNumber = 1
    room.phase = 'playing'
    
    console.log(`[PLAYERS] ${room.players.size}: ${Array.from(room.players.values()).map(p => p.name).join(', ')}`)
    
    startRound(room)
  })
  
  socket.on('get-game-state', () => {
    const code = playerRooms.get(socket.id)
    if (!code) return
    const room = rooms.get(code)
    if (!room) return
    
    socket.emit('game-state', getState(room))
    
    // Also send cards if in playing
    const p = room.players.get(socket.id)
    if (room.phase === 'playing' && p && !p.isJudge && p.cards.length > 0) {
      socket.emit('player-cards', { cards: p.cards, roundNumber: room.roundNumber })
    }
  })
  
  socket.on('get-cards', () => {
    const code = playerRooms.get(socket.id)
    console.log(`[GET-CARDS] from ${socket.id}, room: ${code || 'NONE'}`)
    if (!code) return
    const room = rooms.get(code)
    if (!room) return
    
    const p = room.players.get(socket.id)
    if (!p) {
      console.log(`[GET-CARDS] player not in room. Players: ${Array.from(room.players.keys()).join(',')}`)
      return
    }
    
    console.log(`[GET-CARDS] ${p.name}: judge=${p.isJudge}, cards=${p.cards.length}`)
    if (!p.isJudge && p.cards.length > 0) {
      socket.emit('player-cards', { cards: p.cards, roundNumber: room.roundNumber })
    }
  })
  
  socket.on('submit-card', (data: { cardId: string }) => {
    const code = playerRooms.get(socket.id)
    if (!code) return
    const room = rooms.get(code)
    if (!room || room.phase !== 'playing') return
    
    const p = room.players.get(socket.id)
    if (!p || p.isJudge || p.hasSubmitted) return
    
    const card = p.cards.find(c => c.id === data.cardId)
    if (!card) return
    
    room.submittedCards.set(socket.id, { playerId: socket.id, card })
    p.hasSubmitted = true
    p.cards = p.cards.filter(c => c.id !== data.cardId)
    
    console.log(`[SUBMIT] ${p.name}: "${card.text}"`)
    
    socket.emit('player-cards', { cards: p.cards })
    broadcast(room, 'game-state')
    
    // Check all submitted
    const nonJudges = Array.from(room.players.values()).filter(pl => !pl.isJudge)
    if (nonJudges.every(pl => pl.hasSubmitted)) {
      console.log(`[SUBMIT] All done!`)
      startJudging(room)
    }
  })
  
  socket.on('vote', (data: { cardId: string }) => {
    const code = playerRooms.get(socket.id)
    if (!code) return
    const room = rooms.get(code)
    if (!room || room.phase !== 'judging') return
    
    const p = room.players.get(socket.id)
    if (!p || !p.isJudge || p.hasVoted) return
    
    p.hasVoted = true
    
    for (const [pid, entry] of room.submittedCards) {
      if (entry.card.id === data.cardId) {
        room.winner = pid
        room.winningCard = entry.card
        const winner = room.players.get(pid)
        if (winner) winner.score++
        console.log(`[VOTE] Judge chose ${winner?.name}`)
        break
      }
    }
    
    endRound(room)
  })
  
  socket.on('leave-room', () => {
    const code = playerRooms.get(socket.id)
    if (!code) return
    const room = rooms.get(code)
    if (!room) return
    
    const p = room.players.get(socket.id)
    console.log(`[LEAVE] ${p?.name} from ${code}`)
    
    room.players.delete(socket.id)
    playerRooms.delete(socket.id)
    socket.leave(code)
    
    if (room.players.size === 0) {
      if (room.timerInterval) clearInterval(room.timerInterval)
      rooms.delete(code)
      console.log(`[DELETE] Room ${code}`)
    } else {
      if (p?.isHost) {
        const newHost = room.players.values().next().value
        if (newHost) { newHost.isHost = true; room.hostId = newHost.id }
      }
      broadcast(room, 'game-state')
    }
  })
  
  socket.on('disconnect', () => {
    console.log(`\n[-] ${socket.id}`)
    // Keep player in room for reconnection
  })
})

const PORT = 3003
httpServer.listen(PORT, () => console.log(`\n🎮 Server on port ${PORT}`))

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)))
process.on('SIGINT', () => httpServer.close(() => process.exit(0)))
