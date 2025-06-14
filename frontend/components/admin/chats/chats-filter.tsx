import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConversationStatus } from "@/schemas";
import { Select } from "@/components/ui/select";

export interface CustomerFilterOptions {
    user_id?: number;
    status?: ConversationStatus;
}

interface CustomerFilterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChatsFilter = ({ open, onOpenChange }: CustomerFilterProps) => {
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
                    <DialogTitle>Filter Chats</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                value={filters.user_id}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        user_id: Number(e.target.value),
                                    }))
                                }
                            />
                            <Label htmlFor="user-id">User ID</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        status: value as ConversationStatus,
                                    }))
                                }
                            />
                            <Label htmlFor="status">Status</Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between">
                    <Button variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChatsFilter;
