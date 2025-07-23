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
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                Twitter
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
            >
                Facebook
            </a>
            <a
                href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
            >
                WhatsApp
            </a>
            <button onClick={handleCopy} className="text-gray-700 hover:underline focus:outline-none">
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}
