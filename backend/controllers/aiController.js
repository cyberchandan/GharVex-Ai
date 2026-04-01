const asyncHandler = require('express-async-handler');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  
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

  let responseContent = '';

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    res.status(500);
    throw new Error('Gemini API key is missing. Check backend/.env file.');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPromptContent 
  });

  const chatHistory = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const chat = model.startChat({
      history: chatHistory,
  });
  
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  responseContent = result.response.text();

  // Parse JSON if outputted
  let parsedProject = null;
  try {
    if (responseContent.includes('"project_finalized": true')) {
      let jsonStr = responseContent;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0];
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0];
      }
      parsedProject = JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('Failed to parse AI JSON', e);
  }

  res.json({
    reply: responseContent,
    projectReady: !!parsedProject,
    projectData: parsedProject,
  });
});

module.exports = { handleChat };
