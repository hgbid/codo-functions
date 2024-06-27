const functions = require('firebase-functions');
const { default: OpenAI } = require('openai');
const dotenv = require('dotenv');

async function translateTask(text) {
    const openai_res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
            role: "system",
            content: `
Following is a programming task in Hebrew. You need to translate it to English, preserving all the technical requirements.
The task might have HTML tags embedded, please format the response WITHOUT these tags or any structure - just return the text.
`,
        },
        {
            role: "user",
            content: text
        }
      ],
    });

    return {task: openai_res.choices[0].message.content};
}

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

exports.getTaskTranslation = functions.https.onRequest(async (req, res) => {
    const task = req.body.task;

    const translatedTask = await translateTask(task);

    res.status(200).send({task: translatedTask});
});
