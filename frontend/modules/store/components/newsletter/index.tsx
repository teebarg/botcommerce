"use client";

import { newsletterForm } from "@modules/account/actions";
import { useActionState, useEffect, useRef } from "react";
import { Mail } from "nui-react-icons";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function NewsletterForm() {
    const [state, formAction, isPending] = useActionState(newsletterForm, { success: false, message: "" });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message) {
            formRef?.current?.reset(); // Reset the form fields
            toast.success(state.message);
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
            <div className="mt-6 sm:flex sm:max-w-lg lg:mt-0 items-center">
                <Input
                    name="email"
                    placeholder="email@gmail.com"
                    startContent={<Mail className="text-default-500 pointer-events-none flex-shrink-0" />}
                    type="email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                    <Button aria-label="subscribe" isLoading={isPending} size="sm" type="submit">
                        Subscribe
                    </Button>
                </div>
            </div>
        </form>
    );
}
