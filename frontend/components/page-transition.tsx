"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Truck, CreditCard } from "lucide-react";

interface PageTransitionProps {}

const PageTransition: React.FC<PageTransitionProps> = () => {
    const icons = [ShoppingBag, Package, Truck, CreditCard];

    return (
        <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-violet-100/90 to-violet-200/90 backdrop-blur-md md:bg-white/90 md:backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
        >
            {/* Mobile Design */}
            <div className="block md:hidden w-full h-full">
                <motion.div
                    animate={{ y: 0, opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center px-6 text-white"
                    initial={{ y: 20, opacity: 0 }}
                >
                    <div className="relative w-24 h-24 mb-8">
                        {icons.map((Icon, index) => (
                            <motion.div
                                key={index}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.8, 1, 0.8],
                                }}
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.5,
                                    ease: "easeInOut",
                                }}
                            >
                                <Icon size={48} />
                            </motion.div>
                        ))}
                    </div>

                    <motion.div className="w-full max-w-[200px] h-1 bg-white/20 rounded-full overflow-hidden mb-6">
                        <motion.div
                            animate={{ x: "100%" }}
                            className="h-full bg-white rounded-full"
                            initial={{ x: "-100%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>

                    <h3 className="text-2xl font-semibold mb-2">Just a moment</h3>
                    <p className="text-white/80 text-center">{`We're preparing something special for you`}</p>
                </motion.div>
            </div>

            {/* Desktop Design */}
            <div className="hidden md:block">
                <motion.div
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 w-[400px]"
                    exit={{ scale: 0.9, opacity: 0 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                >
                    <div className="relative h-20 mb-6">
                        {icons.map((Icon, index) => (
                            <motion.div
                                key={index}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0.8, 1, 0.8],
                                    rotate: [0, 0, 360],
                                }}
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.5,
                                    ease: "easeInOut",
                                }}
                            >
                                <Icon className="w-12 h-12 text-violet-500" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 text-center">Loading Your Experience</h3>

                        <div className="relative h-2 bg-violet-100 rounded-full overflow-hidden">
                            <motion.div
                                animate={{
                                    width: ["0%", "100%", "0%"],
                                }}
                                className="absolute inset-y-0 left-0 bg-violet-500 rounded-full"
                                initial={{ width: "0%" }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>

                        <motion.div animate={{ opacity: 1 }} className="flex justify-center" initial={{ opacity: 0 }} transition={{ delay: 0.5 }}>
                            <div className="flex space-x-1.5">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5],
                                        }}
                                        className="w-2 h-2 rounded-full bg-violet-500"
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PageTransition;
