const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => res.send('S.Agent2 WebRTC Signaling is Live!'));

io.on('connection', (socket) => {
    socket.on('join', (roomId) => {
        socket.join(roomId);
    });

    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', data.sdp);
    });

    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', data.sdp);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data.candidate);
    });

    socket.on('touch-event', (data) => {
        socket.to(data.roomId).emit('perform-touch', data);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
