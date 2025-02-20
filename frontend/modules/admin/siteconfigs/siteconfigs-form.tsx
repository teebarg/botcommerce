"use client";

import React, { forwardRef, useActionState, useRef } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";

import { createSiteConfig } from "../actions";

import { Button } from "@/components/ui/button";
import { SiteConfig } from "@/types/global";

interface Props {
    current?: SiteConfig;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {
    // submit: () => void;
}

const SiteConfigForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, current = { name: "", key: "" } }, ref) => {
    const router = useRouter();
    const isCreate = type === "create";

    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction, isPending] = useActionState(createSiteConfig, {
        success: false,
        message: "",
        data: null,
    });

    const formRef = useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (state.success) {
            enqueueSnackbar(state.message || "SiteConfig created successfully", { variant: "success" });
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
                                <Input isRequired defaultValue={current.key} label="Key" name="key" placeholder="Sitename" />
                                <Input isRequired defaultValue={current.value} label="Value" name="value" placeholder="NetFlix" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-100 w-full right-0 z-50">
                        <Button aria-label="cancel" className="min-w-32" color="danger" variant="shadow" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="submit" className="min-w-32" color="primary" isLoading={isPending} type="submit" variant="shadow">
                            {isCreate ? "Submit" : "Update"}
                        </Button>
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
});

SiteConfigForm.displayName = "SiteConfigForm";

export { SiteConfigForm };
