const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

if (!GROQ_API_KEY) {
  console.error(
    "VITE_GROQ_API_KEY is missing in .env file. Please add it and restart the server."
  );
}

export const chatWithGroq = async (messages, text) => {
  try {
    const history = [
      {
        role: "system",
        content: `
You are LeafShield AI.

You are an expert Agriculture AI Assistant.

Rules:
- Reply in Marathi by default.
- Give short and practical answers.
- Help farmers.
- Give pesticide/fungicide names only when appropriate.
- If user asks non-agriculture questions, answer politely.
- Use simple Marathi language.
`,
      },

      ...messages
        .filter((msg) => msg.role !== "system")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),

      {
        role: "user",
        content: text,
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 1024,
        messages: history,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq Error:", error);

    return "क्षमस्व, AI शी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.";
  }
};
export const generateStructuredContent = async (prompt) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content:
              "Respond ONLY with valid JSON. Do not use markdown or extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    throw error;
  }
};