export async function transcribeAudio(audioBlob: Blob): Promise<any> {
  try {
    // Convert Blob → Base64 safely using FileReader
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Strip the "data:audio/webm;codecs=opus;base64," prefix
        const base64 = dataUrl.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Prepare request body
    const body = {
      audio_data: base64Audio,
      audio_format: audioBlob.type || "audio/mp4;codecs=aac",
    };

    // Call backend endpoint
    const response = await fetch("https://api-dev.agilow.ai/transcribe-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Received API result:", data);
    return data;
  } catch (err) {
    console.error("Transcription failed:", err);
    return { success: false, error: err instanceof Error ? err.message : err };
  }
}
