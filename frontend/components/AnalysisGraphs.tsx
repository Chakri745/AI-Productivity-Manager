"use client";

import React from "react";

type ChartProps = {
    data: any[];
};

export function UrgencyChart({ data }: ChartProps) {
    // Buckets: Critical (90+), High (75-89), Medium (50-74), Low (<50)
    const buckets = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    data.forEach((item) => {
        const score = item.priorityScore;
        if (score >= 90) buckets.Critical++;
        else if (score >= 75) buckets.High++;
        else if (score >= 50) buckets.Medium++;
        else buckets.Low++;
    });

    const max = Math.max(...Object.values(buckets), 1);
    const keys = Object.keys(buckets) as Array<keyof typeof buckets>;
    const colors = { Critical: "#ef4444", High: "#f97316", Medium: "#3b82f6", Low: "#64748b" };

    return (
        <div className="w-full h-40 flex items-end justify-between gap-2 pt-6">
            {keys.map((key) => {
                const value = buckets[key];
                const height = (value / max) * 100;
                return (
                    <div key={key} className="flex-1 flex flex-col items-center group relative">
                        <div className="text-xs text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                            {value}
                        </div>
                        <div
                            className="w-full max-w-[40px] rounded-t transition-all duration-500 hover:opacity-80"
                            style={{ height: `${height}%`, backgroundColor: colors[key], minHeight: value > 0 ? "4px" : "0" }}
                        />
                        <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider font-semibold">{key}</div>
                    </div>
                );
            })}
        </div>
    );
}

export function SourceChart({ data }: { data: any[] }) {
    // Count by source
    const counts: Record<string, number> = {};
    data.forEach(item => {
        const src = item.event.source || "unknown";
        counts[src] = (counts[src] || 0) + 1;
    });

    const total = data.length || 1;
    const keys = Object.keys(counts);

    // Simple segmented bar for "Donut" feel behavior in a linear layout (easier to implement reliably in pure CSS than SVG donut)
    return (
        <div className="space-y-3">
            <div className="flex h-4 rounded-full overflow-hidden w-full">
                {keys.map((key, i) => {
                    const width = (counts[key] / total) * 100;
                    // hash string to color roughly
                    const colors = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"];
                    const color = colors[i % colors.length];
                    return (
                        <div key={key} style={{ width: `${width}%`, background: color }} title={`${key}: ${counts[key]}`} />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-4">
                {keys.map((key, i) => {
                    const colors = ["#8b5cf6", "#10b981", "#3b82f6", "#f59e0b"];
                    const color = colors[i % colors.length];
                    return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <span className="text-slate-300 capitalize">{key}</span>
                            <span className="text-slate-500 font-mono">({Math.round((counts[key] / total) * 100)}%)</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
