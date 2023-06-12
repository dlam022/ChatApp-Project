import react from "react";
import {io} from "socket.io-client";
import{useState} from 'react';

function Message({loggedInUser, messageObject, server_url}) {
    
    
    const [editBoxText, setEditBoxText] = useState('');
    const [isShowEditBox, setEditBox] = useState(false);
    const [messageObjectText, setMessageObjectText] = useState(messageObject.message);

    var canEdit = false;
    console.log("CURR USER", loggedInUser);
    console.log("MESSAGE OWNER", messageObject.username);
    console.log(server_url)
    // messageObject.messageId = "6486acd79f93420db6b69da1"

    if(loggedInUser === messageObject.username) {
        canEdit = true;
    }
    else {
        canEdit = false;
    }

    console.log("MESSAGE OBJECT", messageObject);
    

    const handleEdit = async () =>{
        console.log("")
        console.log("")
        console.log("ENTER HANDLE EDIT");

        const editMessageData = {
            messageId:messageObject.messageId,
            newMessageText:editBoxText
        }

        try{
            const response = await fetch(server_url + '/api/rooms/editmessage', {
                method: 'POST',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(editMessageData), //need to include the messageID
            });

            if(response.ok){
                console.log("IN MESSAGE JS,Edit message object sent to backend");
                setMessageObjectText(editBoxText);
            }
            else {
                console.error("IN MESSAGE JS, failed to send message object to backend");
            }
        }
        catch(error) {
            console.error("In MESSAGE JS, error sending message data to backend", error);
        }

        setEditBoxText("");

      }

    return(
        <>
            <div className="entire-message">
                <h4>{messageObject.username}:</h4>
                <p>{messageObjectText}</p>

                {canEdit && (
                    <>
                        <button onClick={()=>{setEditBox(true)}}>Edit Message!</button>

                        {isShowEditBox && (

                            <form onSubmit={handleEdit}>
                            <input 
                                type="text"
                                value={editBoxText}
                                onChange={(e) => setEditBoxText(e.target.value)}
                            />
                            <button type="submit">Edit</button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </>
    )


}

export default Message;