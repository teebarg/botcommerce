import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import ImageDisplay from "@/components/image-display";
import { cn } from "@/utils";

interface ImageLightboxProps {
    url?: string;
    alt: string;
    className?: string;
    imgClassName?: string;
    disabled?: boolean;
}

export default function ImageLightbox({ url, alt, className, imgClassName, disabled = false }: ImageLightboxProps) {
    const [open, setOpen] = useState(false);

    const close = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault()
        setOpen(false)
    }, []);

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    if (disabled) return;
                    e.stopPropagation();
                    e.preventDefault()
                    setOpen(true);
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

            {open && !disabled &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
                        onClick={close}
                        role="dialog"
                        aria-modal="true"
                        aria-label={alt}
                    >
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <img
                            src={url || "/placeholder.jpg"}
                            alt={alt}
                            className="max-w-[92vw] max-h-[88vh] object-contain touch-pinch-zoom"
                        />
                    </div>,
                    document.body
                )}
        </>
    );
}