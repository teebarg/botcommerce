import React, { useState } from "react";
import { cn } from "@/utils";

interface MediaDisplayProps {
    url?: string;
    alt: string;
    className?: string;
}

const ImageDisplay: React.FC<MediaDisplayProps> = ({ url, alt, className }) => {
    const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
    const mediaUrl = url || "/placeholder.jpg";

    const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);
    const displayUrl = isVideo ? mediaUrl.replace(/\.(mp4|webm|mov)$/i, ".webp") : mediaUrl;

    return (
        <div className="relative w-full h-full overflow-hidden bg-muted">
            {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}

            <img
                alt={alt}
                src={displayUrl}
                onLoad={() => setMediaLoaded(true)}
                loading="lazy"
                decoding="async"
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    mediaLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
            />
        </div>
    );
};

export default React.memo(ImageDisplay);
