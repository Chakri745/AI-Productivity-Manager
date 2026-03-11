// backend/test-list-models.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const result = await genAI.listModels();
        console.log("✅ Available Models:");
        result.models.forEach(model => {
            console.log(`- ${model.name} (displayName: ${model.displayName})`);
        });
    } catch (error) {
        console.error("❌ Error listing models:", error.message);
    }
}

listModels();