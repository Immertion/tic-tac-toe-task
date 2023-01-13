// Зависимости
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

// Настройки сервера
const settings = require('./settings.js');

app.set('port', settings.serverPort);
app.use('/static', express.static(__dirname + '/static'));

// Маршруты
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, './static/index.html'));
});
app.get('/game', (request, response) => {
    response.sendFile(path.join(__dirname, './static/routes/game.html'));
});

// Запуск сервера
server.listen(5000, settings.serverIP, () => {
    console.log('Запускаю сервер на порте 5000');
});

var players = {};

io.on("connection", (socket) => {
    console.log(socket.id);
});