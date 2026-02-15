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
                        content: `Create a funny two-line meme about: ${topic}. Format as: TOP TEXT|BOTTOM TEXT. Keep each line under 30 characters.` 
                    }]
                })
            });
            
            const data = await response.json();
            let text = data.content || "WHEN YOU TRY|BUT IT FAILS";
            
            // Clean up the text
            text = text.replace(/["'`]/g, '').trim();
            setMemeText(text);
            
            // Parse the text
            let topText = "TOP TEXT";
            let bottomText = "BOTTOM TEXT";
            
            if (text.includes('|')) {
                const parts = text.split('|');
                topText = parts[0].trim().toUpperCase();
                bottomText = parts[1]?.trim().toUpperCase() || "BOTTOM TEXT";
            } else {
                const words = text.split(' ');
                const mid = Math.ceil(words.length / 2);
                topText = words.slice(0, mid).join(' ').toUpperCase();
                bottomText = words.slice(mid).join(' ').toUpperCase();
            }
            
            // Pick random template
            const template = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
            
            // Generate meme image
            const formData = new URLSearchParams();
            formData.append('template_id', template.id);
            formData.append('username', 'imgflip_hubot');
            formData.append('password', 'imgflip_hubot');
            formData.append('text0', topText);
            formData.append('text1', bottomText);
            
            const memeResponse = await fetch('https://api.imgflip.com/caption_image', {
                method: 'POST',
                body: formData
            });
            
            const memeData = await memeResponse.json();
            
            if (memeData.success && memeData.data?.url) {
                setMemeImage(memeData.data.url);
            } else {
                console.error('Meme API error:', memeData);
                setMemeText("Failed to generate image. Try again!");
            }
        } catch (error) {
            console.error('Error:', error);
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
