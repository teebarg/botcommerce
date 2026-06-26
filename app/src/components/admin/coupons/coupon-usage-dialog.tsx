import { useState } from "react";
import { History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CouponUsage } from "@/schemas/common";
import { currency, formatDate } from "@/utils";
import { Separator } from "@/components/ui/separator";

interface CouponUsageDialogProps {
    couponCode: string;
    usageHistory: CouponUsage[];
    couponType?: "PERCENTAGE" | "FIXED_AMOUNT";
    assignedUserIds?: number[];
}


export const CouponUsageDialog = ({ couponCode, usageHistory }: CouponUsageDialogProps) => {
    const [open, setOpen] = useState(false);
    const totalDiscountGiven = usageHistory.reduce((total, usage) => total + usage.discount_amount, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="text-muted-foreground hover:text-foreground bg-muted gap-1.5"
                >
                    <History className="h-4 w-4" />
                    History ({usageHistory.length})
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[75vh] flex flex-col gap-0 p-0 overflow-hidden">

                <DialogHeader className="px-6 pt-6 pb-5 shrink-0">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                        Coupon
                    </p>
                    <DialogTitle className="text-base font-medium mb-4">
                        {couponCode}
                    </DialogTitle>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-muted/60 rounded-xl px-4 py-2.5">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                                Total uses
                            </p>
                            <p className="text-2xl font-medium">{usageHistory.length}</p>
                        </div>
                        <div className="bg-muted/60 rounded-xl px-4 py-2.5">
                            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                                Discount given
                            </p>
                            <p className="text-2xl font-medium">{currency(totalDiscountGiven)}</p>
                        </div>
                    </div>
                </DialogHeader>

                <Separator />

                {usageHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <History className="h-8 w-8 text-muted-foreground/30 mb-3" />
                        <p className="text-sm font-medium mb-1">No usage yet</p>
                        <p className="text-xs text-muted-foreground">
                            This coupon hasn't been used by anyone.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="px-6">
                            {usageHistory.map((record, i) => (
                                <div key={record.id}>
                                    <div className="py-4 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{record.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{record.email}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-medium">−{currency(record.discount_amount)}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(record.created_at)}</p>
                                        </div>
                                    </div>
                                    {i < usageHistory.length - 1 && <Separator />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};
