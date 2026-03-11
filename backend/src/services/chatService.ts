import { ActivityEvent } from "../types";
import { askGemini, localEmbedding, cosineSimilarity } from "./geminiClient";
import { ingestAllSources } from "../ingestion/ingest";
import { PrismaClient } from "@prisma/client";

// Simple in-memory history type
export type ChatMessage = {  // ← Changed from [ to {
    role: "user" | "bot";
    content: string;
};  // ← Changed from ] to }

type ChatResponse = {
    reply: string;
    action?: {
        type: "create_task";
        data: {
            title: string;
            dueDate?: string;
        };
    };
};

export async function processChatMessage(
    message: string,
    history: ChatMessage[],
    prisma: PrismaClient
): Promise<ChatResponse> {
    // 1. Detect Intent: Task Scheduling vs General Query
    // Simple heuristic: check for keywords. Ideally, an LLM call would be better for intent classification,
    // but to save latency/tokens we can try a quick check or just include it in the main prompt.
    // We'll use the main prompt to handle both.

    // 2. Retrieve Context (RAG)
    // Fetch all events (hackathon scale: <100 events usually). 
    // For production: use vector DB.
    const allEvents = await ingestAllSources(prisma);

    // Calculate embedding for user query
    // Note: localEmbedding is synchronous
    const queryVector = localEmbedding(message);

    // Score events
    const scoredEvents = allEvents.map((e) => {
        const eventVector = localEmbedding(e.title + " " + (e.metadata?.description || ""));
        const score = cosineSimilarity(queryVector, eventVector);
        return { event: e, score };
    });

    // Top 5 relevant events
    const relevantEvents = scoredEvents
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.event);

    const contextText = relevantEvents
        .map(
            (e) =>
                `- [${e.type.toUpperCase()}] ${e.title} (${new Date(
                    e.timestamp
                ).toLocaleDateString()})`
        )
        .join("\n");

    // 3. Construct Prompt
    const prompt = `
You are a helpful AI productivity assistant.
User Query: "${message}"

Context from user's data (Emails/Calendar/Tasks):
${contextText || "No relevant data found."}

Conversation History:
${history.slice(-3).map((h) => `${h.role}: ${h.content}`).join("\n")}

Instructions:
1. Answer the user's question based on the context.
2. If the user wants to schedule a task or meeting, output a JSON object ONLY for the action at the end of your response in this format: 
   :::ACTION_JSON={"type":"create_task","data":{"title":"...","dueDate":"YYYY-MM-DD"}}}:::
   Otherwise, just provide a helpful text response.
3. Keep the text response concise and friendly.
`;

    // 4. Call LLM
    const llmResponse = await askGemini(prompt, { jsonMode: false });

    if (!llmResponse) {
        // Fallback Logic for Offline Mode
        console.warn("Gemini offline, using regex fallback.");
        const lowerMsg = message.toLowerCase();

        // 1. Task Creation Fallback
        if (lowerMsg.includes("schedule") || lowerMsg.includes("create task") || lowerMsg.includes("remind me")) {
            // Extract roughly what comes after the trigger word
            const match = message.match(/(?:schedule|create task|remind me to|add task) (.+)/i);
            const title = match ? match[1].trim() : "New Task";

            return {
                reply: `(Offline Mode) I can't reach the AI brain right now, but I can still help you create that task.`,
                action: {
                    type: "create_task",
                    data: { title, dueDate: new Date().toISOString().split('T')[0] }
                }
            };
        }

        // 2. Greeting Fallback
        if (lowerMsg.match(/\b(hi|hello|hey)\b/)) {
            return { reply: "Hi there! I'm currently running in offline mode. I can help you schedule tasks if you say 'Schedule [task name]'." };
        }

        // 3. Generic Fallback
        return { reply: "I'm having trouble connecting to my AI brain right now. You can try asking me to 'Schedule a meeting' or check your internet connection." };
    }

    // 5. Parse Response for Actions
    // Looking for the special marker
    const actionMarker = ":::ACTION_JSON=";
    const splitIndex = llmResponse.indexOf(actionMarker);

    if (splitIndex !== -1) {
        const textReply = llmResponse.substring(0, splitIndex).trim();
        const jsonString = llmResponse.substring(splitIndex + actionMarker.length);
        // Remove trailing ::: if present (simple cleanup)
        const cleanJson = jsonString.replace(/:::$/, "");

        try {
            const action = JSON.parse(cleanJson);
            return { reply: textReply, action };
        } catch (e) {
            console.error("Failed to parse action JSON:", e);
            return { reply: textReply };
        }
    }

    return { reply: llmResponse };
}