"use client";

import { useMemo } from "react";
import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ShippingAddressForm from "../../address-form";
import { AddressCard } from "../address-item";

import { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useUserAddresses } from "@/lib/hooks/useCart";
import Overlay from "@/components/overlay";
import ComponentLoader from "@/components/component-loader";

type AddressSelectProps = {
    address: Address | null;
};

const EmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-default-900">No Addresses Found</h3>
            <p className="text-default-500 text-center mb-6 text-sm">
                {`You haven't added any addresses yet. Add your first address to get started with your order.`}
            </p>
        </div>
    );
};

const AddressSelect: React.FC<AddressSelectProps> = ({ address }) => {
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const state = useOverlayTriggerState({});
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredAddresses = addresses.filter(
        (address) =>
            address.address_1.toLowerCase().includes(searchQuery.toLowerCase()) || address.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);

    if (isLoading) {
        return <ComponentLoader className="h-24" />;
    }

    return (
        <div className="w-auto overflow-hidden bg-content1">
            <div className="border-b border-default-300 pb-6">
                {(filteredAddresses.length > 0 || searchQuery) && (
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-default-500 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-default-300 outline-none transition-all"
                            placeholder="Search addresses..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-2 py-1.5">
                    {filteredAddresses.length === 0 ? (
                        <EmptyState />
                    ) : (
                        filteredAddresses.map((address: Address, idx: number) => (
                            <AddressCard key={idx} address={address} addresses={addresses} selectedAddress={selectedAddress} />
                        ))
                    )}
                </div>
            </div>
            <Overlay
                open={state.isOpen}
                sheetClassName="min-w-[600px]"
                title="Create Address"
                trigger={
                    <Button className="w-full mt-6" variant="primary" onClick={state.open}>
                        Add New Address
                    </Button>
                }
                onOpenChange={state.setOpen}
            >
                <ShippingAddressForm onClose={state.close} />
            </Overlay>
        </div>
    );
};

export default AddressSelect;
