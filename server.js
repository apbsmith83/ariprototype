// Import required modules
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
require("dotenv").config(); // Make sure this line is present to load .env variables

// Initialize the Express app
const app = express();
const port = process.env.PORT || 10000;

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Set up OpenAI API connection using the key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // This will pull from your Render environment variable
});
const openai = new OpenAIApi(configuration);

// Define your API endpoint
app.post("/interact", async (req, res) => {
  const { input } = req.body; // Expecting a JSON body with an 'input' field

  try {
    // Interact with OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4", // You can switch this to the model you're using
      messages: [{ role: "user", content: input }],
    });

    // Send back the response from OpenAI
    res.json({
      message: completion.data.choices[0].message.content,
    });
  } catch (error) {
    // Handle errors
    console.error("Error interacting with OpenAI API:", error);
    res.status(500).json({
      error: "Failed to interact with OpenAI API",
      details: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
