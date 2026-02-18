"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Check, Flame, Calendar, TrendingUp, X, Bell, Clock, BarChart3, Brain, Lightbulb, ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Habit {
    id: string;
    name: string;
    streak: number;
    completedToday: boolean;
    lastCompleted: string;
    totalDays: number;
    reminderTime?: string;
    notificationsEnabled: boolean;
    completionHistory: { date: string; completed: boolean }[];
    bestStreak: number;
    category: string;
}

interface HabitSuggestion {
    name: string;
    category: string;
    stackWith?: string;
    reason: string;
}

export function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabit, setNewHabit] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showAICoach, setShowAICoach] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<HabitSuggestion[]>([]);
    const [showMotivationChat, setShowMotivationChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState("");

    useEffect(() => {
        const savedHabits = localStorage.getItem('nexia_habits');
        if (savedHabits) {
            const parsedHabits = JSON.parse(savedHabits);
            // Migrate old habits to new format
            const migratedHabits = parsedHabits.map((habit: any) => ({
                ...habit,
                completionHistory: habit.completionHistory || [],
                bestStreak: habit.bestStreak || habit.streak || 0,
                category: habit.category || "general"
            }));
            setHabits(migratedHabits);
            // Save migrated data
            localStorage.setItem('nexia_habits', JSON.stringify(migratedHabits));
        }
        
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
        
        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);
                    
                    // Listen for messages from service worker
                    navigator.serviceWorker.addEventListener('message', (event) => {
                        if (event.data.type === 'GET_HABITS') {
                            // Send habits data to service worker
                            registration.active?.postMessage({
                                type: 'HABITS_DATA',
                                habits: habits
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }
        
        checkMissedHabits();
        const interval = setInterval(checkReminders, 60000);
        
        // Daily goal reminder notifications
        const dailyReminders = setInterval(() => {
            sendGoalNotifications();
            // Also schedule service worker reminder
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_REMINDER' });
            }
        }, 10000); // Every 10 seconds for testing
        
        return () => {
            clearInterval(interval);
            clearInterval(dailyReminders);
        };
    }, []);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            return permission === 'granted';
        }
        return false;
    };

    const sendNotification = (title: string, body: string) => {
        if (notificationPermission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    };

    const checkMissedHabits = () => {
        const today = new Date().toDateString();
        const savedHabits = localStorage.getItem('nexia_habits');
        if (savedHabits) {
            const habits = JSON.parse(savedHabits);
            const missedHabits = habits.filter((h: Habit) => 
                !h.completedToday && h.lastCompleted !== today
            );
            
            if (missedHabits.length > 0) {
                sendNotification(
                    '🎯 Habit Reminder',
                    `You have ${missedHabits.length} habits to complete today!`
                );
            }
        }
    };

    const checkReminders = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        habits.forEach(habit => {
            if (habit.reminderTime === currentTime && !habit.completedToday && habit.notificationsEnabled) {
                sendNotification(
                    '⏰ Habit Reminder',
                    `Time to: ${habit.name}`
                );
            }
        });
    };

    const saveHabits = (updatedHabits: Habit[]) => {
        setHabits(updatedHabits);
        localStorage.setItem('nexia_habits', JSON.stringify(updatedHabits));
    };

    const addHabit = async () => {
        if (!newHabit.trim()) return;
        
        if (habits.length === 0) {
            await requestNotificationPermission();
        }
        
        const habit: Habit = {
            id: Date.now().toString(),
            name: newHabit,
            streak: 0,
            completedToday: false,
            lastCompleted: "",
            totalDays: 0,
            notificationsEnabled: true,
            completionHistory: [],
            bestStreak: 0,
            category: "general"
        };
        
        saveHabits([...habits, habit]);
        setNewHabit("");
        setShowAddForm(false);
    };

    const toggleHabit = (id: string) => {
        const today = new Date().toDateString();
        const updatedHabits = habits.map(habit => {
            if (habit.id === id) {
                // Ensure completionHistory exists
                const history = habit.completionHistory || [];
                
                if (habit.completedToday) {
                    return {
                        ...habit,
                        completedToday: false,
                        streak: Math.max(0, habit.streak - 1),
                        totalDays: Math.max(0, habit.totalDays - 1),
                        completionHistory: history.filter(h => h.date !== today)
                    };
                } else {
                    const wasYesterday = habit.lastCompleted === new Date(Date.now() - 86400000).toDateString();
                    const newStreak = wasYesterday || habit.streak === 0 ? habit.streak + 1 : 1;
                    const newBestStreak = Math.max(habit.bestStreak || 0, newStreak);
                    
                    if (newStreak === 7) {
                        sendNotification('🔥 Amazing!', `7-day streak for "${habit.name}"! Keep it up!`);
                    } else if (newStreak === 30) {
                        sendNotification('🏆 Incredible!', `30-day streak for "${habit.name}"! You're unstoppable!`);
                    } else if (newStreak % 10 === 0 && newStreak > 0) {
                        sendNotification('🎉 Milestone!', `${newStreak}-day streak for "${habit.name}"!`);
                    }
                    
                    // Add or update today's completion
                    const updatedHistory = history.filter(h => h.date !== today);
                    updatedHistory.push({ date: today, completed: true });
                    
                    const updatedHabit = {
                        ...habit,
                        completedToday: true,
                        lastCompleted: today,
                        streak: newStreak,
                        totalDays: habit.totalDays + 1,
                        bestStreak: newBestStreak,
                        completionHistory: updatedHistory
                    };
                    
                    return updatedHabit;
                }
            }
            return habit;
        });
        saveHabits(updatedHabits);
        
        // Check celebration immediately with updated habits
        const allCompleted = updatedHabits.length > 0 && updatedHabits.every(h => h.completedToday);
        if (allCompleted) {
            const messages = [
                "BEEP BEEP! 🤖 Mission Complete! All habits executed successfully! You're amazing, human!",
                "SYSTEM ALERT: 100% Success Rate! 🎯 My circuits are buzzing with pride for you!",
                "CALCULATING... WOW! 🚀 Perfect performance detected! Keep up the excellent work!",
                "ROBOT.EXE: Impressed! 💫 All objectives achieved! You make my processors happy!",
                "SCANNING... INCREDIBLE! 🌟 Habit completion: 100%! You're my favorite human!",
                "BEEP BOOP! 🎉 All systems green! Your dedication powers my motivation circuits!"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            setCelebrationMessage(randomMessage);
            setShowCelebration(true);
            
            // Auto-hide after 10 seconds
            setTimeout(() => setShowCelebration(false), 10000);
        }
    };

    const setReminder = (id: string, time: string) => {
        const updatedHabits = habits.map(habit => 
            habit.id === id ? { ...habit, reminderTime: time } : habit
        );
        saveHabits(updatedHabits);
    };

    const toggleNotifications = (id: string) => {
        const updatedHabits = habits.map(habit => 
            habit.id === id ? { ...habit, notificationsEnabled: !habit.notificationsEnabled } : habit
        );
        saveHabits(updatedHabits);
    };

    const getAISuggestions = async () => {
        setLoadingAI(true);
        try {
            const habitData = habits.map(h => ({
                name: h.name,
                streak: h.streak,
                totalDays: h.totalDays,
                category: h.category,
                bestStreak: h.bestStreak
            }));
            
            const currentTime = new Date().getHours();
            const timeContext = currentTime < 12 ? "morning" : currentTime < 18 ? "afternoon" : "evening";
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `I have these habits: ${JSON.stringify(habitData)}. It's ${timeContext}. Suggest 3 NEW personalized habits I don't have yet, considering my current habits and time of day. Focus on habit stacking with my existing habits. Respond ONLY in JSON format: [{"name": "specific habit name", "category": "health/productivity/learning/wellness", "stackWith": "existing habit name or time-based trigger", "reason": "personalized reason based on my habits"}]`
                    }]
                })
            });
            
            const data = await response.json();
            try {
                const suggestions = JSON.parse(data.content.replace(/```json|```/g, ''));
                setAiSuggestions(suggestions.slice(0, 3));
            } catch {
                // Personalized fallback based on existing habits
                const fallbackSuggestions = [];
                
                if (!habits.some(h => h.name.toLowerCase().includes('water'))) {
                    fallbackSuggestions.push({
                        name: "Drink water after waking up",
                        category: "health",
                        stackWith: "morning routine",
                        reason: "Hydration kickstarts metabolism and energy"
                    });
                }
                
                if (!habits.some(h => h.name.toLowerCase().includes('exercise'))) {
                    fallbackSuggestions.push({
                        name: "10 pushups after coffee",
                        category: "fitness",
                        stackWith: "morning coffee",
                        reason: "Quick energy boost and strength building"
                    });
                }
                
                if (!habits.some(h => h.name.toLowerCase().includes('read'))) {
                    fallbackSuggestions.push({
                        name: "Read 5 pages before bed",
                        category: "learning",
                        stackWith: "bedtime routine",
                        reason: "Improves knowledge and helps wind down"
                    });
                }
                
                if (!habits.some(h => h.name.toLowerCase().includes('meditat'))) {
                    fallbackSuggestions.push({
                        name: "3-minute breathing exercise",
                        category: "wellness",
                        stackWith: "after lunch",
                        reason: "Reduces stress and improves afternoon focus"
                    });
                }
                
                setAiSuggestions(fallbackSuggestions.slice(0, 3));
            }
        } catch {
            setAiSuggestions([
                { name: "Morning gratitude journal", category: "wellness", stackWith: "after waking up", reason: "Starts day with positive mindset" },
                { name: "Evening phone-free time", category: "wellness", stackWith: "1 hour before bed", reason: "Improves sleep quality and mental clarity" }
            ]);
        } finally {
            setLoadingAI(false);
        }
    };

    const getWeeklyProgress = () => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 86400000);
            const dateStr = date.toDateString();
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            const completed = habits.filter(h => 
                h.completionHistory?.some(ch => ch.date === dateStr && ch.completed)
            ).length;
            const completedHabits = habits.filter(h => 
                h.completionHistory?.some(ch => ch.date === dateStr && ch.completed)
            ).map(h => h.name);
            
            last7Days.push({ 
                date: dayName, 
                fullDate: dateStr,
                completed, 
                total: habits.length,
                completedHabits,
                isToday: dateStr === new Date().toDateString()
            });
        }
        return last7Days;
    };

    const checkAllGoalsCompleted = () => {
        if (habits.length > 0 && habits.every(h => h.completedToday)) {
            const messages = [
                "🎉 AMAZING! You completed ALL your habits today! You're absolutely crushing it!",
                "🌟 WOW! Perfect day! Every single habit done - you're a habit champion!",
                "🚀 INCREDIBLE! 100% completion today! You're building an amazing life!",
                "💪 OUTSTANDING! All habits completed! You're unstoppable!",
                "🏆 PERFECT! Every goal achieved today! You're a true winner!"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            setCelebrationMessage(randomMessage);
            setShowCelebration(true);
            
            // Auto-hide after 5 seconds
            setTimeout(() => setShowCelebration(false), 5000);
        }
    };

    const sendMotivationMessage = async () => {
        if (!chatInput.trim()) return;
        
        const userMessage = { role: "user", content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput("");
        setChatLoading(true);
        
        try {
            const habitContext = habits.map(h => `${h.name}: ${h.streak} day streak, ${h.totalDays} total days`).join(', ');
            const missedHabits = habits.filter(h => !h.completedToday).map(h => h.name);
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: "You are a supportive, empathetic habit coach and motivational friend. Help users with stress, motivation, and habit building. Be encouraging, understanding, and provide practical advice. Use emojis and keep responses warm and personal."
                        },
                        {
                            role: "user",
                            content: `My habits: ${habitContext}. Today I missed: ${missedHabits.join(', ') || 'none'}. ${chatInput}`
                        }
                    ]
                })
            });
            
            const data = await response.json();
            setChatMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        } catch {
            setChatMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I'm here for you! 💪 Remember, every small step counts. What's one tiny habit you can do right now? Even 1% progress is still progress! 🌟" 
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const sendGoalNotifications = () => {
        const incompleteHabits = habits.filter(h => !h.completedToday);
        const currentHour = new Date().getHours();
        
        // Only send notifications during active hours (8 AM - 10 PM)
        if (currentHour >= 8 && currentHour <= 22 && incompleteHabits.length > 0) {
            const messages = [
                `🎯 ${incompleteHabits.length} habits waiting! Time to make progress!`,
                `⏰ Don't forget your goals! ${incompleteHabits.length} habits need attention.`,
                `🌟 Your future self will thank you! Complete your ${incompleteHabits.length} habits.`,
                `💪 Stay consistent! ${incompleteHabits.length} habits ready to be conquered.`,
                `🚀 Keep building! ${incompleteHabits.length} habits are waiting for you.`
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            sendNotification('NEXIA - Goal Reminder', randomMessage);
        }
    };

    const deleteHabit = (id: string) => {
        saveHabits(habits.filter(h => h.id !== id));
    };

    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const completedToday = habits.filter(h => h.completedToday).length;
    const bestStreaks = habits.map(h => h.bestStreak || 0);
    const overallBestStreak = Math.max(...bestStreaks, 0);
    const weeklyProgress = getWeeklyProgress();

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-8"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block"
                    >
                        <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-green-400" />
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        Habit Tracker
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Build better habits, one day at a time</p>
                </motion.div>

                {/* Enhanced Stats with Analytics & AI Coach */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-4 text-center"
                    >
                        <Flame className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                        <p className="text-lg md:text-2xl font-bold text-white">{totalStreak}</p>
                        <p className="text-xs md:text-sm text-zinc-400">Total Streak</p>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-4 text-center"
                    >
                        <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-lg md:text-2xl font-bold text-white">{completedToday}</p>
                        <p className="text-xs md:text-sm text-zinc-400">Done Today</p>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-4 text-center"
                    >
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-lg md:text-2xl font-bold text-white">{habits.length}</p>
                        <p className="text-xs md:text-sm text-zinc-400">Active Habits</p>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-2xl p-4 text-center"
                    >
                        <Flame className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-lg md:text-2xl font-bold text-white">{overallBestStreak}</p>
                        <p className="text-xs md:text-sm text-zinc-400">Best Streak</p>
                    </motion.div>
                </div>

                {/* Analytics & AI Coach & Motivation Chat Buttons */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <motion.button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">Analytics</span>
                        {showAnalytics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                    
                    <motion.button
                        onClick={() => {
                            setShowAICoach(!showAICoach);
                            if (!showAICoach && aiSuggestions.length === 0) {
                                getAISuggestions();
                            }
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <Brain className="w-4 h-4" />
                        <span className="text-sm">AI Coach</span>
                        {showAICoach ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                    
                    <motion.button
                        onClick={() => setShowMotivationChat(!showMotivationChat)}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-xl text-green-400 hover:text-green-300 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Motivation</span>
                        {showMotivationChat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                </div>

                {/* Analytics Panel */}
                <AnimatePresence>
                    {showAnalytics && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border border-blue-500/20 rounded-2xl p-6 mb-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Weekly Progress
                            </h3>
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {weeklyProgress.map((day, i) => (
                                    <div key={i} className="text-center group relative">
                                        <div className={`text-xs mb-1 ${day.isToday ? 'text-blue-400 font-bold' : 'text-zinc-400'}`}>
                                            {day.date}
                                        </div>
                                        <div className="h-16 bg-zinc-800 rounded-lg flex flex-col justify-end p-1 relative overflow-hidden">
                                            <div 
                                                className={`rounded transition-all ${
                                                    day.completed === day.total && day.total > 0 
                                                        ? 'bg-gradient-to-t from-green-500 to-emerald-400' 
                                                        : day.completed > 0 
                                                        ? 'bg-gradient-to-t from-yellow-500 to-orange-400'
                                                        : 'bg-gradient-to-t from-red-500 to-red-400'
                                                }`}
                                                style={{ height: `${day.total > 0 ? Math.max((day.completed / day.total) * 100, 5) : 5}%` }}
                                            />
                                            {day.isToday && (
                                                <div className="absolute inset-0 border-2 border-blue-400 rounded-lg animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">{day.completed}/{day.total}</div>
                                        
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                            <div className="font-medium">{day.fullDate.slice(0, 10)}</div>
                                            {day.completedHabits.length > 0 ? (
                                                <div>
                                                    ✅ {day.completedHabits.join(', ')}
                                                </div>
                                            ) : (
                                                <div className="text-red-400">No habits completed</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {habits.map(habit => (
                                    <div key={habit.id} className="bg-zinc-800/50 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-white truncate">{habit.name}</span>
                                            <span className="text-xs text-zinc-400">Best: {habit.bestStreak || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-zinc-700 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all"
                                                    style={{ width: `${habit.totalDays > 0 ? Math.min((habit.streak / (habit.bestStreak || 1)) * 100, 100) : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-zinc-400">{habit.streak}d</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Coach Panel */}
                <AnimatePresence>
                    {showAICoach && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 rounded-2xl p-6 mb-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                AI Habit Coach
                            </h3>
                            {loadingAI ? (
                                <div className="flex items-center justify-center py-8">
                                    <Lightbulb className="w-6 h-6 text-purple-400 animate-pulse" />
                                    <span className="ml-2 text-zinc-400">Analyzing your habits...</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {aiSuggestions.map((suggestion, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-zinc-800/50 rounded-lg p-4 border border-purple-500/20"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-white">{suggestion.name}</h4>
                                                <motion.button
                                                    onClick={() => {
                                                        setNewHabit(suggestion.name);
                                                        setShowAddForm(true);
                                                        setShowAICoach(false);
                                                    }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded"
                                                >
                                                    Add
                                                </motion.button>
                                            </div>
                                            <p className="text-sm text-zinc-400 mb-2">{suggestion.reason}</p>
                                            {suggestion.stackWith && (
                                                <p className="text-xs text-purple-400">
                                                    💡 Stack with: "{suggestion.stackWith}"
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                    <motion.button
                                        onClick={getAISuggestions}
                                        whileHover={{ scale: 1.02 }}
                                        className="w-full mt-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors text-sm"
                                    >
                                        Get New Suggestions
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Motivation Chat Panel */}
                <AnimatePresence>
                    {showMotivationChat && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-2xl p-6 mb-6"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-400" />
                                Motivation & Support Chat
                            </h3>
                            
                            <div className="bg-zinc-800/50 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center text-zinc-500 py-8">
                                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                                        <p className="text-sm">Hi! I'm here to help with motivation and stress. How are you feeling about your habits today? 😊</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-green-600 text-white rounded-br-none' 
                                                    : 'bg-zinc-700 text-zinc-200 rounded-bl-none'
                                            }`}>
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-zinc-700 text-zinc-200 p-3 rounded-lg rounded-bl-none text-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMotivationMessage()}
                                    placeholder="Share how you're feeling or ask for motivation..."
                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-4 text-sm text-zinc-200 focus:outline-none focus:border-green-500"
                                />
                                <motion.button
                                    onClick={sendMotivationMessage}
                                    disabled={!chatInput.trim() || chatLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                            
                            <div className="mt-3 flex gap-2 flex-wrap">
                                {[
                                    "I'm feeling stressed about my habits",
                                    "I missed my goals today",
                                    "How do I stay motivated?",
                                    "I'm struggling with consistency"
                                ].map((prompt, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => {
                                            setChatInput(prompt);
                                            setTimeout(() => sendMotivationMessage(), 100);
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        className="text-xs bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full hover:bg-green-600/30 transition-colors"
                                    >
                                        {prompt}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notification Permission */}
                {notificationPermission !== 'granted' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Enable Notifications</p>
                                <p className="text-xs text-zinc-400">Get reminders and celebrate milestones</p>
                            </div>
                        </div>
                        <Button
                            onClick={requestNotificationPermission}
                            className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1"
                        >
                            Enable
                        </Button>
                    </motion.div>
                )}
                <div className="mb-6 md:mb-8">
                    <AnimatePresence>
                        {showAddForm ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 md:p-6"
                            >
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newHabit}
                                        onChange={(e) => setNewHabit(e.target.value)}
                                        placeholder="Enter a new habit (e.g., 'Drink 8 glasses of water')"
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl py-2 md:py-3 px-4 text-sm md:text-base text-zinc-200 focus:outline-none focus:border-green-500"
                                        onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                                    />
                                    <Button
                                        onClick={addHabit}
                                        className="bg-green-600 hover:bg-green-500 p-2 md:p-3"
                                    >
                                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                    <Button
                                        onClick={() => setShowAddForm(false)}
                                        className="bg-zinc-700 hover:bg-zinc-600 p-2 md:p-3"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.button
                                onClick={() => setShowAddForm(true)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-4 md:p-6 flex items-center justify-center gap-3 text-green-400 hover:text-green-300 transition-colors"
                            >
                                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                <span className="text-sm md:text-base font-medium">Add New Habit</span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Habits List */}
                <div className="space-y-3 md:space-y-4">
                    {habits.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 md:py-12"
                        >
                            <Target className="w-12 h-12 md:w-16 md:h-16 text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-500 text-sm md:text-base">No habits yet. Add your first habit to get started!</p>
                        </motion.div>
                    ) : (
                        habits.map((habit, index) => (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gradient-to-r p-4 md:p-6 rounded-2xl border transition-all ${
                                    habit.completedToday
                                        ? 'from-green-900/30 to-emerald-900/30 border-green-500/50'
                                        : 'from-zinc-900/50 to-zinc-800/50 border-zinc-700/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                                        <motion.button
                                            onClick={() => toggleHabit(habit.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                                                habit.completedToday
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-zinc-600 hover:border-green-500'
                                            }`}
                                        >
                                            {habit.completedToday && <Check className="w-4 h-4 md:w-5 md:h-5" />}
                                        </motion.button>
                                        
                                        <div className="flex-1">
                                            <h3 className={`font-medium text-sm md:text-base ${habit.completedToday ? 'text-green-200' : 'text-white'}`}>
                                                {habit.name}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs md:text-sm text-zinc-400 flex items-center gap-1">
                                                    <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                                                    {habit.streak} day streak
                                                </span>
                                                <span className="text-xs md:text-sm text-zinc-400">
                                                    {habit.totalDays} total days
                                                </span>
                                            </div>
                                            
                                            {/* Reminder Settings */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="time"
                                                    value={habit.reminderTime || ''}
                                                    onChange={(e) => setReminder(habit.id, e.target.value)}
                                                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300"
                                                />
                                                <motion.button
                                                    onClick={() => toggleNotifications(habit.id)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`p-1 rounded transition-colors ${
                                                        habit.notificationsEnabled
                                                            ? 'text-blue-400 hover:text-blue-300'
                                                            : 'text-zinc-600 hover:text-zinc-500'
                                                    }`}
                                                    title={habit.notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
                                                >
                                                    <Bell className="w-3 h-3" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <motion.button
                                        onClick={() => deleteHabit(habit.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4 md:w-5 md:h-5" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Perfect Anime Robot - Bottom Right */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 200, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 150 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <div className="relative">
                            {/* Perfect Speech Bubble - Top Left */}
                            <motion.div
                                initial={{ scale: 0, x: 20, y: 20 }}
                                animate={{ scale: 1, x: 0, y: 0 }}
                                transition={{ delay: 0.7, type: "spring", damping: 25 }}
                                className="absolute -top-20 -left-64 bg-white rounded-2xl p-4 shadow-2xl max-w-xs border-2 border-blue-200 z-30"
                                style={{
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(59,130,246,0.1)'
                                }}
                            >
                                {/* Speech bubble tail pointing to robot */}
                                <div className="absolute bottom-4 right-0 translate-x-full">
                                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent" />
                                    <div className="absolute -left-[14px] top-0 w-0 h-0 border-l-[12px] border-l-blue-200 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent" />
                                </div>
                                
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="text-gray-800 font-semibold text-sm leading-relaxed"
                                >
                                    {celebrationMessage}
                                </motion.p>
                            </motion.div>
                            
                            {/* Perfect Robot Character */}
                            <motion.div
                                animate={{ 
                                    y: [-3, 3, -3],
                                }}
                                transition={{ 
                                    duration: 4, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative cursor-pointer group"
                                onClick={() => setShowCelebration(false)}
                            >
                                {/* Outer Glow */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                
                                {/* Robot Main Body */}
                                <div className="relative">
                                    {/* Head */}
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-3xl mx-auto shadow-2xl border-2 border-slate-200 relative overflow-hidden">
                                        {/* Head Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-3xl" />
                                        
                                        {/* Smart Display Visor */}
                                        <div className="w-20 h-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full mx-auto mt-3 shadow-inner relative overflow-hidden">
                                            <motion.div 
                                                animate={{ x: [-30, 30, -30] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <motion.span 
                                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-white text-xs font-bold tracking-widest"
                                                >
                                                    NEXIA AI
                                                </motion.span>
                                            </div>
                                        </div>
                                        
                                        {/* Perfect Eyes */}
                                        <div className="flex justify-center items-center mt-4 gap-3">
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg relative"
                                            >
                                                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-90" />
                                                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white/60 rounded-full" />
                                            </motion.div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 3, repeat: Infinity, delay: 0.1 }}
                                                className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg relative"
                                            >
                                                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-90" />
                                                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white/60 rounded-full" />
                                            </motion.div>
                                        </div>
                                        
                                        {/* Happy Smile */}
                                        <motion.div 
                                            animate={{ scaleX: [1, 1.1, 1] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="w-8 h-2.5 bg-gradient-to-r from-pink-400 via-red-400 to-pink-400 rounded-full mx-auto mt-3 shadow-sm"
                                        />
                                        
                                        {/* Cheek Blush */}
                                        <div className="absolute left-2 bottom-6 w-3 h-2 bg-pink-300/40 rounded-full blur-sm" />
                                        <div className="absolute right-2 bottom-6 w-3 h-2 bg-pink-300/40 rounded-full blur-sm" />
                                    </div>
                                    
                                    {/* Body */}
                                    <div className="w-20 h-18 bg-gradient-to-br from-slate-100 via-white to-slate-200 rounded-2xl mx-auto mt-2 shadow-xl border-2 border-slate-200 relative">
                                        {/* Body Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
                                        
                                        {/* Heart Monitor Display */}
                                        <div className="w-14 h-7 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl mx-auto mt-3 shadow-inner relative overflow-hidden">
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <span className="text-red-400 text-lg font-bold drop-shadow-sm">♥</span>
                                            </motion.div>
                                            <motion.div 
                                                animate={{ x: [-20, 20, -20] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute top-0 w-0.5 h-full bg-green-400/50"
                                            />
                                        </div>
                                        
                                        {/* Status Lights */}
                                        <div className="flex justify-center gap-2 mt-2">
                                            <motion.div 
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 bg-green-400 rounded-full shadow-sm"
                                            />
                                            <motion.div 
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                                                className="w-2 h-2 bg-blue-400 rounded-full shadow-sm"
                                            />
                                            <motion.div 
                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                                                className="w-2 h-2 bg-purple-400 rounded-full shadow-sm"
                                            />
                                        </div>
                                        
                                        {/* Arms */}
                                        <motion.div 
                                            animate={{ rotate: [-25, 25, -25] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -left-2 top-4 w-4 h-10 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full shadow-lg border border-slate-300"
                                        />
                                        <motion.div 
                                            animate={{ rotate: [25, -25, 25] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -right-2 top-4 w-4 h-10 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full shadow-lg border border-slate-300"
                                        />
                                    </div>
                                    
                                    {/* Legs */}
                                    <div className="flex justify-center gap-3 mt-2">
                                        <motion.div 
                                            animate={{ scaleY: [1, 1.05, 1] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="w-3 h-6 bg-gradient-to-b from-slate-200 to-slate-300 rounded-full shadow-md border border-slate-400"
                                        />
                                        <motion.div 
                                            animate={{ scaleY: [1, 1.05, 1] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                                            className="w-3 h-6 bg-gradient-to-b from-slate-200 to-slate-300 rounded-full shadow-md border border-slate-400"
                                        />
                                    </div>
                                </div>
                                
                                {/* Perfect Particle Effects */}
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`absolute w-2 h-2 rounded-full shadow-lg ${
                                            i % 3 === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 
                                            i % 3 === 1 ? 'bg-gradient-to-r from-purple-400 to-pink-500' : 
                                            'bg-gradient-to-r from-yellow-400 to-orange-500'
                                        }`}
                                        style={{
                                            left: `${20 + Math.random() * 60}%`,
                                            top: `${20 + Math.random() * 60}%`,
                                        }}
                                        animate={{
                                            scale: [0, 1.2, 0],
                                            opacity: [0, 1, 0],
                                            y: [-25, -40, -25],
                                            rotate: [0, 360]
                                        }}
                                        transition={{
                                            duration: 3.5,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                                
                                {/* Magic Sparkles */}
                                {[...Array(4)].map((_, i) => (
                                    <motion.div
                                        key={`magic-${i}`}
                                        className="absolute text-2xl"
                                        style={{
                                            left: `${30 + i * 10}%`,
                                            top: `${30 + i * 8}%`,
                                            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                                        }}
                                        animate={{
                                            y: [-10, -25, -10],
                                            opacity: [0, 1, 0],
                                            scale: [0.5, 1, 0.5],
                                            rotate: [0, 180, 360]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            delay: i * 0.8,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        ✨
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}