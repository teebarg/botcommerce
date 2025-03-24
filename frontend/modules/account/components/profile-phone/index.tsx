"use client";

import React, { useActionState, useEffect } from "react";
import { updateCustomerPhone } from "@modules/account/actions";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
    const [, setSuccessState] = React.useState(false);

    const [state, formAction] = useActionState(updateCustomerPhone, {
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
            <AccountInfo clearState={clearState} currentInfo={`${customer.phone}`} data-testid="account-phone-editor" label="Phone">
                <div className="grid grid-cols-1 gap-y-2">
                    <Input
                        required
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
