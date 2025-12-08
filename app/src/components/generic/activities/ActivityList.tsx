import type React from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Trash2, Activity as ActivityIcon, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

import type { Activity } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteActivity } from "@/hooks/useActivities";

interface ActivityListProps {
    activities: Activity[];
}

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

export const ActivityListItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const { mutateAsync: deleteActivity, isPending } = useDeleteActivity();

    const handleDeleteActivity = async (id: number) => {
        deleteActivity(id);
    };

    return (
        <div className="group bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-4 sm:p-6">
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
                        <Button
                            aria-label={`Remove ${activity.description}`}
                            disabled={isPending}
                            isLoading={isPending}
                            size="sm"
                            startContent={<Trash2 className="w-4 h-4" />}
                            variant="destructive"
                            onClick={() => handleDeleteActivity(activity.id)}
                        >
                            Delete
                        </Button>
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
        </div>
    );
};

export const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
    if (!activities.length) {
        return (
            <div className="text-center py-12 bg-secondary">
                <div className="w-16 h-16 mx-auto mb-4 bg-contrast/10 rounded-full flex items-center justify-center">
                    <ActivityIcon className="w-8 h-8 text-contrast" />
                </div>
                <h3 className="text-xl font-medium">No activities yet</h3>
                <p className="text-muted-foreground">Activities will appear here</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-4 px-1 md:px-6 md:py-12">
            <div className="space-y-2 sm:space-y-6">
                {activities.map((activity: Activity, idx: number) => (
                    <ActivityListItem key={idx} activity={activity} />
                ))}
            </div>
        </div>
    );
};
