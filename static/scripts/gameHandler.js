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
            {
                name: playerName,
                id: undefined,
            }
        ],
        status: 'idle',
        board: [
            [0, 0, 0], 
            [0, 0, 0],
            [0, 0, 0],
        ],
        currentTurn: true,
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

    $('#firstPlayerName').html(room[0].players[0].name + ' (X)');
    $('#secondPlayerName').html(room[0].players[1].name + ' (O)');
    
    $('#gameInfo').show(500);
    $('#gameCanvas').show();
}

let currentRoom;

socket.on('roomStatus', (room) => {
    console.log(room[0]);
    currentRoom = room[0];
    if (room[0].status === 'ready') {
        // socket.emit('userAction', currentRoom.name);
        prepareRoom(room);
    }
});

$('.game-cell').click(function (e) { 
    e.preventDefault();
    socket.emit('userAction', currentRoom.name, this.id);
    console.log(this.id);
});


socket.on('updateBoardClient', room => {
    const pathImg = 'static/images/';
    const formatImg = '.png';
    
    for (let i = 1; i <= 3; i++){
        for (let j = 1; j <= 3; j++){
            let img = document.createElement('img');
            img.classList.add('game-icon');
            if (room[0].board[i - 1][j - 1] === 0){
                img.src = pathImg + 'dot' + formatImg;
            }
            else if( room[0].board[i - 1][j - 1] === 1){
                img.src = pathImg + 'cross' + formatImg;
            }
            else if( room[0].board[i - 1][j - 1] === -1){
                img.src = pathImg + 'o' + formatImg;
            }
            $('#' + 'game' + i + j).html(img);
        }
    }
})
socket.on('statusRoom', status => {
    if (status === 'process'){
    }
    else if (status === 'P1'){

    }
    else if (status === 'P2'){

    }
    else if (status === 'tie'){
        
    }
})

