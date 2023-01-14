// Зависимости
const express = require('express');

const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);

const io = socketIO(server);

// Настройки сервера
const settings = require('./settings.js');

app.set('port', settings.serverPort);
app.use('/static', express.static(__dirname + '/static'));

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html'));
});
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, './static/routes/game.html'));
});

// Запуск сервера
server.listen(5000, settings.serverIP, () => {
    console.log('Запускаю сервер на порте 5000');
});

rooms = [];

io.on('connection', (socket) => {
    socket.on('createRoom', (room) => {
        let roomCopy = room;
        roomCopy.players[0].id = socket.id;
        rooms.push(roomCopy);
        socket.join(room.name);
    }) 

    socket.on('joinRoom', (room) => {
        const foundRoom = rooms.filter(element => element.name === room.name);

        if (foundRoom.length !== 0 && foundRoom[0].status === 'idle') {
            player = {
                name: room.player,
                id: socket.id,
                currentTurn: false,
            };

            foundRoom[0].players.push(player);

            socket.join(room.name);

            if (foundRoom[0].players.length === 2) {
                let changedRoom = foundRoom[0];
                changedRoom.status = 'ready';

                io.to(room.name).emit('updateBoardClient', changedRoom);
            }
        }
        else {
            console.log('error');
        }
    }); 

    socket.on('userAction', (currentRoomName, cellId = '') => {
        const currentRoom = rooms.filter(element => element.name === currentRoomName)[0];

        let status = 'process';

        const P1 = 1;
        const P2 = -1;

        if (currentRoom.players[0].currentTurn === false && socket.id === currentRoom.players[0].id || currentRoom.board[cellId[4] - 1][cellId[5] - 1] != 0){
            return;
        }
        if (currentRoom.players[1].currentTurn === false && socket.id === currentRoom.players[1].id || currentRoom.board[cellId[4] - 1][cellId[5] - 1] != 0){
            return;
        }

        if (currentRoom.players[0].currentTurn === true && socket.id === currentRoom.players[0].id ){
            currentRoom.board[cellId[4] - 1][cellId[5] - 1] = P1;
        }

        if (currentRoom.players[1].currentTurn === true && socket.id === currentRoom.players[1].id){
            currentRoom.board[cellId[4] - 1][cellId[5] - 1] = P2;
        }
        
        currentRoom.moves += 1;
        currentRoom.players[0].currentTurn = !currentRoom.players[0].currentTurn;
        currentRoom.players[1].currentTurn = !currentRoom.players[1].currentTurn;

        if (currentRoom.board[0][0] + currentRoom.board[0][1] + currentRoom.board[0][2] === 3 || 
            currentRoom.board[1][0] + currentRoom.board[1][1] + currentRoom.board[1][2] === 3 ||
            currentRoom.board[2][0] + currentRoom.board[2][1] + currentRoom.board[2][2] === 3 ||
            currentRoom.board[0][0] + currentRoom.board[1][0] + currentRoom.board[2][0] === 3 ||
            currentRoom.board[0][1] + currentRoom.board[1][1] + currentRoom.board[2][1] === 3 ||
            currentRoom.board[0][2] + currentRoom.board[1][2] + currentRoom.board[2][2] === 3 ||
            currentRoom.board[0][0] + currentRoom.board[1][1] + currentRoom.board[2][2] === 3 ||
            currentRoom.board[0][2] + currentRoom.board[1][1] + currentRoom.board[2][0] === 3 )
            {
            currentRoom.status = 'P1';
        }
        if (currentRoom.board[0][0] + currentRoom.board[0][1] + currentRoom.board[0][2] === -3 || 
            currentRoom.board[1][0] + currentRoom.board[1][1] + currentRoom.board[1][2] === -3 ||
            currentRoom.board[2][0] + currentRoom.board[2][1] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][0] + currentRoom.board[1][0] + currentRoom.board[2][0] === -3 ||
            currentRoom.board[0][1] + currentRoom.board[1][1] + currentRoom.board[2][1] === -3 ||
            currentRoom.board[0][2] + currentRoom.board[1][2] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][0] + currentRoom.board[1][1] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][2] + currentRoom.board[1][1] + currentRoom.board[2][0] === -3 )
            {
            currentRoom.status = 'P2';
        }
        if (currentRoom.moves >= 9){
            currentRoom.status = 'tie';
        }
        
        console.log(currentRoom.status);

        io.to(currentRoomName).emit('updateBoardClient', currentRoom);
        // io.to(currentRoomName).emit('statusRoom', status);
    })
});