"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemeGenerator() {
    const [topic, setTopic] = useState("");
    const [meme, setMeme] = useState("");
    const [loading, setLoading] = useState(false);

    const generateMeme = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `Create a funny meme caption and format for: ${topic}. Include the meme template name and text.` }]
                })
            });
            
            const data = await response.json();
            setMeme(data.content || "Meme generation failed... that's the real meme 😅");
        } catch (error) {
            setMeme("Meme generation failed... that's the real meme 😅");
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
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-orange-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                        Meme Generator
                    </h1>
                    <p className="text-zinc-400">Turn anything into a hilarious meme</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && generateMeme()}
                            placeholder="What should the meme be about?"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <Button
                            onClick={generateMeme}
                            disabled={loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                        >
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>

                    {meme && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-8 backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-4">
                                <ImageIcon className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                                <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap">{meme}</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
