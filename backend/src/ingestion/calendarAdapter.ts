// Ingestion layer: calendar-style mock events -> ActivityEvent[]
import { ActivityEvent } from "../types";

export type MockCalendarEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  attendees?: { email: string }[];
  hangoutLink?: string;
  projectHint?: string;
};

export function calendarToEvents(raw: MockCalendarEvent[]): ActivityEvent[] {
  const nowUser = "user-1";

  return raw.map((ev) => {
    const participants = (ev.attendees ?? []).map((a) => a.email);

    return {
      id: `cal-${ev.id}`,
      userId: nowUser,
      source: "calendar",
      type: "meeting",
      title: ev.summary,
      timestamp: new Date(ev.start.dateTime),
      metadata: {
        participants,
        url: ev.hangoutLink,
        projectHint: ev.projectHint,
      },
    };
  });
}

export function calendarApiToEvents(raw: any[]): ActivityEvent[] {
  const nowUser = "user-1";

  return raw.map((ev) => {
    const participants = (ev.attendees || []).map((a: any) => a.email);
    const start = ev.start?.dateTime || ev.start?.date; // dateTime for specific time, date for all-day

    return {
      id: `cal-${ev.id}`,
      userId: nowUser,
      source: "calendar",
      type: "meeting",
      title: ev.summary || "Untitled Event",
      timestamp: start ? new Date(start) : new Date(),
      metadata: {
        participants,
        url: ev.htmlLink || ev.hangoutLink,
        location: ev.location,
        description: ev.description,
      },
    };
  });
}

