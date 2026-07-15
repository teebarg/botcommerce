import { createLazyFileRoute } from "@tanstack/react-router";
import type { Order } from "@/schemas";
import OrderCard from "@/components/store/orders/order-card";
import { BtnLink } from "@/components/ui/btnLink";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";
import { useOrders } from "@/hooks/useOrder";

export const Route = createLazyFileRoute("/_mainLayout/account/orders")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, isPending } = useOrders({ take: 20 });
    return (
        <div className="w-full px-2 pt-6">
            <div className="mb-4">
                <h1 className="text-xl">Orders</h1>
                <p className="text-sm text-muted-foreground">
                    View your previous orders and their status.
                </p>
            </div>
            <div>
                {isPending ? (
                    <PageLoader variant="list" />
                    ) : data?.items?.length == 0 ? (
                        <EmptyState
                            title="Nothing to see here"
                            description={`You don&apos;t have any orders yet, let us change that`}
                            action={
                                <BtnLink href="/collections">
                                    Continue shopping
                                </BtnLink>
                            }
                        />
                    ) : (
                        <div className="flex flex-col gap-y-2">
                            {data?.items?.map((o: Order, idx: number) => (
                                <OrderCard key={idx} order={o} />
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}
