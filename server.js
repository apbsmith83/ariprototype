// server.js

const express = require('express');
const dotenv = require('dotenv');
const { Configuration, OpenAIApi } = require('openai');

dotenv.config();  // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // Get the key from the .env file
});
const openai = new OpenAIApi(configuration);

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
