"use client";

import { submitContactForm } from "@modules/account/actions";
import { useActionState, useEffect, useRef } from "react";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function ContactForm() {
    const [state, formAction, isPending] = useActionState(submitContactForm, { success: false, message: "" });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message) {
            formRef?.current?.reset(); // Reset the form fields
            toast.success(state.message);
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction}>
            <div className="mt-10 space-y-4">
                <Input required className="" label="Name" name="name" placeholder="Ex. John....." />
                <Input required className="" label="Email" name="email" placeholder="Ex. email@email.com" type="email" />
                <Input className="" label="Phone" name="phone" placeholder="Ex. 09000000000" type="number" />
                <Textarea required className="" label="Description" name="message" placeholder="Ex. I want to make an enquiry about..." />
                <div className="text-default-600">
                    <label>I allow this website to store my submission.</label>
                    <Checkbox checked={true} name="agreement" />
                </div>
                <Button aria-label="submit" className="min-w-32" color="danger" isLoading={isPending} type="submit">
                    Submit
                </Button>
            </div>
        </form>
    );
}
