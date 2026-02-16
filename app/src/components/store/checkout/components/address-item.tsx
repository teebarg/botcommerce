import { omit } from "@/utils";
import { Building, Check, Edit3, Home, MapPin, Phone, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import ShippingAddressFormEdit from "../address-form-edit";
import type { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useUpdateCartDetails } from "@/hooks/useCart";
import ComponentLoader from "@/components/component-loader";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useDeleteAddress } from "@/hooks/useAddress";

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
    const deleteAddress = useDeleteAddress();

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
        deleteAddress.mutateAsync(address.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div
            className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden w-full ${
                isSelected ? "ring-2 ring-primary/20 bg-primary/10" : "border border-input bg-secondary hover:border-primary/50 hover:shadow-md"
            }`}
        >
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? "border-primary bg-primary shadow-sm" : "border-input group-hover:border-primary/50"
                    }`}
                >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            </div>

            <div onClick={() => !isSelected && handleSelect(address.id)}>
                <div className="flex items-start gap-3 mb-3">
                    <div
                        className={`p-2.5 rounded-lg transition-colors ${
                            isSelected ? "bg-primary text-white" : "bg-primary/10 text-muted-foreground group-hover:bg-primary/10"
                        }`}
                    >
                        {getTypeIcon(address.address_type)}
                    </div>
                    <div>
                        <p className="font-semibold">{address?.first_name + " " + address?.last_name}</p>
                        <p className="text-muted-foreground font-medium text-sm truncate text-wrap">{address.address_1}</p>
                        <p className="text-muted-foreground text-sm">{address.state}</p>
                    </div>
                </div>

                {address.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{address.phone}</span>
                    </p>
                )}
            </div>

            <div className="absolute bottom-3 right-3 flex gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <SheetDrawer
                    open={state.isOpen}
                    title="Address"
                    trigger={
                        <Button
                            className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
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
                </SheetDrawer>
                <ConfirmDrawer
                    open={deleteState.isOpen}
                    onOpenChange={deleteState.setOpen}
                    trigger={
                        <Button size="icon" variant="destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    }
                    onClose={deleteState.close}
                    onConfirm={onConfirmDelete}
                    isLoading={deleteAddress.isPending}
                    title="Delete Address"
                    description="Are you sure you want to delete this address?"
                />
            </div>
            {updateCartDetails.isPending && (
                <div className="absolute top-0 left-0 w-full h-full bg-white/70 dark:bg-black/50 z-50 flex items-center justify-center">
                    <ComponentLoader />
                </div>
            )}
        </div>
    );
};
