"use client";

import React, { forwardRef, useRef } from "react";

import { Input } from "@nextui-org/input";
import { FormButton } from "@modules/common/components/form-button";
import { createCollection } from "../actions";
import { useSnackbar } from "notistack";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { Checkbox } from "@modules/common/components/checkbox";
import { useRouter } from "next/navigation";

interface Props {
    current?: any;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {
    // submit: () => void;
}

const CollectionForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true } }, ref) => {
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
                                    <input type="text" name="type" value={type} className="hidden" readOnly />
                                    <input type="text" name="id" value={current.id} className="hidden" readOnly />
                                    <Input name="name" label="Name" placeholder="Ex. Gown" required defaultValue={current.name} />
                                    <Checkbox name="is_active" label="Is Active" isSelected={current.is_active} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-50 w-full right-0 z-50">
                            <Button color="danger" onClick={onClose} variant="shadow" className="min-w-32">
                                Cancel
                            </Button>
                            <FormButton color="primary" variant="shadow" className="min-w-32">
                                {isCreate ? "Submit" : "Update"}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
);

CollectionForm.displayName = "CollectionForm";

export { CollectionForm };
