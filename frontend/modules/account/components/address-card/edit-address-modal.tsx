"use client";

import React, { useEffect, useState } from "react";
import { PencilSquare as Edit, Spinner, Trash } from "nui-react-icons";
import { Modal } from "@modules/common/components/modal";
import { deleteCustomerShippingAddress, updateCustomerShippingAddress } from "@modules/account/actions";
import { useFormState } from "react-dom";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import Button from "@modules/common/components/button";
import { Address } from "types/global";
import { useOverlayTriggerState } from "react-stately";
import { ComboBox } from "@modules/common/components/combobox";
import { states } from "@modules/collections/templates/data";
import { Input } from "@components/ui/input";
import { cn } from "@/lib/util/cn";

type EditAddressProps = {
    address: Address;
    isActive?: boolean;
};

const EditAddress: React.FC<EditAddressProps> = ({ address, isActive = false }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [removing, setRemoving] = useState(false);
    const modalState = useOverlayTriggerState({});

    const [formState, formAction] = useFormState(updateCustomerShippingAddress, {
        success: false,
        error: null,
        addressId: address.id,
    });

    useEffect(() => {
        if (formState.success) {
            enqueueSnackbar("Address successfully updated", { variant: "success" });
            modalState.close();

            return;
        }
        if (formState.error) {
            enqueueSnackbar(formState.error, { variant: "error" });
        }
    }, [formState]);

    const removeAddress = async () => {
        setRemoving(true);
        await deleteCustomerShippingAddress(address.id);
        setRemoving(false);
    };

    return (
        <React.Fragment>
            <div
                className={cn("border rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors", {
                    "border-gray-900": isActive,
                })}
                data-testid="address-container"
            >
                <div className="flex flex-col">
                    <h3 className="text-left text-sm" data-testid="address-name">
                        {address.firstname} {address.lastname}
                    </h3>
                    <p className="flex flex-col text-left text-base mt-2">
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
                <div className="flex items-center gap-x-4">
                    <button className="text-sm flex items-center gap-x-2" data-testid="address-edit-button" onClick={modalState.open}>
                        <Edit />
                        Edit
                    </button>
                    <button className="text-sm text-danger-500 flex items-center gap-x-2" data-testid="address-delete-button" onClick={removeAddress}>
                        {removing ? <Spinner /> : <Trash />}
                        Remove
                    </button>
                </div>
            </div>
            {modalState.isOpen && (
                <Modal data-testid="edit-address-modal" onClose={modalState.close}>
                    <div className="p-8">
                        <h3 className="mb-2">Edit address</h3>
                        <form action={formAction}>
                            <div className="grid grid-cols-1 gap-y-2 w-full py-2">
                                <div className="grid grid-cols-2 gap-x-2">
                                    <Input
                                        isRequired
                                        autoComplete="given-name"
                                        data-testid="first-name-input"
                                        defaultValue={address.firstname || undefined}
                                        label="First name"
                                        name="firstname"
                                    />
                                    <Input
                                        isRequired
                                        autoComplete="family-name"
                                        data-testid="last-name-input"
                                        defaultValue={address.lastname || undefined}
                                        label="Last name"
                                        name="lastname"
                                    />
                                </div>
                                <Input
                                    isRequired
                                    autoComplete="address-line1"
                                    data-testid="address-1-input"
                                    defaultValue={address.address_1 || undefined}
                                    label="Address"
                                    name="address_1"
                                />
                                <Input
                                    autoComplete="address-line2"
                                    data-testid="address-2-input"
                                    defaultValue={address.address_2 || undefined}
                                    label="Apartment, suite, etc."
                                    name="address_2"
                                />
                                <div className="grid grid-cols-[144px_1fr] gap-x-2">
                                    <Input
                                        isRequired
                                        autoComplete="postal-code"
                                        data-testid="postal-code-input"
                                        defaultValue={address.postal_code || undefined}
                                        label="Postal code"
                                        name="postal_code"
                                        type="number"
                                    />
                                    <Input
                                        isRequired
                                        autoComplete="locality"
                                        data-testid="city-input"
                                        defaultValue={address.city || undefined}
                                        label="City"
                                        name="city"
                                    />
                                </div>
                                <ComboBox
                                    data-testid="state-input"
                                    defaultInputValue={address.state || undefined}
                                    items={states}
                                    label="State"
                                    name="state"
                                    placeholder="Select State"
                                />
                                <Input
                                    autoComplete="phone"
                                    data-testid="phone-input"
                                    defaultValue={address.phone || undefined}
                                    label="Phone"
                                    name="phone"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button className="h-10" color="danger" data-testid="cancel-button" type="reset" onPress={modalState.close}>
                                    Cancel
                                </Button>
                                <FormButton color="primary" data-testid="save-button">
                                    Update
                                </FormButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </React.Fragment>
    );
};

export default EditAddress;
