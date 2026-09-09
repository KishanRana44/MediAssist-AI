const ChatHistory = require("../models/ChatHistory");
const { retrieveRelevantContext, ai } = require("../ai/ragService");

const handleRAGQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question content is empty." });
    }

    // 1. Semantic Retrieval via Knowledge Store Vector blocks
    const dynamicContextNodes = retrieveRelevantContext(question, 3);
    
    let contextString = "No explicit background reference found inside verified materials.";
    let citedSources = ["Global AI Clinical Weights Baseline"];

    if (dynamicContextNodes.length > 0) {
      contextString = dynamicContextNodes.map(node => node.content).join("\n\n");
      citedSources = [...new Set(dynamicContextNodes.map(node => node.source))];
    }

    // 2. Format Structured Clinical Guidelines Prompt for Gemini
    const systemPrompt = `
      You are MediAssist AI, a clinical decision support system. 
      Answer the patient or clinician's question using the provided verified medical context below.
      If the context doesn't contain sufficient evidence to answer, state that you are using general clinical guidelines, but prioritize verified documents.

      [VERIFIED MEDICAL CONTEXT]:
      ${contextString}

      [USER QUESTION]:
      ${question}

      Provide a precise, scientific, and actionable answer.
    `;

    // 3. Request Gemini Inference Generation (using recommended gemini-2.5-flash)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    const generatedText = response.text || "Unable to compute clinical validation metrics.";

    // 4. Register complete context parameters inside MongoDB ChatHistory
    const savedChatSession = await ChatHistory.create({
      userId: req.user._id,
      question,
      answer: generatedText,
      sourceDocs: citedSources
    });

    // 5. Dispatch synchronized structural schema payload
    return res.status(200).json({
      success: true,
      message: "Query processed via Multimodal Retrieval-Augmented pipeline.",
      data: {
        id: savedChatSession._id,
        question: savedChatSession.question,
        answer: savedChatSession.answer,
        sourceDocs: savedChatSession.sourceDocs,
        timestamp: savedChatSession.createdAt
      }
    });

  } catch (error) {
    console.error("RAG Core Subsystem Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal core engine breakdown in retrieval pipeline.",
      error: error.message
    });
  }
};

module.exports = { handleRAGQuery };