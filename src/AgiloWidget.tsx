import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";
import { useWidgetRecord } from "./useWidgetRecord"; 

function AgiloWidget() {
    const [open,setOpen] = useState(false);
    const { recording, startRecording, stopRecording, recordedBlob } = useWidgetRecord();

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
            startRecording();
        }
        console.log({ recording, open, recordedBlob });
    }

    
    return (
    <>
       <button className="agilow-button" onClick={handleWidgetButton}>
            🐞
        </button>
        {open && (
            <div className="agilow-frame">
                
                <button
                    onClick={stopRecording} 
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
                    ⏹
                  </button>
            </div>
        )}
    </>
    );
}

export default AgiloWidget;