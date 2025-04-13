const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');  // Corrected import based on new API

const app = express();  // Initialize Express app here
app.use(cors()); // Add this line for cross-origin requests

const port = process.env.PORT || 3000;

// Initialize OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // API key from the .env file
});

app.use(express.json());  // Middleware to parse incoming JSON requests

// POST route to handle interaction
app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userInput }],
    });

    const response = completion.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
