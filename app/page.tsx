"use client";

import { useState, useEffect } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUser = localStorage.getItem('nexia_current_user');
            setUser(currentUser ? JSON.parse(currentUser) : null);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Loading neural interface...</div>
    }

    if (!user) {
        return <AuthScreen />;
    }

    if (showOnboarding) {
        return <WelcomeFlow onComplete={() => setShowOnboarding(false)} />;
    }

    return (
        <AppShell>
            {(activeTab) => (
                activeTab === "chat" ? <ChatInterface /> : <PromptStudio />
            )}
        </AppShell>
    );
}
