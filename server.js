const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => res.send('S.Agent2 Relay is Live!'));

io.on('connection', (socket) => {
    // Host room join karega
    socket.on('join-as-host', (roomId) => {
        socket.join(roomId);
    });

    // Controller connect request bhejega
    socket.on('request-connect', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('controller-requested', socket.id);
    });

    // Host accept karega aur stream start karega
    socket.on('accept-connect', (data) => {
        socket.to(data.roomId).emit('connection-accepted', data);
    });

    // Touch events
    socket.on('touch-event', (data) => {
        socket.to(data.roomId).emit('perform-touch', data);
    });

    // Screen Frames
    socket.on('screen-frame', (data) => {
        socket.to(data.roomId).emit('receive-screen', data);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
