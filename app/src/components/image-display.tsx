import type React from "react";
import { useState } from "react";
import { cn } from "@/utils";

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
        <>
            {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full max-h-[400px] object-cover" />}
            <img
                alt={alt}
                className={cn("w-full h-full object-cover transition-opacity duration-500", mediaLoaded ? "opacity-100" : "opacity-0", className)}
                src={displayUrl}
                onLoad={() => setMediaLoaded(true)}
                loading="lazy"
                decoding="async"
                {...props}
            />
        </>
    );
};

export default ImageDisplay;
