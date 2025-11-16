import { useState } from "react";
import { History } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { CouponUsage } from "@/schemas/common";
import { currency, formatDate } from "@/lib/utils";

interface CouponUsageDialogProps {
    couponCode: string;
    usageHistory: CouponUsage[];
    couponType?: "PERCENTAGE" | "FIXED_AMOUNT";
    assignedUserIds?: number[];
}

export const CouponUsageDialog = ({ couponCode, usageHistory, couponType, assignedUserIds }: CouponUsageDialogProps) => {
    const [open, setOpen] = useState(false);
    const totalDiscountGiven = usageHistory.reduce((total, usage) => total + usage.discount_amount, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="sm" variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Usage History ({usageHistory.length})</span>
                    <span className="sm:hidden">History ({usageHistory.length})</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">Usage History: {couponCode}</DialogTitle>
                    <DialogDescription className="text-sm">Track who used this coupon and when</DialogDescription>
                </DialogHeader>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/50">
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Total Uses</p>
                        <p className="text-xl md:text-2xl font-bold">{usageHistory.length}</p>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-muted-foreground">Total Discount Given</p>
                        <p className="text-xl md:text-2xl font-bold text-destructive">{currency(totalDiscountGiven)}</p>
                    </div>
                </div>

                {usageHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No usage history yet</p>
                        <p className="text-sm text-muted-foreground mt-1">This coupon hasn't been used by anyone</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <ScrollArea className="h-[400px] rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Date Used</TableHead>
                                            {/* <TableHead className="text-right">Cart Total</TableHead> */}
                                            <TableHead className="text-right">Discount Applied</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usageHistory.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {record.user.first_name} {record.user.last_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{record.user.email}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{formatDate(record.created_at)}</span>
                                                    </div>
                                                </TableCell>
                                                {/* <TableCell className="text-right font-medium">${record.cartTotal.toFixed(2)}</TableCell> */}
                                                <TableCell className="text-right">
                                                    <Badge variant="destructive">-{currency(record.discount_amount)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>

                        {/* Mobile Card View */}
                        <ScrollArea className="md:hidden h-[400px]">
                            <div className="space-y-3">
                                {usageHistory.map((record) => (
                                    <Card key={record.id}>
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">
                                                        {record.user.first_name} {record.user.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{record.user.email}</p>
                                                </div>
                                                <Badge variant="destructive">-{currency(record.discount_amount)}</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Date</p>
                                                    <p>{formatDate(record.created_at)}</p>
                                                </div>
                                                {/* <div className="text-right">
                                                    <p className="text-muted-foreground text-xs">Cart Total</p>
                                                    <p className="font-medium">${record.cartTotal.toFixed(2)}</p>
                                                </div> */}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
