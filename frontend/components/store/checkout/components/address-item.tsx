"use client";

import { omit } from "@lib/utils";
import { Building, Check, Edit3, Home, MapPin, Phone, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import ShippingAddressFormEdit from "../address-form-edit";

import { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";
import { Confirm } from "@/components/generic/confirm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUpdateCartDetails } from "@/lib/hooks/useCart";

interface AddressItemProp {
    address: Address;
    addresses: Address[];
    selectedAddress?: Address;
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case "home":
            return <Home className="w-4 h-4" />;
        case "office":
            return <Building className="w-4 h-4" />;
        default:
            return <MapPin className="w-4 h-4" />;
    }
};

export const AddressCard: React.FC<AddressItemProp> = ({ address, addresses, selectedAddress }) => {
    const isSelected = selectedAddress?.id === address.id;
    const updateCartDetails = useUpdateCartDetails();

    const state = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const handleSelect = async (id: number) => {
        const savedAddress = addresses.find((a) => a.id === id);

        if (updateCartDetails.isPending) return;

        if (savedAddress) {
            updateCartDetails.mutateAsync({
                shipping_address: omit(savedAddress, ["created_at", "updated_at"]) as any,
            });
        }
    };

    const onConfirmDelete = async () => {
        // delete address
    };

    return (
        <div
            className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 group ${
                isSelected ? "ring-2 ring-accent bg-accent/10" : "border border-divider bg-content2 hover:border-accent/50 hover:shadow-md"
            }`}
            onClick={() => !isSelected && handleSelect(address.id)}
        >
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? "border-accent bg-accent shadow-sm" : "border-divider group-hover:border-accent/50"
                    }`}
                >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            </div>

            <div className="pr-16">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className={`p-2.5 rounded-lg transition-colors ${
                            isSelected ? "bg-accent text-white" : "bg-content1 text-default-500 group-hover:bg-accent/50"
                        }`}
                    >
                        {getTypeIcon(address.address_type)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-default-800 text-lg">{address.label}</h3>
                        <p className="text-default-500 text-sm">{address.first_name + " " + address.last_name}</p>
                    </div>
                </div>

                <div className="space-y-0.5 text-sm">
                    <p className="text-default-800 font-medium">{address.address_1}</p>
                    <p className="text-default-500">
                        {address.city}, {address.state}
                    </p>
                    {address.phone && (
                        <p className="flex items-center gap-2 text-default-500 mt-2">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{address.phone}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="absolute bottom-3 right-3 flex gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Overlay
                    open={state.isOpen}
                    sheetClassName="min-w-[600px]"
                    title="Address"
                    trigger={
                        <Button
                            className="text-default-500 hover:text-blue-600 hover:bg-blue-50"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Edit3 className="w-4 h-4" />
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <ShippingAddressFormEdit address={address} onClose={state.close} />
                </Overlay>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="text-default-500 hover:text-red-600 hover:bg-red-50"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Delete Address</DialogTitle>
                        </DialogHeader>
                        <Confirm onClose={deleteState.close} onConfirm={onConfirmDelete} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
