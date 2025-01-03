"use client";

import React, { useEffect } from "react";
import { updateCustomerPassword } from "@modules/account/actions";
import { useFormState } from "react-dom";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useFormState(updateCustomerPassword, {
        customer,
        success: false,
        error: false,
    });

    const clearState = () => {
        setSuccessState(false);
    };

    useEffect(() => {
        setSuccessState(state.success);
    }, [state]);

    return (
        <form action={formAction} className="w-full" onReset={() => clearState()}>
            <AccountInfo
                clearState={clearState}
                currentInfo={<span>The password is not shown for security reasons</span>}
                data-testid="account-password-editor"
                errorMessage={state.error}
                isError={!!state.error}
                isSuccess={successState}
                label="Password"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Input isRequired data-testid="old-password-input" label="Old password" name="old_password" type="password" />
                    <Input isRequired data-testid="new-password-input" label="New password" name="new_password" type="password" />
                    <Input isRequired data-testid="confirm-password-input" label="Confirm password" name="confirm_password" type="password" />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
