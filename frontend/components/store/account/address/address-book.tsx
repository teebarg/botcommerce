"use client";

import React from "react";

import { Address } from "@/schemas";
import Overlay from "@/components/overlay";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AddAddressForm from "@/components/store/account/address/add-address-form";
import { cn } from "@/lib/utils";
import EditAddressForm from "@/components/store/account/address/edit-address-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAddresses, useDeleteAddress } from "@/lib/hooks/useAddress";
import { Confirm } from "@/components/generic/confirm";
import { Skeleton } from "@/components/ui/skeletons";
import ServerError from "@/components/generic/server-error";

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
            className={cn("border border-default-300 rounded-lg p-5 min-h-[200px] h-full w-full flex flex-col justify-between transition-colors", {
                "border-primary": isActive,
            })}
            data-testid="address-container"
        >
            <div className="flex flex-col">
                <h3 className="text-left text-sm font-semibold" data-testid="address-name">
                    {address.first_name} {address.last_name}
                </h3>
                <p className="flex flex-col text-left mt-2 font-semibold">
                    <span data-testid="address-address">
                        {address.address_1}
                        {address.address_2 && <span>, {address.address_2}</span>}
                    </span>
                    <span data-testid="address-postal-city">
                        {address.postal_code}, {address.city}
                    </span>
                    <span data-testid="address-state-country">{address.state && `${address.state}`}</span>
                </p>
            </div>
            <div className="flex items-center gap-x-2">
                <Overlay
                    open={editState.isOpen}
                    title="Edit address"
                    trigger={
                        <Button aria-label="edit address" data-testid="address-edit-button" size="iconOnly" onClick={editState.open}>
                            <Pencil className="h-5 w-5" />
                        </Button>
                    }
                    onOpenChange={editState.setOpen}
                    sheetClassName="min-w-[30vw]"
                >
                    <EditAddressForm address={address} onClose={editState.close} />
                </Overlay>
                <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                    <DialogTrigger>
                        <Trash2 className="text-rose-500 h-5 w-5 cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent className="bg-content1">
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

const AddressBook: React.FC = () => {
    const addState = useOverlayTriggerState({});
    const { data, isLoading, error } = useAddresses();

    if (!data || error) {
        return <ServerError />;
    }

    if (isLoading) {
        return <Skeleton className="h-[200px]" />;
    }
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
                <Overlay
                    open={addState.isOpen}
                    title="Add new address"
                    trigger={
                        <Button variant="primary" onClick={addState.open}>
                            <Plus className="h-5 w-5" />
                            <span className="font-semibold">Add new address</span>
                        </Button>
                    }
                    onOpenChange={addState.setOpen}
                    sheetClassName="min-w-[30vw]"
                >
                    <AddAddressForm onClose={addState.close} />
                </Overlay>
                {data?.addresses?.map((address, idx: number) => {
                    return <AddressItem key={idx} address={address} />;
                })}
            </div>
        </div>
    );
};

export default AddressBook;
