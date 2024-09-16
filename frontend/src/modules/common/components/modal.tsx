import React, { useRef } from "react";
import { useDialog, useOverlay, usePreventScroll, useModal, OverlayContainer, OverlayProps } from "react-aria";

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
    // if (!isOpen) return null;
    // const { modalProps } = useModal();
    // const { dialogProps, titleProps } = useDialog(props, ref);

    return (
        <OverlayContainer>
            <div {...underlayProps} className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                <div
                    {...overlayProps}
                    // {...dialogProps}
                    // {...modalProps}
                    ref={ref}
                    className="bg-content1 rounded-lg p-6 max-w-lg w-full focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                    {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
                    <div>{children}</div>
                    {/* <button onClick={onClose} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                        Close
                    </button> */}
                </div>
            </div>
        </OverlayContainer>
    );
};

export { Modal };
