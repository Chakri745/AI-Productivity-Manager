"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Critical Analysis", href: "/analysis", icon: "🧠" },
    { name: "Calendar", href: "/calendar", icon: "📅" },
    { name: "Tasks", href: "/tasks", icon: "✅" },
    { name: "Mail", href: "/mail", icon: "✉️" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/5 bg-[#030014]/80 backdrop-blur-xl flex flex-col z-50 p-6">
            <div className="mb-10 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
                    Cortex
                </h1>
            </div>

            <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                                : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                {item.icon}
                            </span>
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* AI Status Card */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="glass-card p-3 rounded-xl flex items-center gap-3 bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-900/20 animate-pulse">
                        AI
                    </div>
                    <div>
                        <div className="text-xs font-medium text-white">System Online</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Ready
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
