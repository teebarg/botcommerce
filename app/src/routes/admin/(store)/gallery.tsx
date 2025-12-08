import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LayoutDashboard, Loader, RectangleVertical } from "lucide-react";
import { GalleryCard } from "@/components/admin/product/product-gallery-card";
import { ProductBulkActions } from "@/components/admin/product/gallery-bulk-action";
import { GalleryImagesUpload } from "@/components/admin/product/gallery-images-upload";
import { useImageGalleryInfinite, useBulkDeleteGalleryImages, useReIndexGallery } from "@/hooks/useGallery";
import ComponentLoader from "@/components/component-loader";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { GalleryImageItem } from "@/schemas";
import { useWebSocket } from "pulsews";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getGalleryImagesFn } from "@/server/gallery.server";
import { InfiniteScroll } from "@/components/InfiniteScroll";

const galleryInfiniteQueryOptions = (limit: number) => ({
    queryKey: ["gallery", JSON.stringify({ limit })],
    queryFn: () => getGalleryImagesFn({ data: { limit } }),
});

export const Route = createFileRoute("/admin/(store)/gallery")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(galleryInfiniteQueryOptions(32));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: initialImages } = useSuspenseQuery(galleryInfiniteQueryOptions(32));
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const { data, isLoading: isImagesLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useImageGalleryInfinite(32, initialImages);
    const images = data?.pages?.flatMap((p: any) => p.images) || [];

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { lastMessage } = useWebSocket();
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
        if (!lastMessage) return;

        if (lastMessage?.type === "image_upload" && lastMessage?.status === "completed") {
            toast.success("Products uploaded successfully");
            setIsLoading(false);
        }

        if (lastMessage?.type === "image_upload" && lastMessage?.status === "processing" && !isLoading) {
            setIsLoading(true);
        }

        if (lastMessage?.type === "bulk_action" && lastMessage?.status === "completed") {
            setSelectedImages(new Set());
            setSelectionMode(false);
        }
    }, [lastMessage?.percent, lastMessage?.status]);

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
                <p className="text-sm text-muted-foreground">Manage your product images.</p>
            </div>
            <div className="mb-8 max-w-xl flex gap-2">
                <GalleryImagesUpload />
                <Button className="min-w-32" disabled={isReIndexing} isLoading={isReIndexing} variant="emerald" onClick={() => reIndexGallery()}>
                    Re-index
                </Button>
            </div>

            {isImagesLoading ? (
                <ComponentLoader />
            ) : images.length === 0 ? (
                <div className="text-center">No images found</div>
            ) : (
                <div>
                    <div className="lg:hidden mb-4 sticky top-16 z-40 bg-background -mx-4 px-4 py-4 flex gap-2">
                        <div className="rounded-full p-1 flex items-center gap-2 bg-secondary w-1/2">
                            <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "grid" && "bg-background")}>
                                <Button
                                    className="h-auto w-auto hover:bg-transparent"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <LayoutDashboard className="h-6 w-6" />
                                </Button>
                            </div>
                            <div className={cn("rounded-full flex flex-1 items-center justify-center py-2", viewMode === "list" && "bg-background")}>
                                <Button
                                    className="h-auto w-auto hover:bg-transparent"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setViewMode("list")}
                                >
                                    <RectangleVertical className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-1/2">
                            <Button
                                className="w-full rounded-full"
                                size="lg"
                                variant={selectionMode ? "destructive" : "default"}
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
                    {!isLoading && images.length > 0 && (
                        <InfiniteScroll
                            onLoadMore={fetchNextPage}
                            hasMore={!!hasNextPage}
                            isLoading={isFetchingNextPage}
                            loader={
                                <div className="flex flex-col items-center justify-center text-blue-600">
                                    <Loader className="h-8 w-8 animate-spin mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">Loading more products...</p>
                                </div>
                            }
                            endMessage={<div className="text-center py-8 text-muted-foreground">You've viewed all products</div>}
                        >
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
                        </InfiniteScroll>
                    )}
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
                </div>
            )}
        </div>
    );
}
