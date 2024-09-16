import React, { useState } from "react";
import Button from "./button";

interface Props {
    title?: string;
    onConfirm?: () => void;
    onClose?: () => void;
}

const Confirm: React.FC<Props> = ({ title = "Confirm?", onConfirm, onClose }) => {
    const [isPending, setIsPending] = useState<boolean>(false);

    const onSubmit = async () => {
        setIsPending(true);
        onConfirm?.();
    };
    return (
        <React.Fragment>
            <div className="mx-auto w-full pb-8">
                <div>
                    <div className="pb-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                        <div className="flex">
                            <div className="flex items-center">
                                <div className="flex grow flex-col gap-1">
                                    <h2 id="radix-:rml:" className="text-lg font-semibold leading-6 text-token-text-primary">
                                        {title}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mt-6">
                            Are you sure you want to delete this user? All of your data will be permanently removed from our servers forever. This
                            action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                        <Button color="default" variant="shadow" onPress={onClose} className="min-w-36">
                            Close
                        </Button>
                        <div>
                            {isPending ? (
                                <Button color="danger" isLoading variant="shadow" isDisabled className="min-w-36">
                                    Deleting...
                                </Button>
                            ) : (
                                <Button onClick={onSubmit} color="danger" variant="shadow" type="submit" className="min-w-36">
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
