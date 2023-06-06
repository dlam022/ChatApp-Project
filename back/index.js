
const express = require("express");
const socketIO = require('socket.io');
const http = require('http');
const cors  = require("cors");
const session = require('express-session');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require( 'body-parser');
const app = express(); 
const server = http.createServer(app);

const auth = require('./routes/auth');
const rooms = require('./routes/rooms');
const { LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");

const Messages = require('./model/messages.js');

// TODO: add cors to allow cross origin requests
//cors allows us to access server from a different address
//allows all origins. Any website from any domain can connect

const io = socketIO(server, {
  cors: {
    origin:'*',
  }
});

app.use(cors({origin: 'http://localhost:3000', credentials:true }))


dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Connect to the database
// TODO: your code here

mongoose.connect(process.env.MONGO_URL);

const database = mongoose.connection;
database.on('error', (error)=>console.error(error));
database.once('open', ()=>{
  console.log("Connected to the data base");
});


// Set up the session
// TODO: your code here

const sessionMiddleware = session({
  resave: false, //whether or not to save session to the store on request
  saveUninitialized:false, //whether to save uninitialized sessions to the store
  secret:process.env.SESSION_SECRET,
})

app.use(sessionMiddleware);





app.get('/', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({ message: "logged in" });
  }
  else {  
    console.log("not logged in")
    res.json({ message: "not logged" });
  }
});


app.use("/api/auth/", auth);


// checking the session before accessing the rooms
app.use((req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
});
app.use("/api/rooms/", rooms);



// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});


// TODO: make sure that the user is logged in before connecting to the socket
// TODO: your code here
io.use((socket,next)=>{
  console.log("Socket io middleware");
  sessionMiddleware(socket.request, {}, next);//pass request into session middleware which checks whether information coming to it is valid
});

//add encrypted information to connection and verify the user is authenicated
//verify if session is active or not
io.use((socket, next)=> {
  if (socket.request.session && socket.request.session.authenticated) {
    next();
  }

  else {
    console.log("unauthorized");
    next(new Error ('unauthorized'));
  }
});

// io.on('connection', (socket)=>{
//   console.log("user connected")
//   // TODO: write codes for the messaging functionality
//   // TODO: your code here
//   const username = socket.request.session.username;
//   const name = socket.request.session.name;
//   // room = undefined
//   const room = socket.request.session.room
//   console.log("user Connected");
//   socket.on("disconnect", () => {
//     console.log("user Disconnected");
//   })

//   socket.on("chat message", (data)=> {
//     console.log("got the message", data)
//     io.to(room).emit("chat message", data)
//   })
//   socket.on("join", (data) => {
//     console.log("JOINED ROOM")
//     socket.join(data.room);
//     let room = data.room;
//     let username = data.username;
//     let name = data.name
//     socket.request.session.room = data.room;
//     console.log(`user has joined the room ${data.room}`);
//   })

//   socket.emit("starting data", {"text":"hi"})
//   //write the different types of callbacks
//     //user sends a message, add message to user, change rooms
//       //in old code but needs to add that the first time user goes to the room, 
//       //load previous messages of the room using the data base
// })

io.on('connection', (socket) => {
  console.log("user connected");

  // Retrieve user information from session
  const username = socket.request.session.username;
  const name = socket.request.session.name;

  socket.on("join", (data) => {
    const { room } = data;

    socket.join(room);
    socket.request.session.room = room;
    socket.request.session.save();

    console.log(`User joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("user Disconnected");
  });

  socket.on("message", (data) => {
    console.log("got the message", data);
    const room = socket.request.session.room;
    io.to(room).emit("message", data);
  });

  socket.on('newMessage', async (data) => {
    try {
      const { text, senderId } = data;
      const room = socket.request.session.room

      // Save the new message to the database
      const newMessage = new Messages({
        message: { text },
        sender: senderId,
        room: room,
      });
      console.log("saving to db")
      await newMessage.save();


      // Emit the new message to all connected clients in the room
      io.to(room).emit('message', {
        message: text,
        senderId,
      });
      console.log('New message:', text);
      console.log('Sender ID:', senderId);
      console.log('Room:', room);
      console.log('Message emitted to other clients in the same room.');
    } catch (error) {
      console.error('Error creating or saving message:', error);
    }
  });

  socket.emit("starting data", { "text": "hi" });
});
app.set('io', io);