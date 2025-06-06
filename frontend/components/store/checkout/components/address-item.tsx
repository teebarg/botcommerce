"use client";

import { omit } from "@lib/util/util";
import { Loader } from "nui-react-icons";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Pencil } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";

import ShippingAddressFormEdit from "../address-form-edit";

import { Address, User } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { useInvalidateCart } from "@/lib/hooks/useCart";
import Overlay from "@/components/overlay";
import { Badge } from "@/components/ui/badge";

type AddressSelectProps = {
    address: Address | null;
    user: User | null;
};

interface AddressItemProp {
    address: Address;
    addresses: Address[];
    selectedAddress?: Address;
}

const AddressItem: React.FC<AddressItemProp> = ({ address, addresses, selectedAddress }) => {
    const state = useOverlayTriggerState({});
    const invalidateCart = useInvalidateCart();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSelect = async (id: number) => {
        setLoading(true);
        const savedAddress = addresses.find((a) => a.id === id);

        if (savedAddress) {
            const res = await api.cart.updateDetails({
                shipping_address: omit(savedAddress, ["created_at", "updated_at"]) as any,
            });

            if (res.error) {
                toast.error(res.error);

                return;
            }
            invalidateCart();
        }

        setLoading(false);
    };

    return (
        <motion.div
            key={address.id}
            animate={{ opacity: 1, y: 0 }}
            className={`relative cursor-pointer focus-visible:outline-none group border ${
                selectedAddress?.id === address.id ? "bg-content1 border-indigo-500" : "border-default-200"
            } rounded-xl p-4 transition-all`}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-start space-x-4" onClick={() => handleSelect(address.id!)}>
                <div className="shrink-0 relative">
                    <div
                        className={`p-3 rounded-full transition-all duration-300 ${
                            selectedAddress?.id === address.id ? "bg-blue-500 shadow-lg shadow-blue-500/25" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                    >
                        <Home
                            className={`w-5 h-5 transition-colors duration-300 ${
                                selectedAddress?.id === address.id ? "text-white" : "text-gray-600"
                            }`}
                        />
                    </div>
                </div>
                <div className="grow space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3
                                className={`font-semibold text-lg transition-colors duration-300 ${
                                    selectedAddress?.id === address.id ? "text-indigo-900" : "text-default-900"
                                }`}
                            >
                                {address.address_type || "Home"}
                            </h3>
                            {address.label && (
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        selectedAddress?.id === address.id ? "bg-blue-100 text-blue-700" : "bg-default-100 text-default-600"
                                    }`}
                                >
                                    {address.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Address Details */}
                    <div className="">
                        <p className="text-default-700 font-medium leading-relaxed">
                            {address.address_1}
                            {address.address_2 && <span className="text-default-600">, {address.address_2}</span>}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-default-600">
                            <span className="flex items-center">
                                <span className="capitalize font-medium">{address.city}</span>
                                {address.state && <span>, {address.state}</span>}
                            </span>
                            {address.postal_code && <Badge variant="yellow">{address.postal_code}</Badge>}
                        </div>

                        {address.phone && <p className="text-sm text-default-500 font-medium">📞 {address.phone}</p>}
                    </div>
                </div>
                <div className="flex items-center shrink-0">
                    <Overlay
                        open={state.isOpen}
                        sheetClassName="min-w-[500px]"
                        title="Address"
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    state.open();
                                }}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                        }
                        onOpenChange={state.setOpen}
                    >
                        <ShippingAddressFormEdit address={address} onClose={state.close} />
                    </Overlay>
                </div>
            </div>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg">
                        <Loader className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600 font-medium">Updating...</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AddressItem;
