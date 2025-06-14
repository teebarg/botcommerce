"use client";

import React, { forwardRef, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/schemas/product";
import { mutateCategory } from "@/actions/category";
import CategoryImageManager from "@/components/admin/categories/category-image";
import { useInvalidate } from "@/lib/hooks/useApi";

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
        const invalidate = useInvalidate();

        const [state, formAction, isPending] = useActionState(mutateCategory, {
            success: false,
            message: "",
            data: null,
        });

        const formRef = useRef<HTMLFormElement>(null);

        useEffect(() => {
            if (state.success) {
                toast.success(state.message || "Category created successfully");
                // Leave the slider open and clear form
                if (formRef.current) {
                    formRef.current.reset();
                }
                invalidate("categories");
                router.refresh();
                onClose?.();
            }
        }, [state.success, state.message, state.data]);

        return (
            <div className="mx-auto w-full px-2 py-6">
                <h2 className="text-lg font-semibold mb-2">{isCreate ? "Create Category" : "Update Category"}</h2>
                <form ref={formRef} action={formAction} className="h-full flex flex-col">
                    <input readOnly className="hidden" name="type" type="text" value={type} />
                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                    <div className="space-y-6">
                        {current.id && <CategoryImageManager categoryId={current.id} initialImage={current.image} />}
                        {hasParent && parent_id && <input readOnly className="hidden" name="parent_id" type="text" value={parent_id} />}
                        <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                        <div className="flex items-center gap-1">
                            <Switch defaultChecked={current.is_active} name="is_active" />
                            <label>Is Active</label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button aria-label="cancel" className="min-w-32" type="button" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit" variant="primary">
                            {isCreate ? "Submit" : "Update"}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }
);

CategoryForm.displayName = "CategoryForm";

export { CategoryForm };
