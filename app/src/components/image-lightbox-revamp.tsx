"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { useOverlayTriggerState } from "react-stately";
import { ConfirmDrawer } from "./generic/confirm-drawer";

function openGemini(imageUrl: string, productId: number) {
    const params = new URLSearchParams({
        prompt:
            "Convert this mannequin image into a real human model. Keep the clothes identical and completely unchanged",
        admin_image_url: imageUrl,
        product_id: productId.toString()
    });

    const url = `https://gemini.google.com/app?${params.toString()}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

interface Image {
    id: number;
    image: string;
    order?: number;
}

interface ImageLightboxProps {
    images: Image[];
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRemoveImage?: (id: number) => void;
    size?: string | null;
    productId?: number;
    defaultImage?: string;
}

export function ImageLightbox({
    images,
    initialIndex = 0,
    open,
    onOpenChange,
    onRemoveImage,
    size,
    productId,
    defaultImage
}: ImageLightboxProps) {
    const state = useOverlayTriggerState({});
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const shouldShow = open && images.length > 0;

    React.useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    React.useEffect(() => {
        if (!shouldShow) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onOpenChange(false);
            } else if (e.key === "ArrowLeft") {
                setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shouldShow, images.length, onOpenChange]);

    React.useEffect(() => {
        if (shouldShow) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [shouldShow]);

    const goToPrevious = React.useCallback(() => {
        setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    }, [images.length]);

    const goToNext = React.useCallback(() => {
        setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    }, [images.length]);

    if (!shouldShow) return null;
    const safeIndex = Math.min(currentIndex, images.length - 1);
    const currentImage = images[safeIndex];

    if (!currentImage) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
        >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="text-sm font-medium text-white/80">
                    {safeIndex + 1} / {images.length}
                </div>
                <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close lightbox"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-12">
                <button
                    onClick={goToPrevious}
                    className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 sm:left-4 sm:p-3"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>

                <div className="relative flex h-full max-h-[calc(100vh-12rem)] w-full max-w-5xl items-center justify-center">
                    <img
                        src={currentImage.image}
                        alt={currentImage.image}
                        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                        loading="eager"
                        onClick={() => onOpenChange(false)}
                    />
                </div>

                <button
                    onClick={goToNext}
                    className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 sm:right-4 sm:p-3"
                    aria-label="Next image"
                >
                    <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
            </div>

            {size && (
                <div className="absolute top-14 left-4 bg-white text-black px-3 py-1">
                    <span className="text-lg font-medium">
                        Size: {size}
                    </span>
                </div>
            )}

            {productId && defaultImage && (
                <div className="absolute top-4 right-16">
                    <Button
                        size="xs"
                        onClick={() => openGemini(defaultImage, productId)}
                    >
                        Open Gemini
                    </Button>
                </div>
            )}

            {/* Thumbnail strip */}
            <div className="border-t border-white/10 bg-black/60 px-4 py-4">
                <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto p-2">
                    {images.map((image, index) => (
                        <div
                            key={`${image}-${index}`}
                            className={cn(
                                "group/thumb relative shrink-0 overflow-hidden rounded-md transition-all",
                                index === safeIndex
                                    ? "ring-2 ring-white/80"
                                    : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <button
                                onClick={() => setCurrentIndex(index)}
                                className="block focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label={`Go to image ${index + 1}`}
                                aria-current={index === safeIndex ? "true" : undefined}
                            >
                                <img
                                    src={image.image}
                                    alt={image.image}
                                    className="h-26 w-20 object-cover"
                                    loading="lazy"
                                />
                            </button>
                            {onRemoveImage && (
                                <ConfirmDrawer
                                    open={state.isOpen}
                                    onOpenChange={state.setOpen}
                                    trigger={
                                        <button
                                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white/80 opacity-0 transition-opacity hover:bg-black/90 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 group-hover/thumb:opacity-100"
                                            aria-label={`Remove image ${index + 1}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    }
                                    onConfirm={() => {
                                        onRemoveImage(image.id);
                                        setCurrentIndex((i) =>
                                            index < i ? i - 1 : Math.min(i, images.length - 2)
                                        );
                                        state.close()
                                    }}
                                    title="Delete Image?"
                                    description="This action cannot be reversed"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="absolute inset-0 -z-10"
                onClick={() => onOpenChange(false)}
                aria-hidden="true"
            />
        </div>
    );
}

export function useLightbox() {
    const [open, setOpen] = React.useState(false);

    return { open, setOpen };
}
