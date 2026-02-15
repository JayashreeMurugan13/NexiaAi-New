"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ShieldAlert, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) {
                    localStorage.setItem('nexia_current_user', JSON.stringify(data.user));
                }
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user) {
                    localStorage.setItem('nexia_current_user', JSON.stringify(data.user));
                }
            }
            router.push('/');
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            // Try Supabase OAuth first
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                }
            });
            
            if (error) {
                console.error('Supabase OAuth error:', error);
                // Fallback: Create mock Google user
                const mockUser = { 
                    id: 'google-' + Date.now(), 
                    email: 'user@gmail.com', 
                    name: 'Google User' 
                };
                localStorage.setItem('nexia_current_user', JSON.stringify(mockUser));
                router.push('/');
            }
        } catch (err: any) {
            console.error('Google auth error:', err);
            // Fallback: Create mock Google user
            const mockUser = { 
                id: 'google-' + Date.now(), 
                email: 'user@gmail.com', 
                name: 'Google User' 
            };
            localStorage.setItem('nexia_current_user', JSON.stringify(mockUser));
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const handleMockLogin = () => {
        const demoUser = { id: 'demo', email: 'demo@nexia.ai' };
        localStorage.setItem('nexia_current_user', JSON.stringify(demoUser));
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-zinc-950/50 backdrop-blur-2xl border border-zinc-800 rounded-[2rem] p-8 shadow-2xl text-center"
            >
                <div className="mb-8">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    >
                        <Sparkles className="w-8 h-8 text-blue-500" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Nexia AI</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Your Creative AI Companion</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-700 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-700 text-sm"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-start gap-2 text-red-400 text-xs font-semibold bg-red-400/5 p-3 rounded-xl border border-red-400/20 mb-2">
                                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] rounded-xl py-2.5 h-auto">
                        {loading ? "Processing..." : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="bg-zinc-950 px-3 text-zinc-600">Quick Access</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="w-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 text-zinc-400 rounded-xl py-2.5 h-auto"
                        onClick={handleMockLogin}
                    >
                        Demo Mode
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 h-auto"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                    >
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                    </Button>
                </div>

                <p className="text-center text-sm text-zinc-500 mt-8">
                    {isLogin ? "New to Nexia?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-500 font-bold ml-1.5 hover:text-blue-400 transition-colors">
                        {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
