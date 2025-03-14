"use client";

import { Plus } from "nui-react-icons";
import React, { useActionState, useEffect } from "react";
import { Modal } from "@modules/common/components/modal";
import { addCustomerShippingAddress } from "@modules/account/actions";
import { useSnackbar } from "notistack";
import { useOverlayTriggerState } from "react-stately";
import { states } from "@modules/collections/templates/data";
import { Input } from "@components/ui/input";

import { ComboBox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";

const AddAddress = () => {
    const { enqueueSnackbar } = useSnackbar();
    const modalState = useOverlayTriggerState({});

    const [formState, formAction, isPending] = useActionState(addCustomerShippingAddress, {
        success: false,
        error: null,
    });

    useEffect(() => {
        if (formState.success) {
            enqueueSnackbar("Address successfully created", { variant: "success" });
            modalState.close();

            return;
        }
        if (formState.error) {
            enqueueSnackbar(formState.error, { variant: "error" });
        }
    }, [formState]);

    return (
        <>
            <button
                aria-label="add address"
                className="border border-default-100 rounded-lg p-5 min-h-[200px] flex flex-col justify-between"
                data-testid="add-address-button"
                onClick={modalState.open}
            >
                <span className="font-semibold">New address</span>
                <Plus />
            </button>

            {modalState.isOpen && (
                <Modal data-testid="add-address-modal" isOpen={modalState.isOpen} onClose={modalState.close}>
                    <div className="p-8">
                        <form action={formAction}>
                            <div className="flex flex-col gap-y-2 w-full py-4">
                                <div className="grid md:grid-cols-2 gap-2">
                                    <Input required autoComplete="given-name" data-testid="first-name-input" label="First name" name="firstname" />
                                    <Input required autoComplete="family-name" data-testid="last-name-input" label="Last name" name="lastname" />
                                </div>
                                <Input required autoComplete="address-line1" data-testid="address-1-input" label="Address" name="address_1" />
                                <Input autoComplete="address-line2" data-testid="address-2-input" label="Apartment, suite, etc." name="address_2" />
                                <div className="grid grid-cols-[144px_1fr] gap-x-2">
                                    <Input
                                        required
                                        autoComplete="postal-code"
                                        data-testid="postal-code-input"
                                        label="Postal code"
                                        name="postal_code"
                                    />
                                    <Input required autoComplete="locality" data-testid="city-input" label="City" name="city" />
                                </div>
                                <ComboBox data-testid="state-input" items={states} label="State" name="state" placeholder="Select State" />
                                <Input autoComplete="phone" data-testid="phone-input" label="Phone" name="phone" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button
                                    aria-label="cancel"
                                    className="min-w-36"
                                    color="danger"
                                    data-testid="cancel-button"
                                    type="reset"
                                    onClick={modalState.close}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    aria-label="save"
                                    className="min-w-36"
                                    color="primary"
                                    data-testid="save-button"
                                    isLoading={isPending}
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default AddAddress;
