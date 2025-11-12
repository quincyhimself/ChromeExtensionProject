import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const MODELS = {
  flash2: {
    name: "gemini-2.0-flash-exp",
    key: process.env.GEMINI_API_KEY1,
  },
  flash25: {
    name: "gemini-2.5-flash",
    key: process.env.GEMINI_API_KEY2,
  },
};

// helper to call Gemini
async function askGemini(modelConfig, question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.name}:generateContent`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              text: `Give only the direct answer to this or these questions, nothing more or less: ${question}`,
            },
          ],
        },
      ],
    },
    {
      headers: {
        "x-goog-api-key": modelConfig.key,
        "Content-Type": "application/json",
      },
    }
  );

  return (
    response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "There's no answer found."
  );
}

app.post("/ask", async (req, res) => {
  try {
    const { question, model } = req.body;
    if (!question)
      return res.status(400).json({ error: "Missing question" });

    // choose model (default to 2.5)
    const selectedModel = MODELS[model] || MODELS.flash25;

    const answer = await askGemini(selectedModel, question);
    res.json({ model: selectedModel.name, answer });
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

app.get("/", (req, res) => res.send("✅ Gemini dual-model backend is running."));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));