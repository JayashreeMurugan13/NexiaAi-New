"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemeGenerator() {
    const [prompt, setPrompt] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const generateImage = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setImageUrl("");
        
        try {
            // First, enhance the prompt
            const enhanceResponse = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ 
                        role: "user", 
                        content: prompt
                    }],
                    enhance: true
                })
            });
            
            const enhanceData = await enhanceResponse.json();
            const enhanced = enhanceData.content || prompt;
            setEnhancedPrompt(enhanced);
            
            // Generate image using Pollinations AI (free, no API key needed)
            const imagePrompt = encodeURIComponent(enhanced);
            const timestamp = Date.now();
            const generatedUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=512&height=512&seed=${timestamp}&nologo=true`;
            
            setImageUrl(generatedUrl);
            
        } catch (error) {
            console.error('Error:', error);
            setEnhancedPrompt("Image generation failed. Try again!");
        } finally {
            setLoading(false);
        }
    };

    const downloadImage = async () => {
        if (!imageUrl) return;
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'nexia-generated-image.png';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
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
                        AI Image Generator
                    </h1>
                    <p className="text-zinc-400">Describe your image and AI will create it</p>
                </motion.div>

                <div className="space-y-6">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to create..."
                            rows={3}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                        />
                        <Button
                            onClick={generateImage}
                            disabled={loading}
                            className="absolute right-2 bottom-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                        >
                            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8"
                        >
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-orange-400 animate-spin" />
                            <p className="text-zinc-400">Generating your image...</p>
                        </motion.div>
                    )}

                    {imageUrl && !loading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm space-y-4"
                        >
                            <img 
                                src={imageUrl} 
                                alt="Generated Image" 
                                className="w-full rounded-xl"
                                onLoad={() => console.log('Image loaded')}
                            />
                            
                            {enhancedPrompt && (
                                <div className="bg-zinc-900/50 rounded-xl p-4">
                                    <p className="text-xs text-zinc-500 mb-1">Enhanced Prompt:</p>
                                    <p className="text-zinc-300 text-sm">{enhancedPrompt}</p>
                                </div>
                            )}
                            
                            <div className="flex gap-2">
                                <Button 
                                    onClick={generateImage}
                                    className="flex-1 bg-zinc-700 hover:bg-zinc-600"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Regenerate
                                </Button>
                                <Button 
                                    onClick={downloadImage}
                                    className="flex-1 bg-orange-600 hover:bg-orange-500"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
