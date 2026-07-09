import { RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Edit3, Home, MapPin, Phone, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import type { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useDeleteAddress } from "@/hooks/useAddress";
import AddressForm from "../../account/address-form";

interface AddressItemProp {
    address: Address;
    isDefault?: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
    home: { icon: Home, label: "home" },
    office: { icon: Building, label: "work" },
};

const getTypeMeta = (type: string) => typeConfig[type] ?? { icon: MapPin, label: type || "other" };

export const AddressCard: React.FC<AddressItemProp> = ({ address, isDefault }) => {
    const { icon: TypeIcon, label } = getTypeMeta(address.address_type);
    const state = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const deleteAddress = useDeleteAddress();

    const onConfirmDelete = async () => {
        deleteAddress.mutateAsync(address.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <RadioGroupItem value={String(address.id)} variant="address">
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-secondary text-muted-foreground shrink-0">
                    <TypeIcon className="w-4 h-4" />
                </div>
                <div className="text-sm min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">
                            {address.first_name} {address.last_name}
                        </p>
                        {isDefault ? (
                            <span className="text-2xs font-semibold px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground">
                                default
                            </span>
                        ) : (
                            <span className="text-2xs font-medium px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                                {label}
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm truncate mt-0.5">{address.address_1}</p>
                    <p className="text-muted-foreground text-2xs">{address.state}</p>
                    {address.phone && (
                        <p className="flex items-center gap-1.5 text-muted-foreground text-2xs mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{address.phone}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-1.5 mt-3 pl-11">
                <SheetDrawer
                    open={state.isOpen}
                    title="Address"
                    trigger={
                        <Button className="border border-border h-7 px-2.5 text-2xs gap-1" size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    <AddressForm mode="edit" address={address} onClose={state.close} />
                </SheetDrawer>
                <ConfirmDrawer
                    open={deleteState.isOpen}
                    onOpenChange={deleteState.setOpen}
                    trigger={
                        <Button size="sm" variant="ghost" className="border border-destructive/40 h-7 px-2.5 text-2xs gap-1 text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </Button>
                    }
                    onClose={deleteState.close}
                    onConfirm={onConfirmDelete}
                    isLoading={deleteAddress.isPending}
                    title="Delete Address"
                    description="Are you sure you want to delete this address?"
                />
            </div>
        </RadioGroupItem>
    );
};