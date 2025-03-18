"use client";

import React, { useActionState, useRef } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Number } from "@/components/ui/number";
import { Textarea } from "@/components/ui/textarea";
import { updateReview } from "@/actions/reviews";

interface Props {
    current?: any;
    onClose?: () => void;
}

const ReviewForm: React.FC<Props> = ({ onClose, current = { rating: 1, comment: "", verified: false } }) => {
    const router = useRouter();

    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction, isPending] = useActionState(updateReview, {
        error: false,
        message: "",
    });

    const formRef = useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (!("error" in state)) {
            enqueueSnackbar("Action successful", { variant: "success" });
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                router.refresh();
            }
        }
    }, [enqueueSnackbar]);

    return (
        <React.Fragment>
            <div className="mx-auto w-full pb-8">
                <form ref={formRef} action={formAction} className="h-full flex flex-col">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                        <div className="relative flex-1">
                            <div className="space-y-8 ">
                                <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                <Number isRequired defaultValue={current.rating} label="Rating" name="rating" placeholder="5" />
                                <Textarea required defaultValue={current.comment} label="Comment" name="comment" placeholder="Great product." />
                                <Checkbox color="warning" defaultSelected={current.verified} label="Verified" name="verified" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-100 w-full right-0 z-50">
                        <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="update" className="min-w-32" isLoading={isPending} type="submit">
                            Update
                        </Button>
                    </div>
                </form>
            </div>
        </React.Fragment>
    );
};

export { ReviewForm };
