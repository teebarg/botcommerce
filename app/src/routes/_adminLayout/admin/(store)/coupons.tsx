import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { CreateCouponDialog } from "@/components/admin/coupons/create-coupon-dialog";
import { Separator } from "@/components/ui/separator";
import LocalizedClientLink from "@/components/ui/link";
import AnalyticsStats from "@/components/admin/coupons/analytics-stats";
import z from "zod";
import { toast } from "sonner";
import { useDeleteCoupon, useToggleCouponStatus } from "@/hooks/useCoupon";
import { SwipeableCouponCard } from "@/components/admin/coupons/swipeable-coupon-card";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { Coupon, PaginatedCoupons } from "@/schemas";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { api } from "@/utils/api";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/(store)/coupons")({
    validateSearch: z.object({
        query: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const toggleMutation = useToggleCouponStatus();
    const deleteMutation = useDeleteCoupon();

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isPending} = useInfiniteResource<PaginatedCoupons, Coupon>({
        queryKey: ["coupons", params],
        queryFn: (cursor) => api.get<PaginatedCoupons>("/coupon/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
    });

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Copied!", {
            description: `Coupon code "${code}" copied to clipboard`,
        });
    };

    const toggleStatus = async (id: number) => {
        await toggleMutation.mutateAsync(id)
    };

    const handleDelete = async (id: number, code: string) => {
        const toastId = toast.loading("Deleting coupon...");
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Coupon deleted successfully", { id: toastId });
        } catch (error) { }
    };

    return (
        <div className="mx-auto max-w-5xl w-full py-4 px-2.5">
            <div className="flex md:flex-row flex-col md:items-center md:justify-between mb-6 gap-2">
                <div>
                    <h1 className="text-xl font-bold">Coupon Management</h1>
                    <p className="text-sm text-muted-foreground">Create, manage, and track your promotional coupons</p>
                </div>
                <div className="flex gap-2 mt-2">
                    <LocalizedClientLink
                        className="flex items-center gap-2 border border-input bg-background py-1 px-4 rounded-md"
                        href="/admin/coupons/analytics"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                    </LocalizedClientLink>
                    <CreateCouponDialog />
                </div>
            </div>
            <Separator className="mb-6" />
            <AnalyticsStats />
            <div className="space-y-4">
                {isPending ? (
                <PageLoader variant="card"  />
            ) : items?.length == 0 ? (
                <EmptyState title="No coupons found" description="No coupons created yet" />
            ) : (
                    <InfiniteResourceList
                        items={items}
                        onLoadMore={fetchNextPage}
                        hasMore={hasNextPage}
                        isLoading={isFetchingNextPage}
                        renderItem={(item: Coupon) => (
                            <SwipeableCouponCard
                                key={item.id}
                                coupon={item}
                                onCopy={handleCopy}
                                onDelete={handleDelete}
                                onToggleStatus={toggleStatus}
                            />
                        )}
                    />
                )}
            </div>
        </div>
    );
}
