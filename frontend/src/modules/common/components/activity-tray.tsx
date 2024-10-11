"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useOverlay, OverlayContainer } from "@react-aria/overlays";
import { useButton } from "@react-aria/button";
import { Bell } from "nui-react-icons";
import { fetchWithAuth } from "@lib/util/api";
import { useSnackbar } from "notistack";

import Activity from "./activity";

interface Props {}

const ActivityTray: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const state = useOverlayTriggerState({});
    const buttonRef = React.useRef(null);
    const overlayRef = React.useRef(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, right: 0, height: 0 });

    const { buttonProps } = useButton({ onPress: state.toggle }, buttonRef);
    const { overlayProps } = useOverlay(
        {
            isOpen: state.isOpen,
            onClose: state.close,
            shouldCloseOnBlur: true,
            isDismissable: true,
        },
        overlayRef
    );

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        // Establish WebSocket connection to listen for real-time updates
        const userId = 1; // Example user_id, you can fetch the actual user ID
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS}/api/ws/activities/`);

        ws.onmessage = (event) => {
            // Update the live activity message
            setActivities((prev) => [JSON.parse(event.data), ...prev]);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            ws.close();
        };
    }, []);

    // Update the position of the popover relative to the button
    useEffect(() => {
        if (state.isOpen && buttonRef.current) {
            const rect = (buttonRef.current as HTMLElement).getBoundingClientRect();

            setPopoverPosition({
                top: rect.bottom + window.scrollY + 15, // Position just below the button
                // right: window.innerWidth - rect.right, // Align horizontally with the button
                right: 10, // Align horizontally with the button
                height: window.innerHeight - rect.bottom - 20,
            });
        }
    }, [state.isOpen]);

    const fetchActivities = async () => {
        setLoading(true);
        const { data, error } = await fetchWithAuth<any>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/`);

        if (error) {
            enqueueSnackbar(`Error: ${error}`, { variant: "error" });
        } else if (data) {
            setActivities(data);
        }

        setLoading(false);
    };

    const onRemove = async (id: string | number) => {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
    };

    return (
        <React.Fragment>
            {/* <div className="relative"> */}
            <button {...buttonProps} ref={buttonRef} className="inline-flex items-center text-default-500 cursor-pointer outline-none">
                <Bell size={22} />
            </button>
            {state.isOpen && (
                <OverlayContainer>
                    <div
                        {...overlayProps}
                        ref={overlayRef}
                        className="absolute flex flex-col w-[450px] overflow-auto rounded-md bg-content1 z-40 shadow-lg"
                        style={{
                            top: popoverPosition.top,
                            right: popoverPosition.right,
                            height: popoverPosition.height,
                        }}
                    >
                        {loading ? <div className="h-full">Loadinng</div> : <Activity activities={activities} onRemove={onRemove} />}
                    </div>
                </OverlayContainer>
            )}
            {/* </div> */}
        </React.Fragment>
    );
};

export default ActivityTray;
