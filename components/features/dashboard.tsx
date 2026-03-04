"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Video, Calendar, Award, BarChart3, Clock, CheckCircle } from "lucide-react";

interface ProgressData {
    interviewScores: { date: string; score: number }[];
    skillTestScores: { skill: string; score: number; date: string }[];
    totalSessions: number;
    averageScore: number;
    improvementRate: number;
    mlPrediction?: {
        skill_level: string;
        confidence: number;
        test_score: number;
        skill_count: number;
    };
}

export function Dashboard() {
    const [progressData, setProgressData] = useState<ProgressData>({
        interviewScores: [],
        skillTestScores: [],
        totalSessions: 0,
        averageScore: 0,
        improvementRate: 0
    });

    useEffect(() => {
        // Load progress data from localStorage
        const interviewHistory = JSON.parse(localStorage.getItem('nexia_interview_history') || '[]');
        const skillHistory = JSON.parse(localStorage.getItem('nexia_skill_history') || '[]');
        const mlPrediction = JSON.parse(localStorage.getItem('nexia_ml_prediction') || 'null');
        
        const avgScore = interviewHistory.length > 0 
            ? interviewHistory.reduce((sum: number, item: any) => sum + item.score, 0) / interviewHistory.length 
            : 0;
            
        const improvement = interviewHistory.length > 1 
            ? interviewHistory[interviewHistory.length - 1].score - interviewHistory[0].score 
            : 0;

        setProgressData({
            interviewScores: interviewHistory,
            skillTestScores: skillHistory,
            totalSessions: interviewHistory.length + skillHistory.length,
            averageScore: Math.round(avgScore),
            improvementRate: Math.round(improvement),
            mlPrediction: mlPrediction
        });
    }, []);

    const stats = [
        {
            label: "Total Sessions",
            value: progressData.totalSessions,
            icon: Calendar,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            label: "Average Score",
            value: `${progressData.averageScore}%`,
            icon: Award,
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            label: "Improvement",
            value: `+${progressData.improvementRate}%`,
            icon: TrendingUp,
            color: "text-orange-400",
            bg: "bg-orange-500/10"
        },
        {
            label: "This Week",
            value: progressData.interviewScores.filter(s => 
                new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            icon: Clock,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Progress Dashboard
                    </h1>
                    <p className="text-zinc-400">Track your improvement across all features</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${stat.bg} border border-zinc-800 rounded-2xl p-4`}
                            >
                                <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-zinc-400">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* AI Skill Analysis - NEW SECTION */}
                    {progressData.mlPrediction && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 md:col-span-2"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                AI Skill Analysis
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-800/50 rounded-lg">
                                    <p className="text-sm text-zinc-400 mb-1">Test Score</p>
                                    <p className="text-2xl font-bold text-white">{progressData.mlPrediction.test_score}%</p>
                                </div>
                                <div className="p-4 bg-zinc-800/50 rounded-lg">
                                    <p className="text-sm text-zinc-400 mb-1">Predicted Level</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${
                                            progressData.mlPrediction.skill_level === 'Beginner' ? 'bg-red-500' :
                                            progressData.mlPrediction.skill_level === 'Intermediate' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}></span>
                                        <p className="text-2xl font-bold text-white">{progressData.mlPrediction.skill_level}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-800/50 rounded-lg">
                                    <p className="text-sm text-zinc-400 mb-1">Confidence</p>
                                    <p className="text-2xl font-bold text-white">{Math.round(progressData.mlPrediction.confidence * 100)}%</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Video className="w-5 h-5 text-orange-400" />
                            Interview Progress
                        </h3>
                        {progressData.interviewScores.length > 0 ? (
                            <div className="space-y-3">
                                {progressData.interviewScores.slice(-5).map((score, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                        <span className="text-zinc-300">{new Date(score.date).toLocaleDateString()}</span>
                                        <span className={`font-semibold ${score.score >= 80 ? 'text-green-400' : score.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {score.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500">No interview sessions yet. Start practicing!</p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Skill Assessments
                        </h3>
                        {progressData.skillTestScores.length > 0 ? (
                            <div className="space-y-3">
                                {progressData.skillTestScores.slice(-5).map((skill, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                        <span className="text-zinc-300">{skill.skill}</span>
                                        <span className={`font-semibold ${skill.score >= 80 ? 'text-green-400' : skill.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {skill.score}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500">No skill tests completed yet. Try Resume Matcher!</p>
                        )}
                    </motion.div>
                </div>

                {/* Goals Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Recommended Next Steps
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Practice Interview</h4>
                            <p className="text-sm text-zinc-400">Aim for 80%+ consistency</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Skill Assessment</h4>
                            <p className="text-sm text-zinc-400">Test new technical skills</p>
                        </div>
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                            <h4 className="font-semibold text-white mb-2">Job Search</h4>
                            <p className="text-sm text-zinc-400">Find matching opportunities</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}