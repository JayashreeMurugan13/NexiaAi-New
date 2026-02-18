"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Layout, LogOut, User as UserIcon, Settings, Gem, Music, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface AppShellProps {
    children: (activeTab: "chat" | "studio" | "fortune" | "karaoke") => React.ReactNode;
    initialTab?: "chat" | "studio" | "fortune" | "karaoke";
    user?: User | null;
}

export function AppShell({ children, initialTab = "chat", user }: AppShellProps) {
    const [activeTab, setActiveTab] = useState<"chat" | "studio" | "fortune" | "karaoke">(initialTab);
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
            id: "studio" as const,
            label: "Prompt Studio",
            icon: Layout,
            gradient: "from-purple-500 to-pink-500",
            description: "Enhance your prompts"
        },
        {
            id: "fortune" as const,
            label: "AI Fortune Teller",
            icon: Gem,
            gradient: "from-violet-500 to-fuchsia-500",
            description: "Mystical predictions"
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
        <div className="flex h-screen bg-black text-zinc-300 font-sans relative">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white hover:bg-zinc-800 transition-colors"
            >
                {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Desktop Sidebar - Always Visible */}
            <aside className="hidden md:flex border-r border-zinc-800/50 flex-col items-center py-6 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl flex-shrink-0 w-72">
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
                        initial={{ x: -288 }}
                        animate={{ x: 0 }}
                        exit={{ x: -288 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="md:hidden border-r border-zinc-800/50 flex flex-col py-6 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl flex-shrink-0 fixed z-50 h-full w-80"
                    >
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
                <nav className="flex-1 w-full space-y-3 px-4 relative z-10">
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
                                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left",
                                    isActive
                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg'
                                        : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                                )}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0" />
                                <span className="font-medium text-base whitespace-nowrap">{item.label}</span>
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
            </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-zinc-950">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex-1 flex flex-col h-full"
                    >
                        {children(activeTab)}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
