import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Bell, Trash2 } from "lucide-react";
import { Cancel, Excel } from "nui-react-icons";

import { Spinner } from "@/components/generic/spinner";
import { useStore } from "@/app/store/use-store";
import { Activity } from "@/types/models";
import { api } from "@/apis";

interface Props {
    activities: Activity[];
    onRemove: (id: string | number) => void;
}

const ActivityView: React.FC<Props> = ({ activities, onRemove }) => {
    const [removing, setRemoving] = useState<number | string | null>(null);
    const { shopSettings } = useStore();

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

    if (activities?.length == 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-linear-to-b from-background to-content2 border border-gray-100 rounded-lg shadow-sm h-full">
                <div className="relative mb-6">
                    {/* Background decoration circles */}
                    <div className="absolute -z-10 animate-pulse">
                        <div className="absolute -top-8 -left-8 w-16 h-16 bg-blue-100 rounded-full opacity-20" />
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-100 rounded-full opacity-20" />
                    </div>

                    {/* Main icon group */}
                    <div className="relative flex items-center justify-center bg-white rounded-full p-4 shadow-md">
                        <svg
                            className="w-8 h-8 text-blue-500"
                            fill="none"
                            height="24"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                        </svg>
                        <div className="absolute -top-2 -right-2">
                            <div className="relative">
                                <Bell className="w-5 h-5 text-purple-500" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-default-900 mb-2">No Recent Activity</h3>

                <p className="text-default-500 text-center mb-6 max-w-sm">
                    Your activity feed is empty right now. New notifications and updates will appear here as they happen.
                </p>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="text-lg font-semibold pt-7 pl-8 pb-1">Activity</div>
            <div>
                {activities?.map((item: Activity, index: number) => (
                    <div key={index} className="border-default-100 mx-8 border-b last:border-b-0">
                        <div className="hover:bg-default-100 -mx-8 flex px-8 py-6">
                            <div className="relative h-full w-full">
                                <div className="text-default-500 flex justify-between">
                                    <div className="flex items-center">
                                        <span className="text-sm font-semibold">{shopSettings?.shop_name}</span>
                                    </div>
                                    <span>
                                        <div className="flex text-sm font-semibold">
                                            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                                            <div className="flex items-center ml-2">
                                                <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-800" />
                                            </div>
                                        </div>
                                    </span>
                                </div>
                                <div className="pl-8p">
                                    <div className="text-sm flex flex-col">
                                        <span>{item.description}</span>
                                        {item.activity_type == "PRODUCT_EXPORT" && (
                                            <div className="mt-4 flex w-full cursor-pointer items-center">
                                                <div className="border-grey-20p flex items-center justify-center rounded-lg border p-2.5">
                                                    {item.is_success ? <Excel /> : <Cancel className="text-default-500" size={18} />}
                                                </div>
                                                <div className="relative w-full pl-4 text-left">
                                                    <div className="text-sm max-w-[80%] overflow-hidden truncate">{item.action_download_url}</div>
                                                    {!item.is_success && (
                                                        <span>
                                                            <div className="text-grey-40 text-sm text-rose-500">Job failed</div>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 flex">
                                        <div className="flex">
                                            <button
                                                aria-label="remove activity"
                                                className="text-rose-500"
                                                data-testid="activity-delete-button"
                                                onClick={() => removeActivity(item.id)}
                                            >
                                                {removing == item.id ? <Spinner /> : <Trash2 />}
                                            </button>
                                            {item.is_success && item.activity_type == "product_export" && (
                                                <a
                                                    download
                                                    className="flex items-center whitespace-nowrap font-normal overflow-hidden bg-success text-white ml-2 px-3 min-w-16 h-8 text-xs rounded-lg"
                                                    href={item.action_download_url}
                                                >
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    );
};

export default ActivityView;
