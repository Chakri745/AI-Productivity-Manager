import { google } from "googleapis";
import { getGoogleClient } from "./googleAuth";

export async function fetchRecentTasks(limit: number = 20) {
    const auth = getGoogleClient();
    const service = google.tasks({ version: "v1", auth });

    // Fetch from the default task list
    const res = await service.tasks.list({
        tasklist: "@default",
        maxResults: limit,
        showCompleted: false, // Focus on pending tasks
        showHidden: false,
    });

    return res.data.items || [];
}
