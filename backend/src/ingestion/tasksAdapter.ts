import { ActivityEvent } from "../types";

export function tasksApiToEvents(raw: any[]): ActivityEvent[] {
    const nowUser = "user-1";

    return raw.map((task) => {
        // Determine timestamp: completed date ? due date ? updated date?
        // For pending tasks, 'due' is good if exists, otherwise 'updated'.
        const dateStr = task.due || task.updated;
        const timestamp = dateStr ? new Date(dateStr) : new Date();

        return {
            id: `task-${task.id}`,
            userId: nowUser,
            source: "task",
            type: "task",
            title: task.title || "Untitled Task",
            timestamp,
            metadata: {
                status: task.status,
                due: task.due,
                url: task.selfLink, // or maybe construct a UI link? "https://tasks.google.com/embed/?origin=https://calendar.google.com&fullWidth=1"
                // standard UI link isn't directly in API response usually, but selfLink is API link.
                notes: task.notes,
            },
        };
    });
}
