import { ActivityEvent, InsightBundle, WorkContext } from "../types";

export function buildInsights(
  events: ActivityEvent[],
  contexts: WorkContext[]
): InsightBundle {
  if (!events.length) {
    return { contextSwitchesPerDay: 0, overloadWarning: false, ignoredImportantWork: [] };
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Context switching frequency: count transitions between inferred contexts ordered by time.
  let switches = 0;
  let lastContext: string | null = null;
  for (const event of sorted) {
    const ctx = contexts.find((c) => c.relatedEventIds.includes(event.id));
    if (!ctx) continue;
    if (lastContext && ctx.contextId !== lastContext) {
      switches += 1;
    }
    lastContext = ctx.contextId;
  }

  const daysCovered =
    (new Date(sorted[sorted.length - 1].timestamp).getTime() -
      new Date(sorted[0].timestamp).getTime()) /
      (1000 * 60 * 60 * 24) +
    1;
  const contextSwitchesPerDay = Number((switches / daysCovered).toFixed(2));

  const overloadWarning = contexts.length >= 4 || contextSwitchesPerDay > 5;

  const ignoredImportantWork = events
    .filter((e) => e.type === "task" && e.metadata?.priority === "high")
    .filter((e) => {
      const daysSince = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 2 && e.metadata?.status !== "done";
    })
    .slice(0, 3)
    .map((e) => e.title);

  return { contextSwitchesPerDay, overloadWarning, ignoredImportantWork };
}
