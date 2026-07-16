import { RadioGroupItem } from "@/components/ui/radio-group";
import { Edit3, Phone, Trash2 } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import type { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useDeleteAddress } from "@/hooks/useAddress";
import AddressForm from "../../account/address-form";

interface AddressItemProp {
    address: Address;
    isDefault?: boolean;
}

const typeLabel = (type: string) => (type === "home" ? "home" : type === "office" ? "work" : type || "other");

export const AddressCard: React.FC<AddressItemProp> = ({ address, isDefault }) => {
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
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-foreground">
                            {address.first_name} {address.last_name}
                        </span>
                        <span
                            className={cn(
                                "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                                isDefault ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground font-medium"
                            )}
                        >
                            {isDefault ? "default" : typeLabel(address.address_type)}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs truncate mt-0.5">
                        {address.address_1}, {address.state}
                    </p>
                    {address.phone && (
                        <p className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{address.phone}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <SheetDrawer
                        open={state.isOpen}
                        title="Address"
                        trigger={
                            <Button
                                size="iconOnly"
                                variant="ghost"
                                className="text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Edit3 />
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
                            <Button
                                size="iconOnly"
                                variant="ghost"
                                className="text-destructive/80 hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Trash2 />
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={onConfirmDelete}
                        isLoading={deleteAddress.isPending}
                        title="Delete Address"
                        description="Are you sure you want to delete this address?"
                    />
                </div>
            </div>
        </RadioGroupItem>
    );
};