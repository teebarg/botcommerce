import { XMark } from "nui-react-icons";
import React, { useRef } from "react";
import { useOverlay, usePreventScroll, OverlayContainer, OverlayProps } from "@react-aria/overlays";
import { cn } from "@lib/util/cn";

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
                className="group fixed inset-0 flex items-center justify-center z-50 backdrop-blur bg-white/40"
                data-has-x={hasX ? "true" : "false"}
            >
                <div
                    {...overlayProps}
                    // {...dialogProps}
                    // {...modalProps}
                    ref={ref}
                    className={cn("bg-default-100 rounded-lg w-full focus-visible:ring-offset-0 focus-visible:outline-none relative", {
                        "max-w-lg": size == "sm",
                        "max-w-2xl": size == "md",
                        "max-w-5xl": size == "lg",
                    })}
                >
                    {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
                    <button className="absolute top-4 right-4 hidden group-data-[has-x=true]:block" onClick={onClose}>
                        <XMark size={20} />
                    </button>
                    <div>{children}</div>
                </div>
            </div>
        </OverlayContainer>
    );
};

export { Modal };
