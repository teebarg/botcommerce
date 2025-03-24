"use client";

import React, { useActionState, useEffect } from "react";
import { updateCustomerPassword } from "@modules/account/actions";
import { Input } from "@components/ui/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
    const [, setSuccessState] = React.useState(false);

    const [state, formAction] = useActionState(updateCustomerPassword, {
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
                label="Password"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Input required data-testid="old-password-input" label="Old password" name="old_password" type="password" />
                    <Input required data-testid="new-password-input" label="New password" name="new_password" type="password" />
                    <Input required data-testid="confirm-password-input" label="Confirm password" name="confirm_password" type="password" />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileName;
