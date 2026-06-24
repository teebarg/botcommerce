import type React from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Clock, Download, FileSpreadsheet, RefreshCw, Trash2 } from "lucide-react";
import { useConfig } from "@/providers/store-provider";
import type { Activity } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteActivity } from "@/hooks/useActivities";

interface Props {
    activities?: Activity[];
    isLoading: boolean;
}

const ActivityTypeIcon = ({ type, isSuccess }: { type: string; isSuccess: boolean }) => {
    if (type === "PRODUCT_EXPORT") {
        return isSuccess
            ? <FileSpreadsheet size={16} />
            : <AlertCircle size={16} />;
    }
    return <RefreshCw size={16} />;
};

const statusVariant = (type: string, isSuccess: boolean) => {
    if (type === "PRODUCT_EXPORT") return isSuccess ? "success-subtle" : "destructive";
    return "success";
};

const statusLabel = (type: string, isSuccess: boolean) => {
    if (type === "PRODUCT_EXPORT") return isSuccess ? "Completed" : "Failed";
    return "Success";
};

const iconState = (type: string, isSuccess: boolean) => {
    if (type === "PRODUCT_EXPORT") return isSuccess ? "success" : "error";
    return "info";
};

const ActivityViewItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const { shop_name } = useConfig();
    const { mutateAsync: deleteActivity, isPending } = useDeleteActivity();
    const state = iconState(activity.activity_type, activity.is_success);

    const handleDownload = (url: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "products_export.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0">
            <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    state === "success"
                        ? "bg-emerald-50 text-emerald-600"
                        : state === "error"
                        ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-blue-500"
                }`}
            >
                <ActivityTypeIcon isSuccess={activity.is_success} type={activity.activity_type} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <Badge variant={statusVariant(activity.activity_type, activity.is_success)} className="shrink-0">
                        {statusLabel(activity.activity_type, activity.is_success)}
                    </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                    {shop_name} · {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>

                {activity.activity_type === "PRODUCT_EXPORT" && activity.is_success && activity.action_download_url && (
                    <Button
                        size="xs"
                        variant="ghost"
                        className="h-7 px-2.5 text-xs font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleDownload(activity.action_download_url!)}
                    >
                        <Download size={12} className="mr-1.5" />
                        Download file
                    </Button>
                )}

                {activity.activity_type === "PRODUCT_EXPORT" && !activity.is_success && (
                    <p className="text-xs text-red-600">
                        Please try again or contact support if the issue persists.
                    </p>
                )}
            </div>

            <Button
                aria-label="Delete activity"
                disabled={isPending}
                size="icon"
                variant="ghost"
                className="shrink-0 w-7 h-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                onClick={() => deleteActivity(activity.id)}
            >
                {isPending ? (
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-border border-t-red-500 rounded-full" />
                ) : (
                    <Trash2 size={14} />
                )}
            </Button>
        </div>
    );
};

const ActivityView: React.FC<Props> = ({ activities, isLoading }) => {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock size={15} className="text-muted-foreground" />
                    Recent activity
                </div>
                {activities && activities.length > 0 && (
                    <span className="text-xs text-muted-foreground">{activities.length} events</span>
                )}
            </div>

            {isLoading ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : activities?.length === 0 ? (
                <div className="px-4 py-10 text-center">
                    <Clock className="mx-auto mb-2 text-muted-foreground" size={24} />
                    <p className="text-sm font-medium">No activity yet</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your recent activities will appear here.</p>
                </div>
            ) : (
                activities?.map((item, idx) => <ActivityViewItem key={idx} activity={item} />)
            )}
        </div>
    );
};

export default ActivityView;