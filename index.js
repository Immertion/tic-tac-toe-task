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
            };

            foundRoom[0].players.push(player);

            socket.join(room.name);

            if (foundRoom[0].players.length === 2) {
                let changedRoom = foundRoom;
                changedRoom[0].status = 'ready';

                io.to(room.name).emit('roomStatus', changedRoom);
            }
        }
        else {
            console.log('error');
        }
    }); 

    socket.on('userAction', (currentRoomName, cellId = '') => {
        const foundRoom = rooms.filter(element => element.name === currentRoomName);

        let win = 3;
        let status = 'process';

        const P1 = 1;
        const P2 = -1;
        
        console.log(foundRoom[0].board, cellId);

        if (foundRoom[0].currentTurn === true){
            foundRoom[0].board[cellId[4] - 1][cellId[5] - 1] = P1;
        }
        else{
            foundRoom[0].board[cellId[4] - 1][cellId[5] - 1] = P2;
        }
        foundRoom[0].currentTurn = !foundRoom[0].currentTurn;

        if (foundRoom[0].board[0][0] + foundRoom[0].board[0][1] + foundRoom[0].board[0][2] === 3 || 
            foundRoom[0].board[1][0] + foundRoom[0].board[1][1] + foundRoom[0].board[1][2] === 3 ||
            foundRoom[0].board[2][0] + foundRoom[0].board[2][1] + foundRoom[0].board[2][2] === 3 ||
            foundRoom[0].board[0][0] + foundRoom[0].board[1][0] + foundRoom[0].board[2][0] === 3 ||
            foundRoom[0].board[0][1] + foundRoom[0].board[1][1] + foundRoom[0].board[2][1] === 3 ||
            foundRoom[0].board[0][2] + foundRoom[0].board[1][2] + foundRoom[0].board[2][2] === 3 ||
            foundRoom[0].board[0][0] + foundRoom[0].board[1][1] + foundRoom[0].board[2][2] === 3 ||
            foundRoom[0].board[0][2] + foundRoom[0].board[1][1] + foundRoom[0].board[2][0] === 3 ){
            status = 'P1';
        }
        if (foundRoom[0].board[0][0] + foundRoom[0].board[0][1] + foundRoom[0].board[0][2] === -3 || 
            foundRoom[0].board[1][0] + foundRoom[0].board[1][1] + foundRoom[0].board[1][2] === -3 ||
            foundRoom[0].board[2][0] + foundRoom[0].board[2][1] + foundRoom[0].board[2][2] === -3 ||
            foundRoom[0].board[0][0] + foundRoom[0].board[1][0] + foundRoom[0].board[2][0] === -3 ||
            foundRoom[0].board[0][1] + foundRoom[0].board[1][1] + foundRoom[0].board[2][1] === -3 ||
            foundRoom[0].board[0][2] + foundRoom[0].board[1][2] + foundRoom[0].board[2][2] === -3 ||
            foundRoom[0].board[0][0] + foundRoom[0].board[1][1] + foundRoom[0].board[2][2] === -3 ||
            foundRoom[0].board[0][2] + foundRoom[0].board[1][1] + foundRoom[0].board[2][0] === -3 ){
            status = 'P2';
        }

        console.log(status);
      
        io.to(currentRoomName).emit('updateBoardClient', foundRoom);
        io.to(currentRoomName).emit('statusRoom', status);
    })
});