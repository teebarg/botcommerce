import { currency } from "@lib/util/util";

import { Order } from "@/lib/models";

type ShippingDetailsProps = {
    order: Order;
};

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
    return (
        <div>
            <h2 className="flex flex-row text-xl font-semibold mt-6 mb-1">Delivery</h2>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                <div className="flex flex-col font-medium" data-testid="shipping-address-summary">
                    <p className="text-base mb-1">Shipping Address</p>
                    <p className="text-default-500">
                        {order?.shipping_address?.first_name} {order?.shipping_address?.last_name}
                    </p>
                    <p className="text-default-500">
                        {order?.shipping_address?.address_1} {order?.shipping_address?.address_2}
                    </p>
                    <p className="text-default-500">
                        {order?.shipping_address?.postal_code}, {order?.shipping_address?.city}
                    </p>
                </div>

                <div className="flex flex-col font-medium" data-testid="shipping-contact-summary">
                    <p className="text-base mb-1">Contact</p>
                    <p className="text-default-500">{order?.shipping_address?.phone}</p>
                    <p className="text-default-500">{order?.email}</p>
                </div>

                <div className="flex flex-col font-medium" data-testid="shipping-method-summary">
                    <p className="text-base mb-1">Method</p>
                    <p className="text-default-500">
                        {order?.shipping_method?.shipping_option?.name} ({currency(order?.shipping_method?.amount)})
                    </p>
                </div>
            </div>
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default ShippingDetails;
