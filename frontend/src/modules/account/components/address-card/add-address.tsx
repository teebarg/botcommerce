"use client";

import { Plus } from "nui-react-icons";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import useToggleState from "@lib/hooks/use-toggle-state";
import Modal from "@modules/common/components/modal";
import { addCustomerShippingAddress } from "@modules/account/actions";
import { Input } from "@nextui-org/input";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import Button from "@modules/common/components/button";

const AddAddress = ({ region }: { region: any }) => {
    const { enqueueSnackbar } = useSnackbar();
    const { state, open, close: closeModal } = useToggleState(false);

    const [formState, formAction] = useFormState(addCustomerShippingAddress, {
        success: false,
        error: null,
    });

    const close = () => {
        closeModal();
    };

    useEffect(() => {
        if (formState.success) {
            enqueueSnackbar("Address successfully created", { variant: "success" });
            close();

            return;
        }
        if (formState.error) {
            enqueueSnackbar(formState.error, { variant: "error" });
        }
    }, [formState]);

    return (
        <>
            <button
                className="border border-default-200 rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
                data-testid="add-address-button"
                onClick={open}
            >
                <span className="font-semibold">New address</span>
                <Plus />
            </button>

            <Modal close={close} data-testid="add-address-modal" isOpen={state}>
                <Modal.Title>
                    <h3 className="mb-2">Add address</h3>
                </Modal.Title>
                <form action={formAction}>
                    <Modal.Body>
                        <div className="flex flex-col gap-y-2 w-full px-6 py-4">
                            <div className="grid grid-cols-2 gap-x-2">
                                <Input isRequired autoComplete="given-name" data-testid="first-name-input" label="First name" name="first_name" />
                                <Input isRequired autoComplete="family-name" data-testid="last-name-input" label="Last name" name="last_name" />
                            </div>
                            <Input autoComplete="organization" data-testid="company-input" label="Company" name="company" />
                            <Input isRequired autoComplete="address-line1" data-testid="address-1-input" label="Address" name="address_1" />
                            <Input autoComplete="address-line2" data-testid="address-2-input" label="Apartment, suite, etc." name="address_2" />
                            <div className="grid grid-cols-[144px_1fr] gap-x-2">
                                <Input isRequired autoComplete="postal-code" data-testid="postal-code-input" label="Postal code" name="postal_code" />
                                <Input isRequired autoComplete="locality" data-testid="city-input" label="City" name="city" />
                            </div>
                            <Input autoComplete="address-level1" data-testid="state-input" label="Province / State" name="province" />
                            <Input autoComplete="phone" data-testid="phone-input" label="Phone" name="phone" />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex gap-3 mt-6">
                            <Button className="h-10" color="danger" data-testid="cancel-button" type="reset" onClick={close}>
                                Cancel
                            </Button>
                            <FormButton data-testid="save-button">Save</FormButton>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};

export default AddAddress;
