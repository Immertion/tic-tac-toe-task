socket = io();

///
const ANIMATION_DURATION = 500;
///

function init(objectsList) {
    objectsList.forEach(elementId => {
        $(elementId).hide();
        $(elementId).removeClass('disabled');
    });
}

$(document).ready(function () {
    objectsList = ['#modalWindowForm', '#modalWindow', '#modalWindowInfo', '#gameInfo', '#gameCanvas'];
    // objectsList = ['#modalWindowForm', '#modalWindow'];
    init(objectsList);
});

$('#connectToRoom').click(function (e) {
    e.preventDefault();
    $('#modalWindowForm').fadeIn(ANIMATION_DURATION);
});

$('#modalBackground').click(function (e) {
    e.preventDefault();
    $('#modalWindowForm').slideUp(ANIMATION_DURATION);
});

$('#createRoom').click(function (e) { 
    e.preventDefault();
    const playerName = $('#inputPlayerName').val();

    room = {
        name: playerName + '',
        players: [
            {
                name: playerName,
                id: undefined,
                currentTurn: true,
                wins: 0,
                loses: 0,
                ties: 0,
            }
        ],
        status: 'idle',
        board: [
            [0, 0, 0], 
            [0, 0, 0],
            [0, 0, 0],
        ],
        moves: 0,
        timer: undefined,
        isUpdated: true,
    };

    socket.emit('createRoom', room);

    $('#modalWindow').fadeIn(ANIMATION_DURATION);
});

$('#connectToRoomModal').click(function (e) { 
    e.preventDefault();
    const roomName = $('#inputRoomNameModal').val();
    const playerName = $('#inputPlayerName').val();

    room = {
        name: roomName + '',
        player: playerName,
    };

    socket.emit('joinRoom', room);
});

function prepareRoom(room) {
    $('#modalWindowForm').hide();
    $('#modalWindow').hide();
    $('#playMenu').hide();

    $('#firstPlayerName').html(room.players[0].name + ' (X)');
    $('#secondPlayerName').html(room.players[1].name + ' (O)');
    
    $('#gameInfo').fadeIn(ANIMATION_DURATION);
    $('#gameCanvas').fadeIn(ANIMATION_DURATION);
}

let currentRoom;

$('.game-cell').click(function (e) { 
    e.preventDefault();
    socket.emit('userAction', currentRoom.name, this.id);
});

function updateBoard(room) {
    currentRoom = room;

    // Если нет необходимости обновлять все ячейки,
    // просто обновляем таймер
    if (!room.isUpdated) {
        $('#gameTimer').html(room.timer);
        return;
    }

    const pathImg = 'static/images/';
    const formatImg = '.png';
    
    for (let i = 1; i <= 3; i++){
        for (let j = 1; j <= 3; j++){
            let img = document.createElement('img');
            img.classList.add('game-icon');
            if (room.board[i - 1][j - 1] === 0){
                img.src = pathImg + 'dot' + formatImg;
            }
            else if( room.board[i - 1][j - 1] === 1){
                img.src = pathImg + 'cross' + formatImg;
            }
            else if( room.board[i - 1][j - 1] === -1){
                img.src = pathImg + 'o' + formatImg;
            }
            $('#' + 'game' + i + j).html(img);
        }
    }

    

    room.players.forEach(player => {
        if (player.currentTurn && player.id === socket.id) {
            $('#message').html('ваш ход');
        }
        else if (!player.currentTurn && player.id === socket.id){
            $('#message').html('ходит соперник');
        }
    });

    $('#firstPlayerWins').html(room.players[0].wins);
    $('#secondPlayerWins').html(room.players[1].wins);
    $('#firstPlayerLoses').html(room.players[0].loses);
    $('#secondPlayerLoses').html(room.players[1].loses);
    $('#firstPlayerTies').html(room.players[0].ties);
    $('#secondPlayerTies').html(room.players[1].ties);
}

function showModal(message) {
    setTimeout(() => {
        $('#modalWindowInfo').fadeIn(ANIMATION_DURATION);
        $('#modalMessage').html(message);
    }, 1000);
}

function closeModal() {
    $('#modalWindowInfo').slideUp(500);
}

socket.on('updateBoardClient', (room) => {
    console.log(room);

    if (room.players[0].id.readyState === 3){
        socket.emit('destroyRoom', currentRoom.name);
    }
    if (room.players[1].id.readyState === 3){
        socket.emit('destroyRoom', currentRoom.name);
    }

    switch (room.status) {
        // Подготовка к игре:
        // сокрытие меню и показывание игрового
        // поля и статистики
        case 'ready':
            prepareRoom(room);
            break;
        // В случае если игрок 1 побеждает
        case 'P1':
            showModal(room.players[0].name + ' победил') 
            break;
        // В случае если игрок 2 побеждает
        case 'P2':
            showModal(room.players[1].name + ' победил') 
            break;
        // В случае если ничья
        case 'tie':
            showModal('ничья') 
            break;
        case 'destroyed':
            location.href = '/';
            room.preventDefault();
            break;
        case 'restart':
            prepareRoom(room);
            break;
    }

    updateBoard(room);
})


$('#restartRoom').click(function (e) { 
    e.preventDefault();

    closeModal();

    socket.emit('restartRoom', currentRoom.name);
});

$('#backToLobby').click(function (e) { 
    e.preventDefault();
    
    closeModal();

    socket.emit('destroyRoom', currentRoom.name);
});

socket.on

