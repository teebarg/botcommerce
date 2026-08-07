"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryThumbnail } from "./image-thumbnail";
import { ProductImageUploader } from "./admin/product/product-image-uploader";
import { cn } from "@/utils/cn";

function openGemini(imageUrl: string, productId: number) {
    const params = new URLSearchParams({
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
    defaultImage?: Image;
    isAdmin?: boolean;
}

export function ImageLightbox({
    images,
    initialIndex = 0,
    open,
    onOpenChange,
    onRemoveImage,
    size,
    productId,
    defaultImage,
    isAdmin = false
}: ImageLightboxProps) {
    const [mediaLoaded, setMediaLoaded] = React.useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const shouldShow = open;

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
    const currentImage = images[safeIndex] || defaultImage;

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
                    {!mediaLoaded && <img src="/placeholder.jpg" alt="placeholder" className="absolute inset-0 w-full h-full object-cover" />}
                    <img
                        onLoad={() => setMediaLoaded(true)}
                        src={currentImage.image}
                        alt={currentImage.image}
                        className={cn(
                            "w-full h-full object-cover transition-opacity duration-500",
                            mediaLoaded ? "opacity-100" : "opacity-0",
                        )}
                        loading="eager"
                        decoding="async"
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

            {productId && defaultImage?.image && (
                <div className="absolute top-4 right-16">
                    <Button
                        size="xs"
                        onClick={() => openGemini(defaultImage.image, productId)}
                    >
                        Open Gemini
                    </Button>
                </div>
            )}

            <div className="border-t border-white/10 bg-black/60 px-4 py-4 space-y-2">
                <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto p-2">
                    {images.map((image, index) => (
                        <GalleryThumbnail
                            key={image.id}
                            image={image}
                            images={images}
                            index={index}
                            productId={productId}
                            isActive={index === safeIndex}
                            onSelect={() => setCurrentIndex(index)}
                            onRemoveImage={onRemoveImage}
                        />
                    ))}
                </div>
                {isAdmin && (
                    <ProductImageUploader productId={productId} />
                )}
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
