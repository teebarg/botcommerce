"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw } from "nui-react-icons";

import { cn } from "@/lib/util/cn";

const OfflinePage = () => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [showAnimation, setShowAnimation] = useState(true);

    useEffect(() => {
        // Reset animation when retrying
        if (isRetrying) {
            setShowAnimation(false);
            setTimeout(() => setShowAnimation(true), 100);
        }
    }, [isRetrying]);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            const response = await fetch("/api/health-check");

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.log("Still offline");
        }
        setIsRetrying(false);
    };

    return (
        <div className="bg-gradient-to-b from-default-50 to-default-100 flex items-center justify-center p-4 flex-1">
            <div className="max-w-md w-full bg-content1 rounded-2xl shadow-xl p-8 text-center">
                {/* Animation Container */}
                <div className={cn("mb-8 relative", { "animate-bounce": showAnimation })}>
                    <div className="relative">
                        {/* <WifiOff className="w-24 h-24 mx-auto text-default-400" strokeWidth={1.5} /> */}
                        {/* <CloudOff className="w-12 h-12 absolute -bottom-2 -right-2 text-default-500" strokeWidth={1.5} /> */}
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl font-bold text-default-800 mb-4">{`You're Offline`}</h1>

                <p className="text-default-600 mb-8">
                    {`It seems you've lost your internet connection. Don't worry - your data is safe and you can still access previously loaded content.`}
                </p>

                {/* Retry Button */}
                <button
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700
                     text-white font-medium rounded-lg transition-colors duration-200
                     disabled:bg-blue-400 disabled:cursor-not-allowed gap-2"
                    disabled={isRetrying}
                    onClick={handleRetry}
                >
                    <RefreshCcw className={cn("w-5 h-5", isRetrying && "animate-spin")} />
                    {isRetrying ? "Retrying..." : "Try Again"}
                </button>

                {/* Tips Section */}
                <div className="mt-8 pt-8 border-t border-default-200">
                    <h2 className="text-sm font-semibold text-default-600 mb-4">{`While you're offline, you can:`}</h2>
                    <ul className="text-sm text-default-500 space-y-2">
                        <li>• View previously loaded content</li>
                        <li>• Use cached features</li>
                        <li>• Check your internet connection</li>
                        <li>• Try connecting to a different network</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OfflinePage;
