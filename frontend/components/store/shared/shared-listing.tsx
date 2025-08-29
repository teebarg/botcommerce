"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const SocialShare = ({ title, view_count }: { title: string; view_count: number }) => {
    const { data: session } = useSession();
    const [copied, setCopied] = useState<boolean>(false);
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const shareText = encodeURIComponent(`Check out this curated collection: ${title}`);
    const shareUrl = encodeURIComponent(url);

    const handleCopy = async () => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!session?.user.isAdmin) return null;

    return (
        <div>
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
            <div className="mb-6 text-sm text-default-400">Curated list • {view_count} views</div>
        </div>
    );
};
