import react from "react";
import {io} from "socket.io-client";


  

class Chatroom extends react.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3001', {
            cors: {
                origin: ['http://localhost:3001', 'http://localhost:3000'],
                credentials: true
            },  transports: ['websocket']
        });
        this.state = {
            messages: [],
            text: '',
            newMessages: '',
            username: props.username, 
            room: props.room ,
            userId: undefined,
        }
        this.socket.on('newMessage', (message) => {
            this.setState((prevState) => ({
              messages: [...prevState.messages, message]
            }));
          });
    }
      
    componentWillUnmount() {
        if (this.socket) {
          this.socket.disconnect();
        }
      }
      
      fetchMessages = async () => {
        try {
          const response = await fetch(
            this.props.server_url + '/api/rooms/allmessages/' + this.props.roomName,
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
            console.log('Fetched messages:', data);
          } else {
            console.error('Failed to fetch messages:', response.status);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };


      async componentDidMount() {
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
              this.setState({ room: room, userId: user._id });
              console.log("Room:", room);
              console.log("User ID:", user._id);
            } else {
              console.error('Room name not found in the response:', responseData);
            }
          } else {
            console.error('Failed to fetch current room:', response.status);
          }
        } catch (error) {
          console.error('Error fetching current room:', error);
        }
      
        this.socket.on('newMessage', (message) => {
          console.log('New message:', message);
          this.setState((prevState) => ({
            messages: [...prevState.messages, message],
          }));
        });
      }
      


    handleChange = (event) => {
        this.setState({text:event.target.value});
    };

    // handleChange = () => {
    //     const { newMessages } = this.state;
    //     if(newMessages) {
    //         this.socket.emit('handleChange', newMessages);
    //         this.setState({
    //             newMessages: ''
    //         });
    //     }
    // };
    // handleSubmit = (event) => {
    //     event.preventDefault();
    //     console.log("I dont wanna live");
    //     //fetch post to newmessage
    //     //call componentDidMount to refresh page and get new message(s)
          
    //     this.socket.emit('sendMessage', { text: this.state.text });
    //     console.log("sent "+ this.state.text)

    //     this.setState({ text: '' });


    // };

    handleSubmit = async (event) => {
      event.preventDefault();
    
      try {
        const { text } = this.state;
    
        const messageData = {
          text,
          room: this.state.room,
        };

        const response = await fetch(this.props.server_url + '/api/rooms/newmessage', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        });
    
        if (response.ok) {
          console.log('Message sent successfully');
          this.setState({ text: '' });

          const newMes = {message: text, username: this.state.username};
          this.setState((prevState) => ({
            messages: [...prevState.messages, newMes],
          }));
          this.socket.emit('newMessage', { message: text, senderId: this.props.userId });
        } else {
          console.error('Failed to send message:', response.status);
        }
      } catch (error) {
        console.error('Error creating message:', error);
      }
    };
    

    

    render(){
        return(
            <div>
                {/* show chats */}
                <p>PLACE HOLDER MESSAGE</p>

                <div className="chatlog">
                  {this.state.messages.map((msg, index) => (
                    <div key={index}>
                      <span className="username">{msg.username}: </span>
                      {msg.message}
                    </div>
                  ))}
                </div>
                
                {/* {this.state.messages.map((element)=> (
                    <p>{element.text}</p>
                ))} */}
                {/* show chat input box*/}
                
                <form onSubmit={this.handleSubmit}>
                    <input
                        type = "text"
                        value = {this.state.text}
                        // value = {this.newMessages}
                        onChange = {this.handleChange}
                        placeholder = "Send a message..."
                    />
                    <button type = "submit">Send!</button>
                </form>
                Chatroom
                <button className="exitbutton">Exit Room</button>
            </div>
        );
    }
}

export default Chatroom;