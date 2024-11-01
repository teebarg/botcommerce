"use client";

import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { updateCustomerName } from "@modules/account/actions";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useFormState(updateCustomerName, {
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
        <form action={formAction} className="w-full overflow-visible">
            <AccountInfo
                clearState={clearState}
                currentInfo={`${customer.firstname} ${customer.lastname}`}
                data-testid="account-name-editor"
                isError={!!state?.error}
                isSuccess={successState}
                label="Name"
            >
                <div className="grid grid-cols-2 gap-x-4">
                    <Input isRequired data-testid="first-name-input" defaultValue={customer.first_name} label="First name" name="first_name" />
                    <Input isRequired data-testid="last-name-input" defaultValue={customer.last_name} label="Last name" name="last_name" />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
