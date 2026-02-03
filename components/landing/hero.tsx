"use client";

import { motion } from "framer-motion";
import { MagneticBox } from "@/components/ui/magnetic-box";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const features = [
        {
            title: "Interactive Chat",
            description: "Chat with Nexia like a friend. It understands you.",
            icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
            color: "bg-purple-500/10 border-purple-500/20",
        },
        {
            title: "Enhance Prompts",
            description: "Turn simple ideas into powerful prompts automatically.",
            icon: <Sparkles className="w-8 h-8 text-blue-400" />,
            color: "bg-blue-500/10 border-blue-500/20",
        },
        {
            title: "Creative Templates",
            description: "Pre-built templates for video & image generation.",
            icon: <Zap className="w-8 h-8 text-amber-400" />,
            color: "bg-amber-500/10 border-amber-500/20",
        },
    ];

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40 animate-pulse-glow pointer-events-none" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-5xl w-full text-center"
            >
                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                    Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-blue-500">Nexia</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Your new creative AI companion. Chat, enhance, and create with a tool designed to be your best friend in creativity.
                </motion.p>

                <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-20">
                    <Link href="/signup">
                        <Button size="lg" className="rounded-full px-8 text-lg shadow-glow">
                            Start Chatting <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating Feature Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div key={i} variants={itemVariants}>
                            <MagneticBox intensity={30} className="w-full h-full">
                                <div className={`h-full p-8 rounded-2xl border backdrop-blur-sm transition-colors hover:bg-white/5 ${feature.color}`}>
                                    <div className="mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </div>
                            </MagneticBox>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
