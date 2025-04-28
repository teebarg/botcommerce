"use client";

import React, { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateReview } from "@/actions/reviews";
import { Input } from "@/components/ui/input";
import { Review } from "@/types/models";

interface Props {
    review?: Review;
    onClose?: () => void;
}

const ReviewForm: React.FC<Props> = ({ onClose, review = { rating: 1, comment: "" } }) => {
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(updateReview, {
        error: false,
        message: "",
    });

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (!("error" in state)) {
            toast.success("Action successful");
            // Leave the slider open and clear form
            if (formRef.current) {
                formRef.current.reset();
                router.refresh();
                onClose?.();
            }
        }
    }, [state.error, state.message]);

    return (
        <div className="mx-auto w-full">
            <form ref={formRef} action={formAction} className="h-full flex flex-col">
                <input readOnly className="hidden" name="id" type="text" value={review.id} />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll pb-6">
                    <div className="relative flex-1 space-y-2">
                        <Input required defaultValue={review.rating} label="Rating" name="rating" placeholder="5" type="number" />
                        <Textarea required defaultValue={review.comment} label="Comment" name="comment" placeholder="Great product." />
                    </div>
                </div>
                <div className="flex items-center justify-end py-4 space-x-2">
                    <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="update" className="min-w-32" isLoading={isPending} type="submit">
                        Update
                    </Button>
                </div>
            </form>
        </div>
    );
};

export { ReviewForm };
