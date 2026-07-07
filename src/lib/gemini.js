const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!OPENROUTER_API_KEY) {
  console.error("VITE_OPENROUTER_API_KEY is missing in .env file. Please add it and restart the server.");
}

// Convert a File object to base64 data URI
async function fileToDataURI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callOpenRouter(messages, model = "openrouter/free") {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// Analyze a plant leaf image and return structured disease info (Detect.jsx साठी)
export const analyzePlantImage = async (imageFile) => {
  const dataUri = await fileToDataURI(imageFile);

  const prompt = `You are an expert plant pathologist. Analyze this plant leaf image and detect any diseases.

Respond ONLY with valid JSON (no markdown, no backticks, no extra text) matching exactly this structure:
{
  "plant_name": "string",
  "disease_name": "string",
  "is_healthy": true or false,
  "confidence": number (0-100),
  "severity": "low" or "medium" or "high" or "critical",
  "symptoms": "string",
  "treatment": "string",
  "prevention": "string",
  "category": "fruit" or "vegetable" or "grain" or "flower" or "tree" or "other"
}`;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: dataUri } },
      ],
    },
  ];

  const text = await callOpenRouter(messages);
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
};

// ChatBot साठी लागणारे फंक्शन
export const chatWithAssistant = async (messages, text) => {
  try {
    const history = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }));

    history.push({ role: "user", content: text });

    return await callOpenRouter(history);
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    return "माफ करा, सर्व्हरशी संपर्क होऊ शकला नाही. कृपया आपली API Key आणि इंटरनेट कनेक्शन तपासा.";
  }
};

// DiseaseRiskCard आणि WeatherWidget साठी — JSON object return करतं
export const generateStructuredContent = async (prompt) => {
  try {
    const messages = [{ role: "user", content: prompt + "\n\nRespond ONLY with valid JSON, no markdown fences, no extra text." }];
    const text = await callOpenRouter(messages);
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Generate Content Error:", error);
    throw new Error("डेटा जनरेट करताना चूक झाली.");
  }
};