import { cn } from "@/utils/cn";
import { useState } from "react";

interface ProductImageProps {
    src?: string | null | undefined;
    alt: string;
    className?: string;
    sizes?: string;
    priority?: boolean;
}

export function ProductImage({ src, alt, className, sizes, priority = false }: ProductImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <div className={cn("relative overflow-hidden image-placeholder", className)}>
            {src && !failed ? (
                <img
                    src={src}
                    alt={alt}
                    sizes={sizes}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={priority ? "high" : "auto"}
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={cn("h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="eyebrow">No image</span>
                </div>
            )}
        </div>
    );
}
