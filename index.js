const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

let players = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGame', () => {
    if (Object.keys(players).length < 2) {
      players[socket.id] = { position: 1, name: Object.keys(players).length === 0 ? 'Zidni' : 'Rahma' };
      socket.emit('joined', { id: socket.id, position: 1, name: players[socket.id].name });
      io.emit('playersUpdate', players);
    } else {
      socket.emit('full');
    }
  });

  socket.on('rollDice', () => {
    const dice = Math.ceil(Math.random() * 6);
    let pos = players[socket.id].position + dice;

    const snakes = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
    const ladders = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

    if (snakes[pos]) pos = snakes[pos];
    else if (ladders[pos]) pos = ladders[pos];
    if (pos > 100) pos = players[socket.id].position;

    players[socket.id].position = pos;

    io.emit('playersUpdate', players);
    if (pos === 100) io.emit('gameOver', socket.id);
  });

  socket.on('sendMessage', (message) => {
    io.emit('chatMessage', { id: socket.id, name: players[socket.id]?.name || 'Pemain', message });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playersUpdate', players);
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));