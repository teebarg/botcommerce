"use client";

import React, { useEffect, useMemo } from "react";
import { useFormState } from "react-dom";
import { updateCustomerBillingAddress } from "@modules/account/actions";
import { Input } from "@nextui-org/input";

import AccountInfo from "../account-info";

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileBillingAddress: React.FC<MyInformationProps> = ({ customer }) => {
    const [successState, setSuccessState] = React.useState(false);

    const [state, formAction] = useFormState(updateCustomerBillingAddress, {
        error: false,
        success: false,
    });

    const clearState = () => {
        setSuccessState(false);
    };

    useEffect(() => {
        setSuccessState(state.success);
    }, [state]);

    const currentInfo = useMemo(() => {
        if (!customer.billing_address) {
            return "No billing address";
        }

        return (
            <div className="flex flex-col font-semibold" data-testid="current-info">
                <span>
                    {customer.billing_address.first_name} {customer.billing_address.last_name}
                </span>
                <span>{customer.billing_address.company}</span>
                <span>
                    {customer.billing_address.address_1}
                    {customer.billing_address.address_2 ? `, ${customer.billing_address.address_2}` : ""}
                </span>
                <span>
                    {customer.billing_address.postal_code}, {customer.billing_address.city}
                </span>
            </div>
        );
    }, [customer]);

    return (
        <form action={formAction} className="w-full" onReset={() => clearState()}>
            <AccountInfo
                clearState={clearState}
                currentInfo={currentInfo}
                data-testid="account-billing-address-editor"
                isError={!!state.error}
                isSuccess={successState}
                label="Billing address"
            >
                <div className="grid grid-cols-1 gap-y-2">
                    <div className="grid grid-cols-2 gap-x-2">
                        <Input
                            isRequired
                            data-testid="billing-first-name-input"
                            defaultValue={customer.billing_address?.first_name || undefined}
                            label="First name"
                            name="billing_address.first_name"
                        />
                        <Input
                            isRequired
                            data-testid="billing-last-name-input"
                            defaultValue={customer.billing_address?.last_name || undefined}
                            label="Last name"
                            name="billing_address.last_name"
                        />
                    </div>
                    <Input
                        data-testid="billing-company-input"
                        defaultValue={customer.billing_address?.company || undefined}
                        label="Company"
                        name="billing_address.company"
                    />
                    <Input
                        isRequired
                        data-testid="billing-address-1-input"
                        defaultValue={customer.billing_address?.address_1 || undefined}
                        label="Address"
                        name="billing_address.address_1"
                    />
                    <Input
                        data-testid="billing-address-2-input"
                        defaultValue={customer.billing_address?.address_2 || undefined}
                        label="Apartment, suite, etc."
                        name="billing_address.address_2"
                    />
                    <div className="grid grid-cols-[144px_1fr] gap-x-2">
                        <Input
                            isRequired
                            data-testid="billing-postcal-code-input"
                            defaultValue={customer.billing_address?.postal_code || undefined}
                            label="Postal code"
                            name="billing_address.postal_code"
                        />
                        <Input
                            isRequired
                            data-testid="billing-city-input"
                            defaultValue={customer.billing_address?.city || undefined}
                            label="City"
                            name="billing_address.city"
                        />
                    </div>
                    <Input
                        data-testid="billing-province-input"
                        defaultValue={customer.billing_address?.province || undefined}
                        label="Province"
                        name="billing_address.province"
                    />
                </div>
            </AccountInfo>
        </form>
    );
};

// const mapBillingAddressToFormData = ({ customer }: MyInformationProps) => {
//   return {
//     billing_address: {
//       first_name: customer.billing_address?.first_name || undefined,
//       last_name: customer.billing_address?.last_name || undefined,
//       company: customer.billing_address?.company || undefined,
//       address_1: customer.billing_address?.address_1 || undefined,
//       address_2: customer.billing_address?.address_2 || undefined,
//       city: customer.billing_address?.city || undefined,
//       province: customer.billing_address?.province || undefined,
//       postal_code: customer.billing_address?.postal_code || undefined,
//       country_code: customer.billing_address?.country_code || undefined,
//     },
//   }
// }

export default ProfileBillingAddress;
