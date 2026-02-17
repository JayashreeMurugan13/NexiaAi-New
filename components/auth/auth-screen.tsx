"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
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
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            localStorage.setItem('nexia_current_user', JSON.stringify({
                id: user.uid,
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL
            }));
            router.push('/');
        } catch (err: any) {
            console.error('Google auth error:', err);
            setError('Google login failed. Please try again.');
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

                <div className="grid grid-cols-1 gap-3">
                    <Button
                        variant="outline"
                        className="w-full bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-900 rounded-xl py-2.5 h-auto font-semibold"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 text-zinc-400 rounded-xl py-2.5 h-auto"
                        onClick={handleMockLogin}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Demo Mode - Try Now
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
