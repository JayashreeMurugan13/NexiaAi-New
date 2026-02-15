"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemeGenerator() {
    const [topic, setTopic] = useState("");
    const [memeText, setMemeText] = useState("");
    const [memeImage, setMemeImage] = useState("");
    const [loading, setLoading] = useState(false);

    const memeTemplates = [
        { id: "181913649", name: "Drake Hotline Bling" },
        { id: "87743020", name: "Two Buttons" },
        { id: "112126428", name: "Distracted Boyfriend" },
        { id: "131087935", name: "Running Away Balloon" },
        { id: "4087833", name: "Waiting Skeleton" },
        { id: "102156234", name: "Mocking Spongebob" },
        { id: "438680", name: "Batman Slapping Robin" },
        { id: "124822590", name: "Left Exit 12 Off Ramp" },
    ];

    const generateMeme = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        
        try {
            // Get AI to generate meme text
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ 
                        role: "user", 
                        content: `Create a funny two-line meme text for: ${topic}. Format: TOP TEXT|BOTTOM TEXT. Keep it short and punchy.` 
                    }]
                })
            });
            
            const data = await response.json();
            const text = data.content || "WHEN YOU|FORGET THE MEME";
            setMemeText(text);
            
            // Parse the text
            const [topText, bottomText] = text.split('|').map(t => t.trim());
            
            // Pick random template
            const template = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
            
            // Generate meme image using imgflip API
            const memeResponse = await fetch('https://api.imgflip.com/caption_image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    template_id: template.id,
                    username: 'imgflip_hubot',
                    password: 'imgflip_hubot',
                    text0: topText || 'TOP TEXT',
                    text1: bottomText || 'BOTTOM TEXT'
                })
            });
            
            const memeData = await memeResponse.json();
            if (memeData.success) {
                setMemeImage(memeData.data.url);
            }
        } catch (error) {
            setMemeText("Meme generation failed... that's the real meme 😅");
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

                    {memeImage && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm"
                        >
                            <img 
                                src={memeImage} 
                                alt="Generated Meme" 
                                className="w-full rounded-xl mb-4"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-zinc-400 text-sm">{memeText}</p>
                                <a 
                                    href={memeImage} 
                                    download="nexia-meme.jpg"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="bg-orange-600 hover:bg-orange-500">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
