"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, BookOpen, TrendingUp } from "lucide-react";
import { StudyBuddy } from "./study-buddy";
import { HabitTracker } from "./habit-tracker";

export function Goals() {
    const [activeTab, setActiveTab] = useState<"study" | "habits">("study");

    const tabs = [
        {
            id: "study" as const,
            label: "Study Buddy",
            icon: Brain,
            gradient: "from-blue-500 to-cyan-500",
            description: "AI-powered learning assistant"
        },
        {
            id: "habits" as const,
            label: "Habit Tracker",
            icon: Target,
            gradient: "from-green-500 to-emerald-500",
            description: "Build better daily habits"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <header className="px-4 md:px-8 py-4 md:py-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-950/80 to-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <motion.div
                        className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-green-600/20 to-blue-600/20 border border-green-500/30 flex items-center justify-center"
                        animate={{ 
                            boxShadow: [
                                "0 0 20px rgba(34,197,94,0.2)",
                                "0 0 30px rgba(59,130,246,0.3)",
                                "0 0 20px rgba(34,197,94,0.2)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                    </motion.div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Goals</h2>
                        <p className="text-xs md:text-sm text-zinc-400 font-medium">Achieve your dreams with AI</p>
                    </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg'
                                        : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icon className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </header>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-1 flex flex-col h-full"
                >
                    {activeTab === "study" ? <StudyBuddy /> : <HabitTracker />}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}