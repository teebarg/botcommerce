"use client";

import React, { forwardRef, useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/types/models";
import { mutateCategory } from "@/actions/category";
import CategoryImageManager from "@/components/categories/category-image";

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

        const [state, formAction, isPending] = useActionState(mutateCategory, {
            success: false,
            message: "",
            data: null,
        });

        const formRef = useRef<HTMLFormElement>(null);

        React.useEffect(() => {
            if (state.success) {
                toast.success(state.message || "Category created successfully");
                // Leave the slider open and clear form
                if (formRef.current) {
                    formRef.current.reset();
                    router.refresh();
                }
                onClose?.();
            }
        }, [state.success, state.message]);

        return (
            <React.Fragment>
                <div className="mx-auto w-full">
                    <form ref={formRef} action={formAction} className="h-full flex flex-col">
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll">
                            <div className="relative flex-1">
                                <div className="space-y-8 ">
                                    {current.id && <CategoryImageManager categoryId={current.id} initialImage={current.image} />}
                                    <input readOnly className="hidden" name="type" type="text" value={type} />
                                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                    {hasParent && parent_id && <input readOnly className="hidden" name="parent_id" type="text" value={parent_id} />}
                                    <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                    <div>
                                        <Switch checked={current.is_active} name="is_active" />
                                        <label>Is Active</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex py-4 space-x-2 w-full mt-8">
                            <Button aria-label="cancel" className="min-w-32" type="button" variant="destructive" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit" variant="default">
                                {isCreate ? "Submit" : "Update"}
                            </Button>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
);

CategoryForm.displayName = "CategoryForm";

export { CategoryForm };
