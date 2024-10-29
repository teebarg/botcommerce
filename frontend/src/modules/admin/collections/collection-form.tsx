"use client";

import React, { forwardRef, useRef } from "react";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Switch } from "@modules/common/components/switch";

import { createCollection } from "../actions";
import { Input } from "@components/ui/input";

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
    const [state, formAction] = useFormState(createCollection, {
        success: false,
        message: "",
        data: null,
    });

    const formRef = useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (state.success) {
            enqueueSnackbar(state.message || "Collection created successfully", { variant: "success" });
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                router.refresh();
            }
        }
    }, [state.success, state.message, enqueueSnackbar]);

    return (
        <React.Fragment>
            <div className="mx-auto w-full pb-8">
                <form ref={formRef} action={formAction} className="h-full flex flex-col">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                        <div className="relative flex-1">
                            <div className="space-y-8 ">
                                <input readOnly className="hidden" name="type" type="text" value={type} />
                                <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                <Input isRequired defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                <Switch defaultSelected={current.is_active} label="Is Active" name="is_active" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-50 w-full right-0 z-50">
                        <Button className="min-w-32" color="danger" variant="shadow" onPress={onClose}>
                            Cancel
                        </Button>
                        <FormButton className="min-w-32" color="primary" variant="shadow">
                            {isCreate ? "Submit" : "Update"}
                        </FormButton>
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
});

CollectionForm.displayName = "CollectionForm";

export { CollectionForm };
