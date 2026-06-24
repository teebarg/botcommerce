import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Edit3, Home, HomeIcon, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useDeleteAddress } from "@/hooks/useAddress";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import SheetDrawer from "@/components/sheet-drawer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userAddressesQuery } from "@/queries/user.queries";
import AddressForm from "@/components/store/account/address-form";
import EmptyState from "@/components/generic/empty";
import { PageLoader } from "@/components/generic/page-loader";
import { Separator } from "@/components/ui/separator";

type AddressItemProps = {
    address: Address;
    isActive?: boolean;
    index: number;
};

const AddressItem: React.FC<AddressItemProps> = ({ address, isActive = false }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const deleteAddress = useDeleteAddress();

    const onConfirmDelete = async () => {
        deleteAddress.mutateAsync(address.id).then(() => deleteState.close());
    };

    return (
        <div>
            <div className="py-6">
                {/* Eyebrow row */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                        Delivery address
                    </p>
                    {isActive && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-subtle text-success-subtle-foreground">
                            Active
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-medium mb-1">
                    {address?.first_name} {address?.last_name}
                </h3>

                {/* Address lines */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {address.address_1}
                    {address.address_2 && <>, {address.address_2}</>}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{address.state}</p>

                {/* Footer card */}
                <div className="rounded-xl border bg-muted/40 px-5 py-3.5 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        <Home className="inline w-3 h-3 mr-1.5 mb-0.5" />
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
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                    onClick={editState.open}
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
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
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
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
            <Separator />
        </div>
    );
};
export const Route = createFileRoute("/_mainLayout/account/addresses")({
    loader: async ({ context: { queryClient, userId } }) => {
        queryClient.prefetchQuery(userAddressesQuery(userId));
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = useRouteContext({ strict: false });
    const addState = useOverlayTriggerState({});
    const { data, isPending } = useSuspenseQuery(userAddressesQuery(userId!));

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
                    <Button>
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Add new address</span>
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
