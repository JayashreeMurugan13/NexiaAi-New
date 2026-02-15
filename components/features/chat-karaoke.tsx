"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatKaraoke() {
    const [text, setText] = useState("");
    const [lyrics, setLyrics] = useState("");
    const [loading, setLoading] = useState(false);

    const generateLyrics = async () => {
        if (!text.trim()) return;
        setLoading(true);
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: `Turn this into catchy song lyrics with verses and chorus: ${text}` }]
                })
            });
            
            const data = await response.json();
            setLyrics(data.content || "🎵 The song couldn't be found... 🎵");
        } catch (error) {
            setLyrics("🎵 The song couldn't be found... 🎵");
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
                    <Music className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        Chat Karaoke
                    </h1>
                    <p className="text-zinc-400">Transform your words into song lyrics</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write something to turn into a song..."
                            rows={4}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                        />
                        <Button
                            onClick={generateLyrics}
                            disabled={loading}
                            className="absolute right-2 bottom-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
                        >
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>

                    {lyrics && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-4">
                                <Music className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap font-mono">{lyrics}</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
