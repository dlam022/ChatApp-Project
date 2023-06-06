import react from "react";
import {io} from "socket.io-client";


  

class Chatroom extends react.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3001', {
            cors: {
                origin: 'http://localhost:3001',
                credentials: true
            },  transports: ['websocket']
        });
        this.state = {
            messages: [],
            text: '',
            newMessages: '',
            username: props.username, 
            roomName: props.room ,
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
      

    componentDidMount() {
        console.log("chat room");
        fetch(this.props.server_url + '/api/rooms/allmessages/' + this.props.roomName,  {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })

        .then((res) => {
            res.json().then((data) => {
                this.setState({messages:data});
                console.log("Fetched messages:", data);
            })
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
          // this.setState({ text: '' });
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
                
                {this.state.messages.map((element)=> (
                    <p>{element.text}</p>
                ))}
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
            </div>
        );
    }
}

export default Chatroom;