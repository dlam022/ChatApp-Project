import react from "react";
import {io} from "socket.io-client";
import{useState} from 'react';

function Message({loggedInUser, messageObject, handleEditMessage}) {
    
    var canEdit = false;
    const[editBoxText, setEditBoxText] = useState('');
    console.log("CURR USER", loggedInUser);
    console.log("MESSAGE OWNER", messageObject.username);

    if(loggedInUser === messageObject.username) {
        canEdit = true;
    }
    else {
        canEdit = false;
    }

    return(
        <>
            <div className="entire-message">
                <h4>{messageObject.username}:</h4>
                <p>{messageObject.message}</p>
                {canEdit && (
                    <form onSubmit={handleEditMessage}>
                        <input 
                            type ="text"
                            value = {editBoxText}
                            onChange ={(e)=>setEditBoxText(e.target.value)}
                        />
                    </form>
                )}
            </div>
        </>
    )


}

export default Message;