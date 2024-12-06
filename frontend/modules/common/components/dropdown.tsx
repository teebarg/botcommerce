"use client";

import React, { useEffect, useState } from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useOverlay, OverlayContainer } from "@react-aria/overlays";
import { useButton } from "@react-aria/button";
import { cn } from "@/lib/util/cn";

interface Props {
    children: React.ReactNode;
    trigger: React.ReactNode;
    align?: "start" | "end" | "center";
    sideOffset?: number;
    className?: string;
}

const Dropdown: React.FC<Props> = ({ children, trigger, align = "start", sideOffset = 4, className }) => {
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

    // Update the position of the popover relative to the button
    useEffect(() => {
        if (state.isOpen && buttonRef.current && overlayRef.current) {
            const updatePosition = () => {
                const rect = (buttonRef.current as HTMLElement | null)?.getBoundingClientRect();
                const contentRect = (overlayRef.current as HTMLElement | null)?.getBoundingClientRect();

                if (!rect || !contentRect) return;

                let left = rect.left;

                if (align === "end") {
                    left = rect.right - contentRect.width;
                } else if (align === "center") {
                    left = rect.left + (rect.width - contentRect.width) / 2;
                }

                // Ensure the dropdown stays within viewport bounds
                const viewportWidth = window.innerWidth;

                left = Math.max(4, Math.min(left, viewportWidth - contentRect.width - 4));

                setPopoverPosition({
                    top: rect.bottom + sideOffset,
                    left,
                });
            };

            updatePosition();
            window.addEventListener("resize", updatePosition);

            return () => window.removeEventListener("resize", updatePosition);
        }
    }, [state.isOpen, align, sideOffset, buttonRef, overlayRef]);

    return (
        <React.Fragment>
            <button
                {...buttonProps}
                ref={buttonRef}
                className={cn("inline-flex items-center text-default-500 cursor-pointer outline-none", className)}
            >
                {trigger}
            </button>
            {state.isOpen && (
                <OverlayContainer>
                    <div
                        {...overlayProps}
                        ref={overlayRef}
                        className="absolute overflow-auto rounded-md bg-inherit z-40 shadow-lg min-w-[150px]"
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
