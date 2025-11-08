export async function transcribeAudio(audioBlob: Blob): Promise<any> {
  try {
    // Convert Blob → Base64 string
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    // Prepare request body
    const body = {
      audio_data: base64Audio,
      audio_format: audioBlob.type || "audio/webm;codecs=opus",
      // user_id: "optional-user-id", // uncomment if needed
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

    // Parse and return result
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Transcription failed:", err);
    return { success: false, error: err instanceof Error ? err.message : err };
  }
}
