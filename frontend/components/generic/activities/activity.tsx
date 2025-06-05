import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, Download, FileSpreadsheet, Trash2 } from "lucide-react";

import { useStore } from "@/app/store/use-store";
import { Activity } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
    activities: Activity[];
    onRemove: (id: string | number) => void;
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

const ActivityView: React.FC<Props> = ({ activities, onRemove }) => {
    const [removing, setRemoving] = useState<number | string | null>(null);
    const { shopSettings } = useStore();

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement("a");

        link.href = url;
        link.download = filename || "export.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const removeActivity = async (id: number) => {
        setRemoving(id);
        try {
            const { error } = await api.activities.deleteActivity(id);

            if (error) {
                toast.error(error);

                return;
            }

            onRemove(id); // Remove from UI
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="bg-background rounded-lg shadow-sm border border-default-200">
            {/* Header */}
            <div className="px-6 py-4">
                <h2 className="text-xl font-semibold text-default-900 flex items-center gap-2">
                    <Clock className="text-default-500" size={20} />
                    Recent Activity
                </h2>
            </div>
            <Separator />

            <div className="divide-y divide-default-200">
                {activities.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Clock className="mx-auto h-12 w-12 text-default-400" />
                        <h3 className="mt-2 text-sm font-medium text-default-900">No activity yet</h3>
                        <p className="mt-1 text-sm text-default-500">Your recent activities will appear here.</p>
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="px-6 py-4 hover:bg-content1 transition-colors duration-150">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <ActivityTypeIcon isSuccess={item.is_success} type={item.activity_type} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-default-900 truncate max-w-[200px]">{item.description}</p>
                                            <StatusBadge activityType={item.activity_type} isSuccess={item.is_success} />
                                        </div>

                                        <div className="flex items-center text-xs text-default-500 mb-3">
                                            <span className="font-medium">{shopSettings?.shop_name}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDistanceToNow(new Date(item.created_at))}</span>
                                        </div>

                                        {/* Export specific content */}
                                        {item.activity_type === "PRODUCT_EXPORT" && (
                                            <div className="mt-3">
                                                {item.is_success ? (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <FileSpreadsheet className="text-emerald-600" size={16} />
                                                                <span className="text-sm text-emerald-800 font-medium">Export ready</span>
                                                            </div>
                                                            <Button
                                                                size="xs"
                                                                variant="emerald"
                                                                onClick={() => handleDownload(item.action_download_url!, "products_export.xlsx")}
                                                            >
                                                                <Download className="mr-1" size={14} />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                        <div className="flex items-center space-x-2">
                                                            <AlertCircle className="text-red-500" size={16} />
                                                            <span className="text-sm text-red-800 font-medium">Export failed</span>
                                                        </div>
                                                        <p className="text-xs text-red-600 mt-1">
                                                            Please try again or contact support if the issue persists.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 ml-4">
                                    <Button
                                        aria-label="Remove activity"
                                        disabled={removing === item.id}
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removeActivity(item.id)}
                                    >
                                        {removing === item.id ? (
                                            <div className="animate-spin h-4 w-4 border-2 border-default-200 border-t-red-500 rounded-full" />
                                        ) : (
                                            <Trash2 className="text-red-500" size={16} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityView;
