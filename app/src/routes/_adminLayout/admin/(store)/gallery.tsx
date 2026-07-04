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
import { GalleryQuerySchema, type PaginatedProductImages, type ProductImage } from "@/schemas";
import { useWebSocket } from "pulsews";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { api } from "@/utils/api";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";

export const Route = createFileRoute("/_adminLayout/admin/(store)/gallery")({
    validateSearch: GalleryQuerySchema,
    loaderDeps: ({ search }) => search,
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { lastMessage } = useWebSocket();
    const { mutateAsync: bulkDeleteImages, isPending: isDeleting } = useBulkDeleteGalleryImages();
    const BULK_ACTION_TOAST_ID = "bulk-action-toast";

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedProductImages, ProductImage>({
        queryKey: ["gallery", params],
        queryFn: (cursor) => api.get<PaginatedProductImages>("/gallery/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
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

        if (lastMessage.type === "image_upload") {
            if (lastMessage.status === "completed") {
                toast.success("Products uploaded successfully");
                setIsLoading(false);
            } else if (lastMessage.status === "processing" && !isLoading) {
                setIsLoading(true);
            }
        }

        if (lastMessage.type === "bulk_action") {
            if (lastMessage.status === "processing") {
                toast.loading("Processing...", { id: BULK_ACTION_TOAST_ID, description: "Bulk image deletion in progress." });
            }

            if (lastMessage.status === "completed") {
                toast.success("Requested Action Completed", {
                    id: BULK_ACTION_TOAST_ID,
                    description: "Data updated successfully"
                });

                setSelectionMode(false);
                setSelectedImages(new Set());
                setIsLoading(false);
            }
        }
    }, [lastMessage]);

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
            toast.error("Failed to delete images", { description: "Failed to delete images, contact support" });
        }
    };

    return (
        <div className="px-2 py-4">
            <GalleryImagesUpload />
            <div className="glass sticky top-[calc(var(--sat)+var(--admin-nav-height))] z-40 -mx-2 p-2 mb-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn("rounded-md", viewMode === "grid" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className={cn("rounded-md", viewMode === "list" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
                        onClick={() => setViewMode("list")}
                    >
                        <RectangleVertical className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {selectionMode && selectedImages.size > 0 && (
                        <span className="text-xs text-muted-foreground">{selectedImages.size} selected</span>
                    )}
                    <Button
                        size="sm"
                        variant={selectionMode ? "destructive" : "outline"}
                        onClick={() => {
                            setSelectionMode(!selectionMode);
                            if (selectionMode) setSelectedImages(new Set());
                        }}
                    >
                        {selectionMode ? "Cancel" : "Select"}
                    </Button>
                </div>
            </div>
            {isPending ? (
                <PageLoader variant="grid" />
            ) : items.length > 0 ? (
                <InfiniteResourceList
                    className={cn(
                        "mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2",
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
                    loader={<PageLoader variant="grid" />}
                />
            ) : (
                <EmptyState title="No images found" description="Please upload images or adjust your search filters." />
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
    );
}
