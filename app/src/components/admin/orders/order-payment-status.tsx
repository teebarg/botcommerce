import type React from "react";
import { useState } from "react";
import { CheckCircle, Clock, X, RotateCcw } from "lucide-react";
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

const statusConfig: Record<PaymentStatus, { icon: React.ElementType; label: string; description: string }> = {
    PENDING: { icon: Clock, label: "Pending", description: "Payment is being processed" },
    SUCCESS: { icon: CheckCircle, label: "Paid", description: "Payment completed successfully" },
    FAILED: { icon: X, label: "Failed", description: "Payment was unsuccessful" },
    REFUNDED: { icon: RotateCcw, label: "Refunded", description: "Payment has been refunded" },
};

const PaymentStatusManager: React.FC<PaymentStatusManagerProps> = ({ id, currentStatus, orderNumber, onClose }) => {
    const { mutateAsync: changePaymentStatus, isPending } = useChangePaymentStatus();
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(currentStatus);

    const current = statusConfig[currentStatus];
    const CurrentIcon = current.icon;
    const hasChanges = selectedStatus !== currentStatus;

    const handleUpdate = async () => {
        if (!hasChanges) return;
        changePaymentStatus({ id, status: selectedStatus }).then(() => {
            onClose?.();
        });
    };

    return (
        <div className="w-full max-w-md mx-auto py-4 space-y-5">
            <div>
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">Payment status</p>
                <p className="text-sm text-muted-foreground">Order {orderNumber}</p>
            </div>

            <div className="rounded-xl border border-border bg-card px-4 py-3.5">
                <div className="flex items-start gap-3">
                    <CurrentIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-0.5">Current</p>
                        <p className="text-sm font-medium text-foreground">{current.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{current.description}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Change to
                </label>
                <Select value={selectedStatus} onValueChange={(v: PaymentStatus) => setSelectedStatus(v)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusConfig).map(([status, config]) => {
                            const Icon = config.icon;
                            return (
                                <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{config.label}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2 pt-1">
                <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    disabled={isPending}
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className="flex-1 rounded-full"
                    disabled={!hasChanges || isPending}
                    isLoading={isPending}
                    onClick={handleUpdate}
                >
                    {hasChanges ? "Update status" : "No changes"}
                </Button>
            </div>
        </div>
    );
};

export default PaymentStatusManager;