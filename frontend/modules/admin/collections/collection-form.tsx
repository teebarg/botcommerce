"use client";

import React, { forwardRef, useActionState, useRef } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { mutateCollection } from "@/actions/product";

interface Props {
    current?: any;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {
    // submit: () => void;
}

const CollectionForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, current = { name: "", is_active: true } }, ref) => {
    const router = useRouter();
    const isCreate = type === "create";

    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction, isPending] = useActionState(mutateCollection, {
        data: null,
        error: null,
    });

    const formRef = useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (state.data) {
            enqueueSnackbar("Successful", { variant: "success" });
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                onClose?.();
                // router.refresh();
            }
        }
    }, [state.data, state.error, enqueueSnackbar]);

    return (
        <React.Fragment>
            <div className="mx-auto w-full pb-8">
                <form ref={formRef} action={formAction} className="h-full flex flex-col">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                        <div className="relative flex-1">
                            <div className="space-y-8 ">
                                <input readOnly className="hidden" name="type" type="text" value={type} />
                                <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                <Switch defaultSelected={current.is_active} label="Is Active" name="is_active" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-100 w-full right-0 z-50">
                        <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="update" className="min-w-32" isLoading={isPending} type="submit">
                            {isCreate ? "Submit" : "Update"}
                        </Button>
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
});

CollectionForm.displayName = "CollectionForm";

export { CollectionForm };
