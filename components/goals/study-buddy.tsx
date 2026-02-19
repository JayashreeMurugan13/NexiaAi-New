"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, BookOpen, Calculator, Code, Briefcase, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudyBuddy() {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState<{question: string, answer: string, subject: string}[]>([]);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState<string>("general");
    const [copied, setCopied] = useState(false);

    const subjects = [
        { id: "general", label: "General", icon: Brain },
        { id: "math", label: "Math", icon: Calculator },
        { id: "programming", label: "Programming", icon: Code },
        { id: "placements", label: "Placements", icon: Briefcase },
    ];

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            // Clear chat history after copying
            setChatHistory([]);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const getAnswer = async () => {
        if (!question.trim()) return;
        setLoading(true);
        
        try {
            const isPlacementQuestion = question.toLowerCase().includes('placement') || 
                                       question.toLowerCase().includes('interview') ||
                                       question.toLowerCase().includes('hr question');
            
            let systemPrompt = "";
            
            switch (subject) {
                case "math":
                    systemPrompt = "You are a math tutor. Provide clear, step-by-step solutions. Break down complex problems into simple steps. Use examples and show all work. Keep explanations concise but complete.";
                    break;
                case "programming":
                    systemPrompt = "You are a programming mentor. Provide clear, practical coding solutions with examples. Explain concepts simply, show code snippets, and give best practices. Keep responses focused and actionable.";
                    break;
                case "placements":
                    systemPrompt = isPlacementQuestion
                        ? "You are a placement preparation expert. Generate questions and answers in Q&A format. For HR questions, provide sample answers and tips. For technical questions, give clear explanations with examples. Format as: Q: [question] A: [answer]"
                        : "You are a helpful tutor. Answer the user's question directly and clearly without Q&A format.";
                    break;
                default:
                    systemPrompt = "You are a helpful tutor. Provide clear, concise explanations that are easy to understand. Break down complex topics into simple points. Keep responses short but comprehensive.";
            }
            
            const userPrompt = (subject === "placements" && isPlacementQuestion)
                ? `${question}\n\nGenerate questions and answers in Q&A format for placement preparation.`
                : `${question}\n\nProvide a clear, concise explanation.`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            
            const data = await response.json();
            const answerText = data.content || "I couldn't find an answer right now. Please try rephrasing your question! 📚";
            
            // Add to chat history
            setChatHistory(prev => [...prev, {
                question: question,
                answer: answerText,
                subject: subject
            }]);
            
            setQuestion(""); // Clear input
        } catch (error) {
            setChatHistory(prev => [...prev, {
                question: question,
                answer: "Something went wrong. Let's try again! 🤔",
                subject: subject
            }]);
            setQuestion("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-block"
                    >
                        <Brain className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-blue-400" />
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        AI Study Buddy
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Your personal AI tutor for any subject</p>
                </motion.div>

                <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-2 justify-center flex-wrap">
                        {subjects.map((sub) => {
                            const Icon = sub.icon;
                            return (
                                <motion.button
                                    key={sub.id}
                                    onClick={() => setSubject(sub.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 text-sm md:text-base transition-all ${
                                        subject === sub.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                                >
                                    <Icon className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="hidden sm:inline">{sub.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={subject === "placements" 
                                ? "Ask any question! Add 'placement' or 'interview' for Q&A format. e.g., 'Generate placement questions on OOP'"
                                : "Ask me anything! e.g., 'Explain photosynthesis' or 'How do I solve quadratic equations?'"
                            }
                            rows={4}
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 md:py-4 px-4 md:px-6 text-sm md:text-base text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        />
                        <Button
                            onClick={getAnswer}
                            disabled={loading}
                            className="absolute right-2 bottom-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 p-2 md:p-3"
                        >
                            {loading ? <Brain className="w-3 h-3 md:w-4 md:h-4 animate-pulse" /> : <Send className="w-3 h-3 md:w-4 md:h-4" />}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {chatHistory.length > 0 && (
                            <div className="space-y-4">
                                {chatHistory.map((chat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-4 md:p-6 backdrop-blur-sm"
                                    >
                                        {/* Question */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        Q
                                                    </div>
                                                    <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">
                                                        {chat.subject} Question
                                                    </span>
                                                </div>
                                                <motion.button
                                                    onClick={() => copyToClipboard(`Q: ${chat.question}\n\nA: ${chat.answer}`)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors text-xs"
                                                >
                                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    {copied ? "Copied!" : "Copy"}
                                                </motion.button>
                                            </div>
                                            <div className="bg-green-900/20 rounded-xl p-3 border border-green-500/20">
                                                <p className="text-green-100 text-sm md:text-base leading-relaxed">
                                                    {chat.question}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Answer */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    A
                                                </div>
                                                <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                                                    Answer
                                                </span>
                                            </div>
                                            <div className="bg-blue-900/20 rounded-xl p-3 border border-blue-500/20">
                                                <p className="text-blue-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                                    {chat.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}