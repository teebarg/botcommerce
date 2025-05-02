"use client";

import React, { forwardRef, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { mutateBrand } from "@/actions/product";
import { useInvalidate } from "@/lib/hooks/useCart";

interface Props {
    current?: any;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {
    // submit: () => void;
}

const BrandForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, current = { name: "", is_active: true } }, ref) => {
    const router = useRouter();
    const isCreate = type === "create";
    const invalidate = useInvalidate();

    const [state, formAction, isPending] = useActionState(mutateBrand, {
        success: false,
        message: "",
        data: null,
    });

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message || "Brand created successfully");
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                invalidate("brands");
                router.refresh();
            }
        }
    }, [state.success, state.message, state.data]);

    return (
        <div className="mx-auto w-full">
            <form ref={formRef} action={formAction} className="h-full flex flex-col">
                <input readOnly className="hidden" name="type" type="text" value={type} />
                <input readOnly className="hidden" name="id" type="text" value={current.id} />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll">
                    <div className="relative flex-1">
                        <div className="space-y-6">
                            <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                            <div className="flex items-center gap-2">
                                <Switch defaultChecked={current.is_active} name="is_active" />
                                <label>Status</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end py-4 space-x-2">
                    <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit">
                        {isCreate ? "Submit" : "Update"}
                    </Button>
                </div>
            </form>
        </div>
    );
});

BrandForm.displayName = "BrandForm";

export { BrandForm };
