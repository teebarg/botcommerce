import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";

interface MediaDisplayProps {
    url?: string;
    alt: string;
    className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ url, alt, className }) => {
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const mediaUrl = url || "/placeholder.jpg";
    const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setMediaLoaded(true);
        }
    }, [mediaUrl]);

    if (isVideo) {
        return (
            <video
                className={cn("w-full h-full object-cover duration-700", mediaLoaded ? "opacity-100" : "opacity-0", className)}
                src={mediaUrl}
                onLoadedData={() => setMediaLoaded(true)}
            />
        );
    }

    return (
        <>
            <img
                ref={imgRef}
                alt={alt}
                src={mediaUrl}
                onLoad={() => setMediaLoaded(true)}
                className={cn("w-full h-full object-cover duration-700", mediaLoaded ? "opacity-100" : "opacity-0", className)}
            />
            {!mediaLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        </>
    );
};

export default MediaDisplay;
