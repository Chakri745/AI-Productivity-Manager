import { ActivityEvent, Recommendation, WorkContext } from "../types";
import { askGemini } from "./geminiClient";

function pickTopContext(contexts: WorkContext[], events: ActivityEvent[]) {
  const now = Date.now();
  return contexts
    .map((ctx) => {
      const ctxEvents = events.filter((e) => ctx.relatedEventIds.includes(e.id));
      const dueDates = ctxEvents
        .map((e) => e.metadata?.dueDate)
        .filter(Boolean)
        .map((d) => new Date(d).getTime());
      const soonestDue = dueDates.length ? Math.min(...dueDates) : null;
      const unresolvedTasks = ctx.signals.unresolvedTasks;
      const daysIdle = (now - ctx.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
      const dueScore = soonestDue ? Math.max(0, 30 - (soonestDue - now) / (1000 * 60 * 60 * 24)) : 0;
      const idleScore = daysIdle > 1 ? Math.min(10, daysIdle) : 0;
      const taskScore = unresolvedTasks * 5;
      const total = dueScore + idleScore + taskScore;
      return { ctx, total, soonestDue, unresolvedTasks, daysIdle };
    })
    .sort((a, b) => b.total - a.total)[0];
}

export async function buildRecommendation(
  contexts: WorkContext[],
  events: ActivityEvent[]
): Promise<Recommendation> {
  if (!contexts.length) {
    return {
      recommendation: "Review recent activity to create your first context.",
      reason: "No contexts were inferred from the current activity data.",
      signals: {
        contextName: "N/A",
        unresolvedTasks: 0,
        timeSinceLastActivityDays: 0,
      },
    };
  }

  const top = pickTopContext(contexts, events);
  if (!top) {
    return {
      recommendation: "Organize your tasks to enable prioritization.",
      reason: "Could not compute a top context from activity signals.",
      signals: {
        contextName: "N/A",
        unresolvedTasks: 0,
        timeSinceLastActivityDays: 0,
      },
    };
  }

  const { ctx, soonestDue, unresolvedTasks, daysIdle } = top;

  const explanationPrompt = `
You are generating a concise, explainable recommendation for what to work on next.
Rules:
- Start with “You should work on … next because …”.
- Mention the context name.
- Mention if there is a near deadline (if any).
- Mention unresolved tasks count.
- Mention how long since last activity in this context.
- Keep it under 60 words.
Context: ${ctx.name}
Unresolved tasks: ${unresolvedTasks}
Days since last activity: ${daysIdle.toFixed(1)}
Next deadline: ${soonestDue ? new Date(soonestDue).toISOString() : "none"}
`;

  let reason = `You should work on ${ctx.name} next because it has ${unresolvedTasks} unresolved tasks and was last touched ${daysIdle.toFixed(
    1
  )} days ago${soonestDue ? ` with a deadline approaching on ${new Date(soonestDue).toDateString()}` : ""}.`;

  try {
    const prompt = `You are a productivity assistant. Generate one concise, explainable recommendation.\n${explanationPrompt}`;
    const llmReason = await askGemini(prompt);
    if (llmReason) {
      reason = llmReason.trim();
    }
  } catch (err) {
    console.error("Gemini recommendation explanation failed, using fallback:", err);
  }

  return {
    recommendation: ctx.name,
    reason,
    signals: {
      contextName: ctx.name,
      unresolvedTasks,
      timeSinceLastActivityDays: Number(daysIdle.toFixed(1)),
      dueDate: soonestDue ? new Date(soonestDue).toISOString() : undefined,
    },
  };
}
