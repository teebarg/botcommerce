"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

import { GalleryCard } from "./product-gallery-card";
import { ProductBulkActions } from "./gallery-bulk-action";
import { GalleryImagesUpload } from "./gallery-images-upload";

import { useImageGalleryInfinite, useBulkDeleteGalleryImages, useReIndexGallery } from "@/lib/hooks/useGallery";
import ComponentLoader from "@/components/component-loader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/providers/websocket";
import { GalleryImageItem } from "@/schemas";
import MobileFilterControl from "@/components/store/shared/mobile-filter-control";

export function ProductImageGallery() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const { data, isLoading: isImagesLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useImageGalleryInfinite(32);
    const images = data?.pages?.flatMap((p: any) => p.images) || [];

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { currentMessage, messages } = useWebSocket();
    const { mutateAsync: bulkDeleteImages, isPending: isDeleting } = useBulkDeleteGalleryImages();
    const { mutateAsync: reIndexGallery, isPending: isReIndexing } = useReIndexGallery();

    const selectedProductIds = useMemo(() => {
        const ids = new Set<number>();

        for (const img of images) {
            if (selectedImages.has(img.id) && img.product_id) ids.add(img.product_id);
        }

        return Array.from(ids);
    }, [selectedImages, images]);

    useEffect(() => {
        if (!currentMessage) return;

        if (currentMessage?.type === "image_upload" && currentMessage?.status === "completed") {
            toast.success("Products uploaded successfully");
            setIsLoading(false);
        }

        if (currentMessage?.type === "image_upload" && currentMessage?.status === "processing" && !isLoading) {
            setIsLoading(true);
        }

        if (currentMessage?.type === "bulk_action" && currentMessage?.status === "completed") {
            setSelectedImages(new Set());
            setSelectionMode(false);
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

    return (
        <div className="px-4 py-8">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Image Gallery</h3>
                <p className="text-sm text-default-500">Manage your product images.</p>
            </div>
            <div className="mb-4 max-w-xl flex gap-2">
                <GalleryImagesUpload />
                <Button className="min-w-32" disabled={isReIndexing} isLoading={isReIndexing} variant="emerald" onClick={() => reIndexGallery()}>
                    Re-index
                </Button>
            </div>

            {isImagesLoading ? (
                <ComponentLoader />
            ) : (
                <div>
                    <div className="lg:hidden mb-4 sticky top-12 z-40 bg-content2 py-4 -px-2">
                        {/* <div className="flex gap-2">
                            <div className="rounded-full p-1 flex items-center gap-2 bg-gray-300 dark:bg-content3 w-1/2">
                                <div
                                    className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "grid" && "bg-content1")}
                                >
                                    <Button size="iconOnly" onClick={() => setViewMode("grid")}>
                                        <LayoutDashboard className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div
                                    className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "list" && "bg-content1")}
                                >
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
                        </div> */}
                        <MobileFilterControl setViewMode={setViewMode} viewMode={viewMode} />
                        <Button
                            className="rounded-full ml-3 -mt-8"
                            size="lg"
                            variant={selectionMode ? "destructive" : "indigo"}
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
                    <div
                        className={cn(
                            "mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4",
                            viewMode === "grid" ? "" : "grid-cols-1"
                        )}
                    >
                        {images.map((img: GalleryImageItem, idx: number) => (
                            <GalleryCard
                                key={idx}
                                image={img}
                                isSelected={selectedImages.has(img.id)}
                                selectionMode={selectionMode}
                                onSelectionChange={handleSelectionChange}
                            />
                        ))}
                    </div>
                    {selectedImages.size > 0 && (
                        <ProductBulkActions
                            isLoading={isDeleting}
                            selectedCount={selectedImages.size}
                            selectedImageIds={Array.from(selectedImages)}
                            selectedProductIds={selectedProductIds}
                            onClearSelection={() => setSelectedImages(new Set())}
                            onDelete={handleBulkDelete}
                        />
                    )}
                    <div ref={sentinelRef} />
                    {isFetchingNextPage && <ComponentLoader />}
                </div>
            )}
        </div>
    );
}
