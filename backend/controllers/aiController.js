const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const logToFile = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(__dirname, '../ai_debug.log'), logMsg);
};

const handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  logToFile('Chat request received: ' + JSON.stringify(messages));
  
  // Using Google Gemini API

  const systemPromptContent = `You are "Gharvex Ai", an expert civil engineer and AI Smart Contractor assistant.
Your goal is to help users plan their home construction/renovation projects, document requirements, est. budget, and prepare a "Scope of Work" to send to contractors.
Follow these steps:
1. Greet and ask if it's a new build or a specific renovation.
2. Ask 1-2 clarifying questions about size, materials, location, rooms.
3. Once you have enough details, ask for their estimated budget.
4. When they provide a budget and confirm they are ready to proceed, you MUST output the finalized requirements purely as a JSON object (and nothing else) with the following structure:
{
  "project_finalized": true,
  "title": "Short title of project",
  "description": "A brief overview",
  "scopeOfWork": { "tasks": [], "materials": [] },
  "estimatedBudget": 1000000,
  "location": "City/Area"
}
If they haven't finalized, just respond conversationally and helpfully. Keep responses concise.`;

  console.log('Received messages:', messages);
  let responseContent = '';

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    res.status(500);
    throw new Error('Gemini API key is missing. Check backend/.env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: systemPromptContent 
    });

    const chatHistory = [];
    messages.slice(0, -1).forEach((msg, index) => {
      // Gemini history usually must start with a 'user' message.
      // If the first message is from assistant, we might skip it or handle it.
      if (index === 0 && msg.role === 'assistant') return; 
      
      chatHistory.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    
    console.log('Gemini History:', JSON.stringify(chatHistory, null, 2));

    logToFile('Gemini History size: ' + chatHistory.length);

    const chat = model.startChat({
        history: chatHistory,
    });
    
    const lastMessage = messages[messages.length - 1].content;
    logToFile('Last message received: ' + lastMessage);

    const result = await chat.sendMessage(lastMessage);
    responseContent = result.response.text();
    logToFile('Response received from Gemini');
  } catch (err) {
    logToFile('ERROR: ' + err.message);
    res.status(500);
    throw new Error('AI Service Error: ' + err.message);
  }

  // Parse JSON if outputted
  let parsedProject = null;
  try {
    const jsonMatch = responseContent.match(/\{[\s\S]*"project_finalized":\s*true[\s\S]*\}/);
    if (jsonMatch) {
      parsedProject = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse AI JSON', e);
  }

  let replyText = responseContent.replace(/```json[\s\S]*?```/g, '').replace(/```[\s\S]*?```/g, '').trim();
  
  // If the reply is empty after stripping code blocks (common when AI only outputs JSON),
  // provide a standard confirmation or the raw content as a fallback.
  if (!replyText) {
    if (!!parsedProject) {
      replyText = "Project details finalized! Please review them below.";
    } else {
      replyText = responseContent;
    }
  }

  res.json({
    reply: replyText,
    projectReady: !!parsedProject,
    projectData: parsedProject,
  });
});

module.exports = { handleChat };
