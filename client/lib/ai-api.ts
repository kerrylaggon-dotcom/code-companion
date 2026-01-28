/**
 * Direct API helper - calls Gemini/HuggingFace directly tanpa server proxy
 * Cocok untuk APK standalone
 */

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface AIMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function callGeminiDirect(
  apiKey: string,
  messages: AIMessage[],
  systemPrompt?: string
): Promise<string> {
  try {
    // Prepare messages with system prompt
    const fullMessages = systemPrompt 
      ? [
          { role: "user" as const, parts: [{ text: systemPrompt }] },
          { role: "model" as const, parts: [{ text: "Understood." }] },
          ...messages,
        ]
      : messages;

    const payload = {
      contents: fullMessages,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(
      `${GEMINI_API_ENDPOINT}?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!text) {
      throw new Error("No response from Gemini API");
    }

    return text;
  } catch (error) {
    console.error("Gemini Direct API Error:", error);
    throw error;
  }
}

/**
 * Local fallback - gunakan jika API key tidak tersedia
 * Bisa pakai local model atau show error message
 */
export function getLocalFallbackResponse(userMessage: string): string {
  return `Sorry, I couldn't reach the AI service. Please check:\n1. Your API key is configured in Settings\n2. Your device has internet connection\n3. The API service is available\n\nYour message: "${userMessage}"`;
}
