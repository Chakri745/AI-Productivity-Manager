import { google } from "googleapis";
import { getGoogleClient } from "./googleAuth";

export async function fetchRecentGmailMessages(max = 20) {
  const auth = getGoogleClient(); // uses stored OAuth token
  const gmail = google.gmail({ version: "v1", auth });

  // 1️⃣ List recent messages
  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults: max,
  });

  const messages = listRes.data.messages || [];

  // 2️⃣ Fetch metadata for each message
  const fullMessages = await Promise.all(
    messages.map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject"],
      });
      return msg.data;
    })
  );

  return fullMessages;
}
