
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function test() {
    if (!key) {
        console.error("No API Key");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS:", result.response.text());
    } catch (err: any) {
        console.error("FULL ERROR:");
        console.error(JSON.stringify(err, null, 2));
        if (err.message) console.error("MESSAGE:", err.message);
        if (err.response) console.error("RESPONSE:", JSON.stringify(err.response, null, 2));
    }
}

test();
