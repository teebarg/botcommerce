"use client";

import React, { forwardRef, useActionState, useEffect, useRef } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { mutateCollection } from "@/actions/product";
import { Collection } from "@/schemas/product";

interface Props {
    collection?: Collection;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {
    // submit: () => void;
}

const CollectionForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, collection = { name: "", is_active: true } }, ref) => {
    const isCreate = type === "create";

    const [state, formAction, isPending] = useActionState(mutateCollection, {
        success: false,
        message: "",
        data: null,
    });

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.data) {
            toast.success("Successful");
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                onClose?.();
                // router.refresh();
            }
        }
    }, [state.data, state.message, state.success]);

    return (
        <div className="mx-auto w-full py-6 px-2">
            <h3 className="text-lg font-medium mb-4">{isCreate ? "Create Collection" : "Update Collection"}</h3>
            <form ref={formRef} action={formAction} className="h-full flex flex-col">
                <input readOnly className="hidden" name="type" type="text" value={type} />
                <input readOnly className="hidden" name="id" type="text" value={collection.id} />
                <div className="space-y-6">
                    <Input required defaultValue={collection.name} label="Name" name="name" placeholder="Ex. Gown" />
                    <div className="flex items-center gap-2">
                        <Switch defaultChecked={collection.is_active} name="is_active" />
                        <label>Is Active</label>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="update" className="min-w-32" disabled={isPending} isLoading={isPending} type="submit" variant="primary">
                        {isCreate ? "Submit" : "Update"}
                    </Button>
                </div>
            </form>
        </div>
    );
});

CollectionForm.displayName = "CollectionForm";

export { CollectionForm };
