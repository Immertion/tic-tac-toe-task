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

let rooms = [];
let restartSubmitSockets = [];

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
                wins: 0,
                loses: 0,
                ties: 0,
            };

            foundRoom[0].players.push(player);

            socket.join(room.name);

            if (foundRoom[0].players.length === 2) {
                initGame(foundRoom[0]);
            }
        }
        else {
            if (!foundRoom[0]) {
                io.to(socket.id).emit('errorMessаge', 'Комната не найдена!')
            }
            else  {
                io.to(socket.id).emit('errorMessаge', 'Комната заполнена!')
            }
            console.log('error');

        }
    });

    const GAME_DURATION_SEC = 31;

    function initGame(room) {
        room.status = 'ready';
        io.to(room.name).emit('updateBoardClient', room);

        room.status = 'process';
        room.timer = GAME_DURATION_SEC;

        const UPDATE_INTERVAL = 1000;

        const intervalId = setInterval(() => {
            handleGame(room, intervalId);
        }, UPDATE_INTERVAL);
    }

    function handleGame(room, intervalId) {
        room.timer--;

        if (room.timer <= 0) {
            if (room.players[0].currentTurn && room.timer === 0) {
                room.status = 'P2';
            }
            else if (room.players[1].currentTurn && room.timer === 0) {
                room.status = 'P1';
            }

            clearInterval(intervalId);
        }

        room.isUpdated = false;
        io.to(room.name).emit('updateBoardClient', room);
    }

    function findRoomByName(roomName) {
        return rooms.filter(element => element.name === roomName)[0];
    }

    function findRoomByIdSocket(id){
        return rooms.filter(element => (element.players[0].id === id || element.players[1].id === id))[0];
    }

    socket.on('userAction', (currentRoomName, cellId = '') => {
        const currentRoom = findRoomByName(currentRoomName);

        const P1 = 1;
        const P2 = -1;

        // Ход совершён, прибавляем время


        if (currentRoom.players[0].currentTurn === false && socket.id === currentRoom.players[0].id || currentRoom.board[cellId[4] - 1][cellId[5] - 1] != 0){
            return;
        }
        if (currentRoom.players[1].currentTurn === false && socket.id === currentRoom.players[1].id || currentRoom.board[cellId[4] - 1][cellId[5] - 1] != 0){
            return;
        }

        if (currentRoom.players[0].currentTurn === true && socket.id === currentRoom.players[0].id ){
            currentRoom.board[cellId[4] - 1][cellId[5] - 1] = P1;
            currentRoom.timer = GAME_DURATION_SEC;
        }

        if (currentRoom.players[1].currentTurn === true && socket.id === currentRoom.players[1].id){
            currentRoom.board[cellId[4] - 1][cellId[5] - 1] = P2;
            currentRoom.timer = GAME_DURATION_SEC;
        }

        currentRoom.moves += 1;

        currentRoom.players.forEach(player => {
            player.currentTurn = !player.currentTurn;
        });

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
            console.log(currentRoom.status);

            currentRoom.players[0].wins++;
            currentRoom.players[1].loses++;

            currentRoom.timer = 0;
        }

        else if (currentRoom.board[0][0] + currentRoom.board[0][1] + currentRoom.board[0][2] === -3 ||
            currentRoom.board[1][0] + currentRoom.board[1][1] + currentRoom.board[1][2] === -3 ||
            currentRoom.board[2][0] + currentRoom.board[2][1] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][0] + currentRoom.board[1][0] + currentRoom.board[2][0] === -3 ||
            currentRoom.board[0][1] + currentRoom.board[1][1] + currentRoom.board[2][1] === -3 ||
            currentRoom.board[0][2] + currentRoom.board[1][2] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][0] + currentRoom.board[1][1] + currentRoom.board[2][2] === -3 ||
            currentRoom.board[0][2] + currentRoom.board[1][1] + currentRoom.board[2][0] === -3 )
        {

            currentRoom.status = 'P2';

            currentRoom.players[1].wins++;
            currentRoom.players[0].loses++;

            currentRoom.timer = 0;
        }

        else if (currentRoom.moves >= 9){
            currentRoom.status = 'tie';

            currentRoom.players.forEach(player => {
                player.ties++;
            });

            currentRoom.timer = 0;
        }
        console.log(currentRoom.players[1].id);
        currentRoom.isUpdated = true;

        io.to(currentRoomName).emit('updateBoardClient', currentRoom);
    })



    socket.on('destroyRoom', (roomName) => {
        const currentRoom = findRoomByName(roomName);

        currentRoom.status = 'destroyed';
        console.log(currentRoom);
        io.to(roomName).emit('updateBoardClient', currentRoom);
        rooms = rooms.filter(element => element !== currentRoom);
    });

    function clearBoard() {
        const board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ]

        return board;
    }

    function restartRoom(room) {
        [room.players[0], room.players[1]] = [room.players[1], room.players[0]];
        initGame(room);
        room.board = clearBoard();
        room.isUpdated = true;
        room.moves = 0;

        return room;
    }

    socket.on('disconnect', function(){
        const currentRoom = findRoomByIdSocket(socket.id);
        if (currentRoom){
            console.log(currentRoom);
            currentRoom.timer = 0;
            // socket.emit("disconn", currentRoom);
            io.to(currentRoom.name).emit('disconn', currentRoom);

        }
    })

    socket.on('restartRoom', (roomName) => {
        if (!restartSubmitSockets.includes(socket.id)) {
            restartSubmitSockets.push(socket.id);
        }

        if (restartSubmitSockets.length === 2) {
            restartSubmitSockets.length = 0;
            currentRoom = findRoomByName(roomName);
            currentRoom.status = 'restart';

            currentRoom = restartRoom(currentRoom);
            io.to(roomName).emit('updateBoardClient', currentRoom);
        }
    });
});