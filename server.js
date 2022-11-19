const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
var numClients = {};

const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname, 'PageFiles')));


//Runs when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        
        socket.join(user.room);

        socket.emit('message', formatMessage('Daima Bot', 'Welcome!')); //to the client

        //Broadcast when a user connects to all except to client
        socket.broadcast.to(user.room).emit('message', formatMessage('Daima Bot', `${user.username} has joined!`));

        if (numClients[user.room] == undefined) {
            numClients[user.room] = 1;
        } else {
            numClients[user.room]++;
        }

        //room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: numClients[user.room]
        });

    });

    //listening for text message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //on disconnection
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage('Daima Bot', `${user.username} has left`));

            numClients[user.room]--;

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: numClients[user.room]
            });
        }
    });

});

const PORT = 5000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));