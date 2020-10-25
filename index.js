const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
let port = process.env.PORT || 3000;

let online = 0;

io.on('connection', (socket) => {
    console.log('User Connected');
    let connections = io.sockets.clients().server.engine.clientsCount;
    online += 1;
    socket.on('chatmessage', (msg) => {
        if(msg != '') {
            console.log(msg);
            io.emit('chatmessage', msg)
        }
    });
    socket.on('device', (device) => {
        if(device != '') {
            console.log(device);
            io.emit('device', device)
        }
    });

    socket.on('disconnect', () => {
        console.log('dissconnected');
        online -= 1;
        io.emit('connections', online)
    });

    io.emit('connections', online)
});


server.listen(port, () => console.log(`Server is running on port ${port}`));
