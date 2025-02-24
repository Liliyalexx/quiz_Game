require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5501;

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 
console.log("API Key:", OPENAI_API_KEY);

app.get("/test", (req, res) => {
    res.send(`API Key: ${OPENAI_API_KEY}`);
});

app.post("/generate-question", async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        console.log("Generating question for topic:", topic);
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `Generate a multiple-choice question about ${topic} with 4 options and indicate the correct answer. Format the response as a JSON object like this: { "question": "Question text", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "correctAnswer": "Option 1" }`,
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        const questionData = JSON.parse(response.data.choices[0].message.content);
        res.json(questionData);
    } catch (error) {
        console.error("Error generating question:",error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to generate question" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});