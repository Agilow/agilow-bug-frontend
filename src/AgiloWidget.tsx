import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";
import { useWidgetRecord } from "./useWidgetRecord"; 
import { transcribeAudio } from "./transcribeAudio";


function AgiloWidget() {
    const debug = false;
    const [open,setOpen] = useState(false);
    const messages = [
        { id: 1, sender: "user", text: "The app crashes when I upload a file." },
        { id: 2, sender: "ai", text: "Thanks for reporting that! What file type were you uploading?" },
        { id: 3, sender: "user", text: "It was a .png image from my phone gallery." },
    ];
    const [messagesList, setMessagesList] = useState(messages);
    const [inputValue, setInputValue] = useState(""); 

    const {
    recording,
    screenBlob,
    micBlob,
    startScreenRecording,
    stopScreenRecording,
    startVoiceRecording,
    stopVoiceRecording,
    getNewMicBlob,
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

const handleProcess = async () => {
  const partialMicBlob = await getNewMicBlob();
  console.log("Processing blob:", { partialMicBlob });

  if (!partialMicBlob || partialMicBlob.size < 5000) {
    console.warn("⚠️ Skipping small or empty audio chunk:", partialMicBlob?.size);
    return;
  }

  // 🎧 Play audio safely using FileReader
  const reader = new FileReader();
  reader.onloadend = () => {
    const audio = new Audio(reader.result as string);
    audio.play().catch((err) => console.warn("⚠️ Audio playback failed:", err));
  };
  reader.readAsDataURL(partialMicBlob); // converts blob → base64 playable source

  try {
    console.log("🎧 Sending partial blob to API...");
    const result = await transcribeAudio(partialMicBlob);

    if (result?.success !== false && result?.transcript) {
      console.log("📝 Transcript:", result.transcript);
    } else {
      console.error("❌ API returned error:", result?.error || result);
    }
  } catch (err) {
    console.error("💥 Transcription failed:", err);
  }
};



    const handleSend = () => {
        if (!inputValue.trim()) return; // ignore empty input

        const newMessage = {
            id: messagesList.length + 1,
            sender: "user",
            text: inputValue.trim(),
        };

        setMessagesList((prev) => [...prev, newMessage]); // add to chat
        setInputValue(""); // clear input
    };
    
    return (
    <>
        <div className="agilow-button-group">
        <button className="agilow-stop-button" onClick={handleEndCall}>⏹</button>
        <button className="agilow-process-button" onClick={handleProcess}>➤</button>
        <button
            className={`agilow-button ${recording ? "agilow-pulsate" : ""}`}
            onClick={handleWidgetButton}
        >
            🐞
        </button>
        </div>


        {open && (
            <div className="agilow-frame">

                <div className="agilow-chat">
                    <div className="agilow-chat-messages">
                    {messagesList.map((msg) => (
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
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        />
                        <button className="agilow-send" onClick={handleSend}>Send</button> 
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