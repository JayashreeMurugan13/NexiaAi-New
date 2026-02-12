"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
    type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === "signup") {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                
                if (data.user) {
                    localStorage.setItem('nexia_current_user', JSON.stringify(data.user));
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                
                if (data.user) {
                    localStorage.setItem('nexia_current_user', JSON.stringify(data.user));
                }
            }
            router.push("/chat");
        } catch (error) {
            console.error(error);
            alert("Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 rounded-2xl bg-secondary/30 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    {type === "login" ? "Welcome Back" : "Join Nexia"}
                </h2>
                <p className="text-muted-foreground">
                    {type === "login"
                        ? "Sign in to continue your creative journey"
                        : "Create an account to start exploring"}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-secondary/50 border-white/5 focus:border-primary/50 text-lg py-6"
                    />
                </div>
                <div>
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-secondary/50 border-white/5 focus:border-primary/50 text-lg py-6"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 text-lg relative overflow-hidden group"
                >
                    <span className="relative z-10">{loading ? "Processing..." : type === "login" ? "Sign In" : "Sign Up"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full py-6 border-white/10 hover:bg-white/5"
            >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </Button>

            <div className="mt-6 text-center text-sm">
                <Link
                    href={type === "login" ? "/signup" : "/login"}
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    {type === "login"
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Sign In"}
                </Link>
            </div>
        </motion.div>
    );
}
