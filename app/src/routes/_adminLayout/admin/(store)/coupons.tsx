import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { CreateCouponDialog } from "@/components/admin/coupons/create-coupon-dialog";
import { Separator } from "@/components/ui/separator";
import LocalizedClientLink from "@/components/ui/link";
import AnalyticsStats from "@/components/admin/coupons/analytics-stats";
import z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDeleteCoupon, useToggleCouponStatus } from "@/hooks/useCoupon";
import { SwipeableCouponCard } from "@/components/admin/coupons/swipeable-coupon-card";
import { couponsQuery } from "@/queries/admin.queries";
import { useInfiniteResource } from "@/hooks/useInfiniteResource";
import { Coupon, PaginatedCoupons } from "@/schemas";
import { InfiniteResourceList } from "@/components/InfiniteResourceList";
import { api } from "@/utils/api";
import AdminPageLoading from "@/components/admin/admin-loader";
import EmptyState from "@/components/generic/empty";

export const Route = createFileRoute("/_adminLayout/admin/(store)/coupons")({
    validateSearch: z.object({
        query: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ deps, context: { queryClient } }) => {
        queryClient.prefetchQuery(couponsQuery(deps));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const params = Route.useSearch();
    const { data: initialCoupons, isPending } = useQuery(couponsQuery(params));
    const toggleMutation = useToggleCouponStatus();
    const deleteMutation = useDeleteCoupon();

    const { items, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteResource<PaginatedCoupons, Coupon>({
        queryKey: ["coupons", "infinite", params],
        queryFn: (cursor) => api.get<PaginatedCoupons>("/coupon/", { params: { cursor, ...params } }),
        getItems: (page) => page.items,
        getNextCursor: (page) => page.next_cursor,
        initialData: initialCoupons,
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
                    <AdminPageLoading />
                ) : items.length > 0 ? (
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
                ) : (
                    <EmptyState title="No coupons found" description="No coupons created yet" />
                )}
            </div>
        </div>
    );
}
