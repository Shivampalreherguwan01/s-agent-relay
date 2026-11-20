const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e7 });

app.get('/', (req, res) => res.send('S.Agent2 Ultimate Server is Live!'));

io.on('connection', (socket) => {
    socket.on('join-as-host', (roomId) => {
        socket.join(roomId);
        console.log(`Host joined: ${roomId}`);
    });

    socket.on('request-connect', (roomId) => {
        console.log(`Controller requested: ${roomId}`);
        socket.to(roomId).emit('controller-joined');
    });

    socket.on('screen-frame', (data) => {
        socket.to(data.roomId).emit('receive-screen', data);
    });
    
    socket.on('touch-event', (data) => {
        socket.to(data.roomId).emit('perform-touch', data);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});
