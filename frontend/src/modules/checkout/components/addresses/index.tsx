"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCircleSolid, Spinner } from "nui-react-icons";
import { useFormState } from "react-dom";
import compareAddresses from "@lib/util/compare-addresses";
import { FormButton } from "@modules/common/components/form-button";
import { useState } from "react";
import { Cart } from "types/global";

import BillingAddress from "../billing_address";
import ShippingAddress from "../shipping-address";
import { setAddresses } from "../../actions";
import ErrorMessage from "../error-message";

const Addresses = ({
    cart,
    customer,
}: {
    cart: Omit<Cart, "refundable_amount" | "refunded_total"> | null;
    customer: Omit<any, "password_hash"> | null;
}) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOpen = searchParams.get("step") === "address";

    const [sameAsSBilling, setSameAsSBilling] = useState<boolean>(
        cart?.shipping_address && cart?.billing_address ? compareAddresses(cart?.shipping_address, cart?.billing_address) : true
    );

    const handleEdit = () => {
        router.push(pathname + "?step=address");
    };

    const [message, formAction] = useFormState(setAddresses, null);

    return (
        <div>
            <div className="flex flex-row items-center justify-between mb-6">
                <h2 className="flex flex-row text-2xl gap-x-2 items-baseline">
                    Shipping Address
                    {!isOpen && <CheckCircleSolid />}
                </h2>
                {!isOpen && cart?.shipping_address && (
                    <button className="hover:text-blue-400" data-testid="edit-address-button" onClick={handleEdit}>
                        Edit
                    </button>
                )}
            </div>
            {isOpen ? (
                <form action={formAction}>
                    <div className="pb-8">
                        <ShippingAddress
                            cart={cart}
                            checked={sameAsSBilling}
                            customer={customer}
                            onChange={() => setSameAsSBilling(!sameAsSBilling)}
                        />
                        <input readOnly checked={sameAsSBilling} className="hidden" name="same_as_billing" type="checkbox" />
                        {!sameAsSBilling && (
                            <div>
                                <h2 className="text-2xl gap-x-4 pb-6 pt-8">Billing address</h2>

                                <BillingAddress cart={cart} />
                            </div>
                        )}
                        <FormButton className="mt-6" data-testid="submit-address-button">
                            Continue to delivery
                        </FormButton>
                        <ErrorMessage data-testid="address-error-message" error={message} />
                    </div>
                </form>
            ) : (
                <div>
                    <div className="text-sm">
                        {cart && cart.shipping_address ? (
                            <div className="flex items-start gap-x-8">
                                <div className="flex items-start flex-wrap gap-x-1 w-full text-base space-y-4 md:space-y-0">
                                    <div className="flex flex-col w-full md:w-1/3" data-testid="shipping-address-summary">
                                        <p className="font-medium mb-1">Shipping Address</p>
                                        <p className="font-normal text-default-600">
                                            {cart.shipping_address.first_name} {cart.shipping_address.last_name}
                                        </p>
                                        <p className="font-normal text-default-600">
                                            {cart.shipping_address.address_1} {cart.shipping_address.address_2}
                                        </p>
                                        <p className="font-normal text-default-600">
                                            {cart.shipping_address.postal_code}, {cart.shipping_address.city}
                                        </p>
                                    </div>

                                    <div className="flex flex-col w-full md:w-1/3" data-testid="shipping-contact-summary">
                                        <p className="font-medium mb-1">Contact</p>
                                        <p className="font-normal text-default-600">{cart.shipping_address.phone}</p>
                                        <p className="font-normal text-default-600">{cart.email}</p>
                                    </div>

                                    <div className="flex flex-col w-full md:w-1/3" data-testid="billing-address-summary">
                                        <p className="font-medium mb-1">Billing Address</p>

                                        {sameAsSBilling ? (
                                            <p className="font-normal text-default-600">Billing- and delivery address are the same.</p>
                                        ) : (
                                            <>
                                                <p className="font-normal text-default-600">
                                                    {cart.billing_address.first_name} {cart.billing_address.last_name}
                                                </p>
                                                <p className="font-normal text-default-600">
                                                    {cart.billing_address.address_1} {cart.billing_address.address_2}
                                                </p>
                                                <p className="font-normal text-default-600">
                                                    {cart.billing_address.postal_code}, {cart.billing_address.city}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Spinner />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default Addresses;
