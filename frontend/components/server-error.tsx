"use client";

import { RefreshCcw } from "nui-react-icons";
import React from "react";
import { Button } from "./ui/button";
import { siteConfig } from "@/lib/config";

const ServerError = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-content1 px-4">
            <div className="max-w-lg w-full bg-content2 rounded-lg shadow-lg p-12 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-default-800 text-center mb-4">Oops! Something Went Wrong</h2>
                <p className="text-default-600 text-center mb-6">
                    {`We seem to be having some technical difficulties. Our team is working on it, but in the meantime, let's try that again!`}
                </p>

                <div className="flex justify-center">
                    <Button
                        onClick={handleRetry}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-0"
                        startContent={<RefreshCcw className="h-5 w-5" />}
                    >
                        Try Again
                    </Button>
                </div>

                {/* Optional Support Link */}
                <p className="mt-8 text-sm text-default-500 text-center">
                    If this issue persists, please contact our support team at{" "}
                    <a href={`mailto:${siteConfig.contactEmail}`} className="text-indigo-600 hover:text-indigo-500">
                        {siteConfig.contactEmail}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ServerError;
