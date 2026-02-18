"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, MessageSquare, Zap, Brain, Palette, ArrowRight, Stars, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface HomePageProps {
    onGetStarted: () => void;
    onGoToStudio?: () => void;
    onGoToGoals?: () => void;
}

const FeatureBox = ({ 
    icon, 
    title, 
    desc, 
    delay = 0,
    onClick
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    delay?: number;
    onClick?: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ margin: "-100px", once: true }}
            transition={{ duration: 0.8, delay: delay * 0.1 }}
            whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 50
            }}
            onClick={onClick}
            className="group relative p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-[#0F0F12] via-[#1A1D24] to-[#0F0F12] border border-zinc-800/50 backdrop-blur-xl shadow-2xl cursor-pointer overflow-hidden transform-gpu perspective-1000 hover:border-zinc-700/70 transition-all duration-500"
        >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                        y: [-8, 8, -8],
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
            
            {/* Icon */}
            <motion.div
                className="relative z-10 mb-4 md:mb-6"
                whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
            >
                {icon}
            </motion.div>
            
            {/* Content */}
            <div className="relative z-10">
                <motion.h3 
                    className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-blue-200 transition-colors"
                    whileHover={{ x: 3 }}
                >
                    {title}
                </motion.h3>
                <motion.p 
                    className="text-zinc-400 text-xs md:text-sm leading-relaxed group-hover:text-zinc-300 transition-colors"
                    whileHover={{ x: 3 }}
                >
                    {desc}
                </motion.p>
            </div>
            
            {/* Corner accent */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500/50 rounded-full group-hover:bg-blue-400 group-hover:scale-150 transition-all duration-300" />
        </motion.div>
    );
};

export function HomePage({ onGetStarted, onGoToStudio, onGoToGoals }: HomePageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroY = useTransform(scrollYProgress, [0, 0.5], ["0%", "50%"]);

    const features = [
        {
            icon: <MessageSquare className="w-12 h-12 text-blue-400" />,
            title: "Chat",
            desc: "Have natural conversations with Nexia. Chat, create prompts, generate lyrics, and get mystical fortunes - all in one place.",
            action: "chat"
        },
        {
            icon: <Brain className="w-12 h-12 text-green-400" />,
            title: "Goals",
            desc: "Achieve your dreams with AI-powered Study Buddy and Habit Tracker. Learn faster, build better habits, reach your goals.",
            action: "goals"
        },
        {
            icon: <Palette className="w-12 h-12 text-pink-400" />,
            title: "Creative Templates",
            desc: "Access a curated library of stunning templates for art, nature, business, and imagination. Each template is crafted for maximum impact.",
            action: "studio"
        }
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-black overflow-x-hidden">
            {/* Animated Background */}
            <motion.div 
                className="fixed inset-0 pointer-events-none"
                style={{ y: backgroundY }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/10 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-purple-900/15 via-pink-900/10 to-transparent" />
                
                {/* Floating elements */}
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            x: [-10, 10, -10],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.6, 0.1],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    >
                        {i % 4 === 0 ? (
                            <Stars className="w-3 h-3 text-blue-400/30" />
                        ) : i % 4 === 1 ? (
                            <Wand2 className="w-2 h-2 text-purple-400/30" />
                        ) : i % 4 === 2 ? (
                            <Sparkles className="w-2 h-2 text-pink-400/30" />
                        ) : (
                            <div className="w-1 h-1 bg-blue-400/40 rounded-full" />
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* Hero Section */}
            <motion.section 
                className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-16 md:py-20 text-center"
                style={{ y: heroY }}
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 1.2, type: "spring" }}
                    className="mb-6 md:mb-8 lg:mb-12"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.3)] relative overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                        />
                        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400 relative z-10" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight"
                >
                    NEXIA
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-300 mb-6 md:mb-8 lg:mb-10 max-w-2xl leading-relaxed px-4"
                >
                    Your intelligent creative companion that transforms ideas into reality
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={onGetStarted}
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white px-12 py-6 text-lg rounded-full font-bold shadow-[0_0_40px_rgba(147,51,234,0.4)] transition-all duration-300 border-0 h-auto"
                    >
                        <Sparkles className="mr-3 w-5 h-5" />
                        Get Started
                        <ArrowRight className="ml-3 w-5 h-5" />
                    </Button>
                </motion.div>
            </motion.section>

            {/* About Section */}
            <section className="relative z-10 py-12 md:py-20 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    >
                        About Nexia
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed mb-8 md:mb-12 px-4"
                    >
                        Nexia is more than just an AI assistant - she's your creative partner who understands the nuances of imagination, 
                        logic, and artistic expression. Built with cutting-edge technology and designed with creators in mind, 
                        Nexia helps you transform simple thoughts into extraordinary creations.
                    </motion.p>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-12 md:py-20 px-4 sm:px-6 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-10 md:mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    >
                        What Nexia Can Do
                    </motion.h2>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {features.map((feature, i) => {
                            const handleClick = () => {
                                if (feature.action === "chat") onGetStarted();
                                else if (feature.action === "goals") onGoToGoals?.();
                                else if (feature.action === "studio") onGoToStudio?.();
                            };
                            
                            return (
                                <FeatureBox
                                    key={i}
                                    icon={feature.icon}
                                    title={feature.title}
                                    desc={feature.desc}
                                    delay={i}
                                    onClick={handleClick}
                                />
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-12 md:py-20 px-4 sm:px-6 md:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 md:mb-6">
                        Ready to Create Magic?
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 mb-6 md:mb-8 px-4">
                        Join thousands of creators who are already using Nexia to bring their ideas to life.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            onClick={onGetStarted}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 text-lg rounded-full font-semibold shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 border-0 h-auto"
                        >
                            Start Creating Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}