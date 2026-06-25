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
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/utils/api";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";

const galleryQuery = (params?: object) =>
    queryOptions({
        queryKey: ["gallery", params],
        queryFn: () => api.get<PaginatedProductImages>("/gallery/", { params: params as Record<string, unknown> }),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnMount: false,
    });

export const Route = createFileRoute("/_adminLayout/admin/(store)/gallery")({
    validateSearch: z.object({
        cursor: z.string().optional(),
        active: z.boolean().optional(),
        sort: z.enum(["newest", "oldest"]).default("newest"),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ context: { queryClient }, deps }) => {
        queryClient.prefetchQuery(galleryQuery(deps));
    },
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
        queryKey: ["gallery", "infinite", params],
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
        } finally {
            setSelectedImages(new Set());
        }
    };

    return (
        <div className="px-2 py-4">
            <div className="mb-8">
                <h3 className="text-lg font-semibold">Image Gallery</h3>
                <p className="text-sm text-muted-foreground">Manage your product images.</p>
            </div>
            <GalleryImagesUpload />
            <div>
                <div className="mb-4 sticky top-[calc(var(--sat)+4rem)] z-40 bg-background -mx-2 px-4 py-4 flex gap-2 justify-between">
                    <div className="rounded-full p-1 flex gap-2 bg-secondary w-1/2">
                        <div className={cn("rounded-full flex flex-1 justify-center", viewMode === "grid" && "bg-background")}>
                            <Button
                                className="h-auto w-auto hover:bg-transparent"
                                size="icon"
                                variant="ghost"
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutDashboard className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className={cn("rounded-full flex flex-1 justify-center", viewMode === "list" && "bg-background")}>
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
                    <div className="w-1/2">
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
                        loader={<PageLoader variant="grid" rows={4} className="max-w-7xl w-full mx-auto py-2" />}
                    />
                ) : (
                    <EmptyState title="No images found" description="Please upload images" />
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
        </div>
    );
}
