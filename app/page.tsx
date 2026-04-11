"use client";

import { useState, useEffect } from "react";
import { HomePage } from "@/components/landing/home-page";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { ResumeMatcher } from "@/components/features/resume-matcher";
import { Goals } from "@/components/goals/goals";
import { Dashboard } from "@/components/features/dashboard";
import { JobRecommendations } from "@/components/features/job-recommendations";
import { InterviewCoach } from "@/components/features/interview-coach";
import { ChatKaraoke } from "@/components/features/chat-karaoke";
import { FortuneTeller } from "@/components/features/fortune-teller";
import { MockInterview } from "@/components/features/mock-interview";
import { useRouter } from "next/navigation";

export default function Home() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentUser = localStorage.getItem('nexia_current_user');
            if (currentUser) {
                setUser(JSON.parse(currentUser));
            } else {
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
        return <HomePage 
            onGetStarted={() => router.push('/signup')} 
            onGoToStudio={() => router.push('/signup')}
        />;
    }

    return (
        <AppShell>
            {(activeTab) => {
                if (activeTab === "chat") return <ChatInterface />;
                if (activeTab === "studio") return <PromptStudio />;
                if (activeTab === "resume") return <ResumeMatcher />;
                if (activeTab === "interview") return <InterviewCoach />;
                if (activeTab === "jobs") return <JobRecommendations />;
                if (activeTab === "goals") return <Goals />;
                if (activeTab === "dashboard") return <Dashboard />;
                if (activeTab === "karaoke") return <ChatKaraoke />;
                if (activeTab === "fortune") return <FortuneTeller />;
                if (activeTab === "mockinterview") return <MockInterview />;
                return <ChatInterface />;
            }}
        </AppShell>
    );
}
