"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { LayoutDashboard, RectangleVertical } from "lucide-react";

import { ImageUpload } from "./product-image-upload";
import { GalleryCard } from "./product-gallery-card";
import { ProductBulkActions } from "./gallery-bulk-action";

import { api } from "@/apis/client";
import { useImageGalleryInfinite, useBulkDeleteGalleryImages } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/providers/websocket";

interface ProductImage {
    id: string;
    file: File;
    url: string;
}

export function ProductImageGallery() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const { data, isLoading: isImagesLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useImageGalleryInfinite(20);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { currentMessage, messages } = useWebSocket();
    const { mutateAsync: bulkDeleteImages, isPending: isDeleting } = useBulkDeleteGalleryImages();

    useEffect(() => {
        if (!currentMessage) return;

        if (currentMessage?.type === "image_upload" && currentMessage?.status === "completed") {
            toast.success("Products uploaded successfully");
            setIsLoading(false);
        }

        if (currentMessage?.type === "image_upload" && currentMessage?.status === "processing" && !isLoading) {
            setIsLoading(true);
        }

        if (currentMessage?.type === "product_bulk_delete" && currentMessage?.status === "completed") {
            toast.success("Bulk delete completed", { id: "product_bulk_delete" });
            setSelectedImages(new Set());
            setSelectionMode(false);
        }

        if (currentMessage?.type === "product_bulk_delete" && currentMessage?.status === "processing") {
            toast.loading("Bulk delete in progress...", { id: "product_bulk_delete" });
        }

        if (currentMessage?.type === "product_bulk_delete" && currentMessage?.status === "failed") {
            toast.error(`Bulk delete failed: ${currentMessage.message}`, { id: "product_bulk_delete" });
        }

        if (currentMessage?.type === "product_bulk_update" && currentMessage?.status === "completed") {
            toast.success("Bulk update completed", { id: "bulk_update" });
            setSelectedImages(new Set());
            setSelectionMode(false);
        }

        if (currentMessage?.type === "product_bulk_update" && currentMessage?.status === "processing") {
            toast.loading("Bulk update in progress...", { id: "bulk_update" });
        }
    }, [currentMessage?.percent, currentMessage?.status, messages]);

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

    const handleSelectionChange = (imageId: number, selected: boolean) => {
        setSelectedImages((prev) => {
            const newSet = new Set(prev);

            if (selected) {
                newSet.add(imageId);
            } else {
                newSet.delete(imageId);
            }

            return newSet;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedImages.size === 0) return;

        try {
            await bulkDeleteImages({ imageIds: Array.from(selectedImages) });
        } catch (error) {
            toast.error("Failed to delete images", { description: "Failed to delete images" });
        }
    };

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

            toast.success("Images upload started");
        } catch (error: any) {
            toast.error(error?.message || "Failed to upload images");
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
                    <div className="lg:hidden mb-4 sticky top-16 z-50 bg-content2 -mx-4 px-4 py-4 flex gap-2">
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
                        <div className="flex items-center gap-2 w-1/2">
                            <Button
                                className="w-full rounded-full"
                                size="lg"
                                variant={selectionMode ? "destructive" : "outline"}
                                onClick={() => {
                                    setSelectionMode(!selectionMode);
                                    if (selectionMode) {
                                        setSelectedImages(new Set());
                                    }
                                }}
                            >
                                {selectionMode ? "Cancel Bulk" : "Select Bulk"}
                            </Button>
                        </div>
                    </div>
                    <div
                        className={cn(
                            "mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4",
                            viewMode === "grid" ? "" : "grid-cols-1"
                        )}
                    >
                        {data?.pages
                            ?.flatMap((p) => p.images)
                            .map((img: any, idx: number) => (
                                <GalleryCard
                                    key={`${img.id}-${idx}`}
                                    image={img}
                                    isSelected={selectedImages.has(img.id)}
                                    selectionMode={selectionMode}
                                    onSelectionChange={handleSelectionChange}
                                />
                            ))}
                    </div>
                    <ProductBulkActions
                        selectedCount={selectedImages.size}
                        selectedImageIds={Array.from(selectedImages)}
                        selectedProductIds={(() => {
                            const ids = new Set<number>();
                            const all = data?.pages?.flatMap((p) => p.images) || [];

                            for (const img of all) {
                                if (selectedImages.has(img.id) && img.product_id) ids.add(img.product_id);
                            }

                            return Array.from(ids);
                        })()}
                        onClearSelection={() => setSelectedImages(new Set())}
                        onDelete={handleBulkDelete}
                    />
                    <div ref={sentinelRef} />
                    {isFetchingNextPage && <ComponentLoader />}
                </div>
            )}
        </div>
    );
}
