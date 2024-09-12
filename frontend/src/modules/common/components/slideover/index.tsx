"use client";

import React, { useEffect, useState } from "react";
import { useOverlay, usePreventScroll, useModal, OverlayContainer } from "@react-aria/overlays";
import { useDialog } from "@react-aria/dialog";
import { FocusScope } from "@react-aria/focus";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { CancelIcon } from "nui-react-icons";
import { usePathname } from "next/navigation";

type Direction = "left" | "right";
interface SlideoverProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string | React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
    direction?: Direction;
}

const SlideOver: React.FC<SlideoverProps> = ({ isOpen, onClose, children, title, className, footer, direction = "right" }) => {
    usePreventScroll({ isDisabled: !isOpen });
    const ref = React.useRef<HTMLDivElement>(null);
    const { overlayProps } = useOverlay({ isOpen, onClose, isDismissable: true }, ref);
    const { modalProps } = useModal();
    const { dialogProps } = useDialog({}, ref);
    const pathname = usePathname();
    const [path] = useState(pathname);

    const location: Record<Direction, string> = {
        left: isOpen ? "translate-x-0 left-0" : "-translate-x-full left-0",
        right: isOpen ? "translate-x-0 right-0" : "translate-x-full right-0",
    };

    useEffect(() => {
        if (path != pathname) {
            onClose();
        }
    }, [path, pathname, onClose]);

    return (
        <OverlayContainer>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />}
            <FocusScope contain restoreFocus>
                <div
                    {...overlayProps}
                    {...dialogProps}
                    {...modalProps}
                    ref={ref}
                    className={`fixed flex flex-col top-0 w-[27%] h-screen shadow-lg transform transition-transform duration-300 z-50 py-5 px-2 bg-default-50 ${className} ${location[direction]}`}
                >
                    <button className="absolute top-4 right-2 bg-transparent" onClick={onClose}>
                        <CancelIcon size={24} />
                    </button>
                    <ScrollShadow hideScrollBar className="flex flex-col flex-1" isEnabled={false}>
                        <div className="text-2xl mb-4 font-semibold pl-2">{title}</div>
                        <div className="w-full h-full max-h-full flex-1 px-2">
                            <React.Fragment>{children}</React.Fragment>
                        </div>
                    </ScrollShadow>
                    <React.Fragment>{footer}</React.Fragment>
                </div>
            </FocusScope>
        </OverlayContainer>
    );
};

export { SlideOver };
