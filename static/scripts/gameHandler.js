socket = io();

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
    $('#modalWindowForm').show(500);
});

$('#modalBackground').click(function (e) {
    e.preventDefault();
    $('#modalWindowForm').hide(500);
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
            }
        ],
        status: 'idle',
        board: [
            [0, 0, 0], 
            [0, 0, 0],
            [0, 0, 0],
        ],
        currentTurn: true,
        moves: 0,
        timer: 0
    };

    socket.emit('createRoom', room);

    $('#modalWindow').show('500');
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
    $('#modalWindowForm').hide(500);
    $('#modalWindow').hide(500);
    $('#playMenu').hide(500);

    $('#firstPlayerName').html(room.players[0].name + ' (X)');
    $('#secondPlayerName').html(room.players[1].name + ' (O)');
    
    $('#gameInfo').show(500);
    $('#gameCanvas').show();
}

let currentRoom;

// socket.on('roomStatus', (room) => {
//     if (room[0].status === 'ready') {
//         // socket.emit('userAction', currentRoom.name);
//         prepareRoom(room);
//     }
// });

$('.game-cell').click(function (e) { 
    e.preventDefault();
    socket.emit('userAction', currentRoom.name, this.id);
    console.log(this.id);
});

function updateBoard(room) {
    currentRoom = room;

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
}

function showModal(message) {
    setTimeout(() => {
        $('#modalWindowInfo').show(500);
        $('#modalMessage').html(message);
    }, 1000);
}

function closeModal() {
    $('#modalWindowInfo').hide(500);
}

socket.on('updateBoardClient', (room) => {
    console.log(room);

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
    }

    updateBoard(room);
})

socket.on('statusRoom', (status) => {
    if (status === 'process'){
    }
    else if (status === 'P1'){

    }
    else if (status === 'P2'){

    }
    else if (status === 'tie'){
        
    }
})

$('#restartRoom').click(function (e) { 
    e.preventDefault();

    closeModal();
    updateBoard(currentRoom);
});

$('#backToLobby').click(function (e) { 
    e.preventDefault();
    
    closeModal();
    location.href = '/';
});

