import { useCallback, useState } from "react";
import { Image } from "@/components/ui/image";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    aspect?: string;
    priority?: boolean;
    /** Passed to <img sizes>; only used when responsive images are enabled (see ui/image). */
    sizes?: string;
}

export default function LazyImage({
    src,
    alt,
    className = "",
    aspect = "4/5",
    priority = false,
    sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: LazyImageProps) {
    const [loaded, setLoaded] = useState(false);

    const attach = useCallback((node: HTMLImageElement | null) => {
        if (node?.complete && node.naturalWidth > 0) setLoaded(true);
    }, []);

    return (
        <div className={`relative overflow-hidden bg-secondary ${className}`} style={{ aspectRatio: aspect }}>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-background to-secondary" />}
            <Image
                ref={attach}
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                sizes={sizes}
                fittingType="fill"
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
        </div>
    );
}
