const { query } = require('express');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
// const { testDB } = require('./constants.js');

// Database connectivity
const { Client } = require('pg');
const client = new Client({
    // connectionString: testDB,
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
                if (err) console.log(err);
                
                texts = res.rows[0].data;
                resolve();
            });
        })
    }

    const save = (texts) => {
        return new Promise((resolve, reject) => {
            let query = `UPDATE messages SET data = (\'${JSON.stringify(texts)}\') WHERE id = 1`;
            client.query(query, (err, res) => {
                if (err) console.log(err);
                resolve();
                console.log('Message saved');
            });
        }) 
    }
    
    await getAllMessages();
    console.log('Messages obtained from database');

    // Save messages to database every 5 minutes even without user interaction
    // setInterval(() => {
    //     save();
    //     console.log('Database updated');
    // }, 60000);

    io.on('connection', (socket) => {
    
        console.log('User Connected');
        let connections = socket.client.conn.server.clientsCount;
        online = connections;
        console.log(socket.client.conn.server.clientsCount + " users online");
        socket.on('chatmessage', async(msg) => {
    
            if(msg.message != '') {
                
                texts.push(msg)
                
                // To prevent too many texts from collecting in app
                if(texts.length == 500) {
                    texts = texts.splice(100, 500);
                }
    
                io.emit('chatmessage', texts);
                await save(texts);
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