import { Metadata } from "next";
import { listCustomerOrders } from "@lib/data";
import { notFound } from "next/navigation";
import { Order } from "types/global";
import { currency } from "@lib/util/util";
import { ChevronDown } from "nui-react-icons";

import PromotionalBanner from "@/components/promotion";
import LocalizedClientLink from "@/components/ui/link";
import { api } from "@/api";
import { User } from "@/lib/models";

export const metadata: Metadata = {
    title: "Account",
    description: "Overview of your account activity.",
};

const getProfileCompletion = (customer: Omit<User, "password_hash"> | null) => {
    let count = 0;

    if (!customer) {
        return 0;
    }

    if (customer.email) {
        count++;
    }

    if (customer.firstname && customer.lastname) {
        count++;
    }

    if (customer.phone) {
        count++;
    }

    if (customer.billing_addresses) {
        count++;
    }

    return (count / 4) * 100;
};

export default async function OverviewTemplate() {
    const customer = await api.user.me();
    const { orders } = await listCustomerOrders();

    if (!customer) {
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
                    <span data-testid="welcome-message" data-value={customer?.firstname}>
                        Hello {customer?.firstname}
                    </span>
                    <span className="text-sm text-default-900">
                        Signed in as:{" "}
                        <span className="font-semibold" data-testid="customer-email" data-value={customer?.email}>
                            {customer?.email}
                        </span>
                    </span>
                </div>
                <div className="flex flex-col py-2 border-t border-gray-200 mt-2">
                    <div className="flex flex-col gap-y-4 h-full col-span-1 row-span-2 flex-1">
                        <div className="grid grid-cols-2 gap-x-2 max-w-xl">
                            <div className="flex flex-col bg-pink-100 rounded-lg py-2 px-4 text-gray-800 ">
                                <h3 className="font-semibold">Profile</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="customer-profile-completion" data-value={getProfileCompletion(customer)}>
                                        {getProfileCompletion(customer)}%
                                    </span>
                                    <span className="uppercase">Completed</span>
                                </div>
                            </div>

                            <div className="flex flex-col bg-yellow-100 rounded-lg py-2 px-4 text-gray-800">
                                <h3 className="font-semibold">Addresses</h3>
                                <div className="flex items-center gap-x-2">
                                    <span data-testid="addresses-count" data-value={customer?.shipping_addresses?.length || 0}>
                                        {customer?.shipping_addresses?.length || 0}
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
                                {orders && orders.length > 0 ? (
                                    orders.slice(0, 5).map((order: Order) => {
                                        return (
                                            <li key={order.order_id} data-testid="order-wrapper" data-value={order.order_id}>
                                                <LocalizedClientLink href={`/account/orders/details/${order.order_id}`}>
                                                    <div className="shadow-lg bg-default-100 flex justify-between items-center p-4">
                                                        <div className="grid grid-cols-3 grid-rows-2 text-sm gap-x-4 flex-1">
                                                            <span className="font-semibold">Date placed</span>
                                                            <span className="font-semibold">Order number</span>
                                                            <span className="font-semibold">Total amount</span>
                                                            <span data-testid="order-created-date">{new Date(order.created_at).toDateString()}</span>
                                                            <span data-testid="order-id" data-value={order.order_id}>
                                                                #{order.order_id}
                                                            </span>
                                                            <span data-testid="order-amount">{currency(order.total)}</span>
                                                        </div>
                                                        <button
                                                            aria-label="open"
                                                            className="flex items-center justify-between"
                                                            data-testid="open-order-button"
                                                        >
                                                            <ChevronDown className="-rotate-90" />
                                                        </button>
                                                    </div>
                                                </LocalizedClientLink>
                                            </li>
                                        );
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
