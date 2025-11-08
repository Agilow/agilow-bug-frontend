import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";
import { useWidgetRecord } from "./useWidgetRecord"; 

function AgiloWidget() {
    const [open,setOpen] = useState(false);
    const dummyMessages = [
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
        {open && (
            <div className="agilow-frame">
                {screenBlob && (
                <video
                    src={URL.createObjectURL(screenBlob)}
                    controls
                    style={{ width: "100%", borderRadius: "8px", marginTop: "12px" }}
                />

                )}
                {micBlob && (
                <audio
                    src={URL.createObjectURL(micBlob)}
                    controls
                    style={{ width: "100%", marginTop: "12px" }}
                />
                )}
                <button
                    onClick={handleEndCall} 
                    style={{
                      position: "absolute", 
                      bottom: "12px", 
                      right: "12px", 
                      background: "#ef4444", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "50%", 
                      padding: "8px 12px", 
                      cursor: "pointer", 
                      fontSize: "14px", 
                      width: "32px", 
                      height: "32px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)", 
                      zIndex: 10000, 
                    }}
                  >
                    ■
                  </button>
            </div>
        )}
    </>
    );
}

export default AgiloWidget;