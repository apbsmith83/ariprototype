const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAIApi } = require('openai');  // Import OpenAIApi directly

const app = express();
const port = process.env.PORT || 3000;

// Directly instantiate OpenAIApi with API key
const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY, // Get the key from the .env file
});

app.use(express.json());

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userInput }],
    });

    const response = completion.data.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
