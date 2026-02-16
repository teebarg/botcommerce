import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { CreateCouponDialog } from "@/components/admin/coupons/create-coupon-dialog";
import { Separator } from "@/components/ui/separator";
import LocalizedClientLink from "@/components/ui/link";
import AnalyticsStats from "@/components/admin/coupons/analytics-stats";
import { getCouponsFn } from "@/server/coupon.server";
import z from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteCoupon, useToggleCouponStatus } from "@/hooks/useCoupon";
import { SwipeableCouponCard } from "@/components/admin/coupons/swipeable-coupon-card";
import PaginationUI from "@/components/pagination";

const couponQueryOptions = (query?: string, isActive?: boolean, skip?: number) => ({
    queryKey: ["coupons", `${query}-${isActive}-${skip}`],
    queryFn: () => getCouponsFn({ data: { query, isActive, skip } }),
});

const couponSearchSchema = z.object({
    query: z.string().optional(),
    isActive: z.boolean().optional(),
    skip: z.number().optional(),
});

export const Route = createFileRoute("/admin/(store)/coupons")({
    validateSearch: couponSearchSchema,
    beforeLoad: ({ search }) => {
        return {
            search,
        };
    },
    loaderDeps: ({ search: { query, skip, isActive } }) => ({ query, skip, isActive }),
    loader: async ({ context: { queryClient, search } }) => {
        await queryClient.ensureQueryData(couponQueryOptions(search.query, search.isActive, search.skip));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { isActive, query, skip } = Route.useSearch();
    const { data } = useSuspenseQuery(couponQueryOptions(query, isActive, skip));
    const { coupons, ...pagination } = data;
    const toggleMutation = useToggleCouponStatus();
    const deleteMutation = useDeleteCoupon();

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Copied!", {
            description: `Coupon code "${code}" copied to clipboard`,
        });
    };

    const toggleStatus = async (id: number) => {
        try {
            await toggleMutation.mutateAsync(id);
            toast.success("Coupon status updated successfully");
        } catch (error) {}
    };

    const handleDelete = async (id: number, code: string) => {
        const toastId = toast.loading("Deleting coupon...");
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Coupon deleted successfully", { id: toastId });
        } catch (error) {}
    };
    return (
        <div className="mx-auto max-w-5xl py-8 px-4">
            <div className="flex md:flex-row flex-col md:items-center md:justify-between mb-6 gap-2">
                <div>
                    <h1 className="text-3xl font-bold">Coupon Management</h1>
                    <p className="text-muted-foreground mt-1">Create, manage, and track your promotional coupons</p>
                </div>
                <div className="flex gap-2">
                    <LocalizedClientLink
                        className="flex items-center gap-2 border border-input bg-background hover:bg-accent py-2 px-4 rounded-md"
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
                {coupons.map((coupon) => (
                    <SwipeableCouponCard key={coupon.id} coupon={coupon} onCopy={handleCopy} onDelete={handleDelete} onToggleStatus={toggleStatus} />
                ))}
                {coupons.length === 0 && (
                    <Card>
                        <CardContent className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">No coupons created yet</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            {pagination?.total_pages > 1 && <PaginationUI key="pagination" pagination={pagination} />}
        </div>
    );
}
