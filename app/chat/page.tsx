"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Bot, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hey there! I'm Nexia. What's on your mind today? ✨" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (enhance = false) => {
        if (!input.trim() && !enhance) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    enhance: enhance
                }),
            });

            const data = await response.json();

            if (enhance) {
                // If enhancing, we put the result back in the input for the user to use
                setInput(data.content);
                // And maybe add a system note? 
                setMessages((prev) => [...prev, { role: "assistant", content: "I've enhanced your prompt! Check the input box. 👇" }]);
            } else {
                setMessages((prev) => [...prev, data]);
            }

        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Oops! I encountered an error. 😓" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleEnhance = () => {
        if (!input.trim()) return;
        sendMessage(true);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <Navbar />

            <main className="flex-1 overflow-hidden pt-20 relative flex flex-col max-w-4xl mx-auto w-full px-4">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide">
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex items-start gap-4 max-w-[80%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                                )}>
                                    {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                                </div>

                                <div className={cn(
                                    "p-4 rounded-2xl shadow-md backdrop-blur-sm border",
                                    msg.role === "user"
                                        ? "bg-primary/20 border-primary/20 rounded-tr-none text-foreground"
                                        : "bg-secondary/50 border-white/5 rounded-tl-none text-foreground"
                                )}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground ml-14">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background/80 backdrop-blur-lg border-t border-white/5 mb-4 rounded-t-2xl">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleEnhance}
                            className="shrink-0 text-yellow-400 hover:text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/10"
                            title="Enhance Prompt"
                        >
                            <Sparkles size={18} className="mr-2" /> Enhance
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Message Nexia..."
                            className="flex-1 bg-secondary/50 border-white/10"
                        />
                        <Button
                            size="md"
                            onClick={() => sendMessage(false)}
                            disabled={!input.trim() || loading}
                            className="shrink-0 bg-primary hover:bg-primary/90"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
