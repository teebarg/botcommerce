"use client";

import React, { useEffect, useState } from "react";
import { PencilSquare as Edit, Trash } from "nui-react-icons";
import useToggleState from "@lib/hooks/use-toggle-state";
import { Modal } from "@modules/common/components/modal";
import { deleteCustomerShippingAddress, updateCustomerShippingAddress } from "@modules/account/actions";
import Spinner from "@modules/common/icons/spinner";
import { useFormState } from "react-dom";
import clsx from "clsx";
import { Input } from "@nextui-org/input";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import Button from "@modules/common/components/button";

type EditAddressProps = {
    address: any;
    isActive?: boolean;
};

const EditAddress: React.FC<EditAddressProps> = ({ address, isActive = false }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [removing, setRemoving] = useState(false);
    const { state, open, close: closeModal } = useToggleState(false);

    const [formState, formAction] = useFormState(updateCustomerShippingAddress, {
        success: false,
        error: null,
        addressId: address.id,
    });

    const close = () => {
        closeModal();
    };

    useEffect(() => {
        if (formState.success) {
            enqueueSnackbar("Address successfully updated", { variant: "success" });
            close();

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
        <>
            <div
                className={clsx("border rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors", {
                    "border-gray-900": isActive,
                })}
                data-testid="address-container"
            >
                <div className="flex flex-col">
                    <h3 className="text-left text-sm" data-testid="address-name">
                        {address.first_name} {address.last_name}
                    </h3>
                    {address.company && (
                        <p className="text-sm" data-testid="address-company">
                            {address.company}
                        </p>
                    )}
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
                    <button className="text-sm flex items-center gap-x-2" data-testid="address-edit-button" onClick={open}>
                        <Edit />
                        Edit
                    </button>
                    <button
                        className="text-sm text-default-800 flex items-center gap-x-2"
                        data-testid="address-delete-button"
                        onClick={removeAddress}
                    >
                        {removing ? <Spinner /> : <Trash />}
                        Remove
                    </button>
                </div>
            </div>

            <Modal data-testid="edit-address-modal" isOpen={state} onClose={close}>
                <React.Fragment>
                    <h3 className="mb-2">Edit address</h3>
                    <form action={formAction}>
                        <div className="grid grid-cols-1 gap-y-2 w-full py-2 px-6">
                            <div className="grid grid-cols-2 gap-x-2">
                                <Input
                                    isRequired
                                    autoComplete="given-name"
                                    data-testid="first-name-input"
                                    defaultValue={address.first_name || undefined}
                                    label="First name"
                                    name="first_name"
                                />
                                <Input
                                    isRequired
                                    autoComplete="family-name"
                                    data-testid="last-name-input"
                                    defaultValue={address.last_name || undefined}
                                    label="Last name"
                                    name="last_name"
                                />
                            </div>
                            <Input
                                autoComplete="organization"
                                data-testid="company-input"
                                defaultValue={address.company || undefined}
                                label="Company"
                                name="company"
                            />
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
                            <Input
                                autoComplete="address-level1"
                                data-testid="state-input"
                                defaultValue={address.state || undefined}
                                label="State"
                                name="state"
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
                            <Button className="h-10" color="secondary" data-testid="cancel-button" type="reset" onClick={close}>
                                Cancel
                            </Button>
                            <FormButton data-testid="save-button">Save</FormButton>
                        </div>
                    </form>
                </React.Fragment>
            </Modal>
        </>
    );
};

export default EditAddress;
