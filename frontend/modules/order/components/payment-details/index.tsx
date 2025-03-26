import { paymentInfoMap } from "@lib/constants";

import { Order } from "@/types/models";

type PaymentDetailsProps = {
    order: Order;
};

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
    const payment = order.payment_method;

    return (
        <div>
            <h2 className="flex flex-row font-semibold text-xl mt-6 mb-1">Payment</h2>
            <div>
                {payment && (
                    <div className="gap-2 w-full grid grid-cols-1 md:grid-cols-3">
                        <div className="flex flex-col">
                            <p className="text-base text-default-900">Payment method</p>
                            <p className="text-xs md:text-base text-default-500" data-testid="payment-method">
                                {order.payment_method}
                            </p>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <p className="text-base text-default-900">Payment details</p>
                            <div className="flex gap-2 txt-medium text-default-900 items-center">
                                <div className="flex items-center h-7 w-fit p-2 bg-default rounded-md">{paymentInfoMap[payment]?.icon}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <hr className="tb-divider mt-8" />
        </div>
    );
};

export default PaymentDetails;
