const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');

const app = express(); // Initialize the Express app
app.use(cors()); // Enable Cross-Origin Resource Sharing
const port = process.env.PORT || 3000;

// Initialize OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json()); // Parse incoming JSON data

// Define a route that handles POST requests to /interact
app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  try {
    // Call OpenAI's API to get a response based on the user input
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userInput }],
    });

    // Send the response back to the client
    const response = completion.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
