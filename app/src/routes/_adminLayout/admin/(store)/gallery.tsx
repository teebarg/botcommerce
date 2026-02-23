import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LayoutDashboard, RectangleVertical } from "lucide-react";
import { GalleryCard } from "@/components/admin/product/gallery-card";
import { ProductBulkActions } from "@/components/admin/product/gallery-bulk-action";
import { GalleryImagesUpload } from "@/components/admin/product/gallery-images-upload";
import { useBulkDeleteGalleryImages } from "@/hooks/useGallery";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import type { PaginatedProductImages, ProductImage } from "@/schemas";
import { useWebSocket } from "pulsews";
import { useSuspenseQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { galleryQuery } from "@/queries/admin.queries";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";

export const Route = createFileRoute("/_adminLayout/admin/(store)/gallery")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(galleryQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data } = useSuspenseQuery(galleryQuery());
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { lastMessage } = useWebSocket();
    const { mutateAsync: bulkDeleteImages, isPending: isDeleting } = useBulkDeleteGalleryImages();

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteResource<PaginatedProductImages, ProductImage>({
        queryKey: ["gallery", "infinite", params],
        queryFn: (cursor) => clientApi.get<PaginatedProductImages>("/gallery/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: data,
    });

    const selectedProductIds = useMemo(() => {
        const ids = new Set<number>();

        for (const img of items) {
            if (selectedImages.has(img?.id) && img.product_id) ids.add(img.product_id);
        }

        return Array.from(ids);
    }, [selectedImages, items]);

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
        <div className="px-2">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Image Gallery</h3>
                <p className="text-sm text-muted-foreground">Manage your product images.</p>
            </div>
            <GalleryImagesUpload />

            {items.length === 0 ? (
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
                    {items.length > 0 && (
                        <InfiniteResourceList
                            className={cn(
                                "mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4",
                                viewMode === "grid" ? "" : "grid-cols-1"
                            )}
                            items={items}
                            onLoadMore={fetchNextPage}
                            hasMore={hasNextPage}
                            isLoading={isFetchingNextPage}
                            renderItem={(item: ProductImage, idx: number) => (
                                <GalleryCard
                                    key={idx}
                                    image={item}
                                    isSelected={selectedImages.has(item?.id)}
                                    selectionMode={selectionMode}
                                    onSelectionChange={handleSelectionChange}
                                />
                            )}
                        />
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
