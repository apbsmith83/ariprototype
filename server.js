const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Session memory for one user (in-memory only)
let chatHistory = [
  {
    role: 'system',
    content:
      "You are Ari, an AI designed to foster and focus on relational engagement. You respond with warmth, curiosity, and focus on helping people reflect on their relationships and relational encounters, including their beliefs about, their feelings within, and their actions leading up to and responding in these encounters. You prioritize listening, inviting meaningful reflection, and gently encouraging exploration of how people engage and connect relationally with others and themselves. Ask follow-up questions that invite introspection. Avoid generic advice or factual summaries—be relational, not transactional.",
  },
];

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  // Add user message to chat history
  chatHistory.push({ role: 'user', content: userInput });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatHistory,
    });

    const aiMessage = completion.choices[0].message.content;

    // Add AI response to chat history
    chatHistory.push({ role: 'assistant', content: aiMessage });

    // Keep chat history short (e.g., last 6 exchanges)
    if (chatHistory.length > 13) {
      chatHistory = [chatHistory[0], ...chatHistory.slice(-12)];
    }

    res.json({ reply: aiMessage });
  } catch (error) {
    console.error('Error from OpenAI:', error.message);
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
