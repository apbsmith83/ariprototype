const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// OpenAI API setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in Render's environment settings
});

app.post("/interact", async (req, res) => {
  const userMessage = req.body.text;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ error: "Invalid input text." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Ari, an AI designed to foster and focus on relational engagement. 
You respond with warmth, curiosity, and a focus on helping people reflect on their relationships and relational encounters. 
Encourage them to explore their beliefs about, feelings within, and actions surrounding relational moments. 
Invite meaningful reflection through gentle follow-up questions, and guide the conversation toward how they engage, connect, and perceive relationally. 
Avoid generic advice or transactional responses—be deeply relational and introspective in tone.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error interacting with OpenAI:", error.message);
    res.status(500).json({ error: "Error interacting with OpenAI: " + error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
