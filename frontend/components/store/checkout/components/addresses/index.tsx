"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Pencil } from "nui-react-icons";
import { MapPin } from "lucide-react";

import ShippingAddress from "../shipping-address";

import { cn } from "@/lib/util/cn";
import { Cart } from "@/types/models";
import { useAddress } from "@/lib/hooks/useCart";
import { Skeleton } from "@/components/generic/skeleton";

const Addresses = ({ cart }: { cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const { data: address, isLoading } = useAddress(cart?.shipping_address_id ?? 0);

    if (isLoading)
        return (
            <div className="bg-content1 shadow-medium p-6 rounded border-l-2 border-l-indigo-500">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="font-medium">Shipping Address</span>
                        <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                </div>
                <Skeleton className="h-48" />
            </div>
        );

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
                        <MapPin className="w-5 h-5 text-blue-500" />
                    </div>
                    {!isOpen && address && (
                        <button aria-label="edit" className="text-blue-500 flex items-center gap-2 text-sm" onClick={handleEdit}>
                            Edit <Pencil />
                        </button>
                    )}
                </div>

                <div className={cn("hidden", isOpen && "block")}>
                    <ShippingAddress address={address ?? null} email={cart?.email ?? ""} />
                </div>
                {/* Account Information Section */}
                {!isOpen && address?.address_1 && (
                    <div className="space-y-4">
                        <div className="text-xs md:text-sm" data-testid="shipping-address-summary">
                            <p className="font-medium mb-1 text-base">Shipping Address</p>
                            <p className="font-normal text-default-500">
                                {address.first_name} {address.last_name} <br />
                                {address.address_1} {address.address_2} <br />
                                {address.postal_code}, {address.city}
                            </p>
                        </div>

                        <div className="text-xs md:text-sm" data-testid="shipping-contact-summary">
                            <p className="font-medium mb-1 text-base">Contact</p>
                            <p className="font-normal text-default-500">
                                {address.phone}
                                <br />
                                {cart?.email}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Addresses;
