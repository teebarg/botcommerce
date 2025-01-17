"use client";

import React, { forwardRef, useRef } from "react";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Category } from "types/global";
import { Input } from "@components/ui/input";

import { createCategory } from "../actions";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Props {
    current?: Category;
    type?: "create" | "update";
    onClose?: () => void;
    hasParent?: boolean;
    parent_id?: number;
}

interface ChildRef {
    // submit: () => void;
}

const CategoryForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true, parent_id: null }, hasParent = false, parent_id = null }, ref) => {
        const router = useRouter();
        const isCreate = type === "create";

        const { enqueueSnackbar } = useSnackbar();
        const [state, formAction] = useFormState(createCategory, {
            success: false,
            message: "",
            data: null,
        });

        const formRef = useRef<HTMLFormElement>(null);

        React.useEffect(() => {
            if (state.success) {
                enqueueSnackbar(state.message || "Category created successfully", { variant: "success" });
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
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll">
                            <div className="relative flex-1">
                                <div className="space-y-8 ">
                                    <input readOnly className="hidden" name="type" type="text" value={type} />
                                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                    {hasParent && parent_id && <input readOnly className="hidden" name="parent_id" type="text" value={parent_id} />}
                                    <Input isRequired defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                    <Switch defaultSelected={current.is_active} label="Is Active" name="is_active" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-100 w-full right-0 z-50">
                            <Button className="min-w-32" color="danger" variant="shadow" onClick={onClose}>
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
    }
);

CategoryForm.displayName = "CategoryForm";

export { CategoryForm };
