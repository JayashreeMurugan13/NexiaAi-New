"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1], // ✅ VALID easing
    },
  },
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! I'm Nexia. What's on your mind today? ✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (enhance = false) => {
    if (!input.trim() && !enhance) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          enhance,
        }),
      });

      const data = await res.json();

      if (enhance) {
        setInput(data.content);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I've enhanced your prompt! 👇",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong 😓" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />

      <main className="flex-1 pt-20 flex flex-col max-w-4xl mx-auto w-full px-4">
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={cn(
                  "flex items-start gap-4 max-w-[80%]",
                  msg.role === "user"
                    ? "ml-auto flex-row-reverse"
                    : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                  )}
                >
                  {msg.role === "user" ? <User /> : <Bot />}
                </div>

                <div
                  className={cn(
                    "p-4 rounded-2xl border",
                    msg.role === "user"
                      ? "bg-primary/20 rounded-tr-none"
                      : "bg-secondary/50 rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-14 text-muted-foreground"
            >
              Nexia is thinking…
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => sendMessage(true)}
              disabled={!input.trim()}
            >
              <Sparkles className="mr-2" size={18} /> Enhance
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Message Nexia…"
            />

            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
