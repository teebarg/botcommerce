"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useOverlay, OverlayContainer } from "@react-aria/overlays";
import { useButton } from "@react-aria/button";
import { Bell } from "nui-react-icons";
import { fetchWithAuth } from "@lib/util/api";
import { useSnackbar } from "notistack";
import { useWebSocket } from "@lib/hooks/use-websocket";
import useWatch from "@lib/hooks/use-watch";
import { Customer } from "types/global";

import Activity from "./activity";

interface Props {
    children: React.ReactNode;
    trigger: React.ReactNode;
}

const Dropdown: React.FC<Props> = ({ children, trigger }) => {
    const { enqueueSnackbar } = useSnackbar();
    const state = useOverlayTriggerState({});
    const buttonRef = React.useRef(null);
    const overlayRef = React.useRef(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

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

    useWatch(currentMessage, () => {
        // Update the live activity message
        setActivities((prev) => [currentMessage, ...prev]);
    });

    // Update the position of the popover relative to the button
    useEffect(() => {
        if (state.isOpen && buttonRef.current) {
            const rect = (buttonRef.current as HTMLElement).getBoundingClientRect();

            console.log(rect)

            setPopoverPosition({
                top: rect.bottom + window.scrollY + 5, // Position just below the button
                left: rect.left, // Align horizontally with the button
                // right: 10, // Align horizontally with the button
                // height: window.innerHeight - rect.bottom - 20,
            });
        }
    }, [state.isOpen]);

    return (
        <React.Fragment>
            <button {...buttonProps} ref={buttonRef} className="inline-flex items-center text-default-500 cursor-pointer outline-none">
                {trigger}
            </button>
            {state.isOpen && (
                <OverlayContainer>
                    <div
                        {...overlayProps}
                        ref={overlayRef}
                        className="absolute overflow-auto rounded-md bg-inherit z-40 shadow-lg"
                        style={{
                            top: popoverPosition.top,
                            left: popoverPosition.left,
                        }}
                    >
                        {children}
                    </div>
                </OverlayContainer>
            )}
            {/* </div> */}
        </React.Fragment>
    );
};

export default Dropdown;
