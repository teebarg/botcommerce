import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface Props {
    title?: string;
    content?: string;
    onConfirm?: () => void;
    onClose?: () => void;
}

const Confirm: React.FC<Props> = ({ title = "Confirm?", content, onConfirm, onClose }) => {
    const [isPending, setIsPending] = useState<boolean>(false);

    const onSubmit = async () => {
        setIsPending(true);
        onConfirm?.();
    };

    return (
        <div className="mx-auto w-full">
            <div className="pb-2 border-b border-input">
                <h2 className="text-lg font-semibold leading-6 font-display">{title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
                {content ??
                    "Are you sure you want to delete this item? All of your data will be permanently removed from our servers forever. This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-2 mt-8">
                <Button aria-label="submit" className="min-w-36" onClick={onClose}>
                    Close
                </Button>
                <Button aria-label="submit" className="min-w-36" isLoading={isPending} type="submit" variant="destructive" onClick={onSubmit}>
                    Delete
                </Button>
            </div>
        </div>
    );
};

export { Confirm };
