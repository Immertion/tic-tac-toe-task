socket = io();

function init(objectsList) {
    objectsList.forEach(elementId => {
        $(elementId).hide();
        $(elementId).removeClass('disabled');
    });
}

$(document).ready(function () {
    // objectsList = ['#modalWindowForm', '#modalWindow', '#gameInfo', '#gameCanvas'];
    objectsList = ['#modalWindowForm', '#modalWindow'];
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
            playerName,
        ],
        status: 'idle',
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

    $('#firstPlayerName').html(room[0].players[0] + ' (X)');
    $('#secondPlayerName').html(room[0].players[1] + ' (O)');
    
    $('#gameInfo').show(500);
    $('#gameCanvas').show();
}

socket.on('roomStatus', (room) => {
    console.log(room[0]);
    if (room[0].status === 'ready') {
        prepareRoom(room);
    }
});