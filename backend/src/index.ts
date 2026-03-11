import { config } from "./config"; // MUST be first to load env vars
import express from "express";
import { google } from "googleapis";
import { getOAuthClient, GMAIL_SCOPES } from "./integrations/googleAuth";

import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { inferContexts } from "./services/contextInference";
import { buildRecommendation } from "./services/recommendation";
import { buildInsights } from "./services/insights";
import { ActivityEvent } from "./types";
import { ingestAllSources } from "./ingestion/ingest";
import { analyzeCriticalItems } from "./services/criticalAnalysis";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/events", async (_req, res) => {
  // Now fetching from all sources + inferring similarity scores
  const rawEvents = await ingestAllSources(prisma);
  const { enrichedEvents } = await inferContexts(rawEvents);

  res.json({ events: enrichedEvents });
});

app.post("/api/events", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const event = await prisma.event.create({
      data: {
        userId: "user-1", // Simplified for hackathon
        type: "task",
        title,
        timestamp: new Date(),
        metadata: { status: "todo", manual: true },
      },
    });

    res.json(event);
  } catch (err) {
    console.error("Failed to create task:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Try to update in DB
    try {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          metadata: updates.metadata ? updates.metadata : undefined,
          // Add other fields if necessary, but metadata is flexible
        },
      });
      return res.json(updated);
    } catch (dbErr) {
      // If not in DB, it might be a mock event.
      // For now, we return 404 for mock events as we can't persist them easily without a DB sync.
      // Front-end will handle optimistic updates.
      // Or we could create a new event here?
      // Let's keep it simple: strict 404 for now.
      return res.status(404).json({ error: "Event not found or not editable" });
    }
  } catch (err) {
    console.error("Failed to update event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.get("/api/contexts", async (_req, res) => {
  const events: ActivityEvent[] = await ingestAllSources(prisma);
  const { contexts } = await inferContexts(events);
  res.json({ contexts });
});

app.get("/api/recommendation", async (_req, res) => {
  const events: ActivityEvent[] = await ingestAllSources(prisma);
  const { contexts } = await inferContexts(events);
  const rec = await buildRecommendation(contexts, events);
  res.json(rec);
});

app.get("/api/insights", async (_req, res) => {
  const events: ActivityEvent[] = await ingestAllSources(prisma);
  const { contexts } = await inferContexts(events);
  const insights = buildInsights(events, contexts);
  res.json(insights);
});

app.get("/api/analysis", async (_req, res) => {
  const events = await ingestAllSources(prisma);
  const analysis = await analyzeCriticalItems(events);
  res.json(analysis);
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Lazy import to avoid circular dep issues if any, though properly structured it should be fine.
    const { processChatMessage } = await import("./services/chatService");
    const response = await processChatMessage(message, history || [], prisma);
    res.json(response);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error processing chat" });
  }
});
// =====================
// Google OAuth (Gmail)
// =====================

app.get("/auth/google", (_req, res) => {
  const auth = getOAuthClient();
  const url = auth.generateAuthUrl({
    access_type: "offline",
    scope: GMAIL_SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code as string;
    const auth = getOAuthClient();

    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    // Hackathon-safe: store in memory
    (global as any).googleAuth = auth;

    // Redirect back to frontend
    res.redirect("http://localhost:3000");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("OAuth failed");
  }
});

app.get("/api/auth/status", (req, res) => {
  const g = (global as any).googleAuth;
  res.json({ authenticated: !!g });
});


app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
