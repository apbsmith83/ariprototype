const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for all origins (for testing)
app.use(cors());

// Use bodyParser to parse incoming JSON requests
app.use(bodyParser.json());

// Logging for incoming requests (to verify what data is being sent)
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// POST /interact endpoint to handle the user input and interact with OpenAI API
app.post('/interact', async (req, res) => {
  console.log('POST request received at /interact');
  try {
    const userInput = req.body.input;
    if (!userInput) {
      return res.status(400).json({ error: 'No input provided' });
    }

    // Make the API request to OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003', // You may use your model here
        prompt: userInput,
        max_tokens: 100,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('OpenAI API response:', response.data);
    res.json(response.data); // Send the OpenAI API response back to the client
  } catch (error) {
    console.error('Error interacting with OpenAI API:', error);
    res.status(500).json({ error: 'Failed to interact with OpenAI API' });
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
