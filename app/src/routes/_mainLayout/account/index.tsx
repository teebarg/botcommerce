import { createFileRoute } from "@tanstack/react-router";
import { ordersQueryOptions } from "@/hooks/useOrder";
import PromotionalBanner from "@/components/promotion";
import { currency } from "@/utils";
import { ChevronDown } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import type { Order, Session } from "@/schemas";
import Overlay from "@/components/overlay";
import OrderDetails from "@/components/store/orders/order-details";
import { useSuspenseQuery } from "@tanstack/react-query";

const getProfileCompletion = (customer: Omit<Session, "password_hash"> | null) => {
    let count = 0;

    if (!customer) {
        return 0;
    }

    if (customer.email) {
        count++;
    }

    if (customer.first_name && customer.last_name) {
        count++;
    }

    if (customer.addresses?.length) {
        count++;
    }

    return (count / 3) * 100;
};

const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
    const state = useOverlayTriggerState({});

    return (
        <li>
            <Overlay
                open={state.isOpen}
                sheetClassName="min-w-[70vw]"
                trigger={
                    <div className="shadow-lg flex justify-between items-center p-4 rounded-lg cursor-pointer">
                        <div className="grid grid-cols-3 grid-rows-2 text-sm gap-x-4 flex-1">
                            <span className="font-semibold">Date placed</span>
                            <span className="font-semibold">Order number</span>
                            <span className="font-semibold">Total amount</span>
                            <span data-testid="order-created-date">{new Date(order.created_at).toDateString()}</span>
                            <span data-testid="order-id" data-value={order.order_number}>
                                #{order.order_number}
                            </span>
                            <span data-testid="order-amount">{currency(order.total)}</span>
                        </div>
                        <button aria-label="open" className="flex items-center justify-between" data-testid="open-order-button">
                            <ChevronDown className="-rotate-90" />
                        </button>
                    </div>
                }
                onOpenChange={state.setOpen}
            >
                <OrderDetails order={order} onBack={state.close} />
            </Overlay>
        </li>
    );
};

export const Route = createFileRoute("/_mainLayout/account/")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(ordersQueryOptions({}));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { session } = Route.useRouteContext();
    const { data } = useSuspenseQuery(ordersQueryOptions({}));

    return (
        <div className="px-2 md:px-0" data-testid="overview-page-wrapper">
            <div>
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 md:mx-auto max-w-8xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
                <div className="text-xl hidden md:flex justify-between items-center mt-4">
                    <span data-testid="welcome-message" data-value={session?.user?.first_name}>
                        Hello {session?.user?.first_name}
                    </span>
                    <span className="text-sm text-foreground">
                        Signed in as:{" "}
                        <span className="font-semibold" data-testid="customer-email" data-value={session?.user?.email}>
                            {session?.user?.email}
                        </span>
                    </span>
                </div>
                <div className="flex flex-col py-2 border-t border-gray-200 mt-2">
                    <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 max-w-xl">
                            <div className="flex flex-col bg-pink-100 dark:bg-pink-900 rounded-lg py-2 px-4">
                                <h3 className="font-semibold">Profile</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="customer-profile-completion" data-value={getProfileCompletion(session?.user!)}>
                                        {getProfileCompletion(session?.user!).toFixed(2)}%
                                    </span>
                                    <span className="uppercase">Completed</span>
                                </div>
                            </div>

                            <div className="flex flex-col bg-yellow-100 dark:bg-yellow-900 rounded-lg py-2 px-4">
                                <h3 className="font-semibold">Addresses</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="addresses-count" data-value={session?.user?.addresses?.length || 0}>
                                        {session?.user?.addresses?.length || 0}
                                    </span>
                                    <span className="uppercase">Saved</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex flex-col gap-y-4 mt-4">
                            <div className="flex items-center gap-x-2">
                                <h3 className="text-lg">Recent orders</h3>
                            </div>
                            <ul className="flex flex-col gap-y-4" data-testid="orders-wrapper">
                                {data?.orders && data?.orders?.length > 0 ? (
                                    data?.orders.slice(0, 5)?.map((order: Order, idx: number) => {
                                        return <OrderItem key={idx} data-testid="order-wrapper" data-value={order.order_number} order={order} />;
                                    })
                                ) : (
                                    <span data-testid="no-orders-message">No recent orders</span>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
