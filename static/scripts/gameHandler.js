var socket = io();

let socketID;

const helloMessageRu = "здравствуйте, ";
socket.on("connect", () => {
    socketID = socket.id;
    $('#helloMessage').html(helloMessageRu + socketID);
});
