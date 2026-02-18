"use client";

import { useState, useEffect } from "react";
import { HomePage } from "@/components/landing/home-page";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { FortuneTeller } from "@/components/features/fortune-teller";
import { ChatKaraoke } from "@/components/features/chat-karaoke";
import { WelcomeFlow } from "@/components/onboarding/welcome-flow";
import { useRouter } from "next/navigation";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showApp, setShowApp] = useState(true); // Start with app shown
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUser = localStorage.getItem('nexia_current_user');
            if (currentUser) {
                setUser(JSON.parse(currentUser));
                // Check if user was already using the app (skip landing page)
                const hasUsedApp = localStorage.getItem('nexia_has_used_app');
                if (hasUsedApp === 'true') {
                    setShowApp(true);
                }
            } else {
                // Check for user from OAuth callback cookie
                const cookies = document.cookie.split(';');
                const userCookie = cookies.find(c => c.trim().startsWith('nexia_user='));
                if (userCookie) {
                    const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
                    localStorage.setItem('nexia_current_user', JSON.stringify(userData));
                    setUser(userData);
                }
            }
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

    if (!showApp && !user) {
        return <HomePage onGetStarted={() => router.push('/signup')} onGoToStudio={() => router.push('/signup')} />;
    }

    return (
        <AppShell>
            {(activeTab) => {
                if (activeTab === "chat") return <ChatInterface />;
                if (activeTab === "studio") return <PromptStudio />;
                if (activeTab === "fortune") return <FortuneTeller />;
                if (activeTab === "karaoke") return <ChatKaraoke />;
                return <ChatInterface />;
            }}
        </AppShell>
    );
}
