import { useEffect, useMemo, useState } from "react";
import { Loader2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Coupon } from "@/schemas";
import { useAssignCoupon } from "@/hooks/useCoupon";
import { useUsers } from "@/hooks/useUser";

type CouponUser = NonNullable<Coupon["users"]>[number];

interface AssignmentDialogProps {
    couponId: number;
    couponCode: string;
    assignedUsers?: CouponUser[];
}

export const AssignmentDialog = ({ couponId, couponCode, assignedUsers }: AssignmentDialogProps) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [debouncedSearch] = useDebounce(searchQuery, 400);

    const assignCoupon = useAssignCoupon();
    const memoizedAssignedUsers = useMemo(() => assignedUsers ?? [], [assignedUsers]);
    const assignedUserIds = useMemo(() => memoizedAssignedUsers.map((user) => user.id), [memoizedAssignedUsers]);
    const assignedUserIdsSet = useMemo(() => new Set(assignedUserIds), [assignedUserIds]);

    const { data: usersResponse, isLoading: isUsersLoading } = useUsers(
        {
            skip: 0,
            limit: 50,
            status: "ACTIVE",
            query: debouncedSearch || undefined,
        },
        { enabled: open }
    );

    const availableUsers = useMemo(() => {
        const fetchedUsers = usersResponse?.users ?? [];

        return fetchedUsers.filter((user) => !assignedUserIdsSet.has(user.id));
    }, [usersResponse, assignedUserIdsSet]);

    const selectedAssignedIds = selectedUsers.filter((id) => assignedUserIdsSet.has(id));
    const selectedAvailableIds = selectedUsers.filter((id) => !assignedUserIdsSet.has(id));

    useEffect(() => {
        if (!open) {
            // react-hooks/set-state-in-effect
            setSelectedUsers([]);
            setSearchQuery("");
        }
    }, [open]);

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const updateAssignments = async (nextUserIds: number[], title: string, description?: string) => {
        try {
            await assignCoupon.mutateAsync({ id: couponId, userIds: nextUserIds });
            toast.success(title, description ? { description } : undefined);
            setSelectedUsers([]);
        } catch (error) {
            // Error toast handled inside the mutation hook
        }
    };

    const handleAddUsers = async () => {
        if (selectedAvailableIds.length === 0) return;

        const newAssignedUserIds = Array.from(new Set([...assignedUserIds, ...selectedAvailableIds]));

        await updateAssignments(
            newAssignedUserIds,
            "Users added",
            `${selectedAvailableIds.length} user${selectedAvailableIds.length > 1 ? "s" : ""} assigned to ${couponCode}`
        );
    };

    const handleRemoveUser = async (userId: number) => {
        if (!assignedUserIdsSet.has(userId)) return;
        const newAssignedUserIds = assignedUserIds.filter((id) => id !== userId);
        const user = memoizedAssignedUsers.find((u) => u.id === userId);

        await updateAssignments(newAssignedUserIds, "User removed", `${user?.first_name ?? "User"} removed from ${couponCode}`);
    };

    const handleRemoveSelected = async () => {
        if (selectedAssignedIds.length === 0) return;
        const newAssignedUserIds = assignedUserIds.filter((id) => !selectedAssignedIds.includes(id));

        await updateAssignments(
            newAssignedUserIds,
            "Users removed",
            `${selectedAssignedIds.length} user${selectedAssignedIds.length > 1 ? "s" : ""} removed from ${couponCode}`
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="sm" variant="outline">
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
                            <h3 className="text-sm font-semibold">Assigned Users ({memoizedAssignedUsers.length})</h3>
                            {selectedAssignedIds.length > 0 && (
                                <Button
                                    className="w-full sm:w-auto"
                                    disabled={assignCoupon.isPending}
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleRemoveSelected}
                                >
                                    Remove Selected
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[300px] rounded-md border bg-muted/20 p-4">
                            {memoizedAssignedUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No users assigned yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {memoizedAssignedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedUsers.includes(user.id)}
                                                    disabled={assignCoupon.isPending}
                                                    onCheckedChange={() => toggleUserSelection(user.id)}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                disabled={assignCoupon.isPending}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveUser(user.id)}
                                            >
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
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h3 className="text-sm font-semibold">Available Users ({availableUsers.length})</h3>
                                {selectedAvailableIds.length > 0 && <Badge variant="secondary">{selectedAvailableIds.length} selected</Badge>}
                            </div>
                            <Input
                                placeholder="Search by name or email"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-[300px] rounded-md border bg-muted/20 p-4">
                            {isUsersLoading ? (
                                <div className="flex items-center justify-center py-8 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : availableUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {memoizedAssignedUsers.length === 0
                                        ? "No users available yet"
                                        : searchQuery
                                          ? "No users match your search"
                                          : "All users assigned"}
                                </p>
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
                                                disabled={assignCoupon.isPending}
                                                onCheckedChange={() => toggleUserSelection(user.id)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {user.first_name} {user.last_name}
                                                </p>
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
                    <Button className="w-full sm:w-auto" variant="outline" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <Button
                        className="w-full sm:w-auto"
                        disabled={selectedAvailableIds.length === 0 || assignCoupon.isPending}
                        onClick={handleAddUsers}
                    >
                        {assignCoupon.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assign Selected Users
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
