import react from "react";
import { Button } from "@mui/material";
import {Card, CardContent, CardActions, Typography} from "@mui/material";
import io from 'socket.io-client';

class Lobby extends react.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3001', {
            cors: {
                origin: 'http://localhost:3000',
                credentials: true
            },  transports: ['websocket']
        });
        this.state = {
            rooms: undefined,
            activeRooms: [],
            newRoom: '',
            screen: "starting",
            name: "",
            username: '',
            room: '',
        }
    }
    fetchRooms = () => {
        fetch(this.props.server_url + '/api/rooms/all', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('Could not fetch rooms');
            }
          })
          .then((data) => {
            this.setState({ rooms: data }, () => {
              console.log('Fetched rooms:', data);
            });
          })
          .catch((error) => {
            console.log('Error fetching rooms:', error);
          });
      };
      
    componentDidMount(){
        // TODO: write codes to fetch all rooms from server
        this.fetchRooms();
    }

    logout = () => {
        fetch(this.props.server_url+'/api/auth/logout',  {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.ok) {
                window.location.href= "http://localhost:3000";
            } else {
                console.log("couldnt log out");
            }
          })
          .catch((error) => {
            console.log("Error logging out: ", error);
          })

    }

    newRoom = () => {
        
    }

    inputChange = (event) => {
        this.setState({ [event.target.name]: event.target.value});
    }

    createRoom = () => {
        const { newRoom, rooms } = this.state;
        fetch(this.props.server_url + "/api/rooms/create", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomName: newRoom.toLowerCase() }),
          })
            // .then((res) => res.json())
            // .then((data) => {
            //   // Update the list of rooms with the newly created room
            //   if(newRoom.trim() !== '') {
            //     if(!rooms.some(room => room === newRoom)) {
            //         // const addRoom = {
            //         //     name: newRoom,
            //         //     participants: [],
            //         // };
            //         this.setState((prevState) => ({
            //             rooms: [...prevState.rooms, data.newRoom],
            //             newRoom: "",
            //         }),
            //         () => {
            //             window.location.reload();
            //         }
            //         );
            //     }
            // }
            // })
            // .then((res) => {
            //     if (res.ok) {
            //         window.location.reload();
            //     } else {
            //         console.log("couldnt create");
            //     }
            //   })
            .then((res) => {
                if (res.ok) {
                    this.fetchRooms();
                } else {
                    console.log("couldnt create");
                }
              })
            .catch((error) => {
              console.log("Error creating room:", error);
            });
    }

    removeRoom = (roomName) => {
        //const{ newRoom, rooms} = this.state; 
       fetch(this.props.server_url + "/api/rooms/leave", {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomName }),
        })
        // .then((res) => res.json())
        // .then((data) => {
        //     this.setState((prevState) => ({
        //         rooms: prevState.rooms.filter((room) => room !== roomName),
        //     }),
        //     () => {
        //         window.location.reload();
        //       });
        //     const updatedRoom = this.state.rooms.filter(room => room !== roomName);
        //     this.setState({rooms: updatedRoom});
        // })
        .then((res) => {
            if (res.ok) {
                this.fetchRooms();
            } else {
                console.log("couldnt remove");
            }
          })
        .catch((error) => {
          console.log("Error deleting room:", error);
        });

    }

    joinRoom = (room) => {
        // const { username } = this.state;
        fetch(this.props.server_url + "/api/rooms/join", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ room }),
        })
        .then((res) => res.json())
        .then((data) => {
            const { room, username } = data;
            console.log(room)
            console.log(username)
            console.log("Emitting join event with room:", room, "and username:", username);
            this.socket.emit("join", { room: room, username: username });            
            this.setState({
                username: username,
                room: room,
              });
            //this.setState({ rooms: room, username: username, screen: "chatroom" });
          this.props.changeScreen("chatroom");
        // window.location.href = "/chatroom";
        // this.props.changeScreen("chatroom");
            //this.setState({screen: "chatroom"});
        })
        .catch((error) => {
          console.error("Error joining room:", error);
          // Handle the error
        });
      }

      // const CustomColorButton = () => {
        
      // }

    render(){
        return(
          <div className ="entire-lobby">
            <div>
                <h1 id="lobby-h1">Lobby</h1>
                <h2 id="active-rooms-h2">Active Rooms</h2>
                {/* {this.state.rooms ? this.state.rooms.map((room) => {
                    return <Button variant="contained" key={"roomKey"+room} onClick={() => alert(room)}>{room}</Button>
                }) : "loading..."} */}

                <div className="room-grid-container">
                  {this.state.rooms ? (
                      this.state.rooms.map((room) => (
                        <Card variant="outlined" sx={{backgroundColor:'#000000'}}>
                          <CardContent>
                            <div key={"roomKey" + room} className="chatroom-box">
                                <Typography sx={{fontSize:20}} color="#ffffff" gutterBottom>
                                  Room Name
                                </Typography>
                                <Typography sx={{fontSize:18}} color="#ffffff" gutterBottom>
                                  {room}
                                </Typography>
                               <CardActions>
                                  <Button variant="contained" color="success" onClick={()=>this.joinRoom(room)}>
                                    Join!
                                  </Button>

                                  <Button
                                    variant="contained" color="error" onClick={() => this.removeRoom(room)}>
                                    Delete Room
                                  </Button>
                                </CardActions>

                            </div>
                          </CardContent>
                        </Card>
                        
                      ))
                  ) : (
                      "loading..."
                  )}
                </div>
                <button class="logoutButton" onClick={this.logout}>Log out</button>

                {/* write codes to enable user to create a new room*/}
                <h3>Create A New Room</h3>
                <input 
                    type="text" 
                    name="newRoom" 
                    value={this.state.newRoom}
                    onChange={this.inputChange} 
                    placeholder="Enter Room Name"
                />
                <button onClick={this.createRoom}>Create</button>

                
            </div>
          </div>
        );
    }
}

export default Lobby;