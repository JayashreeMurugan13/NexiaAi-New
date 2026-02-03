"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-lg border-b border-border/40"
        >
            <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Nexia
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Features
                </Link>
                <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Templates
                </Link>
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        Get Started
                    </Button>
                </Link>
            </div>
        </motion.header>
    );
}
