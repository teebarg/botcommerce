import { fetchWithAuth } from "@lib/util/api";
import React, { useEffect, useState } from "react";

interface Props {}
interface Activity {
    id: number;
    activity_type: string;
    description: string;
    timestamp: string;
    action_download_url: string;
    is_success: boolean;
}

const Activity: React.FC<Props> = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveActivity, setLiveActivity] = useState<any>(null);

    useEffect(() => {
        fetchActivities();
        // Establish WebSocket connection to listen for real-time updates
        const userId = 1; // Example user_id, you can fetch the actual user ID
        const ws = new WebSocket(`ws://localhost:8000/ws/activities/`);

        ws.onmessage = (event) => {
            // Update the live activity message
            setLiveActivity(event.data);

            // Optionally, you could fetch recent activities after receiving the message
            // fetchActivities();
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        const { data, error } = await fetchWithAuth<any>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/`);

        if (error) {
            setError(error);
        } else if (data) {
            setActivities(data);
        }

        setLoading(false);
    };

    return (
        <React.Fragment>
            {/* <div className="bg-grey-0 shadow-dropdown rounded-rounded fixed top-[64px] bottom-2 right-3 flex w-[400px] flex-col overflow-x-hidden rounded z-[1]"> */}
            <div className="inter-large-semibold pt-7 pl-8 pb-1">Activity</div>
            <div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Import of products has failed.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="product-import.csv"
                                        >
                                            <svg fill="none" height="18" viewBox="0 0 20 20" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M15 5L5 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M5 5L15 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">product-import.csv</div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular text-rose-500">Job failed</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Export file is no longer available. The file will only be stored for 24 hours.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="1725639661431_exports/products/product-export-1725639661431"
                                        >
                                            <svg
                                                className="text-grey-40"
                                                fill="none"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                width="20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M13.333 17.5H14.1663C14.8294 17.5 15.4653 17.2366 15.9341 16.7678C16.4029 16.2989 16.6663 15.663 16.6663 15V7.09109C16.6663 6.42805 16.4029 5.79217 15.9341 5.32333L13.843 3.23223C13.3742 2.76339 12.7383 2.5 12.0752 2.5H5.83301C5.16997 2.5 4.53408 2.76339 4.06524 3.23223C3.5964 3.70107 3.33301 4.33696 3.33301 5V7.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M16.6663 7.08333H13.7497C13.3076 7.08333 12.8837 6.90774 12.5712 6.59518C12.2586 6.28262 12.083 5.85869 12.083 5.41667V2.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M4.99967 10H9.16634C9.60837 10 10.0323 10.1756 10.3449 10.4882C10.6574 10.8007 10.833 11.2246 10.833 11.6667V15.8333C10.833 16.2754 10.6574 16.6993 10.3449 17.0118C10.0323 17.3244 9.60837 17.5 9.16634 17.5H4.99967C4.55765 17.5 4.13372 17.3244 3.82116 17.0118C3.5086 16.6993 3.33301 16.2754 3.33301 15.8333V11.6667C3.33301 11.2246 3.5086 10.8007 3.82116 10.4882C4.13372 10.1756 4.55765 10 4.99967 10V10Z"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M10.833 13.75H3.33301"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M7.08301 10V17.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">
                                                1725639661431_exports/products/product-export-1725639661431
                                            </div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular">7.17 Kb</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex">
                                    <div className="flex">
                                        <button className="btn btn-danger btn-small inter-small-regular flex justify-start">
                                            <span className="mr-xsmall last:mr-0">Delete</span>
                                        </button>
                                        <button className="btn btn-ghost btn-small inter-small-regular flex justify-start ml-2">
                                            <span className="mr-xsmall last:mr-0">Download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Import of products has failed.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="product-import.csv"
                                        >
                                            <svg fill="none" height="18" viewBox="0 0 20 20" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M15 5L5 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M5 5L15 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">product-import.csv</div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular text-rose-500">Job failed</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Export file is no longer available. The file will only be stored for 24 hours.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="1725637600399_exports/products/product-export-1725637600399"
                                        >
                                            <svg
                                                className="text-grey-40"
                                                fill="none"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                width="20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M13.333 17.5H14.1663C14.8294 17.5 15.4653 17.2366 15.9341 16.7678C16.4029 16.2989 16.6663 15.663 16.6663 15V7.09109C16.6663 6.42805 16.4029 5.79217 15.9341 5.32333L13.843 3.23223C13.3742 2.76339 12.7383 2.5 12.0752 2.5H5.83301C5.16997 2.5 4.53408 2.76339 4.06524 3.23223C3.5964 3.70107 3.33301 4.33696 3.33301 5V7.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M16.6663 7.08333H13.7497C13.3076 7.08333 12.8837 6.90774 12.5712 6.59518C12.2586 6.28262 12.083 5.85869 12.083 5.41667V2.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M4.99967 10H9.16634C9.60837 10 10.0323 10.1756 10.3449 10.4882C10.6574 10.8007 10.833 11.2246 10.833 11.6667V15.8333C10.833 16.2754 10.6574 16.6993 10.3449 17.0118C10.0323 17.3244 9.60837 17.5 9.16634 17.5H4.99967C4.55765 17.5 4.13372 17.3244 3.82116 17.0118C3.5086 16.6993 3.33301 16.2754 3.33301 15.8333V11.6667C3.33301 11.2246 3.5086 10.8007 3.82116 10.4882C4.13372 10.1756 4.55765 10 4.99967 10V10Z"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M10.833 13.75H3.33301"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M7.08301 10V17.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">
                                                1725637600399_exports/products/product-export-1725637600399
                                            </div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular">7.17 Kb</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex">
                                    <div className="flex">
                                        <button className="btn btn-danger btn-small inter-small-regular flex justify-start">
                                            <span className="mr-xsmall last:mr-0">Delete</span>
                                        </button>
                                        <button className="btn btn-ghost btn-small inter-small-regular flex justify-start ml-2">
                                            <span className="mr-xsmall last:mr-0">Download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Import of products has failed.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="product-import.csv"
                                        >
                                            <svg fill="none" height="18" viewBox="0 0 20 20" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M15 5L5 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M5 5L15 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">product-import.csv</div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular text-rose-500">Job failed</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Import of products has failed.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="product-import.csv"
                                        >
                                            <svg fill="none" height="18" viewBox="0 0 20 20" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M15 5L5 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M5 5L15 15"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">product-import.csv</div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular text-rose-500">Job failed</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-grey-20 mx-8 border-b last:border-b-0">
                    <div className="hover:bg-grey-5 -mx-8 flex px-8 py-6">
                        <div className="relative h-full w-full">
                            <div className="inter-small-semibold text-grey-90 flex justify-between">
                                <div className="flex">
                                    <svg
                                        className="mr-3"
                                        fill="none"
                                        height="20"
                                        viewBox="0 0 45 48"
                                        width="18.75"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M38.8535 7.79156L28.0165 1.5383C24.4707 -0.512767 20.1259 -0.512767 16.5802 1.5383L5.69318 7.79156C2.19737 9.84263 0 13.6446 0 17.6967V30.2533C0 34.3554 2.19737 38.1073 5.69318 40.1584L16.5302 46.4617C20.076 48.5128 24.4208 48.5128 27.9665 46.4617L38.8036 40.1584C42.3493 38.1073 44.4967 34.3554 44.4967 30.2533V17.6967C44.5966 13.6446 42.3992 9.84263 38.8535 7.79156ZM22.2733 35.1558C16.1307 35.1558 11.1367 30.1532 11.1367 24C11.1367 17.8468 16.1307 12.8442 22.2733 12.8442C28.416 12.8442 33.4599 17.8468 33.4599 24C33.4599 30.1532 28.4659 35.1558 22.2733 35.1558Z"
                                            fill="#8B5CF6"
                                        />
                                    </svg>
                                    <span>BotCommerce Store</span>
                                </div>
                                <span>
                                    <div className="flex cursor-default">
                                        <span>28d ago</span>
                                        <div className="inter-small-regular flex items-center ml-2">
                                            <div className="h-1.5 w-1.5 self-center rounded-full bg-violet-60" />
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="pl-8">
                                <div className="inter-small-regular flex flex-col">
                                    <span>Export file is no longer available. The file will only be stored for 24 hours.</span>
                                    <div className="mt-4 flex w-full cursor-pointer items-center">
                                        <div
                                            className="border-grey-20 flex items-center justify-center rounded-lg border p-2.5"
                                            title="1725634168439_exports/products/product-export-1725634168439"
                                        >
                                            <svg
                                                className="text-grey-40"
                                                fill="none"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                width="20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M13.333 17.5H14.1663C14.8294 17.5 15.4653 17.2366 15.9341 16.7678C16.4029 16.2989 16.6663 15.663 16.6663 15V7.09109C16.6663 6.42805 16.4029 5.79217 15.9341 5.32333L13.843 3.23223C13.3742 2.76339 12.7383 2.5 12.0752 2.5H5.83301C5.16997 2.5 4.53408 2.76339 4.06524 3.23223C3.5964 3.70107 3.33301 4.33696 3.33301 5V7.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M16.6663 7.08333H13.7497C13.3076 7.08333 12.8837 6.90774 12.5712 6.59518C12.2586 6.28262 12.083 5.85869 12.083 5.41667V2.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M4.99967 10H9.16634C9.60837 10 10.0323 10.1756 10.3449 10.4882C10.6574 10.8007 10.833 11.2246 10.833 11.6667V15.8333C10.833 16.2754 10.6574 16.6993 10.3449 17.0118C10.0323 17.3244 9.60837 17.5 9.16634 17.5H4.99967C4.55765 17.5 4.13372 17.3244 3.82116 17.0118C3.5086 16.6993 3.33301 16.2754 3.33301 15.8333V11.6667C3.33301 11.2246 3.5086 10.8007 3.82116 10.4882C4.13372 10.1756 4.55765 10 4.99967 10V10Z"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M10.833 13.75H3.33301"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                                <path
                                                    d="M7.08301 10V17.5"
                                                    stroke="#2DD4BF"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="1.5"
                                                />
                                            </svg>
                                        </div>
                                        <div className="relative w-full pl-4 text-left">
                                            <div className="inter-small-regular max-w-[80%] overflow-hidden truncate">
                                                1725634168439_exports/products/product-export-1725634168439
                                            </div>
                                            <span>
                                                <div className="text-grey-40 inter-small-regular">13.66 Kb</div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex">
                                    <div className="flex">
                                        <button className="btn btn-danger btn-small inter-small-regular flex justify-start">
                                            <span className="mr-xsmall last:mr-0">Delete</span>
                                        </button>
                                        <button className="btn btn-ghost btn-small inter-small-regular flex justify-start ml-2">
                                            <span className="mr-xsmall last:mr-0">Download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* </div> */}
        </React.Fragment>
    );
};

export default Activity;
