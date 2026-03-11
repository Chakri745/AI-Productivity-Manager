
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function test() {
    if (!key) {
        console.error("No API Key found");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Connection Successful'");
        console.log("RESULT:", result.response.text());
    } catch (err: any) {
        console.error("ERROR:", err.message);
    }
}

test();
