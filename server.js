const getAriResponse = async (input) => {
    const lowerInput = input.toLowerCase();
    let response;

    // Use GPT-3/4 to generate responses dynamically
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: "You are an AI designed to engage users in relational dialogue, helping them reflect on their perceptions, actions, and relationship dynamics." },
                { role: 'user', content: input }
            ]
        });

        // Extract the response from GPT
        response = completion.choices[0].message.content;
        
    } catch (error) {
        console.error("Error generating response: ", error);
        response = "Sorry, something went wrong with my response. Could you try again?";
    }

    return response;
};

app.post('/interact', async (req, res) => {
    const userInput = req.body.text;

    try {
        const response = await getAriResponse(userInput);
        res.json({ reply: response });
    } catch (error) {
        res.status(500).send('Error interacting with OpenAI: ' + error.message);
    }
});
