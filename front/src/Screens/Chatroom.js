
import react from "react";
import io from "socket.io-client";
import { Button, TextField } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SendIcon from '@mui/icons-material/Send';
import Message from "./Message.js";


class Chatroom extends react.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3001', {
            cors: {
                origin: 'http://localhost:3000',
                credentials: true
            },  transports: ['websocket'],
        });
        this.state = {
            messages: [],
            text: '',
            //newMessages: '',
            username: props.username, 
            room: props.room ,
            name: props.name,
            screenName:undefined,
            // userId: undefined,
        }
        this.socket.on("chat message", (data) => {
            console.log("received message")
            this.setState((prevState) => ({
              messages: [...prevState.messages, data],
            }));
          });
          // this.socket.on("test", () => {
          //   console.log(`test called`);
          // });
    }
      
    componentWillUnmount() {
      console.log("LEAVING ROOM COMPONENT WILL UNMOUNT IN CHATROOM");
        // if (this.socket) {
        //   this.socket.disconnect();
          // console.log("left");
        //}
        // this.socket.off();
      }
      
      fetchMessages = async () => {
        try {
          const response = await fetch(this.props.server_url + '/api/rooms/allmessages/' + this.state.roomName,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      
          if (response.ok) {
            const data = await response.json();
            //const { roomName } = await response.json();
            //this.setState({name: roomName});
            this.setState({ messages: data });
            console.log('Fetched messages:', data); // Move this line inside the if block
          } else {
            console.error('Failed to fetch messages:', response.status);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      


      async componentDidMount() {
        //this.socket.on("editReceive", this.handleMessageUpdated);
        //const { roomId } = this.props
        //this.socket.emit("join", { room: roomId});

        // this.socket.on("something", (message) => {
        //   if(message.room === roomId) {
        //     this.setState((prevState) => ({
        //       messages: [...prevState.messages, message.text]
        //     }));
        //   };
        // })
        this.socket.on("receive", (data) => {
          console.log("received message")
          this.fetchMessages()
          this.forceUpdate();
          // this.setState((prevState) => ({
          //   messages: [...prevState.messages, data],
          // }));
          
        });
        this.socket.on("editReceive", (data) => {
          console.log("edit received message");
          console.log("Received data:", data);
          //this.fetchMessages();
          //this.forceUpdate();
        
          const updatedMessages = this.state.messages.map((message) => {
            if (message.messageId === data.messageId) {
              return {
                ...message,
                message: data.message,
                username: data.username,
              };
            }
            return message;
          });
          console.log(updatedMessages);
          this.forceUpdate();
          //this.sendChat(datahere);
          this.setState({
            messages: updatedMessages,
          });
          // this.setState(() => ({
          //   messages: updatedMessages
          // }));
          
          //console.log(messages);
          // this.fetchMessages();
          //this.forceUpdate();
          console.log("UPDATED:",updatedMessages)
          console.log("UUUUP:",this.state.messages)
          this.setState({messages: updatedMessages})
        });

        // this.socket.on("editReceive", (data) => {
        //   console.log("edit received message");
        //   console.log("Received data:", data);
        //   console.log("PREV STATE",this.prevState);
        //   let updatedMessages;

        //   this.setState((prevState) => {
        //       updatedMessages = prevState.messages.map((message)=>
        //       message.messageId === data.messageId ? data : message
        //     );
        //     return updatedMessages;
        //   });

        //   console.log("UPDATED", updatedMessages);
        //   console.log("STATE ANEW", this.state.messages);
        // });
 
        
        
        
        
        
        this.socket.on("test", () => {
          console.log(`test called`);
        });
        console.log("Component mounted");
        console.log("chat room");
        this.fetchMessages();
        console.log("fetching room currently in");
        try {
          const response = await fetch(this.props.server_url + '/api/rooms/current', {
            method: 'GET',
            credentials: 'include',
          });
      
          if (response.ok) {
            const responseData = await response.json();
            console.log('Response Data:', responseData);
      
            if (responseData && responseData.room) {
              const { room, user } = responseData;
              // this.setState({ room: room, userId: user._id });
              // this.props.userId = user._id;
              this.setState({
                userId: user._id,
                username: user.username,
                name: user.name,
                room: room
              });
          
              console.log("Room:", room);
              console.log("User ID:", user._id);
              console.log("USER ASSOCIATED WITH ID", user.name);
              this.setState({screenName:user.name});
            } else {
              console.error('Room name not found in the response:', responseData);
            }
          } else {
            console.error('Failed to fetch current room:', response.status);
          }
        } catch (error) {
          console.error('Error fetching current room:', error);
        }
      
      }
      


    handleChange = (event) => {
        this.setState({text:event.target.value});
    };


    handleSubmit = async (event) => {
      event.preventDefault();
    
    };

    sendMessage =  () => {
      const { text, room, username, name} = this.state;
      
      const data = {
          text,
          room,
          username,
          name,
          senderId: this.state.userId,
        };
      console.log(data);
      // this.socket.emit("chat message", data);
      this.sendChat(data);
      const newMes = {message: text, username: username};
      this.setState((prevState) => ({
        messages: [...prevState.messages, newMes],
      }));
      //this.setState({text: ""});
      fetch(this.props.server_url + '/api/rooms/newmessage', {
          method: 'POST',
          mode: "cors",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
          },
          body: JSON.stringify(data),
        })
        .then((res) => {
          res.json().then((data) => {
            if(data === 200) {
              console.log("nice")
            }
            else{
              console.log("failed to send to the db");
            }
          })
        })


      
        
  
    
      //const { text } = this.state;
      // const { roomID } = this.props;
      // // const { usernameId } = this.props;
      // const msg = this.state.text;
      // console.log(msg);
      // this.socket.emit('something', {room: roomID, text: msg});
      // this.setState({text});
    }

    //  handleMessageUpdated = (updatedMessage) => {
    //   console.log("edit received message");
    //   console.log("Received data:", updatedMessage);
    //  // console.log("PREV STATE",this.prevState.messages);

    //   this.setState((prevState) => ({
    //     messages:prevState.messages.map((message) =>
    //       message.messageId === updatedMessage.messageId ? updatedMessage:message
    //   ),
    //   }));
    //   // console.log("UPDATED:",updatedMessages)
    //   this.forceUpdate();
    //   console.log("UUUUP:",this.state.messages);

    // };
    
    leaveRoom = ()=> {
      console.log("LEAVE ROOM TRIGGERED");
      this.socket.disconnect();
      this.props.changeScreen("lobby");
    }
    
    //define the send chat function
    sendChat = (text) => {
      this.socket.emit("chat message", text);
      this.forceUpdate();
    }

    handleEditReceived = (data) => {
      this.socket.emit("chat edit", data); 
     
    }

    render(){
        return(
            <div className="entire-chat-screen">
                {/* show chats */}
                <div className = "chatroom-header">
                  <h1>{this.state.room} Chatroom</h1>
                  <Button variant="standard" color="error" className="exit-button" onClick={this.leaveRoom}>Exit Room</Button>
                </div>

                <div className="chatlog">
                  {this.state.messages.map((msg, index) => (
                    <div key={index}>
                      {/* <span className="username">{msg.username}: </span>
                      {msg.message} */}
                      <Message 
                        key={index}
                        loggedInUser = {this.state.screenName}
                        messageObject = {msg}
                        server_url = {this.props.server_url}
                        handleEmit = {this.sendChat}
                        handleEditReceivedEmit = {this.handleEditReceived}
                        // handleEditMessage = {this.handleEdit}
                      />

                    </div>
                  ))}
                </div>
                
                {/* {this.state.messages.map((element)=> (
                    <p>{element.text}</p>
                ))} */}
                {/* show chat input box*/}
                
//                 <form onSubmit={this.handleSubmit}>
//                     <input
//                         type = "text"
//                         value = {this.state.text}
//                         onChange = {this.handleChange}
//                         placeholder = "Send a message..."
//                     />
//                     <button onClick={this.sendMessage} type = "submit">Send!</button>
//                 </form>
//                 Chatroom
//               <button className="exitbutton" onClick={this.leaveRoom}>Exit Room</button>
                <div className="new-message-form-container">
                  <form className ="new-message-form" onSubmit={this.handleSubmit}>
                      <TextField
                          type = "text"
                          variant="filled"
                          className="new-message-text-box"
                          sx={{backgroundColor:'#fefefe'}}
                          value = {this.state.text}
                          // value = {this.newMessages}
                          onChange = {this.handleChange}
                          placeholder = "Send a message..."
                      />
                      <Button className ="send-button" onClick={this.sendMessage} variant="contained" color="primary" type = "submit" startIcon={<SendIcon/>}>Send</Button>
                  </form>
                </div>
            </div>
        );
    }
}
export default Chatroom;