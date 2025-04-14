const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Route for interacting with OpenAI
app.post("/interact", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.error("Error interacting with OpenAI:", error);
    res.status(500).json({ error: "Failed to interact with OpenAI API" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
