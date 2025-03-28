"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useOverlay, OverlayContainer } from "@react-aria/overlays";
import { useButton } from "@react-aria/button";
import { Bell } from "nui-react-icons";
import { useSnackbar } from "notistack";
import { useWebSocket } from "@lib/hooks/use-websocket";
import useWatch from "@lib/hooks/use-watch";

import Activity from "./activity";

interface Props {
    userId: string | number;
}

const ActivityTray: React.FC<Props> = ({ userId }) => {
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

    const { messages: wsMessages, connect: initializeWebsocket, disconnect: disconnectWebsocket } = useWebSocket({ type: ["activities"] });

    const currentMessage = wsMessages[wsMessages.length - 1];
    const wsUrl = `${process.env.NEXT_PUBLIC_WS}/api/ws/${userId}/`;

    useEffect(() => {
        fetchActivities();
        initializeWebsocket(wsUrl);

        return () => {
            disconnectWebsocket();
        };
    }, []);

    useWatch(currentMessage, () => {
        // Update the live activity message
        setActivities((prev) => [currentMessage, ...prev]);
    });

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
        // const { data, error } = await fetch<any>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/`);

        setLoading(false);
    };

    const onRemove = async (id: string | number) => {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
    };

    return (
        <React.Fragment>
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
        </React.Fragment>
    );
};

export default ActivityTray;
