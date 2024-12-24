import { XMark } from "nui-react-icons";
import React, { useRef } from "react";
import { useOverlay, usePreventScroll, OverlayContainer, OverlayProps } from "@react-aria/overlays";
import { cn } from "@lib/util/cn";

import { BackButton } from "@/components/back";

interface ModalProps extends OverlayProps {
    title?: string;
    children: React.ReactNode;
    isOpen?: boolean;
    hasX?: boolean;
    size?: "sm" | "md" | "lg";
    onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, isOpen, size = "sm", hasX = true, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);

    // const { overlayProps, underlayProps } = useOverlay(props, ref);
    usePreventScroll();
    // Setup the modal with useOverlay for accessibility
    const { overlayProps, underlayProps } = useOverlay(
        {
            isOpen,
            onClose,
            isDismissable: true, // This allows dismissing by clicking outside or pressing Escape
        },
        ref
    );

    return (
        <OverlayContainer>
            <div
                {...underlayProps}
                className="group fixed inset-0 flex items-center justify-center z-50 backdrop-blur"
                data-has-x={hasX ? "true" : "false"}
            >
                <div
                    {...overlayProps}
                    // {...dialogProps}
                    // {...modalProps}
                    ref={ref}
                    className={cn("bg-default rounded-lg w-full h-full md:h-auto focus-visible:ring-offset-0p focus-visible:outline-nonep relative", {
                        "max-w-lg": size == "sm",
                        "max-w-2xl": size == "md",
                        "max-w-5xl": size == "lg",
                    })}
                >
                    <div className="sticky top-0 md:hidden p-4 flex items-center gap-4 bg-background z-20 shadow-2xl">
                        <BackButton onClick={onClose} />
                        <div>{title && <h2 className="text-lg font-semibold">{title}</h2>}</div>
                    </div>
                    {/* {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>} */}
                    <button className="absolute top-6 right-6 hidden group-data-[has-x=true]:block" onClick={onClose}>
                        <XMark size={20} />
                    </button>
                    <div className="py-8 md:px-4">{children}</div>
                </div>
            </div>
        </OverlayContainer>
    );
};

export { Modal };
