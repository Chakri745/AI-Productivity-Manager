"use client";

import React from "react";
import Link from "next/link";
import { useData } from "./context/DataContext";

export default function Dashboard() {
  const { contexts, criticalItems, authenticated, loading, refreshData } = useData();

  if (loading && !authenticated) return (
    <div className="flex justify-center items-center h-screen text-slate-500">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin"></div>
        <div className="animate-pulse">Booting WorkOS...</div>
      </div>
    </div>
  );

  return (
    <main className="p-8 md:p-12 space-y-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-lg text-slate-400">
            Overview of current workflow state and active contexts.
          </p>
        </div>

        <div className="flex gap-4">
          {!authenticated ? (
            <a
              href="http://localhost:4000/auth/google"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-3 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-white">Connect Google</span>
            </a>
          ) : (
            <button
              onClick={() => refreshData()}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh Data
            </button>
          )}
        </div>
      </header>

      {/* Useful Tools / Quick Actions */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tasks" className="glass-card p-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="font-semibold text-white">Check Tasks</div>
            <div className="text-xs text-slate-500">Create a quick to-do</div>
          </Link>

          <Link href="/mail" className="glass-card p-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="font-semibold text-white">Check emails</div>
            <div className="text-xs text-slate-500">Check your emails</div>
          </Link>

          <Link href="/calendar" className="glass-card p-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="font-semibold text-white">Check Calendar</div>
            <div className="text-xs text-slate-500">Check calendar</div>
          </Link>

          <Link href="/analysis" className="glass-card p-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="font-semibold text-white">Alerts</div>
            <div className="text-xs text-slate-500">View critical items</div>
          </Link>
        </div>
      </section>

      {/* Stats Grid - SIMPLIFIED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="text-sm text-slate-400 mb-1">Active Contexts</div>
          <div className="text-4xl font-mono text-white">{contexts.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-slate-400 mb-1">Critical Alerts</div>
          <div className="text-4xl font-mono text-red-400">{criticalItems.length}</div>
        </div>
        {/* System Load removed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Critical Preview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Critical Actions</h2>
            <Link href="/analysis" className="text-sm text-blue-400 hover:text-blue-300">View Full Analysis &rarr;</Link>
          </div>

          <div className="space-y-4">
            {criticalItems.slice(0, 3).map((item, i) => (
              <div key={i} className="glass-card p-4 border border-red-500/20 flex gap-4 items-center group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold">
                  !
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white group-hover:text-red-300 transition-colors">
                    {item.event.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {item.reasoning}
                  </div>
                </div>
              </div>
            ))}
            {criticalItems.length === 0 && (
              <div className="text-slate-500 italic">No critical items detected.</div>
            )}
          </div>
        </section>

        {/* Contexts Preview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Active Streams</h2>
            <span className="text-sm text-slate-500">Real-time Inference</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {contexts.slice(0, 4).map((ctx) => (
              <div key={ctx.contextId} className="glass-card p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-200">{ctx.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Last active: {new Date(ctx.lastActiveAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono text-blue-400">{ctx.signals.unresolvedTasks}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Tasks</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  );
}
