"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { updateCustomerPhone } from "@modules/account/actions";
import { Input } from "@nextui-org/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useFormState(updateCustomerPhone, {
        error: false,
        success: false,
    });

    const clearState = () => {
        setSuccessState(false);
    };

    useEffect(() => {
        setSuccessState(state.success);
    }, [state]);

    return (
        <form action={formAction} className="w-full">
            <AccountInfo
                clearState={clearState}
                currentInfo={`${customer.phone}`}
                data-testid="account-phone-editor"
                errorMessage={state.error}
                isError={!!state.error}
                isSuccess={successState}
                label="Phone"
            >
                <div className="grid grid-cols-1 gap-y-2">
                    <Input
                        isRequired
                        autoComplete="phone"
                        data-testid="phone-input"
                        defaultValue={customer.phone}
                        label="Phone"
                        name="phone"
                        type="phone"
                    />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileEmail;
