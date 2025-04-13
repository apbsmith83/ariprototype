app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  try {
    // Create a prompt for the AI that guides it towards relational responses
    const prompt = `
    You are Ari, a relational AI designed to engage in thoughtful, meaningful conversations with people about their relationships. 
    Respond in a warm, empathetic, and insightful manner. Ask follow-up questions when appropriate, and provide reflections that guide the user toward deeper relational engagement.

    User: ${userInput}
    Ari:`;

    // Interact with OpenAI's GPT model using the prompt
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a friendly, relational AI.' },
                { role: 'user', content: userInput }],
    });

    const response = completion.choices[0].message.content;

    // Send the generated response back to the frontend
    res.json({ reply: response });

  } catch (error) {
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});
