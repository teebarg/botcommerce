"use client";

import { useMemo } from "react";
import compareAddresses from "@lib/util/compare-addresses";
import { omit } from "@lib/util/util";
import { Loader } from "nui-react-icons";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, ChevronRight, Check, Home, Pencil } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { useStore } from "@/app/store/use-store";
import { Address } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import ShippingAddressForm from "@/components/checkout/address-form";
import ShippingAddressFormEdit from "@/components/checkout/address-form-edit";

type AddressSelectProps = {
    cart: Omit<any, "refundable_amount" | "refunded_total"> | null;
};

interface AddressItemProp {
    address: Address;
    selectedAddress?: Address;
    idx: number;
}

const AddressItem: React.FC<AddressItemProp> = ({ address, selectedAddress, idx }) => {
    const { user } = useStore();
    const addresses = user?.addresses?.sort((a, b) => (a.created_at! > b.created_at! ? -1 : 1)) ?? [];
    const state = useOverlayTriggerState({});
    const [loading, setLoading] = useState<boolean>(false);

    const handleSelect = async (id: number) => {
        setLoading(true);
        const savedAddress = addresses.find((a) => a.id === id);

        if (savedAddress) {
            await api.cart.updateDetails({
                shipping_address: omit(savedAddress, ["created_at", "updated_at"]) as any,
            });
        }
        setLoading(false);
    };

    return (
        <motion.div
            key={address.id}
            animate={{ opacity: 1, y: 0 }}
            className={`relative cursor-pointer group ${
                selectedAddress?.id === address.id ? "bg-blue-50" : "hover:bg-gray-50"
            } rounded-xl p-4 transition-all`}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-start space-x-4" onClick={() => handleSelect(address.id!)}>
                <div className="flex-shrink-0">
                    <Home className={`w-6 h-6 ${selectedAddress?.id === address.id ? "text-blue-500" : "text-gray-400"}`} />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                            {address.address_type || "Home"}
                            {address.label && <span>({address.label})</span>}
                        </h3>
                        {idx == 0 && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Default</span>}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                        {address.address_1}
                        {address.address_2 && <span>, {address.address_2}</span>}
                        {address.postal_code && <span>, {address.postal_code}</span>}
                    </p>
                    <p className="text-gray-500 text-sm capitalize">
                        {address.city}
                        {address.state && <span>, {address.state}</span>}
                    </p>
                    <p className="text-gray-500 text-sm capitalize">{address.phone}</p>
                </div>
                <div className="flex items-center flex-shrink-0">
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
                    {selectedAddress?.id === address.id ? (
                        <Check className="w-5 h-5 text-blue-500" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                    )}
                </div>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                </div>
            )}
            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="sr-only">Address</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6">
                        <ShippingAddressFormEdit address={address} onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </motion.div>
    );
};

const AddressSelect: React.FC<AddressSelectProps> = ({ cart }) => {
    const { user } = useStore();
    const addresses = user?.addresses?.sort((a, b) => (a.created_at! > b.created_at! ? -1 : 1)) ?? [];
    const state = useOverlayTriggerState({});
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredAddresses = addresses.filter(
        (address) =>
            address.address_1.toLowerCase().includes(searchQuery.toLowerCase()) || address.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedAddress = useMemo(() => {
        return addresses.find((a) => compareAddresses(a, cart?.shipping_address));
    }, [addresses, cart?.shipping_address]);

    return (
        // <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-auto shadow-xlp overflow-hidden bg-content1">
            <div className="border-b border-gray-100">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Search addresses..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-3 max-h-[30vh] overflow-y-auto">
                    <AnimatePresence>
                        {filteredAddresses.map((address: Address, idx: number) => (
                            <AddressItem key={idx} address={address} idx={idx} selectedAddress={selectedAddress} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerTrigger asChild>
                    <Button className="w-full mt-6" variant="default">
                        <Plus className="w-5 h-5" />
                        <span>Add New Address</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="sr-only">Address</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6">
                        <ShippingAddressForm onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
        // </div>
    );
};

export default AddressSelect;
