import { XMark } from "nui-react-icons";
import React, { useRef } from "react";
import { useOverlay, usePreventScroll, OverlayContainer, OverlayProps } from "react-aria";

interface ModalProps extends OverlayProps {
    title?: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, isOpen, ...props }) => {
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
            <div {...underlayProps} className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur bg-white/40">
                <div
                    {...overlayProps}
                    // {...dialogProps}
                    // {...modalProps}
                    ref={ref}
                    className="bg-default-200 rounded-lg p-10 max-w-lg w-full focus-visible:ring-offset-0 focus-visible:outline-none relative"
                >
                    {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
                    <div>
                        <button className="absolute top-4 right-4" onClick={onClose}>
                            <XMark size={20} />
                        </button>
                    </div>
                    <div>{children}</div>
                </div>
            </div>
        </OverlayContainer>
    );
};

export { Modal };
