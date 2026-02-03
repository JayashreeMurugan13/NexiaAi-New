"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Heart, Sparkles, Copy, Check, Plus, History, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

const formatMessage = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);

    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            // Multi-line code block
            const code = part.slice(3, -3);
            const lines = code.split('\n');
            const language = lines[0].trim();
            const codeContent = lines.slice(1).join('\n');

            return (
                <div key={index} className="my-3 bg-zinc-950 border border-zinc-700 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
                        <span className="text-xs text-zinc-400 font-mono">{language || 'code'}</span>
                        <CopyButton text={codeContent} />
                    </div>
                    <pre className="p-3 text-sm font-mono text-zinc-200 overflow-x-auto">
                        <code>{codeContent}</code>
                    </pre>
                </div>
            );
        } else if (part.startsWith('`') && part.endsWith('`')) {
            // Inline code
            const code = part.slice(1, -1);
            return (
                <code key={index} className="px-2 py-1 bg-zinc-800 text-zinc-200 rounded font-mono text-sm">
                    {code}
                </code>
            );
        } else {
            // Regular text
            return <span key={index}>{part}</span>;
        }
    });
};

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

const ChatMessage = ({ message, isUser }: { message: string, isUser: boolean }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const copyMessage = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20, scale: isVisible ? 1 : 0.95 }}
            transition={{ duration: 0.5, type: "spring" }}
            className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                <motion.div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${isUser ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-600'}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isUser ? (
                        <User className="w-5 h-5 text-white" />
                    ) : (
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="w-5 h-5 text-blue-400" />
                        </motion.div>
                    )}
                </motion.div>

                <motion.div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg relative overflow-hidden group ${isUser
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md shadow-[0_4px_20px_rgba(37,99,235,0.3)]'
                        : 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-md shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                >
                    {!isUser && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
                    )}

                    {/* Copy button */}
                    <button
                        onClick={copyMessage}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/20 hover:bg-black/40 rounded-lg transition-all"
                        title="Copy message"
                    >
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-zinc-300" />}
                    </button>

                    <div className="whitespace-pre-wrap relative z-10">
                        {formatMessage(message.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'))}
                    </div>

                    {/* Floating hearts for Nexia messages */}
                    {!isUser && message.includes('❤️') && (
                        <motion.div
                            className="absolute top-2 right-2"
                            animate={{
                                y: [-5, -15, -5],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Heart className="w-3 h-3 text-pink-400" />
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex justify-start items-center gap-3 mb-6"
    >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-600 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Sparkles className="w-5 h-5 text-blue-400" />
            </motion.div>
        </div>
        <div className="flex gap-1.5 px-4 py-3 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-md">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    </motion.div>
);

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const loadConversations = async () => {
        const { data } = await supabase
            .from('conversations')
            .select('*')
            .order('updated_at', { ascending: false });
        if (data) {
            setConversations(data);
            setFilteredConversations(data);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter(conv =>
                conv.title.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredConversations(filtered);
        }
    };

    const loadConversation = async (conversationId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (data) {
            setMessages(data);
            setCurrentConversationId(conversationId);
            setShowHistory(false);
        }
    };

    const createNewChat = () => {
        setMessages([]);
        setCurrentConversationId(null);
        setShowHistory(false);
    };

    const saveConversation = async (newMessages: Message[]) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('Current user:', user?.email);
            if (!user) return;

            let conversationId = currentConversationId;

            if (!conversationId) {
                console.log('Generating title for new conversation...');
                // Generate title for new conversation
                const titleResponse = await fetch('/api/generate-title', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: newMessages })
                });
                const { title } = await titleResponse.json();
                console.log('Generated title:', title);

                // Create new conversation
                const { data: conversation, error } = await supabase
                    .from('conversations')
                    .insert({ user_id: user.id, title })
                    .select()
                    .single();

                console.log('Conversation created:', conversation, error);
                if (conversation) {
                    conversationId = conversation.id;
                    setCurrentConversationId(conversationId);
                }
            }

            if (conversationId) {
                // Save new message
                const lastMessage = newMessages[newMessages.length - 1];
                const { error: messageError } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        role: lastMessage.role,
                        content: lastMessage.content
                    });

                console.log('Message saved:', messageError);

                // Update conversation timestamp
                await supabase
                    .from('conversations')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', conversationId);

                loadConversations();
            }
        } catch (error) {
            console.error('Save conversation error:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: "user", content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        // Save user message
        await saveConversation(newMessages);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await response.json();
            const finalMessages = [...newMessages, data];
            setMessages(finalMessages);

            // Save assistant message
            await saveConversation(finalMessages);
        } catch (error) {
            console.error(error);
            const errorMsg = {
                role: "assistant" as const,
                content: "Oops! Something went wrong, but I'm still here! 💫 Try asking me something else!"
            };
            const finalMessages = [...newMessages, errorMsg];
            setMessages(finalMessages);
            await saveConversation(finalMessages);
        } finally {
            setLoading(false);
        }
    };

    const quickPrompts = [
        "Tell me about yourself! 😊",
        "Help me brainstorm ideas 💡",
        "What can you help me create? 🎨",
        "Let's chat about something fun! ✨"
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <header className="px-8 py-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-950/80 to-zinc-900/80 backdrop-blur-md flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-4">
                    <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(59,130,246,0.2)",
                                "0 0 30px rgba(147,51,234,0.3)",
                                "0 0 20px rgba(59,130,246,0.2)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Sparkles className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Nexia</h2>
                        <p className="text-xs text-zinc-400 font-medium">Your Creative AI Friend</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{
                            boxShadow: [
                                "0 0 5px rgba(34,197,94,0.5)",
                                "0 0 15px rgba(34,197,94,0.8)",
                                "0 0 5px rgba(34,197,94,0.5)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Online & Ready</span>
                </div>

                <div className="flex gap-2">
                    <motion.button
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <History className="w-4 h-4 text-zinc-400" />
                    </motion.button>
                    <motion.button
                        onClick={createNewChat}
                        className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-4 h-4 text-zinc-400" />
                    </motion.button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-scroll p-8 space-y-2 relative">
                {/* Chat History Sidebar */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className="fixed left-20 md:left-72 top-0 bottom-0 w-80 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 z-50 p-4 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Chat History</h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-1 hover:bg-zinc-800 rounded"
                                >
                                    <span className="text-zinc-400">✕</span>
                                </button>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-zinc-200 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-500"
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredConversations.length === 0 ? (
                                    <p className="text-zinc-500 text-sm">
                                        {searchQuery ? 'No conversations found' : 'No chat history yet'}
                                    </p>
                                ) : (
                                    filteredConversations.map((conv) => (
                                        <motion.button
                                            key={conv.id}
                                            onClick={() => loadConversation(conv.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${currentConversationId === conv.id
                                                    ? 'bg-blue-600/20 border border-blue-500/30'
                                                    : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="font-medium text-white text-sm truncate">
                                                {conv.title}
                                            </div>
                                            <div className="text-xs text-zinc-400 mt-1">
                                                {new Date(conv.updated_at).toLocaleDateString()}
                                            </div>
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400/10 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [-20, 20, -20],
                                opacity: [0.1, 0.3, 0.1],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-8 relative z-10">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[40px] border border-blue-500/20 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
                            <Sparkles className="w-16 h-16 text-blue-400 mx-auto relative z-10" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h3
                                className="text-3xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                Hey there! I'm Nexia! 👋
                            </motion.h3>
                            <motion.p
                                className="text-zinc-400 leading-relaxed font-medium"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                I'm your creative AI companion, ready to chat, brainstorm, and help bring your ideas to life! What's on your mind today? ✨
                            </motion.p>
                        </div>

                        {/* Quick prompts */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                        >
                            {quickPrompts.map((prompt, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => setInput(prompt)}
                                    className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-left"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {prompt}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                )}

                {messages.map((m, idx) => (
                    <ChatMessage key={idx} message={m.content} isUser={m.role === "user"} />
                ))}

                <AnimatePresence>
                    {loading && <TypingIndicator />}
                </AnimatePresence>

                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-8 relative">
                <div className="max-w-4xl mx-auto relative group">
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"
                        animate={{
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Chat with Nexia... ✨"
                            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-6 pr-16 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-all shadow-2xl backdrop-blur-sm"
                        />
                        <motion.button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="absolute right-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-30 disabled:hover:from-blue-600 disabled:hover:to-purple-600 text-white rounded-xl transition-all shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
