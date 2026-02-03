"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Layout, LogOut, User as UserIcon, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface AppShellProps {
    children: (activeTab: "chat" | "studio") => React.ReactNode;
    initialTab?: "chat" | "studio";
    user?: User | null;
}

export function AppShell({ children, initialTab = "chat", user }: AppShellProps) {
    const [activeTab, setActiveTab] = useState<"chat" | "studio">(initialTab);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
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
        }
    ];

    return (
        <div className="flex h-screen bg-black text-zinc-300 font-sans">
            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "border-r border-zinc-800/50 flex flex-col items-center py-6 bg-gradient-to-b from-zinc-950/80 to-zinc-900/80 backdrop-blur-xl relative flex-shrink-0",
                    isCollapsed ? "w-20" : "w-20 md:w-72"
                )}
                animate={{ width: isCollapsed ? 80 : window.innerWidth >= 768 ? 288 : 80 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                {/* Logo */}
                <div className={cn("mb-10 relative z-10", isCollapsed ? "px-3" : "px-6 hidden md:block w-full")}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                            "flex items-center gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4 rounded-2xl border border-blue-500/30 relative overflow-hidden",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="relative z-10"
                        >
                            <Sparkles className="text-blue-400 w-6 h-6" />
                        </motion.div>
                        {!isCollapsed && (
                            <motion.span
                                className="font-bold text-white text-lg tracking-tight relative z-10"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                Nexia AI
                            </motion.span>
                        )}
                    </motion.div>
                </div>

                {/* Mobile logo */}
                <div className={cn("md:hidden mb-10 relative z-10", !isCollapsed && "hidden")}>
                    <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
                        <Sparkles className="text-blue-400 w-7 h-7" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 w-full space-y-3 px-3 md:px-4 relative z-10">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group",
                                    isActive
                                        ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-2xl transform scale-105'
                                        : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'
                                )}
                                whileHover={{ scale: isActive ? 1.05 : 1.02, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                <motion.div
                                    className="relative z-10"
                                    animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.div>

                                {!isCollapsed && (
                                    <div className="hidden md:block flex-1 text-left relative z-10">
                                        <div className="font-semibold">{item.label}</div>
                                        <div className={cn(
                                            "text-xs opacity-70",
                                            isActive ? "text-white/80" : "text-zinc-500"
                                        )}>
                                            {item.description}
                                        </div>
                                    </div>
                                )}

                                {isActive && (
                                    <motion.div
                                        className="absolute right-2 w-2 h-8 bg-white/30 rounded-full"
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* User Profile & Settings */}
                <div className="mt-auto px-4 w-full space-y-3 relative z-10">
                    {/* User Profile */}
                    {!isCollapsed && (
                        <motion.div
                            className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/50 mb-4 hidden md:block backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600">
                                    <UserIcon className="w-5 h-5 text-zinc-300" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Active User</p>
                                    <p className="text-sm text-zinc-200 truncate font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Settings Button */}
                    <motion.button
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all group"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        {!isCollapsed && <span className="hidden md:block font-semibold">Settings</span>}
                    </motion.button>

                    {/* Sign Out */}
                    <motion.button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all group"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        {!isCollapsed && <span className="hidden md:block font-semibold">Sign Out</span>}
                    </motion.button>
                </div>
            </motion.aside>

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
