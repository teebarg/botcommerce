"use client";

import { PaystackButton } from "react-paystack";

import { PaystackResponse } from "@/types/models";

const config = {
    reference: new Date().getTime().toString(),
    email: "neyostica2000@yahoo.com",
    amount: 10000, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: "pk_test_a4524c06459fb43786e889c2504a9e3a2011d888",
};

const Paystack: React.FC = () => {
    const handleSuccess = (reference: PaystackResponse) => {
        // Implementation for whatever you want to do with reference and after success call.
        console.log(reference);
    };

    const handleClose = () => {
        // implementation for  whatever you want to do when the Paystack dialog closed.
        console.log("closed");
    };

    const componentProps = {
        ...config,
        text: "Paystack Button",
        onSuccess: (reference: PaystackResponse) => handleSuccess(reference),
        onClose: handleClose,
    };

    return (
        <div>
            <PaystackButton {...componentProps} />
        </div>
    );
};

export default Paystack;
