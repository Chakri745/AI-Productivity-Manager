// Ingestion layer: Gmail-style mock messages -> ActivityEvent[]
import { ActivityEvent } from "../types";


export type MockGmailMessage = {
  id: string;
  threadId?: string;
  subject: string;
  snippet?: string;
  internalDate: string; // ISO or millis string
  from?: string;
  to?: string[];
  cc?: string[];
  labels?: string[];
  url?: string;
};

export function gmailToEvents(raw: MockGmailMessage[]): ActivityEvent[] {
  const nowUser = "user-1";

  return raw.map((msg) => {
    const participants = [
      ...(msg.from ? [msg.from] : []),
      ...(msg.to ?? []),
      ...(msg.cc ?? []),
    ];

    const timestamp =
      /^\d+$/.test(msg.internalDate)
        ? new Date(Number(msg.internalDate))
        : new Date(msg.internalDate);

    return {
      id: `gmail-${msg.id}`,
      userId: nowUser,
      source: "gmail",
      type: "email",
      title: msg.subject || msg.snippet || "Email",
      timestamp,
      metadata: {
        participants,
        threadId: msg.threadId,
        projectHint: msg.labels?.[0],
        url: msg.url,
        snippet: msg.snippet,
      },
    };
  });
}

// Real Gmail API message -> ActivityEvent[]
export function gmailApiToEvents(raw: any[]): ActivityEvent[] {
  const nowUser = "user-1";

  return raw.map((msg) => {
    const headers = msg.payload?.headers || [];

    const getHeader = (name: string) =>
      headers.find((h: any) => h.name === name)?.value;

    const from = getHeader("From");
    const to = getHeader("To")?.split(",").map((s: string) => s.trim());

    return {
      id: `gmail-${msg.id}`,
      userId: nowUser,
      source: "gmail",
      type: "email",
      title: getHeader("Subject") || "Email",
      timestamp: new Date(Number(msg.internalDate)),
      metadata: {
        participants: [
          ...(from ? [from] : []),
          ...(to ?? []),
        ],
        threadId: msg.threadId,
        snippet: msg.snippet,
      },
    };
  });
}
