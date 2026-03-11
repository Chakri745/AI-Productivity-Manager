import { v4 as uuidv4 } from "uuid";
import { ActivityEvent, WorkContext } from "../types";
import { askGemini, cosineSimilarity, localEmbedding } from "./geminiClient";

type EmbeddingResult = {
  id: string;
  vector: number[];
};

async function embedTitles(events: ActivityEvent[]): Promise<EmbeddingResult[]> {
  if (!events.length) return [];
  // Deterministic, offline-friendly embeddings
  return events.map((e) => ({ id: e.id, vector: localEmbedding(e.title) }));
}

async function generateContextName(titles: string[]): Promise<string> {
  const fallback =
    titles.length === 1
      ? titles[0]
      : Array.from(
        new Set(
          titles
            .join(" ")
            .split(" ")
            .filter((w) => w.length > 3)
        )
      )
        .slice(0, 4)
        .join(" ");

  try {
    const prompt = `You are a productivity assistant. Name this work context in <=6 words, no quotes. Focus on the shared theme.\nEvent titles: ${titles.join(
      " | "
    )}`;
    const name = (await askGemini(prompt))?.trim();
    return name || `Context: ${fallback || "General"}`;
  } catch (err) {
    console.error("Gemini context naming failed, using fallback:", err);
    return `Context: ${fallback || "General"}`;
  }
}

export async function inferContexts(
  events: ActivityEvent[],
  similarityThreshold = 0.82
): Promise<{ contexts: WorkContext[]; enrichedEvents: ActivityEvent[] }> {
  if (!events.length) return { contexts: [], enrichedEvents: [] };

  const embeddings = await embedTitles(events);
  const clusters: { eventIds: string[]; vectors: number[] }[] = [];

  // 1. Cluster events
  for (const emb of embeddings) {
    let bestCluster = -1;
    let bestScore = -1;

    clusters.forEach((cluster, idx) => {
      const centroid = cluster.vectors;
      const score = cosineSimilarity(centroid, emb.vector);
      if (score > bestScore) {
        bestScore = score;
        bestCluster = idx;
      }
    });

    if (bestScore >= similarityThreshold && bestCluster >= 0) {
      const cluster = clusters[bestCluster];
      cluster.eventIds.push(emb.id);
      // Update centroid (simple average).
      const count = cluster.eventIds.length;
      cluster.vectors = cluster.vectors.map(
        (value, idx) => (value * (count - 1) + emb.vector[idx]) / count
      );
    } else {
      clusters.push({ eventIds: [emb.id], vectors: emb.vector });
    }
  }

  // 2. Build contexts and enrich events
  const contexts: WorkContext[] = [];
  const eventsMap = new Map(events.map((e) => [e.id, { ...e }])); // Clone to avoid mutation side-effects if any

  for (const cluster of clusters) {
    const clusterEvents = events.filter((e) => cluster.eventIds.includes(e.id));
    const unresolvedTasks = clusterEvents.filter(
      (e) => e.type === "task" && e.metadata?.status !== "done"
    ).length;

    // Sort events in cluster by time to find last active
    const lastActiveAt = clusterEvents
      .map((e) => new Date(e.timestamp))
      .reduce((a, b) => (a > b ? a : b));

    // Calculate similarity for each event against the FINAL centroid
    let totalSimilarity = 0;

    for (const eventId of cluster.eventIds) {
      const emb = embeddings.find(e => e.id === eventId);
      if (emb) {
        const score = cosineSimilarity(emb.vector, cluster.vectors);
        totalSimilarity += score;

        // Enrich the event
        const evt = eventsMap.get(eventId);
        if (evt) {
          evt.metadata = { ...evt.metadata, similarity: score };
          eventsMap.set(eventId, evt);
        }
      }
    }

    const averageSimilarity = cluster.eventIds.length > 0
      ? totalSimilarity / cluster.eventIds.length
      : 1;

    const titles = clusterEvents.map((e) => e.title);
    const name = await generateContextName(titles);

    const upcomingDeadline = clusterEvents
      .map((e) => e.metadata?.dueDate)
      .filter(Boolean)
      .sort()[0];

    contexts.push({
      contextId: uuidv4(),
      name,
      relatedEventIds: cluster.eventIds,
      lastActiveAt,
      signals: {
        averageSimilarity,
        unresolvedTasks,
        daysSinceLastActivity: Math.round(
          (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
        upcomingDeadline,
      },
    });
  }

  // Sort contexts by recent activity
  contexts.sort(
    (a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime()
  );

  return {
    contexts,
    enrichedEvents: Array.from(eventsMap.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  };
}
