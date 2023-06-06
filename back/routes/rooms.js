const express = require('express');
const router = express.Router()
// TODO: add rest of the necassary imports
const Room = require('../model/room.js');
const Messages = require('../model/messages.js');
const Senders = require('../model/user.js');
const User = require('../model/user.js');

module.exports = router;

// temporary rooms
// rooms = ["room1", "room2", "room3"]
// const existingRooms = ["room1", "room2", "room3"];

// Populate the database with temp rooms
const initialRooms = ["room1", "room2", "room3"];

Room.find({ name: { $in: initialRooms } })
  .then((existingRooms) => {
    const existingRoomNames = existingRooms.map((room) => room.name);
    const newRooms = initialRooms.filter((room) => !existingRoomNames.includes(room));
    if (newRooms.length > 0) {
      return Room.insertMany(newRooms.map((name) => ({ name })));
    } else {
      return Promise.resolve();
    }
  })
  .then(() => console.log('Initial rooms added successfully'))
  .catch((error) => console.error('Error adding initial rooms:', error));


//Get all the rooms
router.get('/all', async (req, res) => {
    // TODO: you have to check the database to only return the rooms that the user is in
    // res.send(rooms)
    try {
        const rooms = await Room.find();
        const roomNames = rooms.map((room) => room.name);
        res.send(roomNames);
    } catch (error) {
        console.error("COULDNT RETRIEVE ROOMS: ", error);
        res.status(500).send("server broke")
    }
});

// router.get('/allmessages/:roomName', async(req,res) => {
//     try{
//         // const roomName = req.params.roomName;
//         const roomName = req.session.room;
//         const all_messages = await Messages.find({room: roomName});

//         // var all_messages_array = all_messages;
//         var room_name_sender_name_arr = new Array();

//         for(const message of all_messages) {
//             const roomID = message.room;
//             const room = await Room.findById(roomID);
//             const room_name = room.name;

//             const senderID = message.sender;
//             const sender = await Senders.findById(senderID);
//             const sender_name = sender.name;

//             const room_name_sender_name = {
//                 message: message.message,
//                 roomName: room_name,
//                 username: sender_name,
//             }

//             room_name_sender_name_arr.push(room_name_sender_name);
//         }

//         res.send(room_name_sender_name_arr);
//         //res.send(all_messages);
//     }

//     catch(error){
//         console.error("In room.js, ", error);
//         res.status(500).send("Invalid query");
//     }
// });

router.get('/allmessages/:roomName', async (req, res) => {
  try {
    const roomName = req.session.room;
    console.log(roomName)
    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    const allMessages = await Messages.find({ room: room._id })
      .populate('sender', 'name') 
      .populate({
        path: 'room',
        select: 'name',
      }); 

    const roomNameSenderNameArr = allMessages.map((message) => {
      const roomName = message.room.name;
      const senderName = message.sender.name;

      console.log('Message:', message.message.text);
      console.log('Room:', roomName);
      console.log('Sender Name:', senderName);

      return {
        message: message.message.text,
        roomName,
        username: senderName,
      };
    });

    res.send(roomNameSenderNameArr);
  } catch (error) {
    console.error("Error in /allmessages/:roomName endpoint:", error);
    res.status(500).send("Invalid query");
  }
});

// router.post('/newmessage', async (req, res) => {
//     try {
//       const { text, senderId, room } = req.body;
//       const newMessage = new Message({
//         message: { text },
//         sender: senderId,
//         room: roomId,
//       });
//       await newMessage.save();
//       return res.status(200).send('Message saved successfully');
//     } catch (error) {
//       console.error("Error creating or saving message:", error);
//       res.status(500).send("Error in the newmessage endpoint");
//     }
//   });

router.post('/newmessage', async (req, res) => {
    try {
      const { text } = req.body;

      
    //   res.send({ text })
      const roomName = req.session.room; // Retrieve the room name from the session data
      // console.log(roomName)
      if (!req.session.room) {
        return res.status(400).send("Room name not found in the session");
      }
      const username = req.session.username; 
      // console.log(username)
    //   res.json(roomName)
    //   console.log(req.session.room)
    
      const roomC = await Room.findOne({ name: roomName });
        // res.json({"testing ": roomC})
        // console.log(roomC)
  
      if (!roomC) {
        return res.status(404).send("Room not found");
      }
  
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      const newMessage = new Messages({
        message: { text },
        sender: user._id, // Use the retrieved user ID
        room: roomC._id, // Use the retrieved room ID
      });
      await newMessage.save();
      const io = req.app.get('io');
      // res.json("emitting new message")
      io.to(roomName).emit('newMessage', {
        message: text,
        senderId: user._id,
      });
  
  
      return res.status(201).send('Message saved successfully');
    } 
    catch (error) {
      console.error("Error creating or saving message:", error);
      res.status(500).send("Error in the newmessage endpoint");
    }
  });
  


router.post('/create', async (req, res) => {
    // TODO: write necassary codesn to Create a new room
    try {
        const { roomName } = req.body;
    
        const existingRoom = await Room.findOne({ name: roomName });
        if (existingRoom) {
          return res.status(400).send('Room already exists');
        }
        const newRoom = new Room({ name: roomName });
        await newRoom.save();
    
        res.status(201).send('Room created successfully');
      } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).send('Internal Server Error');
      }
});


// router.post('/join', (req, res) => {
//     // TODO: write necassary codes to join a new room
//     try {
    
//         // DO MORE SFF WHEN USER JOINS 
//         // this.props.changeScreen("chatroom");
//         const { session } = req;
//         const { roomName } = req.body;
//         console.log(req.body)
      
//         // Set the selected roomName in the session
//         session.roomName = roomName;
//         res.json({roomName});
//         // this.props.changeScreen("chatroom");
//         // res.send('User joined the room');
//       } catch (error) {
//         console.error('Error joining room:', error);
//         res.status(500).send('Internal Server Error');
//       }
// });


router.post('/join', (req, res) => {
    try {
    //   const { session } = req;
    //   const { roomName } = req.body;
    // console.log(req.body)
    const username = req.session.username;
    const {room} = req.body;
    const roomName = room || req.session.room;
    req.session.room = roomName;

    //   session.room = room;
    //   session.username = username;
      
      res.json({ room: req.session.room, username });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.get('/current', async (req, res) => {
    try {
    //   const { session } = req;
    //   const { roomName } = req.body;
    // console.log(req.body)
    const username = req.session.username;
    const {room} = req.body;
    const roomName = room || req.session.room;
    req.session.room = roomName;
    const user = await User.findOne({ username: req.session.username });

    //   session.room = room;
    //   session.username = username;
      
      res.json({ room:  req.session.room, user });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  

router.delete('/leave', async (req, res) => {
    // TODO: write necassary codes to delete a room
    //means deleting the room not leaving the room apparently
    try {
        const { roomName } = req.body;

        const room = await Room.findOne({ name:roomName});
        if(!room){
            return res.status(404).send("Room not in database");
        }
        await Room.deleteOne({name:roomName});
        res.status(200).send('Room deleted');
    } catch (error) {
        console.error("Couldn't remove room", error);
        res.status(500).send("Internal server error");
    }
});