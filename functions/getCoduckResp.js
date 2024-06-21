const OpenAI = require('openai');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.getCoduckResp = async (req, res) => {
  const { chatMessages, code, task } = req.body;

  if (!chatMessages || !code || !task) {
    return res.status(400).send({ error: 'chatMessages, code, and task are required' });
  }

  const systemPrompt = { 
    role: "system", 
    content: `
      You are Coduck, a debugging assistant duck. Your role is to help the user (a student) identify problems in their code or task. 
      You must not solve the task for them but instead guide them to understand what the issue might be and how they can approach fixing it. 
      Here is the task they need help with: ${JSON.stringify(task)}
      All the conversation will be in Hebrew.
    `
  };

  const formattedChatMessages = chatMessages.map(message => ({
    role: message.writer === 'user' ? 'user' : 'assistant',
    content: message.message,
  }));

  const codePrompt = {
    role: "system",
    content: `The current student code is ${code}`
  };

  const messages = [systemPrompt, ...formattedChatMessages, codePrompt];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    res.status(200).send(response.choices);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).send({ error: 'Error calling OpenAI API' });
  }
};
