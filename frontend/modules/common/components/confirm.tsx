import { Button } from "@/components/ui/button";
import React, { useState } from "react";

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
        <React.Fragment>
            <div className="mx-auto w-full p-8">
                <div>
                    <div className="pb-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                        <div className="flex">
                            <div className="flex items-center">
                                <div className="flex grow flex-col gap-1">
                                    <h2 className="text-lg font-semibold leading-6 text-default-900">{title}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-default-500 mt-6 font-medium">
                            {content ??
                                "Are you sure you want to delete this item? All of your data will be permanently removed from our servers forever. This action cannot be undone."}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                        <Button className="min-w-36" color="default" variant="shadow" onClick={onClose}>
                            Close
                        </Button>
                        <div>
                            {isPending ? (
                                <Button disabled isLoading className="min-w-36" color="danger" variant="shadow">
                                    Deleting...
                                </Button>
                            ) : (
                                <Button className="min-w-36" color="danger" type="submit" variant="shadow" onClick={onSubmit}>
                                    Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export { Confirm };
