"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ShieldAlert, Chrome, Zap, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");

        if (isLogin) {
            const { data, error } = supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            setSuccess("Welcome back! 🎉");
            setTimeout(() => window.location.href = '/', 500);
        } else {
            const { data, error } = supabase.auth.signUp({ email, password });
            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }
            setSuccess("Account created successfully! ✨");
            setTimeout(() => window.location.href = '/', 500);
        }
    };

    const handleGoogleAuth = () => {
        setLoading(true);
        supabase.auth.signInWithOAuth({ provider: 'google' });
        window.location.href = '/';
    };

    const handleDemoMode = () => {
        const demoUser = { id: 'demo', email: 'demo@nexia.ai' };
        localStorage.setItem('nexia_current_user', JSON.stringify(demoUser));
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-pink-600/5 blur-[80px] rounded-full animate-bounce" />
                
                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/50 rounded-[2rem] p-8 shadow-2xl text-center"
            >
                <div className="mb-8">
                    <motion.div
                        animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                            rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                        className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse" />
                        <Sparkles className="w-10 h-10 text-blue-400 relative z-10" />
                        <motion.div
                            className="absolute inset-0"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Stars className="w-6 h-6 text-purple-400/50 absolute top-2 right-2" />
                        </motion.div>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    >
                        Nexia AI
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-zinc-400 mt-2 font-medium"
                    >
                        Your Creative AI Companion
                    </motion.p>
                </div>

                <AnimatePresence mode="wait">
                    <motion.form 
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleAuth} 
                        className="space-y-4 text-left"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                            <motion.div 
                                className="relative group"
                                whileFocus={{ scale: 1.02 }}
                            >
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-700 text-sm backdrop-blur-sm"
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                            <motion.div 
                                className="relative group"
                                whileFocus={{ scale: 1.02 }}
                            >
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-700 text-sm backdrop-blur-sm"
                                />
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-start gap-2 text-green-400 text-xs font-semibold bg-green-400/5 p-3 rounded-xl border border-green-400/20 mb-2">
                                        <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span>{success}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-start gap-2 text-red-400 text-xs font-semibold bg-red-400/5 p-3 rounded-xl border border-red-400/20 mb-2">
                                        <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] rounded-xl py-3 h-auto font-semibold transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    isLogin ? 'Sign In to Nexia' : 'Create Account'
                                )}
                            </Button>
                        </motion.div>
                    </motion.form>
                </AnimatePresence>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="bg-zinc-950 px-4 text-zinc-600">Quick Access</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            onClick={handleGoogleAuth}
                            disabled={loading}
                            className="w-full bg-white hover:bg-gray-100 text-gray-900 rounded-xl py-3 h-auto font-semibold transition-all duration-300 shadow-lg"
                        >
                            <Chrome className="w-5 h-5 mr-3" />
                            Continue with Google
                        </Button>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            variant="outline"
                            className="w-full bg-zinc-900/50 border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white rounded-xl py-3 h-auto backdrop-blur-sm"
                            onClick={handleDemoMode}
                            disabled={loading}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Try Demo Mode
                        </Button>
                    </motion.div>
                </div>

                <motion.p 
                    className="text-center text-sm text-zinc-500 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {isLogin ? "New to Nexia?" : "Already have an account?"}
                    <motion.button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
                        className="text-blue-400 font-bold ml-2 hover:text-blue-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </motion.button>
                </motion.p>
            </motion.div>
        </div>
    );
}
