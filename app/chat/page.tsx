"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { ChatKaraoke } from "@/components/features/chat-karaoke";
import { Goals } from "@/components/goals/goals";
import { ResumeMatcher } from "@/components/features/resume-matcher";
import { InterviewCoach } from "@/components/features/interview-coach";
import { JobRecommendations } from "@/components/features/job-recommendations";
import { Dashboard } from "@/components/features/dashboard";
import { useRouter } from "next/navigation";

export default function ChatPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const currentUser = localStorage.getItem('nexia_current_user');
        if (!currentUser) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(currentUser));
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <AppShell user={user}>
            {(activeTab) => {
                switch (activeTab) {
                    case "chat":
                        return <ChatInterface />;
                    case "studio":
                        return <PromptStudio />;
                    case "resume":
                        return <ResumeMatcher />;
                    case "interview":
                        return <InterviewCoach />;
                    case "jobs":
                        return <JobRecommendations />;
                    case "dashboard":
                        return <Dashboard />;
                    case "goals":
                        return <Goals />;
                    case "karaoke":
                        return <ChatKaraoke />;
                    default:
                        return <ChatInterface />;
                }
            }}
        </AppShell>
    );
}
