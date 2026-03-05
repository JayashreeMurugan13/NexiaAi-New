"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalaryPredictor() {
    const [jobRole, setJobRole] = useState("");
    const [education, setEducation] = useState("Bachelor's");
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<{ predicted_salary: number; formatted_salary: string } | null>(null);

    const handlePredict = async () => {
        if (!jobRole.trim()) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/predict-salary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_role: jobRole,
                    education: education
                })
            });
            
            const data = await response.json();
            setPrediction(data);
        } catch (error) {
            console.error('Prediction failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        AI Salary Predictor
                    </h1>
                    <p className="text-zinc-400">Get salary estimates based on job role and education</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-white font-medium mb-2">
                                <Briefcase className="w-4 h-4 text-blue-400" />
                                Job Role
                            </label>
                            <input
                                type="text"
                                value={jobRole}
                                onChange={(e) => setJobRole(e.target.value)}
                                placeholder="e.g., Software Engineer, Data Scientist"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-white font-medium mb-2">
                                <GraduationCap className="w-4 h-4 text-purple-400" />
                                Education Level
                            </label>
                            <select
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            >
                                <option value="Bachelor's">Bachelor's Degree</option>
                                <option value="Master's">Master's Degree</option>
                                <option value="PhD">PhD</option>
                            </select>
                        </div>

                        <Button
                            onClick={handlePredict}
                            disabled={loading || !jobRole.trim()}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 py-6 text-lg disabled:opacity-50"
                        >
                            {loading ? (
                                <TrendingUp className="w-5 h-5 animate-pulse mr-2" />
                            ) : (
                                <DollarSign className="w-5 h-5 mr-2" />
                            )}
                            {loading ? "Predicting..." : "Predict Salary"}
                        </Button>
                    </div>
                </motion.div>

                {prediction && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-8 text-center"
                    >
                        <h3 className="text-xl font-semibold text-white mb-4">Predicted Salary</h3>
                        <div className="text-5xl font-bold text-green-400 mb-2">
                            {prediction.formatted_salary}
                        </div>
                        <p className="text-zinc-400 text-sm">per year</p>
                        
                        <div className="mt-6 grid grid-cols-2 gap-4 text-left">
                            <div className="bg-zinc-800/50 rounded-lg p-4">
                                <p className="text-sm text-zinc-400 mb-1">Job Role</p>
                                <p className="text-white font-medium">{jobRole}</p>
                            </div>
                            <div className="bg-zinc-800/50 rounded-lg p-4">
                                <p className="text-sm text-zinc-400 mb-1">Education</p>
                                <p className="text-white font-medium">{education}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6"
                >
                    <h4 className="text-white font-semibold mb-3">Popular Job Roles:</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Manager', 'Financial Analyst', 'HR Manager'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setJobRole(role)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
