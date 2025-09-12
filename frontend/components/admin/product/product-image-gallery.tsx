"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { LayoutDashboard, RectangleVertical } from "lucide-react";

import { ImageUpload } from "./product-image-upload";
import { GalleryCard } from "./product-gallery-card";

import { api } from "@/apis/client";
import { useImageGalleryInfinite } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import { useInvalidate } from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductImage {
    id: string;
    file: File;
    url: string;
}

export function ProductImageGallery() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const { data, isLoading: isImagesLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useImageGalleryInfinite(12);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const invalidate = useInvalidate();

    useEffect(() => {
        if (!sentinelRef.current) return;
        const el = sentinelRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];

                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { root: null, rootMargin: "200px", threshold: 0.1 }
        );

        observer.observe(el);

        return () => observer.unobserve(el);
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleImagesChange = async (images: ProductImage[]) => {
        setIsLoading(true);
        try {
            const fileToBase64 = (file: File) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve((reader.result as string).split(",")[1] || "");
                    reader.onerror = (e) => reject(e);
                    reader.readAsDataURL(file);
                });

            const imagesPayload = await Promise.all(
                (images || []).map(async (img: ProductImage) => ({
                    file: img.file ? await fileToBase64(img.file) : "",
                    file_name: img.file?.name || "image.jpg",
                    content_type: img.file?.type || "image/jpeg",
                }))
            );

            const payload: any = {
                images: imagesPayload.length ? imagesPayload : undefined,
            };

            await api.post("/product/images/upload", payload);
            invalidate("gallery");

            toast.success("Product created successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Image Gallery</h3>
                <p className="text-sm text-default-500">Manage your product images.</p>
            </div>
            <div className="mb-8 max-w-xl">
                <ImageUpload images={[]} isLoading={isLoading} showUploadArea={false} onImagesChange={handleImagesChange} />
            </div>

            {isImagesLoading ? (
                <ComponentLoader />
            ) : (
                <div>
                    <div className="lg:hidden mb-4 sticky top-16 z-50 bg-content2 -mx-4 px-4 py-4">
                        <div className="rounded-full p-1 flex items-center gap-2 bg-gray-300 dark:bg-content3 w-1/2">
                            <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "grid" && "bg-content1")}>
                                <Button size="iconOnly" onClick={() => setViewMode("grid")}>
                                    <LayoutDashboard className="h-6 w-6" />
                                </Button>
                            </div>
                            <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "list" && "bg-content1")}>
                                <Button size="iconOnly" onClick={() => setViewMode("list")}>
                                    <RectangleVertical className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4",
                            viewMode === "grid" ? "" : "grid-cols-1"
                        )}
                    >
                        {data?.pages?.flatMap((p) => p.images).map((img: any, idx: number) => <GalleryCard key={`${img.id}-${idx}`} image={img} />)}
                    </div>
                    <div ref={sentinelRef} />
                    {isFetchingNextPage && <ComponentLoader />}
                </div>
            )}
        </div>
    );
}
