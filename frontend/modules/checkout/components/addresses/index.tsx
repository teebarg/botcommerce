"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pencil } from "nui-react-icons";

import ShippingAddress from "../shipping-address";

import { cn } from "@/lib/util/cn";
import { Cart } from "@/lib/models";

const Addresses = ({
    cart,
    customer,
}: {
    cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null;
    customer: Omit<any, "password_hash"> | null;
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "address" || searchParams.get("step") == null;

    const handleEdit = () => {
        router.push(pathname + "?step=address");
    };

    return (
        <div>
            {/* Account Information Section */}
            <div className="bg-content1 shadow-medium p-6 rounded border-l-2 border-l-indigo-500">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-medium">Shipping Address</span>
                    </div>
                    {!isOpen && cart?.shipping_address && (
                        <button aria-label="edit" className="text-blue-500 flex items-center gap-2 text-sm" onClick={handleEdit}>
                            Edit <Pencil />
                        </button>
                    )}
                </div>

                <div className={cn("hidden", isOpen && "block")}>
                    <ShippingAddress cart={cart} customer={customer} />
                </div>
                {/* Account Information Section */}
                {!isOpen && cart?.shipping_address?.address_1 && (
                    <div className="space-y-4">
                        <div className="text-xs md:text-sm" data-testid="shipping-address-summary">
                            <p className="font-medium mb-1 text-base">Shipping Address</p>
                            <p className="font-normal text-default-500">
                                {cart.shipping_address.first_name} {cart.shipping_address.last_name} <br />
                                {cart.shipping_address.address_1} {cart.shipping_address.address_2} <br />
                                {cart.shipping_address.postal_code}, {cart.shipping_address.city}
                            </p>
                        </div>

                        <div className="text-xs md:text-sm" data-testid="shipping-contact-summary">
                            <p className="font-medium mb-1 text-base">Contact</p>
                            <p className="font-normal text-default-500">
                                {cart.shipping_address.phone}
                                <br />
                                {cart.email}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Addresses;
