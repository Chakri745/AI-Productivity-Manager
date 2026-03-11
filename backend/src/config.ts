
import dotenv from "dotenv";
dotenv.config();

export const config = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT || 4000,
    // Add other keys here as needed
};
