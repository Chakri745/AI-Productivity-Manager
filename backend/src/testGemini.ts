
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log("Key present:", !!key);

async function test() {
    if (!key) return;
    const genAI = new GoogleGenerativeAI(key);
    try {
        console.log("Testing gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (err: any) {
        console.error("Error with gemini-1.5-flash-latest:", err.message);

        try {
            console.log("Testing gemini-1.5-flash...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-1.5-flash:", result2.response.text());
        } catch (err2: any) {
            console.error("Error with gemini-1.5-flash:", err2.message);
        }
    }
}

test();
