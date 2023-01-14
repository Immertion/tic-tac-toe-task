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
        rooms.push(room);
        socket.join(room.name);
    }) 

    socket.on('joinRoom', (room) => {
        const foundRoom = rooms.filter(element => element.name === room.name);
        if (foundRoom.length !== 0) {
            foundRoom[0].players.push(room.player);

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
    }) 
});