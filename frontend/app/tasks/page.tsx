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

export default function TasksPage() {
    const { events: allEvents, loading, updateStatus } = useData();

    const events = useMemo(() => {
        return allEvents.filter((e: Event) => e.source === "task" || e.type === "task");
    }, [allEvents]);

    const toggleStatus = (evt: Event) => {
        const newStatus = evt.metadata.status === "done" ? "todo" : "done";
        updateStatus(evt.id, newStatus);
    };

    return (
        <main className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <span>✅</span> Tasks
            </h1>

            {loading ? (
                <div className="text-slate-400">Loading tasks...</div>
            ) : (
                <div className="space-y-4">
                    {events.length === 0 ? (
                        <div className="p-10 border border-dashed border-slate-700 rounded text-center text-slate-500">
                            No pending tasks found.
                        </div>
                    ) : (
                        events.map((evt) => {
                            const isDone = evt.metadata.status === "done";
                            return (
                                <div key={evt.id} className={`glass-card p-4 flex items-center gap-4 transition-colors ${isDone ? "opacity-50" : "hover:bg-white/5"}`}>
                                    <div
                                        onClick={() => toggleStatus(evt)}
                                        className={`h-5 w-5 rounded border-2 flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-500 hover:bg-slate-500/50"}`}
                                    >
                                        {isDone && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-medium transition-all ${isDone ? "text-slate-500 line-through" : "text-white"}`}>
                                            {evt.title}
                                        </h3>
                                        {evt.metadata.notes && (
                                            <p className="text-sm text-slate-500 line-clamp-1">{evt.metadata.notes}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-slate-400">
                                            {evt.metadata.due ? new Date(evt.metadata.due).toLocaleDateString() : "No Due Date"}
                                        </div>
                                        {evt.source && (
                                            <span className="text-[10px] uppercase bg-slate-800 text-slate-400 px-1 rounded">
                                                {evt.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </main>
    );
}
