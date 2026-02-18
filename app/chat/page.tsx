"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PromptStudio } from "@/components/studio/prompt-studio";
import { ChatKaraoke } from "@/components/features/chat-karaoke";
import { Goals } from "@/components/goals/goals";
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
                    case "goals":
                        return <Goals />;
                    case "fortune":
                        return <div className="text-white p-4">Feature coming soon!</div>;
                    case "karaoke":
                        return <ChatKaraoke />;
                    default:
                        return <ChatInterface />;
                }
            }}
        </AppShell>
    );
}
