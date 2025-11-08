
import { useState, useRef } from "react";

export function useWidgetRecord() {
  // State tracking
  const [recording, setRecording] = useState(false); 
  const [screenBlob, setScreenBlob] = useState<Blob | null>(null); 
  const [micBlob, setMicBlob] = useState<Blob | null>(null); 

  // References for MediaRecorder and data chunks
  const screenRecorderRef = useRef<MediaRecorder | null>(null); 
  const micRecorderRef = useRef<MediaRecorder | null>(null); 
  const screenChunksRef = useRef<BlobPart[]>([]); 
  const micChunksRef = useRef<BlobPart[]>([]); 

  // ===== SCREEN RECORDING ===== 
  const startScreenRecording = async () => {
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: true, // optional system audio
      }); 

      const screenRecorder = new MediaRecorder(screenStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      }); 

      screenChunksRef.current = []; 
      screenRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) screenChunksRef.current.push(e.data);
      }; 

      screenRecorder.onstop = () => {
        const blob = new Blob(screenChunksRef.current, { type: "video/webm" });
        setScreenBlob(blob);
        screenChunksRef.current = [];
        screenStream.getTracks().forEach((t) => t.stop());
      }; 

      screenRecorder.start(1000); // emit chunks every 1s
      screenRecorderRef.current = screenRecorder;
      setRecording(true); 
      console.log("🎥 Screen recording started"); 
    } catch (err) {
      console.error("Error starting screen recording:", err);
      alert("Unable to start screen recording. Check permissions."); 
    }
  };

  const stopScreenRecording = () => {
    if (screenRecorderRef.current && screenRecorderRef.current.state === "recording") {
      screenRecorderRef.current.stop();
      setRecording(false);
      console.log("🛑 Screen recording stopped"); 
    }
  };

  // ===== VOICE RECORDING ===== 
  const startVoiceRecording = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      }); 

      const micRecorder = new MediaRecorder(micStream, {
        mimeType: "audio/webm;codecs=opus",
      }); 

      micChunksRef.current = []; 
      micRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) micChunksRef.current.push(e.data);
      }; 

      micRecorder.onstop = () => {
        const blob = new Blob(micChunksRef.current, { type: "audio/webm" });
        setMicBlob(blob);
        micChunksRef.current = [];
        micStream.getTracks().forEach((t) => t.stop());
      }; 

      micRecorder.start(1000); 
      micRecorderRef.current = micRecorder;
      setRecording(true); 
      console.log("🎙️ Voice recording started"); 
    } catch (err) {
      console.error("Error starting mic recording:", err);
      alert("Unable to start microphone recording. Check permissions."); 
    }
  };

  const stopVoiceRecording = () => {
    if (micRecorderRef.current && micRecorderRef.current.state === "recording") {
      micRecorderRef.current.stop();
      setRecording(false);
      console.log("🛑 Voice recording stopped"); 
    }
  };

  return {
    recording, 
    screenBlob, 
    micBlob, 
    startScreenRecording, 
    stopScreenRecording, 
    startVoiceRecording, 
    stopVoiceRecording, 
  };
}
