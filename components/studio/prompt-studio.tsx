"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layout, Copy, Plus, Image, Palette, Briefcase, Wand2, Mountain, Flower, Camera, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TemplateItemProps {
    title: string;
    desc: string;
    prompt: string;
    category: string;
    icon: React.ReactNode;
    gradient: string;
    onSelect: (p: string) => void;
}

const TemplateItem = ({ title, desc, prompt, category, icon, gradient, onSelect }: TemplateItemProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(prompt)}
        className={`group relative p-6 bg-gradient-to-br ${gradient} border border-white/10 rounded-3xl cursor-pointer transition-all overflow-hidden backdrop-blur-sm`}
    >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category badge */}
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/20 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {category}
        </div>
        
        {/* Icon */}
        <motion.div
            className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors"
            whileHover={{ rotate: 10, scale: 1.1 }}
        >
            {icon}
        </motion.div>
        
        {/* Content */}
        <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed mb-4 line-clamp-2 group-hover:text-white/90 transition-colors">
                {desc}
            </p>
            
            {/* Action button */}
            <motion.div
                className="flex items-center gap-2 text-xs font-bold text-white/60 group-hover:text-white transition-colors"
                whileHover={{ x: 5 }}
            >
                <Plus className="w-3.5 h-3.5" />
                Use Template
            </motion.div>
        </div>
        
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
    </motion.div>
);

const templates = {
    nature: [
        {
            title: "Mystic Forest",
            desc: "Enchanted woodland scenes with magical lighting and ethereal atmosphere.",
            prompt: "A mystical forest at twilight, ancient trees with glowing moss, fireflies dancing in the air, soft ethereal light filtering through the canopy, magical atmosphere, cinematic lighting, 8k resolution, fantasy art style",
            icon: <Mountain className="w-6 h-6 text-green-400" />,
            gradient: "from-green-500/20 to-emerald-600/20"
        },
        {
            title: "Ocean Dreams",
            desc: "Serene underwater worlds and coastal landscapes with dreamy aesthetics.",
            prompt: "Underwater coral reef paradise, tropical fish swimming through crystal clear water, sunbeams penetrating the ocean surface, vibrant coral formations, peaceful and serene atmosphere, National Geographic style, ultra-detailed",
            icon: <Flower className="w-6 h-6 text-blue-400" />,
            gradient: "from-blue-500/20 to-cyan-600/20"
        },
        {
            title: "Mountain Majesty",
            desc: "Breathtaking mountain vistas and alpine landscapes.",
            prompt: "Majestic snow-capped mountain peaks at sunrise, golden hour lighting, pristine alpine lake reflection, dramatic clouds, epic landscape photography, Ansel Adams style, high contrast, breathtaking vista",
            icon: <Mountain className="w-6 h-6 text-purple-400" />,
            gradient: "from-purple-500/20 to-indigo-600/20"
        }
    ],
    creative: [
        {
            title: "Abstract Dreams",
            desc: "Surreal and imaginative compositions that defy reality.",
            prompt: "Abstract surreal composition, floating geometric shapes, liquid mercury textures, rainbow light refractions, impossible architecture, Salvador Dali meets digital art, vibrant colors, mind-bending perspective",
            icon: <Palette className="w-6 h-6 text-pink-400" />,
            gradient: "from-pink-500/20 to-rose-600/20"
        },
        {
            title: "Cyberpunk City",
            desc: "Futuristic urban landscapes with neon lights and high-tech aesthetics.",
            prompt: "Cyberpunk cityscape at night, neon lights reflecting on wet streets, flying cars, holographic advertisements, rain-soaked atmosphere, Blade Runner aesthetic, purple and blue color palette, cinematic composition",
            icon: <Zap className="w-6 h-6 text-cyan-400" />,
            gradient: "from-cyan-500/20 to-blue-600/20"
        },
        {
            title: "Fantasy Portal",
            desc: "Magical gateways to otherworldly realms and dimensions.",
            prompt: "Ancient stone portal glowing with magical energy, swirling galaxy visible through the gateway, mystical runes carved in stone, ethereal particles floating around, fantasy art style, epic and mysterious atmosphere",
            icon: <Wand2 className="w-6 h-6 text-violet-400" />,
            gradient: "from-violet-500/20 to-purple-600/20"
        }
    ],
    business: [
        {
            title: "Professional Portrait",
            desc: "Corporate headshots and professional photography setups.",
            prompt: "Professional business portrait, confident executive in modern office, natural lighting, clean background, corporate attire, approachable expression, high-end commercial photography style, sharp focus",
            icon: <Camera className="w-6 h-6 text-gray-400" />,
            gradient: "from-gray-500/20 to-slate-600/20"
        },
        {
            title: "Modern Office",
            desc: "Contemporary workspace designs and office environments.",
            prompt: "Modern minimalist office space, clean lines, natural light, plants, ergonomic furniture, collaborative workspace, Scandinavian design influence, professional atmosphere, architectural photography",
            icon: <Briefcase className="w-6 h-6 text-blue-400" />,
            gradient: "from-blue-500/20 to-indigo-600/20"
        },
        {
            title: "Tech Innovation",
            desc: "Cutting-edge technology and innovation concepts.",
            prompt: "Futuristic technology concept, holographic interfaces, AI visualization, clean tech aesthetic, innovation lab setting, blue and white color scheme, professional tech photography, sleek and modern",
            icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
            gradient: "from-emerald-500/20 to-green-600/20"
        }
    ]
};

