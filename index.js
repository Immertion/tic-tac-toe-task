// Зависимости
const express = require('express');
const { query } = require('express');

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

// Комнаты
let rooms = [];

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html'));
});
app.get('/game', (req, res) => {
    // Перенаправление на главную страницу, в случае,
    // если такого id нет
    // if(!rooms.includes(req.query['id'])) {
    //     res.redirect('/');
    // }

    res.sendFile(path.join(__dirname, './static/routes/game.html'));
});

// Запуск сервера
server.listen(5000, settings.serverIP, () => {
    console.log('Запускаю сервер на порте 5000');
});

io.on('connection', (socket) => {
    socket.on('createRoom', (roomName) => {
        roomObj = {roomName: roomName, playerName: undefined};
        rooms.push(roomObj);
        console.log(rooms);
    });

    socket.on('findRoom', (roomName) => {
        let response = true;
        // if (rooms.find(element => element === roomName)) {
        //     response = true;
        // }
        
        socket.emit('roomExists', response);
    });

    socket.on('addPlayerToRoom', (roomObj) => {
        if (!rooms.find(element => element[roomName])) {
            socket.emit('roomExists', false);
            return;
        }

        rooms.find(element => element = roomObj.roomName)['playerName'] = roomObj.playerName;
        console.log(rooms);
    })
});