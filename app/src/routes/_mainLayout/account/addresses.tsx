import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Edit3, Home, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/schemas";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import AddAddressForm from "@/components/store/account/address/add-address-form";
import { cn } from "@/utils";
import EditAddressForm from "@/components/store/account/address/edit-address-form";
import { useDeleteAddress } from "@/hooks/useAddress";
import { AnimatePresence, motion } from "framer-motion";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import SheetDrawer from "@/components/sheet-drawer";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userAddressesQuery } from "@/queries/user.queries";

type AddressItemProps = {
    address: Address;
    isActive?: boolean;
    index: number;
};

const AddressItem: React.FC<AddressItemProps> = ({ address, isActive = false, index }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});

    const deleteAddress = useDeleteAddress();

    const onConfirmDelete = async () => {
        deleteAddress.mutateAsync(address.id).then(() => {
            deleteState.close();
        });
    };

    return (
        <motion.div
            key={address.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            className={cn("bg-card rounded-2xl border-2 overflow-hidden transition-all duration-300", isActive ? "border-primary" : "border-border")}
        >
            <div className="p-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 gradient-primary">
                        <Home className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                                {address?.first_name} {address?.last_name}
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {address.address_1}
                            {address.address_2 && <span>, {address.address_2}</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <SheetDrawer
                        open={editState.isOpen}
                        title="Edit address"
                        trigger={
                            <Button variant="ghost" size="sm" className="text-xs">
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                            </Button>
                        }
                        onOpenChange={editState.setOpen}
                        showHeader={true}
                    >
                        <EditAddressForm address={address} onClose={editState.close} />
                    </SheetDrawer>
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={
                            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={onConfirmDelete}
                        title={`Delete ${address.first_name}`}
                        confirmText="Delete"
                        isLoading={deleteAddress.isPending}
                        variant="destructive"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export const Route = createFileRoute("/_mainLayout/account/addresses")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(userAddressesQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const addState = useOverlayTriggerState({});
    const { data } = useSuspenseQuery(userAddressesQuery());
    const addresses = data.addresses;

    return (
        <div className="w-full px-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2">My Addresses</h2>
                <p className="text-muted-foreground">Manage your delivery addresses</p>
            </motion.div>
            <Overlay
                open={addState.isOpen}
                title="Add new address"
                trigger={
                    <Button onClick={addState.open}>
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Add new address</span>
                    </Button>
                }
                onOpenChange={addState.setOpen}
                showHeader={true}
            >
                <AddAddressForm onClose={addState.close} />
            </Overlay>
            <div className="space-y-3 mt-4">
                <AnimatePresence mode="popLayout">
                    {addresses?.map((address: Address, index: number) => {
                        return <AddressItem key={index} index={index} address={address} />;
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
