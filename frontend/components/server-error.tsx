"use client";

import React from "react";

import Reload from "./reload";

import { siteConfig } from "@/lib/config";

const ServerError = () => {
    return (
        <div className="flex items-center justify-center bg-content1 px-4 flex-1">
            <div className="max-w-lg w-full bg-content2 rounded-lg shadow-lg p-12 animate-fade-in">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 p-4 rounded-full">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-default-800 text-center mb-4">Oops! Something Went Wrong</h2>
                <p className="text-default-600 text-center mb-6">
                    {`We seem to be having some technical difficulties. Our team is working on it, but in the meantime, let's try that again!`}
                </p>

                <div className="flex justify-center">
                    <Reload />
                </div>

                {/* Optional Support Link */}
                <p className="mt-8 text-sm text-default-500 text-center">
                    If this issue persists, please contact our support team at{" "}
                    <a className="text-indigo-600 hover:text-indigo-500" href={`mailto:${siteConfig.contactEmail}`}>
                        {siteConfig.contactEmail}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ServerError;
