import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CustomerFilterOptions {
    minOrders?: number;
    minSpent?: number;
    hasAddress?: boolean;
    hasPhone?: boolean;
    recentActivity?: boolean;
}

interface CustomerFilterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CustomerFilter = ({ open, onOpenChange }: CustomerFilterProps) => {
    const [filters, setFilters] = useState<CustomerFilterOptions>({});

    const handleApply = () => {
        onOpenChange(false);
    };

    const handleReset = () => {
        setFilters({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Filter Customers</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-5">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Purchase History</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={filters.minOrders !== undefined}
                                    id="min-orders"
                                    onCheckedChange={(checked) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            minOrders: checked ? 1 : undefined,
                                        }))
                                    }
                                />
                                <Label htmlFor="min-orders">Has placed orders</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={filters.minSpent !== undefined}
                                    id="min-spent"
                                    onCheckedChange={(checked) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            minSpent: checked ? 100 : undefined,
                                        }))
                                    }
                                />
                                <Label htmlFor="min-spent">Has spent money</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={filters.hasPhone}
                                    id="has-phone"
                                    onCheckedChange={(checked) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            hasPhone: checked ? true : undefined,
                                        }))
                                    }
                                />
                                <Label htmlFor="has-phone">Has phone number</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={filters.hasAddress}
                                    id="has-address"
                                    onCheckedChange={(checked) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            hasAddress: checked ? true : undefined,
                                        }))
                                    }
                                />
                                <Label htmlFor="has-address">Has shipping address</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button variant="warning" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button variant="primary" onClick={handleApply}>
                        Apply Filters
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerFilter;
