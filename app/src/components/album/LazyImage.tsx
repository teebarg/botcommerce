import { useState } from "react";
import { Image } from "@/components/ui/image";

export default function LazyImage({ src, alt, className = "", aspect = "4/5" }: { src: string; alt: string; className?: string; aspect?: string }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-secondary ${className}`} style={{ aspectRatio: aspect }}>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-background to-secondary" />}
            <Image
                src={src}
                alt={alt}
                loading="lazy"
                fittingType="fill"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
}
