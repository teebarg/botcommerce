import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ImageDisplay from "@/components/image-display";
import { cn } from "@/utils";
import { useLightbox } from "@/providers/lightbox-provider";

interface ImageLightboxProps {
    url: string;
    alt: string;
    className?: string;
    imgClassName?: string;
    disabled?: boolean;
}

export default function ImageLightboxRevamped({ url, alt, className, imgClassName, disabled = false }: ImageLightboxProps) {
    const { open } = useLightbox();

    return (
        <button
            type="button"
            onClick={(e) => {
                if (disabled) return;
                e.preventDefault();
                e.stopPropagation();
                open(url, alt);
            }}
            className={cn(
                "relative block w-full h-full",
                disabled ? "cursor-pointer" : "cursor-zoom-in",
                className
            )}
            aria-label={`Enlarge image: ${alt}`}
        >
            <ImageDisplay url={url} alt={alt} className={imgClassName} />
        </button>
    );
}