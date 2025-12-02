import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
    url?: string;
    alt: string;
    className?: string;
    [key: string]: any;
}

const ImageDisplay: React.FC<MediaDisplayProps> = ({ url, alt, className, ...props }) => {
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);

    const mediaUrl = url || "/placeholder.jpg";
    const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);
    const displayUrl = isVideo ? mediaUrl.replace(".mp4", ".webp") : mediaUrl;

    return (
        <img
            alt={alt}
            className={cn("w-full h-full object-cover", mediaLoaded ? "opacity-100" : "opacity-0", className)}
            src={displayUrl}
            onLoad={() => setMediaLoaded(true)}
            loading="lazy"
            {...props}
        />
    );
};

export default ImageDisplay;
