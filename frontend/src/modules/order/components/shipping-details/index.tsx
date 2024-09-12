import { formatAmount } from "@lib/util/prices";

type ShippingDetailsProps = {
    order: any;
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
                    <p className="font-normal text-default-600">{order.shipping_address.country_code?.toUpperCase()}</p>
                </div>

                <div className="flex flex-col w-1/3 " data-testid="shipping-contact-summary">
                    <p className="font-medium text-base mb-1">Contact</p>
                    <p className="font-normal text-default-600">{order.shipping_address.phone}</p>
                    <p className="font-normal text-default-600">{order.email}</p>
                </div>

                <div className="flex flex-col w-1/3" data-testid="shipping-method-summary">
                    <p className="font-medium text-base mb-1">Method</p>
                    <p className="font-normal text-default-600">
                        {order.shipping_methods[0].shipping_option?.name} (
                        {formatAmount({
                            amount: order.shipping_methods[0].price,
                            region: order.region,
                            includeTaxes: false,
                        })
                            .replace(/,/g, "")
                            .replace(/\./g, ",")}
                        )
                    </p>
                </div>
            </div>
            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default ShippingDetails;
