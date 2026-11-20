const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get('/', (req, res) => res.send('S.Agent2 WebRTC Signaling is Live!'));

io.on('connection', (socket) => {
    console.log("New Device Connected:", socket.id);

    socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`Device ${socket.id} joined room: ${roomId}`);
    });

    socket.on('request-connect', (roomId) => {
        console.log(`Controller requested to connect to room: ${roomId}`);
        socket.to(roomId).emit('controller-joined');
    });

    socket.on('offer', (data) => {
        console.log(`Offer sent for room: ${data.roomId}`);
        socket.to(data.roomId).emit('offer', data.sdp);
    });

    socket.on('answer', (data) => {
        console.log(`Answer received for room: ${data.roomId}`);
        socket.to(data.roomId).emit('answer', data.sdp);
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', data.candidate);
    });
    
    socket.on('touch-event', (data) => {
        socket.to(data.roomId).emit('perform-touch', data);
    });

    socket.on('disconnect', () => {
        console.log("Device Disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