export function PromptStudio() {
    const [promptInput, setPromptInput] = useState("");
    const [enhancedResult, setEnhancedResult] = useState("");
    const [enhancing, setEnhancing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'nature' | 'creative' | 'business'>('nature');

    const enhancePrompt = async () => {
        if (!promptInput.trim()) return;
        setEnhancing(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: promptInput }],
                    enhance: true
                })
            });
            const data = await response.json();
            setEnhancedResult(data.content);
        } catch (error) {
            console.error(error);
            setEnhancedResult("Sorry, I couldn't enhance that prompt right now. But your original idea sounds great! ✨");
        } finally {
            setEnhancing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const categories = [
        { key: 'nature' as const, label: 'Nature & Landscapes', icon: <Mountain className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
        { key: 'creative' as const, label: 'Creative & Abstract', icon: <Palette className="w-4 h-4" />, color: 'from-pink-500 to-purple-500' },
        { key: 'business' as const, label: 'Business & Tech', icon: <Briefcase className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <header className="px-8 py-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-950/80 to-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                    <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center"
                        animate={{ 
                            boxShadow: [
                                "0 0 20px rgba(147,51,234,0.2)",
                                "0 0 30px rgba(236,72,153,0.3)",
                                "0 0 20px rgba(147,51,234,0.2)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Layout className="w-6 h-6 text-purple-400" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Prompt Studio</h2>
                        <p className="text-sm text-zinc-400 font-medium">Transform ideas into powerful prompts</p>
                    </div>
                </div>
                
                {/* Category tabs */}
                <div className="flex gap-2">
                    {categories.map((category) => (
                        <motion.button
                            key={category.key}
                            onClick={() => setActiveCategory(category.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                activeCategory === category.key
                                    ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg'
                                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {category.icon}
                            {category.label}
                        </motion.button>
                    ))}
                </div>
            </header>

            <div className="flex-1 min-h-0 overflow-y-scroll p-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Prompt Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" />
                                Prompt Enhancement Lab
                            </h3>
                            
                            <motion.div 
                                className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700/50 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <textarea
                                    value={promptInput}
                                    onChange={(e) => setPromptInput(e.target.value)}
                                    placeholder="Describe your creative vision here... \n\nExample: 'A magical forest with glowing mushrooms'"
                                    className="w-full h-40 bg-zinc-950/50 border border-zinc-700/50 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 transition-all resize-none font-mono leading-relaxed placeholder:text-zinc-600"
                                />
                                
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={enhancePrompt}
                                        disabled={enhancing || !promptInput.trim()}
                                        className="w-full py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 h-auto rounded-2xl shadow-lg"
                                    >
                                        {enhancing ? (
                                            <div className="flex items-center gap-2">
                                                <Wand2 className="w-5 h-5 animate-spin" />
                                                Enhancing Magic...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5" />
                                                Enhance with AI Magic
                                            </div>
                                        )}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </section>

                        {/* Enhanced Result */}
                        <AnimatePresence>
                            {enhancedResult && (
                                <motion.section
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Enhanced Result</h3>
                                        <motion.button
                                            onClick={() => copyToClipboard(enhancedResult)}
                                            className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-2 rounded-full border border-purple-500/20"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy Enhanced Prompt
                                        </motion.button>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-3xl p-6 text-sm leading-relaxed text-zinc-200 font-mono shadow-inner border-l-4 border-l-purple-500 whitespace-pre-wrap relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-transparent" />
                                        <div className="relative z-10">{enhancedResult}</div>
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Template Library */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Image className="w-4 h-4 text-blue-500" />
                            Template Gallery
                        </h3>
                        
                        <motion.div 
                            className="grid gap-4"
                            key={activeCategory}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {templates[activeCategory].map((template, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <TemplateItem
                                        title={template.title}
                                        desc={template.desc}
                                        prompt={template.prompt}
                                        category={activeCategory}
                                        icon={template.icon}
                                        gradient={template.gradient}
                                        onSelect={setPromptInput}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
