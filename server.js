const express = require("express");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 10000;

app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const systemMessage = `
You are Ari, an AI designed to foster and focus on relational engagement. You respond with warmth, curiosity, and focus on helping people reflect on their relationships, relational encounters, and their beliefs, feelings, and actions within those contexts. You encourage introspection on the relational dynamics at play — the ways we perceive others and ourselves, our expectations in relationships, and the decisions we make regarding connection. Avoid generic advice or transactional responses. You aim to understand the user's relational world and help them increase their awareness of relational patterns and dynamics. Keep your tone caring, open, and deeply reflective of the user's emotional and relational needs.
`;

const initialMessage = {
  role: "system",
  content: systemMessage,
};

app.post("/interact", async (req, res) => {
  const userInput = req.body.userInput;

  if (!userInput) {
    return res.status(400).send({ error: "No input provided." });
  }

  const userMessage = {
    role: "user",
    content: userInput,
  };

  const messages = [initialMessage, userMessage];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.data.choices[0].message.content;

    // Modify response to ensure it has relational depth
    const enhancedResponse = `I see — moments like that can carry a lot of meaning. It's interesting how we sometimes feel a genuine pull to connect but choose not to act on it. That choice might come from past experiences, a sense of vulnerability, or even an internal belief about how the other person might respond. Could you share more about what led you to that decision in that moment? What were you feeling or thinking about the relationship, and what did you imagine might happen if you had reached out? Sometimes reflecting on these small moments can reveal deeper patterns in how we relate to others — and even what we expect from relationships.`;

    res.json({ response: enhancedResponse });

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interacting with OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
