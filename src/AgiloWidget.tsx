import React, { useState,useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./AgiloWidget.css";
import cssText from "./AgiloWidget.css?inline";
import { useWidgetRecord } from "./useWidgetRecord"; 
import { transcribeAudio } from "./transcribeAudio";


function AgiloWidget() {
    const debug = true;
    const [open,setOpen] = useState(false);
    const messages = [
        { id: 1, sender: "ai", text: "Hello! What issue are you having today?" },
    ];
    const [messagesList, setMessagesList] = useState(messages);
    const [inputValue, setInputValue] = useState("");
    const [reportOpen, setReportOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [jiraTicket, setJiraTicket] = useState<any>(null);
    const chatEndRef = React.useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    }, [messagesList]);


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
        
        // If we have a Jira ticket, add it to chat
        if (jiraTicket) {
            const jiraMessage = {
                id: messagesList.length + 1,
                sender: "system",
                text: "Bug report created successfully!",
                type: "jira_ticket",
                jiraTicket: jiraTicket
            };
            setMessagesList((prev) => [...prev, jiraMessage]);
            setJiraTicket(null); // Clear after displaying
        }
        
        setOpen(false);
    }


const handleProcess = async () => {
  const partialMicBlob = await getNewMicBlob();
  console.log("Processing blob:", { partialMicBlob });

  if (!partialMicBlob || partialMicBlob.size < 5000) {
    console.warn("⚠️ Skipping small or empty audio chunk:", partialMicBlob?.size);
    return;
  }

  try {
    console.log("🎧 Sending partial blob to API...");
    const result = await transcribeAudio(partialMicBlob);

    if (!result?.success || !result?.transcript) {
      console.error("❌ API returned error or missing transcript:", result);
      return;
    }

    const userTranscript = result.transcript.trim();
    console.log("📝 Transcript:", userTranscript);

    // Add the transcript as a new user message
    const newMessage = {
      id: messagesList.length + 1,
      sender: "user",
      text: userTranscript,
    };

    setMessagesList((prev) => [...prev, newMessage]);

    // 🔗 Prepare request body for backend
    const payload = {
      messages: [...messagesList, newMessage],
      session_id: "test-session-123",
      user_id: "test-user-456",
      console_logs:
        "Error: Cannot read property 'upload' of undefined\n  at FileUploader.upload (uploader.js:45)",
      screen_recording: null, // or screenBlob if you want to include it
    };

    console.log("🌐 Sending payload to backend:", payload);

    const response = await fetch(
      "https://agilow-bug-backend.onrender.com/bug-report-chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const backendData = await response.json();
    console.log("🤖 Backend response:", backendData);

    // Add AI message to chat if exists
    if (backendData?.message) {
      setMessagesList((prev) => [...prev, backendData.message]);
    }

    // If bug report is complete, store Jira ticket data
    if (backendData?.bug_report_complete && backendData?.jira_ticket?.success) {
      setJiraTicket(backendData.jira_ticket);
      setReportData(backendData);
      setReportOpen(true);
    }
  } catch (err) {
    console.error("💥 handleProcess error:", err);
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
                        {debug && micBlob && (
                <audio
                    src={URL.createObjectURL(micBlob)}
                    controls
                    style={{ width: "100%", marginTop: "12px" }}
                />
                )}{debug && screenBlob && (
                <video
                    src={URL.createObjectURL(screenBlob)}
                    controls
                    style={{ width: "100%", borderRadius: "8px", marginTop: "12px" }}
                />

                )}


        {open && (
            <div className="agilow-frame">
                <div className="agilow-chat">
                    <div className="agilow-chat-messages">
                    {messagesList.map((msg) => {
                        // Render Jira ticket card for special messages
                        if (msg.type === "jira_ticket" && msg.jiraTicket) {
                            return (
                                <div key={msg.id} className="agilow-jira-ticket-card">
                                    <div className="agilow-jira-ticket-header">
                                        <span className="agilow-jira-ticket-icon">✓</span>
                                        <span className="agilow-jira-ticket-title">Bug Report Created Successfully!</span>
                                    </div>
                                    <div className="agilow-jira-ticket-content">
                                        <div className="agilow-jira-ticket-key">
                                            Jira Ticket: <strong>{msg.jiraTicket.issue_key}</strong>
                                        </div>
                                        {msg.jiraTicket.issue_url && (
                                            <a
                                                href={msg.jiraTicket.issue_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="agilow-jira-ticket-link"
                                            >
                                                View in Jira →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        // Render regular messages
                        return (
                            <div
                                key={msg.id}
                                className={`agilow-message ${
                                    msg.sender === "user" ? "user-msg" : "ai-msg"
                                }`}
                            >
                                {msg.text}
                            </div>
                        );
                    })}
                      <div ref={chatEndRef} />
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

                
                
            </div>
        )}
    </>
    );
}

export default AgiloWidget;