import type React from "react";
import { useState } from "react";
import { CheckCircle, Clock, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentStatus } from "@/schemas";
import { useChangePaymentStatus } from "@/hooks/useOrder";

interface PaymentStatusManagerProps {
    id: number;
    currentStatus: PaymentStatus;
    orderNumber: string;
    onClose?: () => void;
}

const statusConfig = {
    PENDING: {
        icon: Clock,
        label: "Pending",
        variant: "warning-subtle" as const,
        description: "Payment is being processed",
    },
    SUCCESS: {
        icon: CheckCircle,
        label: "Success",
        variant: "success-subtle" as const,
        description: "Payment completed successfully",
    },
    FAILED: {
        icon: X,
        label: "Failed",
        variant: "destructive" as const,
        description: "Payment was unsuccessful",
    },
    REFUNDED: {
        icon: RotateCcw,
        label: "Refunded",
        variant: "secondary" as const,
        description: "Payment has been refunded",
    },
};

const PaymentStatusManager: React.FC<PaymentStatusManagerProps> = ({ id, currentStatus, orderNumber, onClose }) => {
    const { mutateAsync: changePaymentStatus, isPending } = useChangePaymentStatus();
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(currentStatus);

    const handleStatusUpdate = async () => {
        if (selectedStatus === currentStatus) return;
        changePaymentStatus({ id, status: selectedStatus }).then(() => onClose?.());
    };

    const currentConfig = statusConfig[currentStatus];
    const CurrentIcon = currentConfig.icon;
    const hasChanges = selectedStatus !== currentStatus;

    return (
        <div className="w-full max-w-md mx-auto py-4">
            <div className="mb-5">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Payment status</p>
                <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 mb-5">
                <div className="flex items-start gap-3">
                    <CurrentIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Current status</span>
                            <Badge variant={currentConfig.variant}>{currentConfig.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 mb-5">
                <label className="text-sm font-medium">Change status</label>
                <Select value={selectedStatus} onValueChange={(value: PaymentStatus) => setSelectedStatus(value)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const Icon = config.icon;
                            return (
                                <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{config.label}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2">
                <Button disabled={isPending} variant="outline" className="rounded-full" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    disabled={!hasChanges || isPending}
                    isLoading={isPending}
                    variant={hasChanges ? "default" : "outline"}
                    className="rounded-full"
                    onClick={handleStatusUpdate}
                >
                    {hasChanges ? "Update status" : "No changes"}
                </Button>
            </div>
        </div>
    );
};

export default PaymentStatusManager;