import { google } from "googleapis";
import { getGoogleClient } from "./googleAuth";

export async function fetchRecentCalendarEvents(limit: number = 20) {
    const auth = getGoogleClient();
    const calendar = google.calendar({ version: "v3", auth });

    // Start from the beginning of today so we see earlier meetings too
    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);

    const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        maxResults: limit,
        singleEvents: true,
        orderBy: "startTime",
    });

    return res.data.items || [];
}
