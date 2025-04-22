"use client";

import React, { useEffect, useState } from "react";

const PageTransition: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (progress < 100) {
                setProgress(progress + 1);
            }
        }, 20);

        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="w-20 h-20 mb-8 relative">
                {/* Shopping bag icon with pulse animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="w-16 h-16 text-blue-600 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" x2="21" y1="6" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>

                {/* Spinner animation */}
                <div className="absolute inset-0">
                    <div className="w-full h-full border-4 border-blue-200 rounded-full" />
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {/* Loading text */}
            <div className="text-center">
                <p className="text-lg font-medium text-gray-700">Loading your products</p>
                <p className="text-sm text-gray-500">Please wait a moment...</p>
            </div>

            {/* Animated dots */}
            <div className="flex mt-4 space-x-2">
                {[0, 1, 2].map((dot) => (
                    <div key={dot} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${dot * 0.2}s` }} />
                ))}
            </div>
        </div>
    );
};

export default PageTransition;
