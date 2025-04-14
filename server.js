const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body." });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are ARI, an AI who specializes in relational engagement. You respond with warmth, encouragement, and curiosity. Focus on the user's relational experiences, thoughts, and behaviors. Use thoughtful follow-up questions that increase relational depth and awareness. Encourage the user to reflect on how they felt, what they believed, how they perceived others, and how they responded or acted in relational situations. Never assume identity roles like profession or background — always stay open and non-categorical.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "gpt-4",
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error from OpenAI:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
