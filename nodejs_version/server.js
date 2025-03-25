// CS 532 - Modern Web Technologies
// Robert J. Armendariz
// 03-24-2025
// File: server.js

// express
const express = require('express');

// port to connect to
const PORT = 3000;

// http
const http = require('http');

// path
const path = require('path');

// server
const { Server } = require('socket.io');

// create express application
const app = express();

// create server with app
const server = http.createServer(app);

// socket io
const io = new Server(server);

// players that join game
let players = [];

// the current players turn
let currentPlayer = 1;

// files to use in 'game' directory
app.use(express.static(path.join(__dirname, 'game')));

// start io (to all clients) on socket
io.on('connection', (socket) => {
    // check for full lobby instance
    if (players.length >= 2) {
        socket.emit('gamefull');
        return;
    }

    // player ID that joins
    const playerId = players.length + 1;
    players.push({ id: socket.id, player: playerId });

    // initialize game (waiting for other player state)
    socket.emit('initialization', playerId);

    // check if lobby is full (2 players)
    if (players.length === 2) {
        // start game
        io.emit('start', { currentPlayer });
    }

    // called when piece has been placed
    socket.on('move', (data) => {
        // next player's turn
        currentPlayer = currentPlayer === 1 ? 2 : 1;

        // called when oppenent moves
        socket.broadcast.emit('opponentMove', data);

        // called when updating turn
        io.emit('updateTurn', currentPlayer);
    });

    // called when resetting game
    socket.on('reset', () => {
        // default current player
        currentPlayer = 1;

        // reset game on clients
        io.emit('resetGame');

        // update turn on client
        io.emit('updateTurn', currentPlayer);
    });

    // called when player disconnects from lobby
    socket.on('disconnect', () => {
        // update player list
        players = players.filter(p => p.id !== socket.id);

        // reset game on clients
        io.emit('resetGame');

        // display player has left alert
        io.emit('end');
    });
});

// server listen on port 3000
server.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});
