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
          credentials: 'include',
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
            body: JSON.stringify(hashedData), // body: JSON.stringify(hashedData),
            credentials: 'include',
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
                display = 
                    <div className="login-form">
                        <Form 
                            fields={fields} 
                            close={this.closeForm} 
                            type="login" 
                            submit={this.login} 
                            key={this.state.selectedForm}
                        />
                    </div>
            }
            else if (this.state.selectedForm === "register"){
                fields = [ 'username', 'password', 'name'];
                display = 
                    <div className = "signup-form">
                        <Form
                            fields={fields} 
                            close={this.closeForm} 
                            type="register" 
                            submit={this.register} 
                            key={this.state.selectedForm}
                        />
                    </div>
            }   
        }
        else{
            display = 
                <div className ="login-signup-buttons">
                    <Button className = "login-button" variant = "contained" onClick={() => this.setState({showForm: true, selectedForm:"login"})}> Login </Button>
                    <Button variant = "contained" onClick={() => this.setState({showForm: true, selectedForm: "register"})}> Register </Button>
                </div>
        }
        return(


            <div className="entire-login-signup-display">
                <div className="left-login-signup-display">
                    <h1 className="welcome"> Welcome to our Chat House! </h1>
                    <div >
                        {display}
                    </div>
                </div>
                <div className="right-login-signup-display">
                    <h1>Login or Signup!</h1>
                    <p>If you haven't been here before or you want a new account, signup today!</p>
                    <p>If you've been here before and want to continue chatting, login!</p>
                </div>
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