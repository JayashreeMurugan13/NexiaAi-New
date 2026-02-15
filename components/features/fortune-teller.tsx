"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FortuneTeller() {
    const [question, setQuestion] = useState("");
    const [fortune, setFortune] = useState("");
    const [loading, setLoading] = useState(false);

    const getFortune = async () => {
        if (!question.trim()) return;
        setLoading(true);
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `As a mystical fortune teller, provide a creative and fun fortune for: ${question}` }]
                })
            });
            
            const data = await response.json();
            setFortune(data.content || "The spirits are unclear... try again later 🔮");
        } catch (error) {
            setFortune("The spirits are unclear... try again later 🔮");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-8">
            <div className="max-w-3xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Gem className="w-16 h-16 mx-auto mb-4 text-violet-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                        AI Fortune Teller
                    </h1>
                    <p className="text-zinc-400">Ask the mystical AI about your future...</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && getFortune()}
                            placeholder="What do you seek to know?"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                        />
                        <Button
                            onClick={getFortune}
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>

                    {fortune && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-violet-500/30 rounded-2xl p-8 backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-4">
                                <Gem className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                                <p className="text-zinc-200 text-lg leading-relaxed">{fortune}</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
