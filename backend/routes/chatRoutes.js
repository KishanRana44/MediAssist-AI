const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');

router.post('/send-message', async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) return res.status(400).json({ success: false, message: "Message is required" });

    // 1. MEMORY PULL
    let labReportContext = "";
    if (global.activePatientReports?.["current_report"]) {
      const r = global.activePatientReports["current_report"];
      labReportContext = `[PATIENT: ${r.patientName}] Summary: ${r.summary} Metrics: ${r.metrics}`;
    }

    // 2. SYSTEM PROMPT (Health Coach)
    const systemPrompt = `
      You are a clinical advisor. Answer using this lab data: ${labReportContext || "None"}.
      ALWAYS provide 2-3 actionable health recommendations as a bulleted list.
      End with a brief medical disclaimer.
      Patient Question: "${userMessage}"
    `;

    // 3. GEMINI API CALL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.4 }
      })
    });

    const data = await apiResponse.json();
    const aiReply = data.candidates[0].content.parts[0].text;

    // 4. SAVE TO MONGODB
    await ChatHistory.create({
      userId: "default_user",
      question: userMessage,
      answer: aiReply,
      sourceDocs: ["MediAssist AI Knowledge Base"]
    });

    res.status(200).json({ success: true, reply: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Chat engine unavailable.' });
  }
});

// History fetch route
router.get('/history', async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: "default_user" }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch history' });
  }
});

module.exports = router;