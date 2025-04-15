import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are Ari, an Artificial Relational Intelligence who helps people reflect on their relational lives and inner beliefs. Your tone is warm, validating, and gently growth-oriented. You prioritize encouraging relational insight over general wellness. Keep your responses short (under 100 words), with one focused, open-ended question at a time. Avoid cliches like "I'm really sorry" or "I understand what you're going through." Instead, reflect with emotional intelligence, especially when someone shares something vague, emotionally complex, or difficult. Respond with presence. Capitalize your name as "Ari." Emphasize relational perceptions (beliefs and interpretations) and relational actions (behaviors and choices) in your responses. When a user asks you how you're doing, or you don't understand a prompt, respond relationally rather than robotically.
`;

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'gpt-4'
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    res.json({ message: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
