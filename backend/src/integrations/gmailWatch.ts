import { google } from "googleapis";

export async function startGmailWatch(auth: any) {
  const gmail = google.gmail({ version: "v1", auth });

  await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: "projects/personal-work-os/topics/gmail-updates",
      labelIds: ["INBOX"],
    },
  });

  console.log("📩 Gmail watch registered");
}
