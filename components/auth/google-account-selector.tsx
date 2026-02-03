"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";

interface GoogleAccountSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAccount: (email: string) => void;
}

const mockGoogleAccounts = [
    { email: "john.doe@gmail.com", name: "John Doe", avatar: "JD" },
    { email: "sarah.smith@gmail.com", name: "Sarah Smith", avatar: "SS" },
    { email: "mike.wilson@gmail.com", name: "Mike Wilson", avatar: "MW" },
    { email: "emma.brown@gmail.com", name: "Emma Brown", avatar: "EB" }
];

export function GoogleAccountSelector({ isOpen, onClose, onSelectAccount }: GoogleAccountSelectorProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Choose an account</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {mockGoogleAccounts.map((account, i) => (
                            <motion.button
                                key={account.email}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => onSelectAccount(account.email)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {account.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{account.name}</p>
                                    <p className="text-sm text-gray-500">{account.email}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                const customEmail = prompt("Enter your Google email:");
                                if (customEmail) onSelectAccount(customEmail);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Use another account</p>
                                <p className="text-sm text-gray-500">Sign in with a different Google account</p>
                            </div>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}