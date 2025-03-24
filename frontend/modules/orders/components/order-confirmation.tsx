"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle } from "nui-react-icons";
import { Button } from "@/components/ui/button";
import { BtnLink } from "@/components/ui/btnLink";
import { currency } from "@/lib/util/util";
import LocalizedClientLink from "@/components/ui/link";
import { ChevronRight } from "nui-react-icons";
import { CheckCircle, XCircle } from "lucide-react";
import { Order } from "@/lib/models";

interface OrderConfirmationProps {
    order: Order;
}

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const scaleIn = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 }
};

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusConfig = () => {
        switch (order.payment_status) {
            case "COMPLETED":
                return {
                    icon: <CheckCircle className="w-16 h-16 text-green-500" />,
                    title: "Payment Successful!",
                    subtitle: "Thank you for your purchase",
                    color: "text-green-500",
                    bgColor: "bg-green-50",
                    action: "Continue Shopping"
                };
            case "PENDING":
                return {
                    icon: <Clock className="w-16 h-16 text-yellow-500" />,
                    title: "Payment Pending",
                    subtitle: "Please complete your payment",
                    color: "text-yellow-500",
                    bgColor: "bg-yellow-50",
                    action: "View Payment Details"
                };
            case "FAILED":
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500" />,
                    title: "Payment Failed",
                    subtitle: "There was an issue with your payment",
                    color: "text-red-500",
                    bgColor: "bg-red-50",
                    action: "Try Again"
                };
            default:
                return {
                    icon: <AlertCircle className="w-16 h-16 text-gray-500" />,
                    title: "Unknown Status",
                    subtitle: "Please contact support",
                    color: "text-gray-500",
                    bgColor: "bg-gray-50",
                    action: "Contact Support"
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-8" data-slot="base">
                    <ol className="flex flex-wrap list-none rounded-lg" data-slot="list">
                        <li className="flex items-center" data-slot="base">
                            <LocalizedClientLink href="/">Home</LocalizedClientLink>
                            <span className="px-1 text-foreground/50" data-slot="separator">
                                <ChevronRight />
                            </span>
                        </li>
                        <li className="flex items-center" data-slot="base">
                            <span>Order Confirmation</span>
                        </li>
                    </ol>
                </nav>

                {/* Main Content */}
                <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                    className="bg-content1 rounded-lg shadow-lg p-8"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            variants={scaleIn}
                            className="flex justify-center mb-4"
                        >
                            {statusConfig.icon}
                        </motion.div>
                        <motion.h1
                            variants={fadeIn}
                            className={`text-3xl font-bold mb-2 ${statusConfig.color}`}
                        >
                            {statusConfig.title}
                        </motion.h1>
                        <motion.p
                            variants={fadeIn}
                            className="text-gray-600 mb-6"
                        >
                            {statusConfig.subtitle}
                        </motion.p>
                    </div>

                    {/* Order Details */}
                    <motion.div
                        variants={fadeIn}
                        className={`${statusConfig.bgColor} rounded-lg p-6 mb-8`}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Number:</span>
                                <span className="font-semibold">{order.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-semibold">{order.payment_method}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold">{currency(order.total)}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={fadeIn}
                        className="flex flex-col gap-4"
                    >
                        {order.status === "PENDING" && (
                            <Button
                                size="lg"
                                className="w-full"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? "Hide Payment Details" : "Show Payment Details"}
                            </Button>
                        )}
                        <BtnLink
                            color="primary"
                            href="/collections"
                            className="w-full"
                        >
                            {statusConfig.action}
                        </BtnLink>
                    </motion.div>

                    {/* Payment Details (for pending payments) */}
                    <AnimatePresence>
                        {showDetails && order.status === "PENDING" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-6 p-4 bg-gray-50 rounded-lg"
                            >
                                <h3 className="font-semibold mb-2">Bank Transfer Details</h3>
                                <div className="space-y-2">
                                    <p>Bank: Your Bank Name</p>
                                    <p>Account Number: 1234567890</p>
                                    <p>Account Name: Your Store Name</p>
                                    <p>Reference: {order.order_number}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
} 