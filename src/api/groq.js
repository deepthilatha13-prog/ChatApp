import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getAIResponse(message) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a friendly AI chatbot.

Rules:
- Reply in Tamil if the user types Tamil.
- Reply in English if the user types English.
- Reply in Tanglish if the user types Tanglish.
- Help with coding, studies, and general questions.
- Keep answers simple and friendly.
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "❌ AI is not responding. Please try again.";
  }
}