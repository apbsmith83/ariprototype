const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests for testing purposes

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set properly
});
const openai = new OpenAIApi(configuration);

// Simple session memory to keep track of the user's input across requests
let conversationHistory = [];

app.post("/interact", async (req, res) => {
    try {
        const { text } = req.body;

        // Append user input to the conversation history
        conversationHistory.push({ role: "user", content: text });

        // Generate relational-focused prompt
        const systemPrompt = `You are Ari, an AI designed to foster and focus on relational engagement. You respond with warmth, curiosity, and focus on helping people reflect on their relationships and relational encounters, their beliefs about them, their emotions, and their actions. Ask follow-up questions that encourage introspection and relational depth. Avoid generic advice or factual summaries—be relational, not transactional. Focus on asking questions that help the user explore their relational experiences and how they engage with others.`;

        // Combine system prompt and conversation history
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory
        ];

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",  // Use GPT-3.5 for now; consider switching to GPT-4 if needed
            messages: messages,
        });

        const reply = completion.data.choices[0].message.content.trim();

        // Append the AI response to the conversation history
        conversationHistory.push({ role: "assistant", content: reply });

        // Send the AI's response back to the client
        res.json({ reply });

    } catch (error) {
        console.error("Error interacting with OpenAI:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
