const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// Database connectivity
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
client.connect();

let port = process.env.PORT || 3000;

let online = 0;
let texts = []

const initiate = async() => {
    const getAllMessages = () => {
        return new Promise((resolve, reject) => {
            client.query('SELECT * FROM messages;', (err, res) => {
                if (err) throw err;
                
                texts = res.rows[0].data;
                resolve();
            });
        })
    }

    const save = () => {
        client.query(`UPDATE messages SET data = (\'${JSON.stringify(texts)}\') WHERE id = 1`, (err, res) => {
            if (err) throw err;
        });
    }
    
    await getAllMessages();
    console.log('Messages obtained from database');

    // Save messages to database every 5 minutes even without user interaction
    setInterval(() => {
        save();
        console.log('Database updated');
    }, 300000);

    io.on('connection', async(socket) => {
    
        console.log('User Connected');
        let connections = socket.client.conn.server.clientsCount;
        online = connections;
        console.log(socket.client.conn.server.clientsCount + " users online");
        socket.on('chatmessage', (msg) => {
    
            if(msg.message != '') {
                
                texts.push(msg)
                
                // To prevent too many texts in the room
                if(texts.length == 500) {
                    texts = texts.splice(100, 500);
                }
    
                io.emit('chatmessage', texts);
                save();
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
}
initiate();

server.listen(port, () => console.log(`Server is running on port ${port}`));