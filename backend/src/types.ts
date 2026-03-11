export type ActivityType = "email" | "meeting" | "task" | "document";

export type ActivitySource =
  | "gmail"
  | "calendar"
  | "task"
  | "document"
  | "mock";

export type ActivityEvent = {
  id: string;
  userId: string;
  // Ingestion layer source identifier (internal only, not persisted in DB responses)
  source?: ActivitySource;
  type: ActivityType;
  title: string;
  timestamp: Date;
  metadata: {
    participants?: string[];
    threadId?: string;
    dueDate?: string;
    projectHint?: string;
    url?: string;
    // Keep this flexible so existing logic and seeded data continue to work.
    [key: string]: any;
  };
};

export type WorkContext = {
  contextId: string;
  name: string;
  relatedEventIds: string[];
  lastActiveAt: Date;
  signals: {
    averageSimilarity: number;
    unresolvedTasks: number;
    daysSinceLastActivity: number;
    upcomingDeadline?: string;
  };
};

export type Recommendation = {
  recommendation: string;
  reason: string;
  signals: {
    contextName: string;
    unresolvedTasks: number;
    timeSinceLastActivityDays: number;
    dueDate?: string;
  };
};

export type InsightBundle = {
  contextSwitchesPerDay: number;
  overloadWarning: boolean;
  ignoredImportantWork: string[];
};
