import react from "react";
import Form from "../Components/form.js";
import { Button } from "@mui/material";

String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }


class Auth extends react.Component{
    constructor(props){
        super(props);
        this.state = {
            showForm: false,
            selectedForm: undefined,
        }
    }

    closeForm = () => {
        this.setState({showForm: false});
    }

    login = (data) => {
        console.log(data);
        const { username, password } = data;
        const hashedData = {username: username, password: password.hashCode()}
        fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hashedData),
        })
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            // do login stuff thnx
            console.log("logged in");
            if(result.status) {
                console.log("works");
                this.props.changeScreen("lobby");
            }
          })
          .catch((error) => {
            console.error('Error:', error);
          });
      };


    register = (data) => {
        console.log(data)
        const { username, password, name } = data;
        const hashedData = {username: username, password: password.hashCode(), name: name}
        fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(hashedData),
        })
            .then((response) => response.json())
            .then((result) => {
            console.log(result);
            })
            .catch((error) => {
            console.error('Error:', error);
            });
        }

    render(){
        let display = null;
        if (this.state.showForm){
            let fields = [];
            if (this.state.selectedForm === "login"){
                fields = ['username', 'password'];
                display = <Form fields={fields} 
                close={this.closeForm} 
                type="login" 
                submit={this.login} 
                key={this.state.selectedForm}/>;
            }
            else if (this.state.selectedForm === "register"){
                fields = [ 'username', 'password', 'name'];
                display = <Form
                    fields={fields} 
                    close={this.closeForm} 
                    type="register" 
                    submit={this.register} 
                    key={this.state.selectedForm}/>;
            }   
        }
        else{
            display = <div>
                <Button onClick={() => this.setState({showForm: true, selectedForm:"login"})}> Login </Button>
                <Button onClick={() => this.setState({showForm: true, selectedForm: "register"})}> Register </Button>
                </div>              ;
        }
        return(
            <div>
                <h1> Welcome to our website! </h1>
                {display}
            </div>
        );
    }
}

export default Auth;

// unhashed stuff here
// login = (data) => {
//     console.log(data);
//     const { username, password } = data;
//     const hashedData = {username: username, password: password.hashCode()}
//     fetch('http://localhost:3001/api/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     })
//       .then((response) => response.json())
//       .then((result) => {
//         console.log(result);
//         // do login stuff thnx
//         console.log("logged in");
//         if(result.status) {
//             console.log("works");
//             this.props.changeScreen("lobby");
//         }
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   };


// register = (data) => {
//     console.log(data)
//     const { username, password, name } = data;
//     const hashedData = {username: username, password: password.hashCode(), name: name}
//     fetch('http://localhost:3001/api/auth/register', {
//         method: 'POST',
//         headers: {
//         'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     })
//         .then((response) => response.json())
//         .then((result) => {
//         console.log(result);
//         })
//         .catch((error) => {
//         console.error('Error:', error);
//         });
//     }