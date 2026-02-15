"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Send, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemeGenerator() {
    const [topic, setTopic] = useState("");
    const [memeText, setMemeText] = useState("");
    const [memeImage, setMemeImage] = useState("");
    const [loading, setLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const memeTemplates = [
        "https://i.imgflip.com/30b1gx.jpg", // Drake
        "https://i.imgflip.com/1bij.jpg", // Success Kid
        "https://i.imgflip.com/1g8my4.jpg", // Distracted Boyfriend
        "https://i.imgflip.com/26am.jpg", // Disaster Girl
        "https://i.imgflip.com/9ehk.jpg", // Philosoraptor
        "https://i.imgflip.com/1ur9b0.jpg", // Surprised Pikachu
    ];

    const createMemeImage = (topText: string, bottomText: string, templateUrl: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            canvas.width = 500;
            canvas.height = 500;
            
            ctx.drawImage(img, 0, 0, 500, 500);
            
            // Style for meme text
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.font = 'bold 40px Impact';
            ctx.textAlign = 'center';
            
            // Top text
            ctx.strokeText(topText, 250, 50);
            ctx.fillText(topText, 250, 50);
            
            // Bottom text
            ctx.strokeText(bottomText, 250, 470);
            ctx.fillText(bottomText, 250, 470);
            
            setMemeImage(canvas.toDataURL('image/jpeg'));
        };
        img.src = templateUrl;
    };

    const generateMeme = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ 
                        role: "user", 
                        content: `Create a funny two-line meme about: ${topic}. Format as: TOP TEXT|BOTTOM TEXT. Keep each line under 25 characters. Be creative and funny!` 
                    }]
                })
            });
            
            const data = await response.json();
            let text = data.content || "WHEN YOU TRY|BUT IT FAILS";
            
            text = text.replace(/["'`]/g, '').trim();
            setMemeText(text);
            
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
            
            const template = memeTemplates[Math.floor(Math.random() * memeTemplates.length)];
            createMemeImage(topText, bottomText, template);
            
        } catch (error) {
            console.error('Error:', error);
            setMemeText("Meme generation failed... that's the real meme 😅");
        } finally {
            setLoading(false);
        }
    };

    const downloadMeme = () => {
        if (!memeImage) return;
        const link = document.createElement('a');
        link.download = 'nexia-meme.jpg';
        link.href = memeImage;
        link.click();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-8 overflow-y-auto">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
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
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-zinc-400 text-sm flex-1">{memeText}</p>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={generateMeme}
                                        className="bg-zinc-700 hover:bg-zinc-600"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Regenerate
                                    </Button>
                                    <Button 
                                        onClick={downloadMeme}
                                        className="bg-orange-600 hover:bg-orange-500"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
