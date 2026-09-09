const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse");

const { GoogleGenAI } = require("@google/genai");

// Environment keys control validation
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is not defined in your .env file!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let knowledgeVectorStore = [];

const initializeMedicalKnowledgeBase = async () => {
  try {
    // Correct target path navigation logic pointing to root directory folder
    const pdfDirectory = path.join(__dirname, "../knowledge_base");
    console.log(`🔍 Checking knowledge base directory at: ${pdfDirectory}`);
    
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
      console.log("📁 Folder 'knowledge_base' was missing. Auto-created now at root level. Please paste a PDF inside it and restart.");
      return;
    }

    const files = fs.readdirSync(pdfDirectory).filter(file => file.endsWith(".pdf"));
    console.log(`📁 Files detected inside knowledge_base:`, files);
    
    if (files.length === 0) {
      console.warn("⚠️ Warning: Folder 'knowledge_base' found but it is completely empty. Please drop at least one medical text PDF document.");
      return;
    }

    knowledgeVectorStore = []; // Reset array structure

    for (const file of files) {
      console.log(`⚙️ Starting compilation tracking for file: ${file}`);
      const filePath = path.join(pdfDirectory, file);
      const dataBuffer = fs.readFileSync(filePath);
      
      // PDF Extract parsing engine execution trigger logic
      const parsedPdf = await pdfParse(dataBuffer);
      console.log(`📄 Successfully parsed raw text characters from ${file}: ${parsedPdf.text.length}`);
      
      const textChunks = parsedPdf.text.match(/[\s\S]{1,1000}/g) || [];
      
      textChunks.forEach((chunk, index) => {
        knowledgeVectorStore.push({
          source: file,
          content: chunk.trim(),
          chunkId: `${file}-${index}`
        });
      });
    }
    
    console.log(`✅ RAG Engine Loaded: Indexed ${knowledgeVectorStore.length} medical knowledge vector nodes.`);
  } catch (error) {
    console.error("❌ Failed to initialize RAG Vector Store Engine standard:", error);
  }
};

const retrieveRelevantContext = (query, topK = 3) => {
  if (knowledgeVectorStore.length === 0) return [];
  const queryKeywords = query.toLowerCase().split(" ");
  
  return knowledgeVectorStore
    .map(node => {
      let score = 0;
      queryKeywords.forEach(word => {
        if (node.content.toLowerCase().includes(word)) score++;
      });
      return { ...node, score };
    })
    .filter(node => node.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

module.exports = {
  initializeMedicalKnowledgeBase,
  retrieveRelevantContext,
  ai
};