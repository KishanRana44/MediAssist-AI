const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateMedicalAnalysis = async (
  fileType,
  fileUrl
) => {
  try {
    const prompt = `
You are an expert cardiologist and radiologist.

Analyze this ${fileType} medical file.

Return ONLY valid JSON:

{
  "prediction":"",
  "confidence":0,
  "findings":"",
  "recommendation":"",
  "riskLevel":"Low/Medium/High"
}
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return response.text;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  generateMedicalAnalysis,
};