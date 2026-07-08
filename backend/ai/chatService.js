const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const askMedicalAI = async (question) => {
  try {
    const prompt = `
You are MediAssist AI.

Rules:
- Answer only healthcare-related questions.
- Give evidence-based information.
- Do not provide definitive diagnosis.
- Recommend consulting a doctor when needed.

Question:
${question}
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return response.text;
  } catch (error) {
    console.log(error);
    return "Unable to generate response";
  }
};

module.exports = {
  askMedicalAI,
};