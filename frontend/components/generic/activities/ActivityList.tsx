"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Activity } from "@/types/models";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { TableSkeleton } from "@/components/ui/skeletons";

interface ActivityListProps {
    activities: Activity[];
    isLoading?: boolean;
    onRemove: (id: number) => void;
}

const getActivityIcon = (activityType: string) => {
    switch (activityType) {
        case "PRODUCT_UPLOAD":
            return <Upload className="w-5 h-5" />;
        case "PRODUCT_EXPORT":
            return <Download className="w-5 h-5" />;
        default:
            return null;
    }
};

const getStatusIcon = (isSuccess: boolean) => {
    return isSuccess ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />;
};

export const ActivityList: React.FC<ActivityListProps> = ({ activities, isLoading, onRemove }) => {
    const [removing, setRemoving] = useState<number | null>(null);

    if (isLoading) {
        return <TableSkeleton />;
    }

    if (!activities.length) {
        return <div className="text-center py-8 text-default-500">No activities found</div>;
    }

    const handleDeleteActivity = async (id: number) => {
        setRemoving(id);
        const { error } = await api.activities.deleteActivity(id);

        if (error) {
            toast.error(error);

            return;
        }

        toast.success("Activity deleted successfully");
        onRemove(id);
        setRemoving(null);
    };

    return (
        <div className="space-y-4">
            {activities.map((activity: Activity, idx: number) => (
                <div key={idx} className="bg-background rounded-lg shadow p-4 flex items-start space-x-4">
                    <div className="shrink-0">{getActivityIcon(activity.activity_type)}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-default-900">{activity.description}</p>
                        <p className="text-sm text-default-500">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</p>
                        {activity.action_download_url && (
                            <a
                                download
                                className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                                href={activity.action_download_url}
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </a>
                        )}
                        <Button
                            aria-label="remove activity"
                            className="mt-4 min-w-32"
                            disabled={removing === activity.id}
                            isLoading={removing === activity.id}
                            variant="destructive"
                            onClick={() => handleDeleteActivity(activity.id)}
                        >
                            Delete
                        </Button>
                    </div>
                    <div className="shrink-0">{getStatusIcon(activity.is_success)}</div>
                </div>
            ))}
        </div>
    );
};
