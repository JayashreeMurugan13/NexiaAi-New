"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Layout, LogOut, User as UserIcon, Settings, Target, Music, Menu, X, TrendingUp, Video, BarChart3, Briefcase, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type TabId = "chat" | "studio" | "resume" | "interview" | "goals" | "karaoke" | "dashboard" | "jobs" | "mockinterview" | "fortune";

interface AppShellProps {
    children: (activeTab: TabId) => React.ReactNode;
    initialTab?: TabId;
    user?: any;
}

export function AppShell({ children, initialTab = "chat" }: AppShellProps) {
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("Guest");
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const currentUser = localStorage.getItem("nexia_current_user");
            if (currentUser) {
                const parsed = JSON.parse(currentUser);
                setUserName(parsed.email?.split("@")[0] || "Guest");
            }
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem("nexia_current_user");
        window.location.href = "/";
    };

    const navItems = [
        { id: "chat" as const, label: "Chat with Nexia", icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
        { id: "studio" as const, label: "Prompt Studio", icon: Layout, gradient: "from-purple-500 to-pink-500" },
        { id: "resume" as const, label: "Resume Matcher", icon: Target, gradient: "from-blue-500 to-cyan-500" },
        { id: "interview" as const, label: "Interview Coach", icon: Video, gradient: "from-orange-500 to-red-500" },
        { id: "mockinterview" as const, label: "Mock Interview", icon: Mic, gradient: "from-rose-500 to-orange-500" },
        { id: "jobs" as const, label: "Job Recommendations", icon: Briefcase, gradient: "from-green-500 to-emerald-500" },
        { id: "goals" as const, label: "Goals", icon: TrendingUp, gradient: "from-emerald-500 to-green-500" },
        { id: "dashboard" as const, label: "Dashboard", icon: BarChart3, gradient: "from-indigo-500 to-purple-500" },
        { id: "karaoke" as const, label: "Chat Karaoke", icon: Music, gradient: "from-green-500 to-teal-500" },
    ];

    const SidebarNav = ({ mobile = false }: { mobile?: boolean }) => (
        <nav className={`flex-1 w-full space-y-2 px-4 relative z-10 ${mobile ? "overflow-y-auto" : ""}`}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); if (mobile) setIsMobileSidebarOpen(false); }}
                        className={cn(
                            "w-full flex items-center gap-3 rounded-2xl transition-all text-left",
                            mobile ? "p-3" : "p-4",
                            isActive
                                ? "bg-gradient-to-r " + item.gradient + " text-white shadow-lg"
                                : "hover:bg-zinc-800/50 text-zinc-400 hover:text-white"
                        )}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );

    return (
        <div className="flex h-screen bg-black text-zinc-300 font-sans overflow-hidden">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
            >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {isMobileSidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsMobileSidebarOpen(false)} />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex border-r border-zinc-800/50 flex-col py-6 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl flex-shrink-0 w-72">
                <div className="mb-8 px-6 w-full">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 rounded-2xl border border-blue-500/30">
                        <Sparkles className="text-blue-400 w-6 h-6 flex-shrink-0" />
                        <span className="font-bold text-white text-lg">Nexia AI</span>
                    </div>
                </div>
                <SidebarNav />
                <div className="mt-auto px-4 w-full space-y-3">
                    <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/50 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600">
                                <UserIcon className="w-5 h-5 text-zinc-300" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active User</p>
                                <p className="text-sm text-zinc-200 truncate font-medium">{userName}</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="font-semibold">Settings</span>
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <motion.aside
                        initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="lg:hidden fixed z-50 h-full w-80 flex flex-col py-4 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50"
                    >
                        <div className="mb-4 px-4 w-full">
                            <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-3 rounded-xl border border-blue-500/30">
                                <Sparkles className="text-blue-400 w-5 h-5 flex-shrink-0" />
                                <span className="font-bold text-white text-base">Nexia AI</span>
                            </div>
                        </div>
                        <SidebarNav mobile />
                        <div className="mt-auto px-4 w-full space-y-2">
                            <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600">
                                        <UserIcon className="w-4 h-4 text-zinc-300" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Active User</p>
                                        <p className="text-xs text-zinc-200 truncate font-medium">{userName}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium text-sm">Sign Out</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-zinc-950 overflow-hidden">
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center justify-center p-4 bg-zinc-950/80 border-b border-zinc-800/50">
                    <h1 className="text-lg font-bold text-white">
                        {navItems.find(item => item.id === activeTab)?.label || "Nexia AI"}
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex-1 flex flex-col overflow-hidden h-full"
                        >
                            {children(activeTab)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
