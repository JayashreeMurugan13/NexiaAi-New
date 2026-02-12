"use client";

import { useState, useEffect } from "react";
import { HomePage } from "@/components/landing/home-page";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { useRouter } from "next/navigation";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showApp, setShowApp] = useState(false);
    const router = useRouter();

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
        return <HomePage onGetStarted={() => router.push('/signup')} onGoToStudio={() => router.push('/signup')} />;
    }

    if (showOnboarding) {
        return <WelcomeFlow onComplete={() => setShowOnboarding(false)} />;
    }

    if (!showApp) {
        return <HomePage onGetStarted={() => setShowApp(true)} onGoToStudio={() => setShowApp(true)} />;
    }

    return (
        <AppShell>
            {(activeTab) => (
                activeTab === "chat" ? <ChatInterface /> : <PromptStudio />
            )}
        </AppShell>
    );
}
