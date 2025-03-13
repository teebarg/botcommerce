"use client";

import React, { useActionState, useEffect } from "react";
import { updateCustomerName } from "@modules/account/actions";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useActionState(updateCustomerName, {
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
                <div className="grid md:grid-cols-2 gap-4">
                    <Input required data-testid="first-name-input" defaultValue={customer.firstname} label="First name" name="firstname" />
                    <Input required data-testid="last-name-input" defaultValue={customer.lastname} label="Last name" name="lastname" />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
