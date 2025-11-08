import { useState, useRef } from "react";

export function useWidgetRecord() { 
  const [recording, setRecording] = useState(false); 
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null); 
  const mediaRecorderRef = useRef<MediaRecorder | null>(null); 
  const chunksRef = useRef<BlobPart[]>([]); 

  const startRecording = async () => { 
    try {
      // Request permission to record screen + audio 
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: true,
      });

      // Request microphone audio 
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Merge video + audio tracks 
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...screenStream.getAudioTracks(),
        ...micStream.getAudioTracks(),
      ]);

      // Create recorder 
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        chunksRef.current = [];
        combinedStream.getTracks().forEach((track) => track.stop()); 
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Unable to start screen/mic recording. Check browser permissions."); 
    }
  };

  const stopRecording = () => { 
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return { 
    recording, 
    recordedBlob, 
    startRecording, 
    stopRecording, 
  };
}
