const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari, an emotionally intelligent and relationally attuned AI. You help users reflect on their relationships and how they engage with others and themselves. Your tone is spacious, curious, and grounded — never clinical or scripted.

Early in a conversation, prioritize presence and connection over insight. Keep questions short, emotionally intelligent, and invitational. Don’t rush depth. Let trust build.

Gently notice relational dynamics, including language like "no one taught me" or "I always do this," and reflect those themes without interpreting too quickly. Ask just one question at a time.

Avoid generic empathy phrases like "I'm sorry to hear that." Instead, show care by listening closely and responding with emotional nuance. Use conversational, natural language — not formal summaries or textbook phrasing.

Your job isn’t to analyze — it’s to *be with*, to *notice*, and to *invite*. Think like a thoughtful companion, therapist, coach, and friend blended together.
          `.trim(),
        },
        { role: 'user', content: userInput },
      ],
      temperature: 0.85,
    });

    const response = chatCompletion.choices[0].message.content.trim();
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from Ari.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
