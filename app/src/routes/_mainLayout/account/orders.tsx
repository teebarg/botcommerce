import { ordersQueryOptions } from "@/hooks/useOrder";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Order } from "@/schemas";
import OrderCard from "@/components/store/orders/order-card";
import { BtnLink } from "@/components/ui/btnLink";

export const Route = createFileRoute("/_mainLayout/account/orders")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(ordersQueryOptions({ take: 20 }));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useSuspenseQuery(ordersQueryOptions({take: 20}));
    return (
        <div className="w-full px-2" data-testid="orders-page-wrapper">
            <div className="mb-8">
                <h1 className="text-2xl">Orders</h1>
                <p className="text-sm text-muted-foreground">
                    View your previous orders and their status. You can also create returns or exchanges for your orders if needed.
                </p>
            </div>
            <div>
                {data?.orders?.length ? (
                    <div className="flex flex-col gap-y-8 w-full">
                        {data.orders?.map((o: Order, idx: number) => (
                            <OrderCard key={idx} order={o} idx={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center" data-testid="no-orders-container">
                        <h2 className="text-lg">Nothing to see here</h2>
                        <p>You don&apos;t have any orders yet, let us change that {":)"}</p>
                        <div className="mt-8">
                            <BtnLink data-testid="continue-shopping-button" href="/collections">
                                Continue shopping
                            </BtnLink>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
