const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();

// Middleware for CORS (to allow external requests)
app.use(cors()); // Allow all origins to access this server
app.use(bodyParser.json()); // Parse incoming JSON requests

// OpenAI API Setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Make sure you set your OpenAI API Key in the environment variables
});
const openai = new OpenAIApi(configuration);

// Route to handle POST requests at /interact
app.post('/interact', async (req, res) => {
  try {
    const prompt = req.body.message; // Get the 'message' sent in the request body
    if (!prompt) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Call the OpenAI API to generate a response
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
    });

    // Send the response back
    res.json({ response: completion.data.choices[0].text });
  } catch (error) {
    console.error('Error interacting with OpenAI:', error);
    res.status(500).json({ error: 'Failed to interact with OpenAI API' });
  }
});

// Set up the server to listen on a port
const port = process.env.PORT || 10000; // Default to 10000 or use Render's environment port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
