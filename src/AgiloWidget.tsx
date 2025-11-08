import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";
import { useWidgetRecord } from "./useWidgetRecord"; 

function AgiloWidget() {
    const debug = false;
    const [open,setOpen] = useState(false);
    const messages = [
        { id: 1, sender: "user", text: "The app crashes when I upload a file." },
        { id: 2, sender: "ai", text: "Thanks for reporting that! What file type were you uploading?" },
        { id: 3, sender: "user", text: "It was a .png image from my phone gallery." },
    ];

    const {
    recording,
    screenBlob,
    micBlob,
    startScreenRecording,
    stopScreenRecording,
    startVoiceRecording,
    stopVoiceRecording,
    } = useWidgetRecord();

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
    }, []);

    const handleWidgetButton = () => {
        if (recording) {
            setOpen(!open);   
        }
        else{
            startScreenRecording();
            startVoiceRecording();
            // setOpen(!open);  
        }
    }

    const handleEndCall = () =>{
        stopScreenRecording();
        stopVoiceRecording();
        // setOpen(false);
    }

    
    return (
    <>
       <button className={`agilow-button ${recording ? "agilow-pulsate" : ""}`} onClick={handleWidgetButton} >
            🐞
        </button>
        <button onClick={handleEndCall} className="agilow-stop-button">
            ■
        </button>

        {open && (
            <div className="agilow-frame">

                <div className="agilow-chat">
                    <div className="agilow-chat-messages">
                    {messages.map((msg) => (
                        <div
                        key={msg.id}
                        className={`agilow-message ${
                            msg.sender === "user" ? "user-msg" : "ai-msg"
                        }`}
                        >
                        {msg.text}
                        </div>
                    ))}
                    </div>

                    <div className="agilow-chat-input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="agilow-input"
                    />
                    <button className="agilow-send">Send</button>
                    </div>
                </div>

                {debug && screenBlob && (
                <video
                    src={URL.createObjectURL(screenBlob)}
                    controls
                    style={{ width: "100%", borderRadius: "8px", marginTop: "12px" }}
                />

                )}
                {debug && micBlob && (
                <audio
                    src={URL.createObjectURL(micBlob)}
                    controls
                    style={{ width: "100%", marginTop: "12px" }}
                />
                )}
            </div>
        )}
    </>
    );
}

export default AgiloWidget;