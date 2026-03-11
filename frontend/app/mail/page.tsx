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

export default function MailPage() {
    const { events: allEvents, loading } = useData();

    const events = useMemo(() => {
        return allEvents.filter((e: Event) => e.source === "gmail" || e.type === "email");
    }, [allEvents]);

    return (
        <main className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <span>✉️</span> Mail
            </h1>

            {loading ? (
                <div className="text-slate-400">Loading emails...</div>
            ) : (
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="p-10 border border-dashed border-slate-700 rounded text-center text-slate-500">
                            No recent emails found.
                        </div>
                    ) : (
                        events.map((evt) => (
                            <div key={evt.id} className="glass-card p-5 group hover:border-blue-500/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors">
                                        {evt.title}
                                    </h3>
                                    <span className="text-xs font-mono text-slate-500">
                                        {new Date(evt.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-400 line-clamp-2">
                                    {evt.metadata.snippet || "No preview available."}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {evt.metadata.participants?.slice(0, 3).map((p: string, i: number) => (
                                        <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-slate-500">
                                            {p.replace(/<.*>/, "").trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
}
