require('dotenv').config(); // This will ensure we can use environment variables

const express = require('express');
const { OpenAI } = require('openai'); // Import OpenAI SDK

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This will use the API key from your environment
});

// Endpoint to handle requests
app.post('/interact', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send({ error: 'Message is required.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // You can change the model if needed
      messages: [{ role: 'user', content: message }],
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send({ error: 'Error generating response from AI.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
