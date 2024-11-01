"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { updateCustomerEmail } from "@modules/account/actions";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useFormState(updateCustomerEmail, {
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
                currentInfo={`${customer.email}`}
                data-testid="account-email-editor"
                errorMessage={state.error}
                isError={!!state.error}
                isSuccess={successState}
                label="Email"
            >
                <div className="grid grid-cols-1 gap-y-2">
                    <Input
                        isRequired
                        autoComplete="email"
                        data-testid="email-input"
                        defaultValue={customer.email}
                        label="Email"
                        name="email"
                        type="email"
                    />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileEmail;
