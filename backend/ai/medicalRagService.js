const Report =
 require("../models/Report");

const {
 GoogleGenAI,
} = require("@google/genai");

const ai =
 new GoogleGenAI({
  apiKey:
   process.env.GEMINI_API_KEY,
 });

const askRAG =
 async (question) => {

 try {

  const reports =
   await Report.find()
    .sort({
      createdAt:-1
    })
    .limit(5);

  const context =
   reports
    .map(
      r =>
      r.extractedText
    )
    .join("\n");

  const prompt = `
Medical Context:

${context}

Question:

${question}

Answer using the context.
`;

  const response =
   await ai.models
    .generateContent({
      model:
       "gemini-2.5-flash",
      contents:
       prompt,
   });

  return response.text;

 } catch(error){

  console.log(error);

  return
   "Unable to answer";
 }
};

module.exports = {
 askRAG,
};