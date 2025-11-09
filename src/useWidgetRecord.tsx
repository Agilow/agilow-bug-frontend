
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
  const micStreamRef = useRef<MediaStream | null>(null); // Store mic stream reference 

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
        screenStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());      
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
        video: false,
      }); 

      // Store stream reference
      micStreamRef.current = micStream;

      const micRecorder = new MediaRecorder(micStream, {
        mimeType: MediaRecorder.isTypeSupported("audio/mp4;codecs=aac")
          ? "audio/mp4;codecs=aac"
          : "audio/webm;codecs=opus",
      });

      micChunksRef.current = []; 
      micRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) micChunksRef.current.push(e.data);
      }; 

      micRecorder.onstop = () => {
        const blob = new Blob(micChunksRef.current, { type: "audio/webm" });
        setMicBlob(blob);
        micChunksRef.current = [];
        // Stop stream tracks when recorder stops
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
        }
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
    // Stop the MediaRecorder if it exists and is active
    if (micRecorderRef.current) {
      const state = micRecorderRef.current.state;
      if (state === "recording" || state === "paused") {
        micRecorderRef.current.stop();
        console.log("🛑 Voice recording stopped (MediaRecorder)");
      }
      micRecorderRef.current = null;
    }

    // Explicitly stop all microphone stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Microphone track stopped:", track.kind);
      });
      micStreamRef.current = null;
    }

    setRecording(false);
    console.log("🛑 Voice recording fully stopped");
  };

  
  const lastMicChunkIndex = useRef(0);

const getNewMicBlob = async (): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const recorder = micRecorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      console.warn("⚠️ No active mic recording to split.");
      resolve(null);
      return;
    }

    console.log("⏸️ Stopping mic recording to collect chunk...");

    // Temporarily copy existing chunks
    const oldChunks = [...micChunksRef.current];
    micChunksRef.current = [];

    // Wait for final chunk before resolving
    const handleData = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) oldChunks.push(e.data);
    };

    recorder.addEventListener("dataavailable", handleData, { once: true });

    recorder.onstop = async () => {
      const blob = new Blob(oldChunks, { type: "audio/webm" });

      console.log("✅ Mic chunk finalized:", blob.size, "bytes");

      // Fully stop the stream tracks
      recorder.stream.getTracks().forEach((t) => t.stop());
      
      // Clear stream reference if it matches
      if (micStreamRef.current === recorder.stream) {
        micStreamRef.current = null;
      }

      // Immediately restart
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = newStream; // Store new stream reference
        
        const newRecorder = new MediaRecorder(newStream, {
          mimeType: MediaRecorder.isTypeSupported("audio/mp4;codecs=aac")
            ? "audio/mp4;codecs=aac"
            : "audio/webm;codecs=opus",
        });

        micChunksRef.current = [];
        newRecorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) micChunksRef.current.push(ev.data);
        };

        newRecorder.start(1000);
        micRecorderRef.current = newRecorder;
        console.log("🎙️ Mic recording restarted");
      } catch (err) {
        console.error("❌ Failed to restart mic recording:", err);
        micStreamRef.current = null; // Clear reference on error
      }

      resolve(blob);
    };

    recorder.stop(); // triggers dataavailable + onstop
  });
};





  return {
    recording, 
    screenBlob, 
    micBlob, 
    startScreenRecording, 
    stopScreenRecording, 
    startVoiceRecording, 
    stopVoiceRecording, 
    getNewMicBlob,
  };
}
