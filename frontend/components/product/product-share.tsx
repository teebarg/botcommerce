"use client";

import { Facebook, Link2, Linkedin, Share2, Twitter } from "nui-react-icons";
import React from "react";

import { Separator } from "@/components/ui/separator";

interface ProductShareProps {
    name: string;
}

const ProductShare: React.FC<ProductShareProps> = ({ name }) => {
    const handleShare = (platform: string) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Check out this ${name}!`);

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
        };

        if (platform in shareUrls) {
            window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    return (
        <div className="relative group">
            <button className="p-2 rounded-full hover:bg-content1 transition-colors">
                <Share2 className="w-6 h-6 text-default-500" />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-content1 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="space-y-2">
                    <button
                        className="flex items-center w-full px-4 py-2 text-default-500 hover:bg-default-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleShare("facebook")}
                    >
                        <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                        <span>Facebook</span>
                    </button>

                    <button
                        className="flex items-center w-full px-4 py-2 text-default-500 hover:bg-default-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleShare("twitter")}
                    >
                        <Twitter className="w-5 h-5 mr-3 text-default-800" />
                        <span>Twitter</span>
                    </button>

                    <button
                        className="flex items-center w-full px-4 py-2 text-default-500 hover:bg-default-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleShare("linkedin")}
                    >
                        <Linkedin className="w-5 h-5 mr-3 text-blue-300" />
                        <span>LinkedIn</span>
                    </button>

                    <Separator />

                    <button className="flex items-center w-full px-4 py-2 text-default-500 cursor-pointer" onClick={copyToClipboard}>
                        <Link2 className="w-5 h-5 mr-3 text-default-500" />
                        <span>Copy Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductShare;
