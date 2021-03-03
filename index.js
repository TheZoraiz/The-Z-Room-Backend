const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

let port = process.env.PORT || 3000;

let online = 0;

let texts = []

io.on('connection', (socket) => {
    console.log('User Connected');
    let connections = socket.client.conn.server.clientsCount;
    online = connections;
    console.log(socket.client.conn.server.clientsCount + " users online");
    socket.on('chatmessage', (msg) => {
        if(msg.message != '') {
            
            texts.push(msg)

            if(texts.length == 1000) {
                texts = texts.splice(200, 999);
            }

            io.emit('chatmessage', texts)
            
        }
    });
    socket.on('disconnect', () => {
        console.log('User Disconnected');
        online -= 1;
        io.emit('connections', online)
    });

    io.emit('chatmessage', texts)
    io.emit('connections', connections)
});


server.listen(port, () => console.log(`Server is running on port ${port}`));