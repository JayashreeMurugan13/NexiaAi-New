"use client";

import { Navbar } from "@/components/ui/navbar";
import { MagneticBox } from "@/components/ui/magnetic-box";
import { Button } from "@/components/ui/button";
import { Copy, Video, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function TemplatesPage() {
    const templates = [
        {
            title: "Cyberpunk City",
            type: "Image",
            prompt: "Neon-lit cyberpunk city street at night, rain reflecting on pavement, futuristic vehicles, volumetric fog, cinematic lighting, 8k resolution, unreal engine 5 render",
            icon: <ImageIcon className="w-6 h-6 text-purple-400" />,
            color: "from-purple-500/20 to-blue-500/20"
        },
        {
            title: "Abstract Flow",
            type: "Video",
            prompt: "Abstract fluid, colorful liquid smoke flowing, 4k, smooth motion, high contrast, vibrant colors, slow motion",
            icon: <Video className="w-6 h-6 text-pink-400" />,
            color: "from-pink-500/20 to-rose-500/20"
        },
        {
            title: "Nature Documentary",
            type: "Video",
            prompt: "Cinematic drone shot of a misty mountain range at sunrise, golden hour light, eagles flying, photorealistic, national geographic style",
            icon: <Video className="w-6 h-6 text-green-400" />,
            color: "from-green-500/20 to-emerald-500/20"
        },
        {
            title: "Minimalist Portrait",
            type: "Image",
            prompt: "Minimalist portrait of a woman, side profile, white background, soft lighting, high key, fashion photography style",
            icon: <ImageIcon className="w-6 h-6 text-blue-400" />,
            color: "from-blue-500/20 to-cyan-500/20"
        }
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 px-4 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">Creative Templates</h1>
                    <p className="text-muted-foreground">Jumpstart your creativity with these curated prompts.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <MagneticBox intensity={40} className="w-full h-full">
                                <div className={`relative h-full p-6 rounded-2xl border border-white/10 bg-gradient-to-br ${template.color} backdrop-blur-xl hover:border-white/20 transition-all group overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(template.prompt)}>
                                            <Copy size={16} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        {template.icon}
                                        <span className="font-semibold text-lg">{template.title}</span>
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full uppercase tracking-wider">{template.type}</span>
                                    </div>

                                    <div className="bg-black/40 p-3 rounded-lg text-sm text-gray-300 font-mono mb-4 h-24 overflow-y-auto custom-scrollbar">
                                        {template.prompt}
                                    </div>

                                    <Button className="w-full bg-white/10 hover:bg-white/20" onClick={() => copyToClipboard(template.prompt)}>
                                        Use Template
                                    </Button>
                                </div>
                            </MagneticBox>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
