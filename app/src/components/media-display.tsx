import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
    url?: string;
    alt: string;
    className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ url, alt, className }) => {
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);

    const mediaUrl = url || "/placeholder.jpg";
    const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);
    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

    return (
        <>
            {isVideo ? (
                <video
                    className={cn(
                        "w-full h-full object-cover duration-700 group-hover:scale-105",
                        mediaLoaded ? "opacity-100" : "opacity-0",
                        className
                    )}
                    src={mediaUrl}
                    playsInline
                    preload="metadata"
                    loop={isMobile}
                    autoPlay={isMobile}
                    onLoadedData={() => setMediaLoaded(true)}
                    onMouseEnter={(e) => !isMobile && e.currentTarget.play()}
                    onMouseLeave={(e) => {
                        if (!isMobile) {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                        }
                    }}
                />
            ) : (
                <img
                    alt={alt}
                    className={cn(
                        "w-full h-full object-cover duration-700 group-hover:scale-105",
                        mediaLoaded ? "opacity-100" : "opacity-0",
                        className
                    )}
                    src={mediaUrl}
                    onLoad={() => setMediaLoaded(true)}
                    loading="lazy"
                />
            )}

            {!mediaLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        </>
    );
};

export default MediaDisplay;
