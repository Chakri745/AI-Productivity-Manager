"use client";

import React, { useState, useRef, useEffect } from "react";
import { chatWithBot, createTask } from "../lib/api";

type Message = {
    role: "user" | "bot";
    content: string;
    action?: {
        type: "create_task";
        data: {
            title: string;
            dueDate?: string;
        };
    };
};

export const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hi! I'm your productivity assistant. Ask me about your tasks or schedule." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            // Pass only text content history to API to save tokens/complexity
            const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await chatWithBot(userMsg, historyPayload);

            setMessages(prev => [
                ...prev,
                { role: "bot", content: res.reply, action: res.action }
            ]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "bot", content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAction = async (action: NonNullable<Message["action"]>) => {
        if (action.type === "create_task") {
            try {
                await createTask(action.data.title);
                setMessages(prev => [...prev, { role: "bot", content: `✅ Task "${action.data.title}" created successfully!` }]);
            } catch (err) {
                setMessages(prev => [...prev, { role: "bot", content: "❌ Failed to create task." }]);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 h-[600px] glass-card flex flex-col overflow-hidden animate-fade-in shadow-2xl border border-white/10">
                    {/* Header */}
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <h3 className="font-semibold text-white tracking-wide text-sm">AI Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm backdrop-blur-sm ${m.role === "user"
                                            ? "bg-blue-600/90 text-white rounded-br-sm border border-blue-500/50"
                                            : "bg-white/10 text-slate-100 rounded-bl-sm border border-white/10"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                                    {m.action && m.action.type === "create_task" && (
                                        <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/5">
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5">Action Proposed</div>
                                            <div className="font-medium text-white mb-3 text-base">"{m.action.data.title}"</div>
                                            <button
                                                onClick={() => handleConfirmAction(m.action!)}
                                                className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>✓</span> Confirm Creation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2 rounded-full text-xs">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
                        <div className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask to schedule a task..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-0 disabled:pointer-events-none transition-all shadow-lg shadow-blue-900/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A2.001 2.001 0 005.692 10H8.5a.5.5 0 010 1H5.692a2.001 2.001 0 00-1.999 1.836l-1.414 4.925a.75.75 0 00.916.906l15-7a.75.75 0 000-1.332l-15-7z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-900/50 border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
                {isOpen ? (
                    <span className="text-xl font-light">✕</span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                )}
            </button>
        </div>
    );
};
