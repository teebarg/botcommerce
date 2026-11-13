import { ProductBulkActions } from "@/components/admin/product/gallery-bulk-action";
import { GalleryCard } from "@/components/admin/product/gallery-card";
import { GalleryImagesUpload } from "@/components/admin/product/gallery-images-upload";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";
import { ImageLightbox, useLightbox } from "@/components/image-lightbox-revamp";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { Button } from "@/components/ui/button";
import { useBulkDeleteGalleryImages } from "@/hooks/useGallery";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { type GalleryImage, PaginatedGalleryImages } from "@/schemas";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";
import { createLazyFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, RectangleVertical } from "lucide-react";
import { useWebSocketMessage } from "pulsews";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/_auth/_adminLayout/admin/(store)/gallery")({
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { open, setOpen } = useLightbox();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { mutateAsync: bulkDeleteImages, isPending: isDeleting } = useBulkDeleteGalleryImages();
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const BULK_ACTION_TOAST_ID = "bulk-action-toast";

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = useInfiniteResource<PaginatedGalleryImages, GalleryImage>({
        queryKey: ["gallery", params],
        queryFn: (cursor) => api.get<PaginatedGalleryImages>("/gallery/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    const selectedImage = useMemo(
        () => (selectedImageId != null ? items.find((img) => img.id === selectedImageId) ?? null : null),
        [items, selectedImageId]
    );

    const selectedProductIds = useMemo(() => {
        const ids = new Set<number>();

        for (const img of items) {
            if (selectedImages.has(img?.id) && img.product_id) ids.add(img.product_id);
        }

        return Array.from(ids);
    }, [selectedImages, items]);

    useWebSocketMessage((msg) => {
        if (msg.type === "image_upload") {
            if (msg.status === "completed") {
                toast.success("Products uploaded");
                setIsLoading(false);
            } else if (msg.status === "processing" && !isLoading) {
                setIsLoading(true);
            }
        }

        if (msg.type === "bulk_action") {
            if (msg.status === "processing") {
                toast.loading("Processing...", { id: BULK_ACTION_TOAST_ID, description: "Bulk image deletion in progress." });
            }

            if (msg.status === "completed" || msg.status === "partial") {
                if (msg.status === "completed") {
                    toast.success("Bulk update completed", { id: BULK_ACTION_TOAST_ID, description: "Selected products were updated." });
                } else {
                    toast.error("Bulk update partially completed", {
                        id: BULK_ACTION_TOAST_ID,
                        description: `${msg.failed_ids?.length ?? 0} selected images had update errors. Check the server logs before retrying.`,
                    });
                }
                setSelectionMode(false);
                setSelectedImages(new Set());
                setIsLoading(false);
            }
        }
    });

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

    const handleClick = (id: number) => {
        setSelectedImageId(id);
        setOpen(true);
    };

    const handleBulkDelete = async () => {
        if (selectedImages.size === 0) return;
        await bulkDeleteImages({ imageIds: Array.from(selectedImages) });
    };

    const handleDelete = async (id: number) => {
        try {
            await bulkDeleteImages({ imageIds: [id] });
        } catch (error) {
            toast.error("Failed to delete images", { description: "Failed to delete images, contact support" });
        }
    };

    return (
        <div className="py-2">
            <GalleryImagesUpload />
            <div className="glass sticky top-[var(--admin-nav-height)] z-40 p-2 flex items-center justify-between border-b border-border">
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
                    className={cn("space-y-0 mb-8 w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", viewMode === "grid" ? "" : "grid-cols-1")}
                    items={items}
                    onLoadMore={fetchNextPage}
                    hasMore={hasNextPage}
                    isLoading={isFetchingNextPage}
                    renderItem={(item: GalleryImage, idx: number) => (
                        <GalleryCard
                            key={idx}
                            image={item}
                            isSelected={selectedImages.has(item?.id)}
                            selectionMode={selectionMode}
                            onSelectionChange={handleSelectionChange}
                            onClick={handleClick}
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
                    selectedProducts={Array.from(
                        new Map(
                            items
                                .filter((img) => selectedImages.has(img.id) && img.product_id)
                                .map((img) => [
                                    img.product_id!,
                                    {
                                        id: img.product_id!,
                                        name: img.product?.name || `Product #${img.product_id}`,
                                        imageId: img.id,
                                        options: img.product?.options ?? [],
                                        variants: img.product?.variants ?? [],
                                    },
                                ])
                        ).values()
                    )}
                    onClearSelection={() => setSelectedImages(new Set())}
                    onDelete={handleBulkDelete}
                />
            )}
            <ImageLightbox
                images={selectedImage?.images || []}
                open={open}
                onOpenChange={setOpen}
                onRemoveImage={handleDelete}
                productId={selectedImage?.product_id}
                defaultImage={selectedImage || undefined}
                isAdmin={true}
            />
        </div>
    );
}
