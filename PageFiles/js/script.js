const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');


//To get name and room 
const {username, room} =  Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Joining the chatroom
socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room}) => { 
    outputRoomName(room);
});

socket.on('message', message => { //message from bot
    console.log(message);
    outputMessage(message);

    //to scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Messaging
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value; //getting text message
    socket.emit('chatMessage', msg); //emitting message to server

    e.target.elements.msg.value=''; //clear input
    e.target.elements.msg.focus;
});

//DOM message
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.name} <span>${message.time}</span></p>
    <p class="text">
     ${message.text}
     </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outputRoomName(room){
    if(typeof room !== 'undefined') {roomName.innerText = `Chatroom: ${room}`;}
    else roomName.innerText = 'Chatroom';
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {window.location = '../index.html';});