"use client";

import React, { useEffect } from "react";
import { useData } from "../context/DataContext";
import { UrgencyChart, SourceChart } from "../../components/AnalysisGraphs";

export default function AnalysisPage() {
    const { analysisData, loading } = useData();
    const data = analysisData;

    if (loading && !data) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-2 border-t-transparent border-purple-500 rounded-full animate-spin" />
                    <p className="text-slate-400 animate-pulse">Running critical thinking analysis...</p>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-10">Failed to load analysis.</div>;

    return (
        <main className="p-8 max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🧠</span>
                    <h1 className="text-3xl font-bold text-white">Critical Analysis</h1>
                </div>
                <p className="text-slate-400 max-w-2xl">
                    AI-driven prioritization based on urgency rubric (Critical &gt;90, High &gt;75).
                </p>
            </header>

            {/* Visual Analytics */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Urgency Distribution</h3>
                    <UrgencyChart data={data.criticalItems} />
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Source Breakdown</h3>
                    <SourceChart data={data.criticalItems} />
                </div>
            </section>

            {/* Executive Summary */}
            <section className="glass-card p-6 border-l-4 border-purple-500 bg-purple-500/5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">Executive Summary</h2>
                <p className="text-lg text-slate-200 leading-relaxed font-medium">
                    {data.executiveSummary}
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Critical Actions Column */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Immediate Attention Required
                    </h2>

                    <div className="space-y-4">
                        {data.criticalItems.map((item, i) => (
                            <div key={i} className="glass-card p-5 border border-red-500/20 hover:border-red-500/40 transition-colors group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${item.event.source === 'gmail' ? 'bg-blue-500/20 text-blue-400' :
                                                item.event.source === 'calendar' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {item.event.source}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(item.event.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="group/tooltip relative">
                                        <div className={`px-2 py-1 rounded text-xs font-mono font-bold cursor-help
                          ${item.priorityScore >= 90 ? 'bg-red-500/10 text-red-400' :
                                                item.priorityScore >= 75 ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            Score: {item.priorityScore}
                                        </div>
                                        <div className="absolute right-0 top-8 w-48 p-2 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10 pointer-events-none shadow-xl">
                                            Reflects deadline urgency and impact. 90+ = Critical (24h).
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-300 transition-colors">
                                    {item.event.title}
                                </h3>

                                <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300 italic border-l-2 border-slate-600">
                                    <span className="text-slate-500 text-xs uppercase font-bold mr-2">Why:</span>
                                    "{item.reasoning}"
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Context Groups Column */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Contextual Grouping</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {data.contextGroups.map((group, i) => (
                            <div key={i} className="glass-card p-5">
                                <h3 className="text-lg font-bold text-blue-300 mb-2">{group.contextName}</h3>
                                <p className="text-sm text-slate-400 mb-4">{group.summary}</p>
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold text-slate-500 uppercase">Related Items</div>
                                    {/* We only have IDs here, ideally we'd map them back to titles, or just show count */}
                                    <div className="flex items-center gap-2">
                                        {group.eventIds.slice(0, 5).map(id => (
                                            <div key={id} className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                                        ))}
                                        <span className="text-xs text-slate-600">{group.eventIds.length} items</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.contextGroups.length === 0 && (
                            <div className="p-4 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                                No clear contexts identified.
                            </div>
                        )}
                    </div>
                </section>
            </div>

        </main>
    );
}
