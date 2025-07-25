"use client";

import React, { useState } from "react";

export const SocialShare = ({ title }: { title: string }) => {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareText = encodeURIComponent(`Check out this curated collection: ${title}`);
    const shareUrl = encodeURIComponent(url);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex gap-2 items-center mb-6">
            <span className="text-gray-500">Share:</span>
            <a
                className="text-blue-500 hover:underline"
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                Twitter
            </a>
            <a
                className="text-blue-700 hover:underline"
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                Facebook
            </a>
            <a
                className="text-green-600 hover:underline"
                href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                rel="noopener noreferrer"
                target="_blank"
            >
                WhatsApp
            </a>
            <button className="text-gray-700 hover:underline focus:outline-none" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
};
