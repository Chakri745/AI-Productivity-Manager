"use client";

import React, { useMemo } from "react";
import { useData } from "../context/DataContext";

type Event = {
    id: string;
    source?: string;
    type: string;
    title: string;
    timestamp: string;
    metadata: any;
};

export default function CalendarPage() {
    const { events: allEvents, loading } = useData();

    const events = useMemo(() => {
        return allEvents.filter((e: Event) => e.source === "calendar" || e.type === "meeting");
    }, [allEvents]);

    return (
        <main className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📅</span> Calendar
            </h1>

            {loading ? (
                <div className="text-slate-400">Loading calendar events...</div>
            ) : (
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="p-10 border border-dashed border-slate-700 rounded text-center text-slate-500">
                            No upcoming calendar events found.
                        </div>
                    ) : (
                        events.map((evt) => (
                            <div key={evt.id} className="glass-card p-5 border-l-4 border-amber-500 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{evt.title}</h3>
                                    <div className="text-sm text-slate-400 mt-1">
                                        {new Date(evt.timestamp).toLocaleString()}
                                    </div>
                                    {evt.metadata.description && (
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{evt.metadata.description}</p>
                                    )}
                                </div>
                                {evt.metadata.url && (
                                    <a href={evt.metadata.url} target="_blank" className="self-start md:self-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors">
                                        Open
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
}
