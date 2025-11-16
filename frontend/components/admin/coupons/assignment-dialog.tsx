import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, X } from "lucide-react";
import { User } from "@/schemas";
import { useCouponAssignment } from "@/lib/hooks/useCoupon";
import { toast } from "sonner";

interface AssignmentDialogProps {
    couponId: number;
    couponCode: string;
    assignedUserIds: number[];
}

export const AssignmentDialog = ({ couponId, couponCode, assignedUserIds }: AssignmentDialogProps) => {
    const DUMMY_USERS: User[] = [];
    const [open, setOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const updateCoupon = useCouponAssignment();

    const assignedUsers = DUMMY_USERS.filter((user) => assignedUserIds.includes(user.id));
    const availableUsers = DUMMY_USERS.filter((user) => !assignedUserIds.includes(user.id));

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const handleAddUsers = () => {
        if (selectedUsers.length === 0) return;

        const newAssignedUserIds = [...assignedUserIds, ...selectedUsers];
        updateCoupon.mutate({ id: couponId, assignedUserIds: newAssignedUserIds });

        toast.success("Users added", {
            description: `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} assigned to ${couponCode}`,
        });

        setSelectedUsers([]);
    };

    const handleRemoveUser = (userId: number) => {
        const newAssignedUserIds = assignedUserIds.filter((id) => id !== userId);
        updateCoupon.mutate({ id: couponId, assignedUserIds: newAssignedUserIds });

        const user = DUMMY_USERS.find((u) => u.id === userId);
        toast.success("User removed", {
            description: `${user?.first_name} removed from ${couponCode}`,
        });
    };

    const handleRemoveSelected = () => {
        const usersToRemove = assignedUsers.filter((user) => selectedUsers.includes(user.id)).map((user) => user.id);

        if (usersToRemove.length === 0) return;

        const newAssignedUserIds = assignedUserIds.filter((id) => !usersToRemove.includes(id));
        updateCoupon.mutate({ id: couponId, assignedUserIds: newAssignedUserIds });

        toast.success("Users removed", {
            description: `${usersToRemove.length} user${usersToRemove.length > 1 ? "s" : ""} removed from ${couponCode}`,
        });

        setSelectedUsers([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl">Manage Users for {couponCode}</DialogTitle>
                    <DialogDescription className="text-sm">Assign or remove users who can use this coupon</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Assigned Users */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-sm font-semibold">Assigned Users ({assignedUsers.length})</h3>
                            {selectedUsers.length > 0 && assignedUsers.some((u) => selectedUsers.includes(u.id)) && (
                                <Button variant="destructive" size="sm" onClick={handleRemoveSelected} className="w-full sm:w-auto">
                                    Remove Selected
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[300px] rounded-md border bg-muted/20 p-4">
                            {assignedUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No users assigned yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {assignedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={() => toggleUserSelection(user.id)}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(user.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Available Users */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-sm font-semibold">Available Users ({availableUsers.length})</h3>
                            {selectedUsers.length > 0 && availableUsers.some((u) => selectedUsers.includes(u.id)) && (
                                <Badge variant="secondary">{selectedUsers.filter((id) => !assignedUserIds.includes(id)).length} selected</Badge>
                            )}
                        </div>
                        <ScrollArea className="h-[300px] rounded-md border bg-muted/20 p-4">
                            {availableUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">All users assigned</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                            onClick={() => toggleUserSelection(user.id)}
                                        >
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => toggleUserSelection(user.id)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{user.first_name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button
                        onClick={handleAddUsers}
                        disabled={selectedUsers.length === 0 || !selectedUsers.some((id) => !assignedUserIds.includes(id))}
                        className="w-full sm:w-auto"
                    >
                        Add {selectedUsers.filter((id) => !assignedUserIds.includes(id)).length || ""} User
                        {selectedUsers.filter((id) => !assignedUserIds.includes(id)).length !== 1 ? "s" : ""}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
