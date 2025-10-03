import React, { useState } from "react";

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
            <div>
                <div className="pb-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                    <div className="flex">
                        <div className="flex items-center">
                            <div className="flex grow flex-col gap-1">
                                <h2 className="text-lg font-semibold leading-6 font-outfit">{title}</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                        {content ??
                            "Are you sure you want to delete this item? All of your data will be permanently removed from our servers forever. This action cannot be undone."}
                    </p>
                </div>
                <div className="flex justify-end gap-2 mt-8">
                    <Button aria-label="submit" className="min-w-36" onClick={onClose}>
                        Close
                    </Button>
                    <Button aria-label="submit" className="min-w-36" isLoading={isPending} type="submit" variant="destructive" onClick={onSubmit}>
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export { Confirm };
