"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useOverlay, OverlayContainer } from "@react-aria/overlays";
import { useButton } from "@react-aria/button";
import { Bell } from "nui-react-icons";

import Activity from "./activity";

interface Props {}

const ActivityTray: React.FC<Props> = () => {
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
                        className="absolute p-1 flex flex-col w-[450px] overflow-auto rounded-md bg-content1 z-40 shadow-lg"
                        style={{
                            top: popoverPosition.top,
                            right: popoverPosition.right,
                            height: popoverPosition.height,
                        }}
                    >
                        <Activity />
                    </div>
                </OverlayContainer>
            )}
            {/* </div> */}
        </React.Fragment>
    );
};

export default ActivityTray;
