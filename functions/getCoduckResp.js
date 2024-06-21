const functions = require('firebase-functions');
const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.getCoduckResp = functions.https.onRequest(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: prompt,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    console.log(response.data);
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).send({ error: 'Error calling OpenAI API' });
  }
});
