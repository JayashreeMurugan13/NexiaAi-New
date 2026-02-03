"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, MessageSquare, Zap, Layout, ArrowRight, Stars, Wand2, Brain, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface WelcomeFlowProps {
    onComplete: () => void;
}

const MagicBox = ({ 
    icon, 
    title, 
    desc, 
    color, 
    delay = 0,
    direction = "left" 
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
    delay?: number;
    direction?: "left" | "right";
}) => {
    return (
        <motion.div
            initial={{ 
                opacity: 0, 
                x: direction === "left" ? -100 : 100,
                rotateY: direction === "left" ? -15 : 15
            }}
            whileInView={{ 
                opacity: 1, 
                x: 0,
                rotateY: 0
            }}
            viewport={{ margin: "-100px", once: true }}
            transition={{ 
                duration: 0.8, 
                type: "spring",
                delay: delay * 0.2
            }}
            whileHover={{ 
                scale: 1.05,
                rotateY: direction === "left" ? 5 : -5,
                z: 50
            }}
            className={`group relative p-8 rounded-[3rem] bg-gradient-to-br ${color} border border-white/10 backdrop-blur-xl shadow-2xl cursor-pointer overflow-hidden transform-gpu perspective-1000`}
        >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating particles inside box */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                        y: [-10, 10, -10],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
            
            {/* Icon with rotation animation */}
            <motion.div
                className="relative z-10 mb-6"
                whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                }}
                transition={{ duration: 0.5 }}
            >
                {icon}
            </motion.div>
            
            {/* Content */}
            <div className="relative z-10">
                <motion.h3 
                    className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors"
                    whileHover={{ x: 5 }}
                >
                    {title}
                </motion.h3>
                <motion.p 
                    className="text-zinc-300 leading-relaxed group-hover:text-zinc-200 transition-colors"
                    whileHover={{ x: 5 }}
                >
                    {desc}
                </motion.p>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
        </motion.div>
    );
};

const steps = [
    {
        icon: <Sparkles className="w-16 h-16 text-blue-400" />,
        title: "Welcome to Nexia",
        desc: "Your magical AI companion that understands creativity, logic, and everything in between. Let's embark on this journey together!",
        color: "from-blue-500/20 to-purple-500/20"
    },
    {
        icon: <MessageSquare className="w-16 h-16 text-green-400" />,
        title: "Chat Like Friends",
        desc: "Have natural conversations with Nexia. She remembers context, understands emotions, and responds like your best friend who happens to be super smart.",
        color: "from-green-500/20 to-emerald-500/20"
    },
    {
        icon: <Zap className="w-16 h-16 text-yellow-400" />,
        title: "Enhance Your Ideas",
        desc: "Transform simple thoughts into powerful, detailed prompts. Nexia's Neural Enhancer turns 'make a logo' into professional design briefs.",
        color: "from-yellow-500/20 to-orange-500/20"
    },
    {
        icon: <Palette className="w-16 h-16 text-pink-400" />,
        title: "Creative Templates",
        desc: "Access a curated library of stunning templates for art, nature, business, and imagination. Each template is crafted for maximum impact.",
        color: "from-pink-500/20 to-rose-500/20"
    }
];

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "200%"]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black overflow-y-auto scrollbar-hide">
            <div className="min-h-screen relative">
                {/* Animated Background */}
                <motion.div 
                    className="fixed inset-0 pointer-events-none"
                    style={{ y: backgroundY }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-purple-900/20 to-black opacity-60" />
                    
                    {/* Floating magical elements */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [-30, 30, -30],
                                x: [-20, 20, -20],
                                rotate: [0, 180, 360],
                                opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 4,
                            }}
                        >
                            {i % 3 === 0 ? (
                                <Stars className="w-4 h-4 text-blue-400/40" />
                            ) : i % 3 === 1 ? (
                                <Wand2 className="w-3 h-3 text-purple-400/40" />
                            ) : (
                                <Brain className="w-3 h-3 text-pink-400/40" />
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Content */}
                <div className="relative z-10 min-h-screen flex flex-col">
                    {/* Hero Section */}
                    <motion.div 
                        className="flex-1 flex items-center justify-center p-8"
                        style={{ y: textY }}
                    >
                        <div className="text-center max-w-4xl">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 1, type: "spring" }}
                                className="mb-8"
                            >
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative overflow-hidden">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                                    />
                                    <Sparkles className="w-16 h-16 text-blue-400 relative z-10" />
                                </div>
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-6xl md:text-8xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                            >
                                Meet Nexia
                            </motion.h1>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-2xl text-zinc-300 mb-12 leading-relaxed"
                            >
                                Where creativity meets intelligence in perfect harmony
                            </motion.p>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="text-zinc-500 animate-bounce"
                            >
                                <p className="text-sm uppercase tracking-[0.3em] mb-2">Scroll to Discover Magic</p>
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-transparent mx-auto rounded-full" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Features Section */}
                    <div className="py-20 px-8">
                        <div className="max-w-7xl mx-auto">
                            <motion.h2
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-5xl font-bold text-center text-white mb-20 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                            >
                                Discover Your Superpowers
                            </motion.h2>
                            
                            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                                {steps.map((step, i) => (
                                    <MagicBox
                                        key={i}
                                        icon={step.icon}
                                        title={step.title}
                                        desc={step.desc}
                                        color={step.color}
                                        delay={i}
                                        direction={i % 2 === 0 ? "left" : "right"}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="py-20 text-center"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={onComplete}
                                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white px-12 py-6 text-xl rounded-full font-bold shadow-[0_0_50px_rgba(147,51,234,0.4)] transition-all duration-300 border-0 h-auto"
                            >
                                <Sparkles className="mr-3 w-6 h-6" />
                                Enter the Magic
                                <ArrowRight className="ml-3 w-6 h-6" />
                            </Button>
                        </motion.div>
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-zinc-500 mt-8 text-sm"
                        >
                            Ready to transform your creative process?
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
