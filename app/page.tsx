"use client";

import { useState, useEffect } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { HomePage } from "@/components/landing/home-page";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showHomePage, setShowHomePage] = useState(true);
    const [activeTab, setActiveTab] = useState<"chat" | "studio">("chat");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading neural interface...</div>
    }

    if (!user) {
        return <AuthScreen />;
    }

    if (showHomePage) {
        return (
            <HomePage 
                onGetStarted={() => {
                    setShowHomePage(false);
                    setActiveTab("chat");
                }}
                onGoToStudio={() => {
                    setShowHomePage(false);
                    setActiveTab("studio");
                }}
            />
        );
    }

    return (
        <AppShell initialTab={activeTab} user={user}>
            {(currentTab) => (
                currentTab === "chat" ? <ChatInterface /> : <PromptStudio />
            )}
        </AppShell>
    );
}
