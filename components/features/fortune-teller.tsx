"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Sparkles, Send, Stars, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FortuneTeller() {
    const [question, setQuestion] = useState("");
    const [fortune, setFortune] = useState("");
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<string>("general");

    const categories = [
        { id: "general", label: "General", icon: Stars },
        { id: "love", label: "Love", icon: Sparkles },
        { id: "career", label: "Career", icon: Sun },
        { id: "future", label: "Future", icon: Moon },
    ];

    const getFortune = async () => {
        if (!question.trim()) return;
        setLoading(true);
        
        try {
            const systemPrompt = `You are a mystical fortune teller with deep wisdom and insight. Provide thoughtful, creative, and meaningful fortunes that blend mysticism with practical wisdom. Use poetic language, metaphors, and symbolism. Make predictions that are specific yet open to interpretation. Include lucky numbers, colors, or symbols when relevant. Be encouraging but honest. Format your response with mystical emojis and line breaks for dramatic effect.`;
            
            const userPrompt = `Category: ${category}\nQuestion: ${question}\n\nProvide a detailed fortune reading that includes:\n1. Current situation insight\n2. Future prediction\n3. Advice or guidance\n4. Lucky element (number, color, or symbol)`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            
            const data = await response.json();
            setFortune(data.content || "The spirits are unclear... try again later 🔮");
        } catch (error) {
            setFortune("The cosmic energies are disrupted... ✨ Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                    >
                        <Gem className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-violet-400" />
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                        AI Fortune Teller
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Seek wisdom from the mystical AI oracle</p>
                </motion.div>

                <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-2 justify-center flex-wrap">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 text-sm md:text-base transition-all ${
                                        category === cat.id
                                            ? "bg-violet-600 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    <Icon className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">{cat.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask the oracle your question..."
                            rows={3}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-sm md:text-base text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                        />
                        <Button
                            onClick={getFortune}
                            disabled={loading}
                            className="absolute right-2 bottom-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 p-2 md:p-3"
                        >
                            {loading ? <Sparkles className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Send className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {fortune && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-violet-500/30 rounded-2xl p-4 md:p-8 backdrop-blur-sm relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        background: "radial-gradient(circle, violet 0%, transparent 70%)"
                                    }}
                                />
                                
                                <div className="relative z-10">
                                    <div className="flex items-start gap-3 md:gap-4">
                                        <Gem className="w-5 h-5 md:w-6 md:h-6 text-violet-400 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-violet-300 text-xs uppercase tracking-wider mb-2 font-bold">
                                                {category} Reading
                                            </p>
                                            <p className="text-zinc-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                                                {fortune}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
