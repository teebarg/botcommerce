import { paymentInfoMap } from "@lib/constants";
import { Order } from "types/global";

type PaymentDetailsProps = {
    order: Order;
};

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
    const payment = order.payment_session;

    return (
        <div>
            <h2 className="flex flex-row text-2xl my-6">Payment</h2>
            <div>
                {payment && (
                    <div className="flex items-start gap-x-1 w-full">
                        <div className="flex flex-col w-1/3">
                            <p className="text-lg text-default-800 mb-1">Payment method</p>
                            <p className="text-base text-default-500" data-testid="payment-method">
                                {paymentInfoMap[payment.id]?.title}
                            </p>
                        </div>
                        <div className="flex flex-col w-2/3">
                            <p className="text-base text-default-800 mb-1">Payment details</p>
                            <div className="flex gap-2 txt-medium text-default-700 items-center">
                                <div className="flex items-center h-7 w-fit p-2 bg-default rounded-md">{paymentInfoMap[payment.id]?.icon}</div>
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
