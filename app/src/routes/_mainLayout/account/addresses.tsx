import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/schemas";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import AddAddressForm from "@/components/store/account/address/add-address-form";
import { cn } from "@/utils";
import EditAddressForm from "@/components/store/account/address/edit-address-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addressesQueryOptions, useDeleteAddress } from "@/hooks/useAddress";
import { Confirm } from "@/components/generic/confirm";
import { useSuspenseQuery } from "@tanstack/react-query";

type AddressItemProps = {
    address: Address;
    isActive?: boolean;
};

const AddressItem: React.FC<AddressItemProps> = ({ address, isActive = false }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const deleteAddress = useDeleteAddress();

    const onConfirmDelete = async () => {
        deleteAddress.mutateAsync(address.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div
            className={cn("bg-card border border-border rounded-lg p-5 min-h-[200px] h-full w-full flex flex-col justify-between transition-colors", {
                "border-primary": isActive,
            })}
            data-testid="address-container"
        >
            <div className="flex flex-col">
                <h3 className="text-left text-sm font-semibold" data-testid="address-name">
                    {address?.first_name} {address?.last_name}
                </h3>
                <p className="flex flex-col text-left mt-2 font-semibold">
                    <span data-testid="address-address">
                        {address.address_1}
                        {address.address_2 && <span>, {address.address_2}</span>}
                    </span>
                    <span data-testid="address-city">{address.city}</span>
                    <span data-testid="address-state-country">{address.state && `${address.state}`}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Overlay
                    open={editState.isOpen}
                    sheetClassName="min-w-[30vw]"
                    title="Edit address"
                    trigger={
                        <Button aria-label="edit address" data-testid="address-edit-button" size="icon" onClick={editState.open}>
                            <Pencil className="h-5 w-5" />
                        </Button>
                    }
                    onOpenChange={editState.setOpen}
                >
                    <EditAddressForm address={address} onClose={editState.close} />
                </Overlay>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            aria-label="delete address"
                            data-testid="address-delete-button"
                            size="icon"
                            variant="destructive"
                            onClick={deleteState.open}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Delete Category</DialogTitle>
                        </DialogHeader>
                        <Confirm onConfirm={onConfirmDelete} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export const Route = createFileRoute("/_mainLayout/account/addresses")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(addressesQueryOptions());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const addState = useOverlayTriggerState({});
    const { data } = useSuspenseQuery(addressesQueryOptions());

    return (
        <div className="w-full px-2" data-testid="addresses-page-wrapper">
            <div className="mb-8 flex flex-col gap-y-2">
                <h1 className="text-xl font-semibold">Shipping Addresses</h1>
                <p className="text-sm text-muted-foreground">
                    View and update your shipping addresses, you can add as many as you like. Saving your addresses will make them available during
                    checkout.
                </p>
            </div>
            <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                    <Overlay
                        open={addState.isOpen}
                        sheetClassName="min-w-[30vw]"
                        title="Add new address"
                        trigger={
                            <Button onClick={addState.open}>
                                <Plus className="h-5 w-5" />
                                <span className="font-semibold">Add new address</span>
                            </Button>
                        }
                        onOpenChange={addState.setOpen}
                    >
                        <AddAddressForm onClose={addState.close} />
                    </Overlay>
                    {data?.addresses?.map((address, idx: number) => {
                        return <AddressItem key={idx} address={address} />;
                    })}
                </div>
            </div>
        </div>
    );
}
