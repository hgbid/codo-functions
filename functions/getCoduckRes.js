const functions = require('firebase-functions');
const { default: OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.getCoduckRes = functions.https.onRequest(async (req, res) => {
  const { chatMessages, code, prompt } = req.body;
  
  if (!chatMessages || !code || !prompt ) {
    return res.status(400).send({ error: 'chatMessages, code, and prompt are required' });
  }

  const systemPrompt = {
    role: "system",
    content: prompt
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
});



const mokedRes = {
  "id": "chatcmpl-9cXZt6H8jqO7TH4MWeEplQZegkXyJ",
  "object": "chat.completion",
  "created": 1718972565,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "ישנם מספר אפשרויות להשקעה, תלוי במטרות הפיננסיות שלך, היכולת לקחת סיכונים והזמן שיש לך להשקיע. כאחד הדברים שמומלץ לשקול הוא לבנות קונפורט פיננסי, שיכלול איכות גבוהה של השקעות לפי רמת הסיכון שנרצה לקחת ולהעלות - צעדי פעולה בהתאם."
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 227,
    "total_tokens": 257
  },
  "system_fingerprint": null
};