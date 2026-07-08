import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Edit3, Home, HomeIcon, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useDeleteAddress, useUserAddresses } from "@/hooks/useAddress";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import SheetDrawer from "@/components/sheet-drawer";
import AddressForm from "@/components/store/account/address-form";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/utils";

type AddressItemProps = {
    address: Address;
    isActive?: boolean;
    index: number;
};

const AddressItem: React.FC<AddressItemProps> = ({ address, isActive = true }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const deleteAddress = useDeleteAddress();

    const onConfirmDelete = async () => {
        deleteAddress.mutateAsync(address.id).then(() => deleteState.close());
    };

    return (
        <div className="rounded-2xl border overflow-hidden bg-card border-border">
            <div className="flex items-start justify-between px-4 py-4">
                <div className="space-y-1.5">
                    <h3 className="text-sm font-medium">
                        {address?.first_name} {address?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {address.address_1}
                        {address.address_2 && <>, {address.address_2}</>}
                        <br />
                        {address.state && <>{address.state}.</>}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(address.created_at)}</p>
                </div>
                {isActive && (
                    <Badge variant="success">Active</Badge>
                )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/40">
                <p className="text-xs flex items-center gap-1.5">
                    <Home className="w-3 h-3" />
                    Home
                </p>
                <div className="flex items-center gap-1.5">
                    <SheetDrawer
                        open={editState.isOpen}
                        title="Edit address"
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={editState.open}
                            >
                                <Edit3 className="h-4 w-4" />
                            </Button>
                        }
                        onOpenChange={editState.setOpen}
                        showHeader={true}
                    >
                        <AddressForm mode="edit" address={address} onClose={editState.close} />
                    </SheetDrawer>
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={onConfirmDelete}
                        title={`Delete ${address.first_name}'s address`}
                        description="Are you sure you want to delete this address? This action cannot be undone."
                        isLoading={deleteAddress.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute("/_mainLayout/account/addresses")({
    component: RouteComponent,
});

function RouteComponent() {
    const addState = useOverlayTriggerState({});
    const { data, isPending } = useUserAddresses()

    return (
        <div className="w-full px-2 pt-6">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">My Addresses</h2>
                <p className="text-muted-foreground text-sm">Manage your delivery addresses</p>
            </div>
            <SheetDrawer
                open={addState.isOpen}
                title="Add new address"
                trigger={
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        Add new address
                    </Button>
                }
                onOpenChange={addState.setOpen}
                showHeader={true}
            >
                <AddressForm mode="create" onClose={addState.close} />
            </SheetDrawer>
            <div className="space-y-3 mt-4">
                {isPending ? (
                    <PageLoader variant="list" />
                ) : data?.addresses?.length == 0 ? (
                    <EmptyState
                        title="No Address"
                        description="Click on add new address to create address"
                        icon={HomeIcon}
                        action={
                            <Button className="mx-auto" onClick={addState.open}>
                                <Plus className="h-5 w-5" />
                                <span className="font-semibold">Add new address</span>
                            </Button>
                        }
                    />
                ) : data?.addresses?.map((address: Address, index: number) => {
                    return <AddressItem key={index} index={index} address={address} />;
                })}
            </div>
        </div>
    );
}
