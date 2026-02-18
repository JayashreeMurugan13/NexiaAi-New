"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Layout, LogOut, User as UserIcon, Settings, Target, Music, Menu, X, TrendingUp, Video, BarChart3, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

// Add touch-action CSS for better mobile interaction
if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('touch-action', 'manipulation');
}

interface AppShellProps {
    children: (activeTab: "chat" | "studio" | "resume" | "interview" | "goals" | "karaoke" | "dashboard" | "jobs") => React.ReactNode;
    initialTab?: "chat" | "studio" | "resume" | "interview" | "goals" | "karaoke" | "dashboard" | "jobs";
    user?: User | null;
}

export function AppShell({ children, initialTab = "chat", user }: AppShellProps) {
    const [activeTab, setActiveTab] = useState<"chat" | "studio" | "resume" | "interview" | "goals" | "karaoke" | "dashboard" | "jobs">(initialTab);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("Guest");
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUser = localStorage.getItem('nexia_current_user');
            if (currentUser) {
                const parsed = JSON.parse(currentUser);
                setUserName(parsed.email?.split('@')[0] || 'Guest');
            }
        }
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('nexia_current_user');
        window.location.href = '/';
    };

    const navItems = [
        {
            id: "chat" as const,
            label: "Chat with Nexia",
            icon: MessageSquare,
            gradient: "from-blue-500 to-cyan-500",
            description: "Have friendly conversations"
        },
        {
            id: "resume" as const,
            label: "Resume Matcher",
            icon: Target,
            gradient: "from-blue-500 to-cyan-500",
            description: "AI skill assessment"
        },
        {
            id: "interview" as const,
            label: "Interview Coach",
            icon: Video,
            gradient: "from-orange-500 to-red-500",
            description: "Video interview analysis"
        },
        {
            id: "jobs" as const,
            label: "Job Recommendations",
            icon: Briefcase,
            gradient: "from-green-500 to-emerald-500",
            description: "AI-powered job matching"
        },
        {
            id: "goals" as const,
            label: "Goals",
            icon: TrendingUp,
            gradient: "from-emerald-500 to-green-500",
            description: "Study & Habits"
        },
        {
            id: "dashboard" as const,
            label: "Dashboard",
            icon: BarChart3,
            gradient: "from-indigo-500 to-purple-500",
            description: "Track your progress"
        },
        {
            id: "studio" as const,
            label: "Prompt Studio",
            icon: Layout,
            gradient: "from-purple-500 to-pink-500",
            description: "Enhance your prompts"
        },
        {
            id: "karaoke" as const,
            label: "Chat Karaoke",
            icon: Music,
            gradient: "from-green-500 to-teal-500",
            description: "Turn chats into songs"
        }
    ];

    return (
        <div className="flex h-screen bg-black text-zinc-300 font-sans relative overflow-hidden">
            {/* Mobile Menu Button - Show on tablets and phones */}
            <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition-colors shadow-lg"
            >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Desktop Sidebar - Always Visible on Laptop/Desktop */}
            <aside className="hidden lg:flex border-r border-zinc-800/50 flex-col items-center py-6 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl flex-shrink-0 w-72">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                {/* Logo */}
                <div className="mb-6 md:mb-10 px-6 w-full relative z-10">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 rounded-2xl border border-blue-500/30">
                        <Sparkles className="text-blue-400 w-6 h-6 flex-shrink-0" />
                        <span className="font-bold text-white text-lg whitespace-nowrap">Nexia AI</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full space-y-2 px-4 relative z-10">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-4 rounded-2xl transition-all",
                                    isActive
                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white'
                                        : 'hover:bg-zinc-800/50 text-zinc-400'
                                )}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-sm">{item.label}</div>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Settings */}
                <div className="mt-auto px-4 w-full space-y-3 relative z-10">
                    {/* User Profile */}
                    <motion.div
                        className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/50 mb-4 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600">
                                <UserIcon className="w-5 h-5 text-zinc-300" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active User</p>
                                <p className="text-sm text-zinc-200 truncate font-medium">{userName}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Button */}
                    <motion.button
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-semibold">Settings</span>
                    </motion.button>

                    {/* Sign Out */}
                    <motion.button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all group"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold">Sign Out</span>
                    </motion.button>
                </div>
            </aside>

            {/* Mobile Sidebar - Collapsible */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="lg:hidden border-r border-zinc-800/50 flex flex-col py-4 bg-gradient-to-b from-zinc-950/95 to-zinc-900/95 backdrop-blur-xl flex-shrink-0 fixed z-50 h-full w-80 safe-area-inset"
                    >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                {/* Logo */}
                <div className="mb-4 px-4 w-full relative z-10">
                    <div className="flex items-center gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-3 rounded-xl border border-blue-500/30">
                        <Sparkles className="text-blue-400 w-5 h-5 flex-shrink-0" />
                        <span className="font-bold text-white text-base whitespace-nowrap">Nexia AI</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full space-y-2 px-4 relative z-10 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsMobileSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left touch-manipulation",
                                    isActive
                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                        : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white active:bg-zinc-700/50'
                                )}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile & Settings */}
                <div className="mt-auto px-4 w-full space-y-2 relative z-10 pb-safe">
                    {/* User Profile */}
                    <motion.div
                        className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50 mb-3 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600">
                                <UserIcon className="w-4 h-4 text-zinc-300" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Active User</p>
                                <p className="text-xs text-zinc-200 truncate font-medium">{userName}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Settings Button */}
                    <motion.button
                        className="w-full flex items-center gap-3 p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group touch-manipulation"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium text-sm">Settings</span>
                    </motion.button>

                    {/* Sign Out */}
                    <motion.button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all group touch-manipulation"
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </motion.button>
                </div>
            </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-zinc-950 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
                </div>

                {/* Mobile Top Bar - Show on tablets and phones only */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50 relative z-10">
                    <div className="w-10" /> {/* Spacer for menu button */}
                    <h1 className="text-lg font-bold text-white">
                        {navItems.find(item => item.id === activeTab)?.label || 'Nexia AI'}
                    </h1>
                    <div className="w-10" /> {/* Spacer for balance */}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex-1 flex flex-col h-full overflow-hidden"
                    >
                        {children(activeTab)}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
