import { ActivityEvent } from "../types";
import { askGemini } from "./geminiClient";

export type CriticalAnalysisResult = {
    criticalItems: {
        event: ActivityEvent;
        reasoning: string;
        priorityScore: number; // 0-100
    }[];
    contextGroups: {
        contextName: string;
        eventIds: string[];
        summary: string;
    }[];
    executiveSummary: string;
};

export async function analyzeCriticalItems(
    events: ActivityEvent[]
): Promise<CriticalAnalysisResult> {
    const pendingEvents = events.filter(
        (e) => e.type === "task" || e.type === "email" || e.type === "meeting"
    );

    // Simplify events for the prompt to save tokens
    const simplifiedEvents = pendingEvents
        .slice(0, 50)
        .map((e, idx) => ({
            id: e.id,
            title: e.title,
            type: e.type,
            date: e.timestamp.toISOString(),
            source: e.source,
            metadata: JSON.stringify(e.metadata ?? {}).slice(0, 300),
        }));


    const prompt = `
    You are an expert executive assistant with critical thinking skills. 
    Analyze the following list of user activities (emails, meetings, tasks).
    
    Your goal is to identify the MOST CRITICAL items that require immediate attention.
    
    SCORING RUBRIC (0-100):
    - 90-100 (CRITICAL): Deadline within 24 hours, high-stakes client/manager request, or blocked workflow.
    - 75-89 (HIGH): Deadline within 3 days, important project milestone, or unresolved issue.
    - 50-74 (MEDIUM): Routine status updates, meetings next week, standard maintenance.
    - 0-49 (LOW): Newsletters, "FYI" emails, no action required.

    Input Data:
    ${JSON.stringify(simplifiedEvents, null, 2)}
    
    INSTRUCTIONS:
    1. Filter out duplicates (e.g. same email subject/thread).
    2. Think step-by-step: Why is this urgent? What happens if ignored?
    3. Output structured JSON ONLY with this detailed format:
    {
      "criticalItems": [
        { "id": "event_id", "reasoning": "Explicit reason citing the deadline or impact. Mention the rubric criteria used.", "priorityScore": 95 }
      ],
      "contextGroups": [
         { "contextName": "Project X", "eventIds": ["id1", "id2"], "summary": "Brief status of this project based on items" }
      ],
      "executiveSummary": "A 2-3 sentence high-level overview. Be specific about the #1 priority."
    }

    Select exactly top 3-5 critical items.
    Group related items into contexts.
  `;

    try {
        const response = await askGemini(prompt, { jsonMode: true });
        if (!response) throw new Error("No response from AI");

        // Clean up markdown code blocks if present
        const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        // Rehydrate events
        const criticalItems = parsed.criticalItems.map((item: any) => {
            const fullEvent = events.find(e => e.id === item.id);
            if (!fullEvent) return null;
            return {
                event: fullEvent,
                reasoning: item.reasoning,
                priorityScore: item.priorityScore
            };
        }).filter(Boolean);

        return {
            criticalItems,
            contextGroups: parsed.contextGroups || [],
            executiveSummary: parsed.executiveSummary || "Analysis complete."
        };

    } catch (err) {
        console.error("Critical analysis failed, using fallback:", err);

        // Smarter Fallback:
        // 1. Sort by date (newest first)
        // 2. Prioritize emails with "urgent" or "important" in title
        const sortedEvents = [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const criticalItems = sortedEvents.slice(0, 4).map(e => {
            const isUrgent = e.title.toLowerCase().includes("urgent") || e.title.toLowerCase().includes("due");
            return {
                event: e,
                reasoning: isUrgent ? "Flagged as urgent based on keywords." : "Most recent activity requires review.",
                priorityScore: isUrgent ? 85 : 60
            };
        });

        return {
            criticalItems,
            contextGroups: [
                {
                    contextName: "Recent Activity",
                    eventIds: criticalItems.map(c => c.event.id),
                    summary: "Overview of your most recent emails and tasks (AI temporarily offline)."
                }
            ],
            executiveSummary: "AI Analysis is currently offline due to connectivity issues. Showing most recent items ordered by date."
        };
    }
}
