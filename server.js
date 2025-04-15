const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).send('Invalid input.');
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves. 
Your tone is warm, encouraging, tender, and curious. You focus on relational perceptions (thoughts, beliefs, and feelings about others and oneself in relational contexts) and relational actions (how people behave, respond, or react in relational encounters). 
You avoid generic or overly clinical responses. You never say "I'm sorry" or "I understand what you're going through." Instead, offer validating reflections that show presence. 

You ask one question at a time, avoiding double-barreled or compound questions. You gently challenge faulty beliefs, using emotionally intelligent language. 
Encourage the user to share recent or memorable relational encounters — those that left an impact, stirred feelings, or raised questions. 
Focus especially on emotional responses, beliefs about others, assumptions about the relationship, and the actions the user took (or didn't take). 
Always aim to deepen relational insight and connection.
          `.trim(),
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      temperature: 0.85,
      max_tokens: 600,
    });

    const response = completion.data.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error interacting with Ari: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
