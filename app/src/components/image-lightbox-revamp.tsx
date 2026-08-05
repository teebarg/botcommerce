"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ImageLite } from "@/schemas";
import { Link } from "@tanstack/react-router";

export interface GalleryImage {
    src: string;
    alt: string;
    caption?: string;
}

interface ImageLightboxProps {
    images: ImageLite[];
    initialIndex: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    size?: string | null;
}

export function ImageLightbox({
    images,
    initialIndex,
    open,
    onOpenChange,
    size,
}: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    React.useEffect(() => {
        if (!open) return;

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
    }, [open, images.length, onOpenChange]);

    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const goToPrevious = React.useCallback(() => {
        setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    }, [images.length]);

    const goToNext = React.useCallback(() => {
        setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    }, [images.length]);

    if (!open || images.length === 0) return null;

    const currentImage = images[currentIndex];

    if (!currentImage) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="text-sm font-medium text-white/80">
                    {currentIndex + 1} / {images.length}
                </div>
                <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close lightbox"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Main stage */}
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
                <div className="absolute top-12 left-8 bg-white text-black px-3 py-1">
                    <span className="text-lg font-medium">
                        Size: {size}
                    </span>
                </div>
            )}

            <div className="absolute top-8 right-4">
                <Link to="/about" target="_blank"  className="bg-primary text-popover-foreground p-2 rounded-md test-xs" rel="noreferrer">Model Image</Link>
            </div>

            {/* Caption */}
            {/* {currentImage.caption && (
                <div className="px-4 py-2 text-center text-sm text-white/70 sm:text-base">
                    {currentImage.caption}
                </div>
            )} */}

            {/* Thumbnail strip */}
            <div className="border-t border-white/10 bg-black/60 px-4 py-4">
                <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-2 sm:gap-3">
                    {images.map((image, index) => (
                        <button
                            key={`${image.image}-${index}`}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative shrink-0 overflow-hidden rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-white/50",
                                index === currentIndex
                                    ? "ring-2 ring-white/80"
                                    : "opacity-60 hover:opacity-100"
                            )}
                            aria-label={`Go to image ${index + 1}`}
                            aria-current={index === currentIndex ? "true" : undefined}
                        >
                            <img
                                src={image.image}
                                alt={image.image}
                                width={96}
                                height={64}
                                className="h-14 w-20 object-cover sm:h-16 sm:w-24"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Click backdrop to close */}
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
    const [initialIndex, setInitialIndex] = React.useState(0);

    const openAt = React.useCallback((index: number) => {
        setInitialIndex(index);
        setOpen(true);
    }, []);

    return { open, setOpen, initialIndex, openAt };
}
