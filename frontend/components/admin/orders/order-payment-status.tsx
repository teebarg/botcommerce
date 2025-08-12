"use client";

import React, { useState } from "react";
import { CheckCircle, Clock, X, RotateCcw, CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatus } from "@/schemas";
import { useChangePaymentStatus } from "@/lib/hooks/useOrder";

interface PaymentStatusManagerProps {
    id: number;
    currentStatus: PaymentStatus;
    orderNumber: string;
    onClose?: () => void;
}

const PaymentStatusManager: React.FC<PaymentStatusManagerProps> = ({ id, currentStatus, orderNumber, onClose }) => {
    const { mutateAsync: changePaymentStatus, isPending } = useChangePaymentStatus();
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(currentStatus);

    const statusConfig = {
        PENDING: {
            icon: <Clock className="h-4 w-4" />,
            label: "Pending",
            variant: "secondary" as const,
            bgClass: "bg-orange-50 border-orange-200",
            textClass: "text-orange-700",
            description: "Payment is being processed",
        },
        SUCCESS: {
            icon: <CheckCircle className="h-4 w-4" />,
            label: "Success",
            variant: "default" as const,
            bgClass: "bg-green-50 border-green-200",
            textClass: "text-green-700",
            description: "Payment completed successfully",
        },
        FAILED: {
            icon: <X className="h-4 w-4" />,
            label: "Failed",
            variant: "destructive" as const,
            bgClass: "bg-red-50 border-red-200",
            textClass: "text-red-700",
            description: "Payment was unsuccessful",
        },
        REFUNDED: {
            icon: <RotateCcw className="h-4 w-4" />,
            label: "Refunded",
            variant: "outline" as const,
            bgClass: "bg-gray-50 border-gray-200",
            textClass: "text-gray-700",
            description: "Payment has been refunded",
        },
    };

    const handleStatusUpdate = async () => {
        if (selectedStatus === currentStatus) return;

        changePaymentStatus({ id, status: selectedStatus }).then(() => {
            onClose?.();
        });
    };

    const currentConfig = statusConfig[currentStatus];
    const hasChanges = selectedStatus !== currentStatus;

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    Payment Status
                </CardTitle>
                <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg border ${currentConfig.bgClass}`}>
                    <div className="flex items-center gap-3">
                        <div className={currentConfig.textClass}>{currentConfig.icon}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${currentConfig.textClass}`}>Current Status</span>
                                <Badge variant={currentConfig.variant}>{currentConfig.label}</Badge>
                            </div>
                            <p className={`text-sm mt-1 ${currentConfig.textClass} opacity-80`}>{currentConfig.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Change Status</label>
                    <Select value={selectedStatus} onValueChange={(value: PaymentStatus) => setSelectedStatus(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statusConfig).map(([status, config]) => (
                                <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                        {config.icon}
                                        <span>{config.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button disabled={isPending} variant="default" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!hasChanges || isPending}
                        isLoading={isPending}
                        variant={hasChanges ? "luxury" : "outline"}
                        onClick={handleStatusUpdate}
                    >
                        {hasChanges ? "Update Status" : "No Changes"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentStatusManager;
