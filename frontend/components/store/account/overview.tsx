"use client";

import { notFound } from "next/navigation";
import { currency } from "@lib/utils";
import { ChevronDown } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";

import PromotionalBanner from "@/components/promotion";
import { Order, User } from "@/schemas";
import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/lib/hooks/useOrder";
import Overlay from "@/components/overlay";
import OrderDetails from "@/components/store/orders/order-details";
import ComponentLoader from "@/components/component-loader";

const getProfileCompletion = (customer: Omit<User, "password_hash"> | null) => {
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
                    <div className="shadow-lg bg-content2 flex justify-between items-center p-4 rounded-lg cursor-pointer">
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

const OverviewTemplate: React.FC = () => {
    const { user, loading } = useAuth();
    const { data, isPending } = useOrders({});

    if (loading || isPending) {
        return <ComponentLoader className="h-192" />;
    }

    if (!user || !data?.orders) {
        notFound();
    }

    return (
        <div data-testid="overview-page-wrapper">
            <div>
                <PromotionalBanner
                    btnClass="text-purple-600"
                    outerClass="from-purple-500 via-pink-500 to-orange-400 mx-2 md:mx-auto max-w-8xl"
                    subtitle="Get up to 50% OFF on select products."
                    title="Big Sale on Top Brands!"
                />
                <div className="text-xl hidden md:flex justify-between items-center mt-4">
                    <span data-testid="welcome-message" data-value={user?.first_name}>
                        Hello {user?.first_name}
                    </span>
                    <span className="text-sm text-default-900">
                        Signed in as:{" "}
                        <span className="font-semibold" data-testid="customer-email" data-value={user?.email}>
                            {user?.email}
                        </span>
                    </span>
                </div>
                <div className="flex flex-col py-2 border-t border-gray-200 mt-2">
                    <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 max-w-xl">
                            <div className="flex flex-col bg-pink-100 dark:bg-pink-900 rounded-lg py-2 px-4 text-default-900 ">
                                <h3 className="font-semibold">Profile</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="customer-profile-completion" data-value={getProfileCompletion(user)}>
                                        {getProfileCompletion(user).toFixed(2)}%
                                    </span>
                                    <span className="uppercase">Completed</span>
                                </div>
                            </div>

                            <div className="flex flex-col bg-yellow-100 dark:bg-yellow-900 rounded-lg py-2 px-4 text-default-900">
                                <h3 className="font-semibold">Addresses</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="addresses-count" data-value={user?.addresses?.length || 0}>
                                        {user?.addresses?.length || 0}
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
                                {data?.orders.length > 0 ? (
                                    data.orders.slice(0, 5).map((order: Order, idx: number) => {
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
};

export default OverviewTemplate;
