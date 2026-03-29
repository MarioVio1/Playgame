const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();
const socketRooms = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (data) => {
      const { roomCode, playerId, playerName } = data;
      socket.join(roomCode);
      
      if (!socketRooms.has(roomCode)) {
        socketRooms.set(roomCode, new Map());
      }
      socketRooms.get(roomCode).set(playerId, { socketId: socket.id, playerName });
      
      socket.to(roomCode).emit('player-joined', {
        playerId,
        playerName,
        players: Array.from(socketRooms.get(roomCode).values()).map(p => ({
          id: Array.from(socketRooms.get(roomCode).keys())[
            Array.from(socketRooms.get(roomCode).values()).indexOf(p)
          ],
          name: p.playerName
        }))
      });

      socket.emit('room-state', {
        players: Array.from(socketRooms.get(roomCode).entries()).map(([id, p]) => ({
          id,
          name: p.playerName
        }))
      });
    });

    socket.on('leave-room', (data) => {
      const { roomCode, playerId } = data;
      socket.leave(roomCode);
      
      if (socketRooms.has(roomCode)) {
        socketRooms.get(roomCode).delete(playerId);
        if (socketRooms.get(roomCode).size === 0) {
          socketRooms.delete(roomCode);
        } else {
          socket.to(roomCode).emit('player-left', { playerId });
        }
      }
    });

    socket.on('start-game', (data) => {
      const { roomCode, gameState, players } = data;
      io.to(roomCode).emit('game-started', { gameState, players });
    });

    socket.on('game-update', (data) => {
      const { roomCode, gameState } = data;
      socket.to(roomCode).emit('game-updated', { gameState });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      socketRooms.forEach((players, roomCode) => {
        players.forEach((p, playerId) => {
          if (p.socketId === socket.id) {
            players.delete(playerId);
            io.to(roomCode).emit('player-left', { playerId });
          }
        });
        if (players.size === 0) {
          socketRooms.delete(roomCode);
        }
      });
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

module.exports = { io };
