import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Helper to retrieve the global auth client sitting in memory
export function getGoogleClient() {
  const g = (global as any).googleAuth;
  if (!g) throw new Error("Google Auth client not initialized.");
  return g;
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/tasks.readonly",
];
