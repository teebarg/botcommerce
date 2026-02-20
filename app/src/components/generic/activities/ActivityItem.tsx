import type React from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Trash2, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Activity } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteActivity } from "@/hooks/useActivities";
import { ConfirmDrawer } from "../confirm-drawer";
import { useOverlayTriggerState } from "react-stately";

const ActivityTypeIcon = ({ type, isSuccess }: { type: string; isSuccess: boolean }) => {
    if (type === "PRODUCT_EXPORT") {
        return isSuccess ? <FileSpreadsheet className="text-emerald-600" size={20} /> : <AlertCircle className="text-red-500" size={20} />;
    }

    return <CheckCircle2 className="text-blue-500" size={20} />;
};

const StatusBadge = ({ isSuccess, activityType }: { isSuccess: boolean; activityType: string }) => {
    if (activityType === "PRODUCT_EXPORT") {
        return <Badge variant={isSuccess ? "emerald" : "destructive"}>{isSuccess ? "Completed" : "Failed"}</Badge>;
    }

    return <Badge variant="blue">Success</Badge>;
};

export const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const deleteState = useOverlayTriggerState({});
    const { mutateAsync: deleteActivity, isPending } = useDeleteActivity();

    const handleDeleteActivity = async (id: number) => {
        deleteActivity(id);
    };

    return (
        <div className="group bg-card rounded-xl shadow-sm p-4 sm:p-6 mt-0 md:mt-2.5">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="shrink-0 mt-0.5">
                        <ActivityTypeIcon isSuccess={activity.is_success} type={activity.activity_type} />
                    </div>
                    <div className="hidden sm:block">
                        <StatusBadge activityType={activity.activity_type} isSuccess={activity.is_success} />
                    </div>
                </div>

                <div className="sm:hidden flex items-center space-x-1">
                    <StatusBadge activityType={activity.activity_type} isSuccess={activity.is_success} />
                </div>
            </div>
            <div className="space-y-3">
                <div>
                    <p className="text-sm sm:text-base font-medium leading-relaxed">{activity.description}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between space-y-3 sm:space-y-0 pt-2">
                    <ConfirmDrawer
                        open={deleteState.isOpen}
                        onOpenChange={deleteState.setOpen}
                        trigger={
                            <Button
                                aria-label={`Remove ${activity.description}`}
                                size="sm"
                                startContent={<Trash2 className="w-4 h-4" />}
                                variant="destructive"
                            >
                                Delete
                            </Button>
                        }
                        onClose={deleteState.close}
                        onConfirm={() => handleDeleteActivity(activity.id)}
                        title="Delete"
                        description="This action cannot be undone. This will permanently delete the chat."
                        isLoading={isPending}
                    />
                    {activity.action_download_url && (
                        <a
                            download
                            className="inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
                            href={activity.action_download_url}
                        >
                            <Download className="w-4 h-4 mr-2 group-hover/link:-translate-y-px transition-transform" />
                            Download File
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
