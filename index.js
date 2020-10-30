const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
let port = process.env.PORT || 3000;

let online = 0;

let texts = []
let placeholder = [
    { name: 'Zoraiz', message: 'Hello there wanderer. I see the wheels of fate have carved your path to arive here' }
    { name: 'Zoraiz', message: 'I humbly thank you for visiting my precious domain' },
    { name: 'Zoraiz', message: 'Though once this place was lively and undead, it has decayed to this state of unsightly existence' },
    { name: 'Shafay', message: 'Regardless, please remember, I existed' },
    { name: 'Shafay', message: 'And I continue to exist' },
    { name: 'Shafay', message: 'Though most really don\'t care ._.' },
]

io.on('connection', (socket) => {
    console.log('User Connected');
    let connections = socket.client.conn.server.clientsCount;
    online = connections;
    console.log(socket.client.conn.server.clientsCount + " users online");
    socket.on('chatmessage', (msg) => {
        if(msg.message != '') {
            
            texts.push(msg)
            // Reduce texts on server if they reach 1000
            if(texts.length == 1000) {
                texts = texts.splice(200, 999);
            }

            if(texts.length == 0) {
                io.emit('chatmessage', placeholder)
            } else { 
                console.log(texts);
                io.emit('chatmessage', texts)
            }
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

//commento