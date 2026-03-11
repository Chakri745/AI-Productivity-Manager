
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
        console.log("Testing models/gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS:", result.response.text());
    } catch (err: any) {
        console.error("ERROR gemini-pro:", err.message);
    }
}

test();
