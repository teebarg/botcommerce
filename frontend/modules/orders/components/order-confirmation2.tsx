"use client"

import { Order, OrderStatus, PaymentStatus } from "@/lib/models";
import FailedPayment from "./order-failed";
import PendingPayment from "./order-pending";
import SuccessConfirmation from "./order-success";

type OrderConfirmationProps = {
    status: PaymentStatus;
    order: Order;
    onRetry?: () => void;
    onContinueShopping?: () => void;
  };

const OrderConfirmation: React.FC<OrderConfirmationProps> = (props) => {
    const { status } = props;
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
        {status === "COMPLETED" && <SuccessConfirmation {...props} />}
        {status === "PENDING" && <PendingPayment {...props} />}
        {status === "FAILED" && <FailedPayment {...props} />}
      </div>
    );
  };

export default OrderConfirmation
