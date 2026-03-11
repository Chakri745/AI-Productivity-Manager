// Ingestion layer entry point: unify multiple sources into ActivityEvent[]
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { ActivityEvent } from "../types";
import { gmailToEvents, MockGmailMessage } from "./gmailAdapter";
import {
  calendarToEvents,
  MockCalendarEvent,
} from "./calendarAdapter";

const DEMO_MODE = process.env.DEMO_MODE === "true";

function safeReadJson<T>(fileName: string): T[] {
  try {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function ingestAllSources(
  prisma: PrismaClient
): Promise<ActivityEvent[]> {
  // Always include seeded/mock DB events so existing behavior remains intact.
  let dbEvents = [];
  try {
    dbEvents = await prisma.event.findMany({
      orderBy: { timestamp: "desc" },
    });
  } catch (err) {
    console.warn(
      "⚠️ Database unavailable, continuing without DB events"
    );
  }


  const baseEvents: ActivityEvent[] = dbEvents.map((e) => ({
    id: e.id,
    userId: e.userId,
    source: "mock",
    type: e.type as any,
    title: e.title,
    timestamp: new Date(e.timestamp),
    metadata: {
      ...(e.metadata as any),
    },
  }));

  // In demo mode we also pull from local mock JSON adapters (no real APIs).
  const extraEvents: ActivityEvent[] = [];

  const googleAuth = (global as any).googleAuth;

  if (googleAuth) {
    try {
      console.log("🔌 Google Auth detected, fetching real Gmail messages...");
      // Dynamically import to avoid circular dep issues or side effects if not needed? 
      // Actually standard import is fine if structure allows. 
      // But let's use the imports we added/will add.
      const { fetchRecentGmailMessages } = require("../integrations/gmailFetch");
      const { gmailApiToEvents } = require("./gmailAdapter");

      const realMessages = await fetchRecentGmailMessages(20);
      const realEvents = gmailApiToEvents(realMessages);
      console.log(`✅ Fetched ${realEvents.length} real emails.`);
      extraEvents.push(...realEvents);

      // Calendar
      try {
        const { fetchRecentCalendarEvents } = require("../integrations/calendarFetch");
        const { calendarApiToEvents } = require("./calendarAdapter");
        const realCal = await fetchRecentCalendarEvents(20);
        const calEvents = calendarApiToEvents(realCal);
        console.log(`✅ Fetched ${calEvents.length} real calendar events.`);
        extraEvents.push(...calEvents);
      } catch (err) {
        console.error("❌ Failed to fetch calendar:", err);
      }

      // Tasks
      try {
        const { fetchRecentTasks } = require("../integrations/tasksFetch");
        const { tasksApiToEvents } = require("./tasksAdapter");
        const realTasks = await fetchRecentTasks(20);
        const taskEvents = tasksApiToEvents(realTasks);
        console.log(`✅ Fetched ${taskEvents.length} real tasks.`);
        extraEvents.push(...taskEvents);
      } catch (err) {
        console.error("❌ Failed to fetch tasks:", err);
      }
    } catch (err) {
      console.error("❌ Failed to fetch real Gmail data:", err);
    }
  } else if (DEMO_MODE) {
    console.log("⚠️ No Google Auth, falling back to mock data.");
    const gmailRaw = safeReadJson<MockGmailMessage>("mockGmail.json");
    const calRaw = safeReadJson<MockCalendarEvent>("mockCalendar.json");

    extraEvents.push(...gmailToEvents(gmailRaw));
    extraEvents.push(...calendarToEvents(calRaw));
  }



  const all = [...baseEvents, ...extraEvents];

  // Deduplicate by title + timestamp to avoid "Mock vs Real" overlaps
  const uniqueEvents = new Map();
  for (const event of all) {
    const key = `${event.title}-${event.timestamp.getTime()}`;
    if (!uniqueEvents.has(key)) {
      uniqueEvents.set(key, event);
    } else {
      // If we have a duplicate, prefer the "real" source (calendar/task) over "mock"
      const existing = uniqueEvents.get(key);
      if (existing.source === "mock" && event.source !== "mock") {
        uniqueEvents.set(key, event);
      }
    }
  }

  const deduped = Array.from(uniqueEvents.values());

  // Normalize sort order (most recent first) for downstream consumers.
  // Filter out past events and completed tasks
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const filtered = deduped.filter((e) => {
    // 1. Calendar/Meeting: Must be >= today
    if (e.source === "calendar" || e.type === "meeting") {
      return e.timestamp >= startOfToday;
    }
    // 2. Task: Must not be done
    if (e.source === "task" || e.type === "task") {
      const status = e.metadata?.status;
      // standardizing on 'done' but checking 'completed' just in case
      return status !== "done" && status !== "completed";
    }
    // 3. Keep everything else (emails, etc)
    return true;
  });

  // Normalize sort order (earliest first for upcoming stuff? Or most recent first?)
  // User asked for "upcoming tasks not older".
  // Usually for upcoming agenda, we want ascending order (sooonest first).
  // But the existing code had `b - a` (descending, newest/latest first).
  // If we show a list of tasks, usually we want to see the ones due soon or created recently?
  // The existing dashboard is a feed, so "Newest First" makes sense for a feed.
  // But for a "Calendar" view, you want "Earliest First".
  // Let's stick to the existing sort order (Newest/Latest first) for consistency with the rest of the app for now,
  // or actually, if it's "Upcoming", maybe we want to see the ones happening today first?
  // The current UI seems to handle a list.
  // Let's keep `b - a` (descending) as it was, to avoid breaking other views unexpectedly.
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return filtered;
}

