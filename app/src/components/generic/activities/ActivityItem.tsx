import type React from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Trash2, FileSpreadsheet, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import type { Activity } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteActivity } from "@/hooks/useActivities";
import { ConfirmDrawer } from "../confirm-drawer";
import { useOverlayTriggerState } from "react-stately";

const ActivityTypeIcon = ({ type, isSuccess }: { type: string; isSuccess: boolean }) => {
    if (type === "PRODUCT_EXPORT") {
        return isSuccess
            ? <FileSpreadsheet className="text-emerald-600" size={16} />
            : <AlertCircle className="text-red-500" size={16} />;
    }
    return <RefreshCw className="text-blue-500" size={16} />;
};

const StatusBadge = ({ isSuccess, activityType }: { isSuccess: boolean; activityType: string }) => {
    if (activityType === "PRODUCT_EXPORT") {
        return <Badge variant={isSuccess ? "success-subtle" : "destructive"}>{isSuccess ? "Completed" : "Failed"}</Badge>;
    }
    return <Badge variant="success">Success</Badge>;
};

const accentClass = (type: string, isSuccess: boolean) => {
    if (type === "PRODUCT_EXPORT") {
        return isSuccess
            ? "border-l-[3px] border-l-emerald-500 rounded-l-none"
            : "border-l-[3px] border-l-red-500 rounded-l-none";
    }
    return "border-l-[3px] border-l-blue-500 rounded-l-none";
};

export const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const deleteState = useOverlayTriggerState({});
    const { mutateAsync: deleteActivity, isPending } = useDeleteActivity();

    const handleDeleteActivity = async (id: number) => {
        deleteActivity(id);
    };

    return (
        <div
            className={`bg-card border border-border ${accentClass(activity.activity_type, activity.is_success)} p-4 sm:p-5 mt-0 md:mt-2.5`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <ActivityTypeIcon isSuccess={activity.is_success} type={activity.activity_type} />
                    <StatusBadge activityType={activity.activity_type} isSuccess={activity.is_success} />
                </div>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
            </div>

            <p className="text-sm font-medium leading-snug">{activity.description}</p>

            <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                {activity.action_download_url ? (
                    <a
                        download
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
                        href={activity.action_download_url}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download file
                    </a>
                ) : (
                    <span />
                )}

                <ConfirmDrawer
                    open={deleteState.isOpen}
                    onOpenChange={deleteState.setOpen}
                    trigger={
                        <Button
                            aria-label={`Remove ${activity.description}`}
                            startContent={<Trash2 className="w-3.5 h-3.5" />}
                            variant="ghost"
                            size="sm"
                            className="text-destructive border border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        >
                            Delete
                        </Button>
                    }
                    onClose={deleteState.close}
                    onConfirm={() => handleDeleteActivity(activity.id)}
                    title="Delete"
                    description="This action cannot be undone. This will permanently delete the activity."
                    isLoading={isPending}
                />
            </div>
        </div>
    );
};