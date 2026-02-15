"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Sparkles, Send, Mic, Radio, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatKaraoke() {
    const [text, setText] = useState("");
    const [lyrics, setLyrics] = useState("");
    const [loading, setLoading] = useState(false);
    const [genre, setGenre] = useState<string>("pop");

    const genres = [
        { id: "pop", label: "Pop", icon: Music },
        { id: "rock", label: "Rock", icon: Radio },
        { id: "rap", label: "Rap/Hip-Hop", icon: Mic },
        { id: "country", label: "Country", icon: Disc },
    ];

    const generateLyrics = async () => {
        if (!text.trim()) return;
        setLoading(true);
        
        try {
            const systemPrompt = `You are a master poet and lyricist with the soul of a philosopher. Create deeply meaningful, profoundly poetic song lyrics that touch the heart and soul. Use powerful metaphors, vivid imagery, and profound symbolism. Every line should carry deep meaning and emotional weight. Write like the greatest poets - with beauty, wisdom, and depth. If the user requests lyrics in a specific language (like Tamil, Hindi, Spanish, etc.), write the ENTIRE song in that language with authentic poetic beauty and cultural depth. Make every word resonate with meaning.`;
            
            const userPrompt = `Genre: ${genre}\nTopic/Story: ${text}\n\nCreate a DEEPLY MEANINGFUL and HIGHLY POETIC song with:\n- Profound metaphors and symbolism\n- Rich imagery that paints vivid pictures\n- Philosophical depth and emotional wisdom\n- Beautiful, flowing language\n- 1-2 verses (4-6 lines each) with deep meaning\n- One powerful, memorable chorus (4 lines)\n- Every line should carry weight and significance\n- If a specific language is requested, write EVERYTHING authentically in that language\n- Use literary devices: alliteration, personification, symbolism\n\nMake it as meaningful and poetic as the greatest poets. Use [Verse 1], [Chorus], [Verse 2] labels.`;
            
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
            setLyrics(data.content || "🎵 The song couldn't be found... 🎵");
        } catch (error) {
            setLyrics("🎵 The melody faded away... Try again! 🎵");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block"
                    >
                        <Music className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        Chat Karaoke
                    </h1>
                    <p className="text-zinc-400">Transform your words into professional song lyrics</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="flex gap-2 justify-center flex-wrap">
                        {genres.map((g) => {
                            const Icon = g.icon;
                            return (
                                <motion.button
                                    key={g.id}
                                    onClick={() => setGenre(g.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                                        genre === g.id
                                            ? "bg-green-600 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {g.label}
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write your story, feelings, or idea for a song... (Specify language if needed, e.g., 'in Tamil')"
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

                    <AnimatePresence>
                        {lyrics && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
                            >
                                <motion.div
                                    animate={{ 
                                        background: [
                                            "radial-gradient(circle at 0% 0%, green 0%, transparent 50%)",
                                            "radial-gradient(circle at 100% 100%, teal 0%, transparent 50%)",
                                            "radial-gradient(circle at 0% 0%, green 0%, transparent 50%)"
                                        ]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                    className="absolute inset-0 opacity-10"
                                />
                                
                                <div className="relative z-10">
                                    <div className="flex items-start gap-4">
                                        <Music className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-green-300 text-xs uppercase tracking-wider mb-2 font-bold">
                                                {genre} Song
                                            </p>
                                            <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-wrap font-mono">
                                                {lyrics}
                                            </div>
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
