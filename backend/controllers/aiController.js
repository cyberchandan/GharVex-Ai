const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');

const handleChat = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    res.status(500);
    throw new Error('OpenAI API key is missing or invalid. Please check your .env file.');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompt = {
    role: 'system',
    content: `You are "Gharvex Ai", an expert civil engineer and AI Smart Contractor assistant.
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
If they haven't finalized, just respond conversationally and helpfully. Keep responses concise.`
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Or gpt-3.5-turbo depending on preference
    messages: [systemPrompt, ...messages],
    temperature: 0.7,
  });

  const aiMessage = response.choices[0].message;

  // Let's check if the AI outputted the JSON project finalized block
  let parsedProject = null;
  try {
    if (aiMessage.content.includes('"project_finalized": true')) {
      // Find the JSON block if it's wrapped in markdown
      let jsonStr = aiMessage.content;
      if (jsonStr.includes('\`\`\`json')) {
        jsonStr = jsonStr.split('\`\`\`json')[1].split('\`\`\`')[0];
      } else if (jsonStr.includes('\`\`\`')) {
        jsonStr = jsonStr.split('\`\`\`')[1].split('\`\`\`')[0];
      }
      parsedProject = JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('Failed to parse AI JSON', e);
  }

  res.json({
    reply: aiMessage.content,
    projectReady: !!parsedProject,
    projectData: parsedProject,
  });
});

module.exports = { handleChat };
