import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Nexia | Your Creative AI Companion",
    description: "Chat, enhance prompts, and create stunning visuals with Nexia, your best AI friend.",
    keywords: ["AI", "Chatbot", "Groq", "Prompt Engineering", "Creative Tools"],
    openGraph: {
        title: "Nexia",
        description: "Your new best friend in creativity.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>
            <body className={outfit.className}>{children}</body>
        </html>
    );
}
