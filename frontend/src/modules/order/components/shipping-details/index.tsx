import { currency } from "@lib/util/util";
import { Order } from "types/global";

type ShippingDetailsProps = {
    order: Order;
};

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
    return (
        <div>
            <h2 className="flex flex-row text-xl font-semibold my-6">Delivery</h2>
            <div className="flex items-start gap-x-8">
                <div className="flex flex-col w-1/3" data-testid="shipping-address-summary">
                    <p className="font-medium text-base mb-1">Shipping Address</p>
                    <p className="font-normal text-default-600">
                        {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    <p className="font-normal text-default-600">
                        {order.shipping_address.address_1} {order.shipping_address.address_2}
                    </p>
                    <p className="font-normal text-default-600">
                        {order.shipping_address.postal_code}, {order.shipping_address.city}
                    </p>
                </div>

                <div className="flex flex-col w-1/3 " data-testid="shipping-contact-summary">
                    <p className="font-medium text-base mb-1">Contact</p>
                    <p className="font-normal text-default-600">{order.shipping_address.phone}</p>
                    <p className="font-normal text-default-600">{order.email}</p>
                </div>

                <div className="flex flex-col w-1/3" data-testid="shipping-method-summary">
                    <p className="font-medium text-base mb-1">Method</p>
                    <p className="font-normal text-default-600">
                        {order.shipping_method?.shipping_option?.name} ({currency(order.shipping_method?.amount)})
                    </p>
                </div>
            </div>
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default ShippingDetails;
